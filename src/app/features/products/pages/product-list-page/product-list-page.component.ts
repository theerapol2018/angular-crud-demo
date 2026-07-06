import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductStoreService } from '../../data-access/product-store.service';

@Component({
  selector: 'app-product-list-page',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-list-page.component.html',
})
export class ProductListPageComponent implements OnInit {
  readonly store = inject(ProductStoreService);

  ngOnInit(): void {
    this.store.load();
  }

  deleteProduct(id: string): void {
    if (window.confirm('Delete this product?')) {
      this.store.remove(id);
    }
  }
}
