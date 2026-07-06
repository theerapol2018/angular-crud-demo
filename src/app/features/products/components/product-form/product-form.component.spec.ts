import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormComponent } from './product-form.component';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks invalid controls as touched and does not submit', () => {
    const submittedSpy = vi.spyOn(component.submitted, 'emit');

    component.form.controls.name.setValue('');
    component.save();

    expect(component.form.controls.name.touched).toBe(true);
    expect(submittedSpy).not.toHaveBeenCalled();
  });

  it('submits the form value when valid', () => {
    const submittedSpy = vi.spyOn(component.submitted, 'emit');

    component.form.setValue({
      name: 'Monitor',
      price: 7500,
      stock: 4,
    });
    component.save();

    expect(submittedSpy).toHaveBeenCalledWith({
      name: 'Monitor',
      price: 7500,
      stock: 4,
    });
  });
});
