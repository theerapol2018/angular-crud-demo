import { Component, effect, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Product, ProductCreate } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  template: `
    <form class="form-grid" [formGroup]="form" (ngSubmit)="save()">
      <div class="field">
        <label for="product-name">Name</label>
        <input id="product-name" type="text" formControlName="name" autocomplete="off" />

        @if (hasError('name', 'required')) {
          <p class="field-error" role="alert">Name is required.</p>
        }
        @if (hasError('name', 'maxlength')) {
          <p class="field-error" role="alert">Name must be 120 characters or fewer.</p>
        }
      </div>

      <div class="field">
        <label for="product-price">Price</label>
        <input id="product-price" type="number" min="0" formControlName="price" />

        @if (hasError('price', 'min')) {
          <p class="field-error" role="alert">Price must be 0 or more.</p>
        }
      </div>

      <div class="field">
        <label for="product-stock">Stock</label>
        <input id="product-stock" type="number" min="0" step="1" formControlName="stock" />

        @if (hasError('stock', 'min') || hasError('stock', 'positiveInteger')) {
          <p class="field-error" role="alert">Stock must be a whole number of 0 or more.</p>
        }
      </div>

      <div class="button-row">
        <button type="submit" [disabled]="form.invalid || form.pending || saving()">
          {{ saving() ? 'Saving...' : 'Save' }}
        </button>
        <button type="button" class="secondary" (click)="canceled.emit()">Cancel</button>
      </div>
    </form>
  `,
})
export class ProductFormComponent {
  readonly product = input<Product | null>(null);
  readonly saving = input(false);
  readonly submitted = output<ProductCreate>();
  readonly canceled = output<void>();

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    stock: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), positiveIntegerValidator],
    }),
  });

  constructor() {
    effect(() => {
      const product = this.product();

      if (!product) {
        return;
      }

      this.form.reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
      });
    });
  }

  save(): void {
    if (this.form.invalid || this.form.pending || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  hasError(controlName: keyof ProductCreate, errorCode: string): boolean {
    const control = this.form.controls[controlName];

    return control.touched && control.hasError(errorCode);
  }
}

function positiveIntegerValidator(control: AbstractControl<number>): ValidationErrors | null {
  const value = control.value;

  if (Number.isInteger(value) && value >= 0) {
    return null;
  }

  return { positiveInteger: true };
}
