import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ApiRequestError, ProductApiService } from '../../data-access/product-api.service';
import { ProductStoreService } from '../../data-access/product-store.service';
import { Product, ProductUpdate } from '../../models/product.model';

@Component({
  selector: 'app-product-edit-page',
  imports: [ProductFormComponent, RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div class="page-title">
          <h1>Edit product</h1>
          <p>Update catalog price or stock.</p>
        </div>
        <a class="button secondary" routerLink="/products">Back</a>
      </div>

      @if (store.error()) {
        <p class="alert" role="alert">{{ store.error() }}</p>
      }

      <div class="form-panel">
        @if (loadingProduct()) {
          <p class="status-message">Loading...</p>
        } @else if (notFound()) {
          <p class="alert" role="alert">Product not found.</p>
        } @else if (product()) {
          <app-product-form
            [product]="product()"
            [saving]="store.saving()"
            (submitted)="update($event)"
            (canceled)="navigateBack()"
          />
        }
      </div>
    </section>
  `,
})
export class ProductEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductApiService);
  readonly store = inject(ProductStoreService);

  readonly productId = signal<string | null>(null);
  readonly product = signal<Product | null>(null);
  readonly loadingProduct = signal(false);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.store.setError(null);

    const id = this.route.snapshot.paramMap.get('id');

    if (!id?.trim()) {
      this.notFound.set(true);
      return;
    }

    this.productId.set(id);
    this.loadingProduct.set(true);

    this.api
      .get(id)
      .pipe(finalize(() => this.loadingProduct.set(false)))
      .subscribe({
        next: (product) => this.product.set(product),
        error: (error: unknown) => {
          if (error instanceof ApiRequestError && error.kind === 'notFound') {
            this.notFound.set(true);
            return;
          }

          this.store.setError(error instanceof Error ? error.message : 'Cannot load product.');
        },
      });
  }

  update(payload: ProductUpdate): void {
    const id = this.productId();

    if (!id) {
      return;
    }

    this.store.update(id, payload, () => this.navigateBack());
  }

  navigateBack(): void {
    this.router.navigate(['/products']);
  }
}
