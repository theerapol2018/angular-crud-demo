import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductStoreService } from '../../data-access/product-store.service';
import { ProductCreate } from '../../models/product.model';

@Component({
  selector: 'app-product-create-page',
  imports: [ProductFormComponent, RouterLink],
  templateUrl: './product-create-page.component.html',
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
