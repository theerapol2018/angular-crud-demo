import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductStoreService } from '../../data-access/product-store.service';
import { ProductCreate } from '../../models/product.model';

@Component({
  selector: 'app-product-create-page',
  imports: [ProductFormComponent, RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div class="page-title">
          <h1>Create product</h1>
          <p>Add a new product to the demo catalog.</p>
        </div>
        <a class="button secondary" routerLink="/products">Back</a>
      </div>

      @if (store.error()) {
        <p class="alert" role="alert">{{ store.error() }}</p>
      }

      <div class="form-panel">
        <app-product-form
          [saving]="store.saving()"
          (submitted)="create($event)"
          (canceled)="navigateBack()"
        />
      </div>
    </section>
  `,
})
export class ProductCreatePageComponent implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(ProductStoreService);

  ngOnInit(): void {
    this.store.setError(null);
  }

  create(payload: ProductCreate): void {
    this.store.create(payload, () => this.navigateBack());
  }

  navigateBack(): void {
    this.router.navigate(['/products']);
  }
}
