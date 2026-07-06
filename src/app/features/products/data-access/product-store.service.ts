import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Product, ProductCreate, ProductUpdate } from '../models/product.model';
import { ProductApiService } from './product-api.service';

@Injectable({ providedIn: 'root' })
export class ProductStoreService {
  private readonly api = inject(ProductApiService);
  private readonly productsState = signal<Product[]>([]);
  private readonly errorState = signal<string | null>(null);

  readonly products = this.productsState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly totalStock = computed(() =>
    this.products().reduce((sum, product) => sum + product.stock, 0),
  );

  load(): void {
    this.loading.set(true);
    this.errorState.set(null);

    this.api
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => this.productsState.set(products),
        error: (error: unknown) => this.errorState.set(this.toMessage(error)),
      });
  }

  create(payload: ProductCreate, onSuccess?: () => void): void {
    this.saving.set(true);
    this.errorState.set(null);

    this.api
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (product) => {
          this.productsState.update((products) => [...products, product]);
          onSuccess?.();
        },
        error: (error: unknown) => this.errorState.set(this.toMessage(error)),
      });
  }

  update(id: string, payload: ProductUpdate, onSuccess?: () => void): void {
    this.saving.set(true);
    this.errorState.set(null);

    this.api
      .update(id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updatedProduct) => {
          this.productsState.update((products) =>
            products.map((product) => (product.id === id ? updatedProduct : product)),
          );
          onSuccess?.();
        },
        error: (error: unknown) => this.errorState.set(this.toMessage(error)),
      });
  }

  remove(id: string): void {
    this.saving.set(true);
    this.errorState.set(null);

    this.api
      .remove(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.productsState.update((products) => products.filter((product) => product.id !== id));
        },
        error: (error: unknown) => this.errorState.set(this.toMessage(error)),
      });
  }

  setError(message: string | null): void {
    this.errorState.set(message);
  }

  private toMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unexpected error.';
  }
}
