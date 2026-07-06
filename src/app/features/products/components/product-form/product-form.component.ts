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
  templateUrl: './product-form.component.html',
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
