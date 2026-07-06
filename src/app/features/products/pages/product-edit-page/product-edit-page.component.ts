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
  templateUrl: './product-edit-page.component.html',
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
