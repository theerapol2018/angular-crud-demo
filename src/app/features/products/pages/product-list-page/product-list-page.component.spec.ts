import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductStoreService } from '../../data-access/product-store.service';
import { ProductListPageComponent } from './product-list-page.component';

describe('ProductListPageComponent', () => {
  let fixture: ComponentFixture<ProductListPageComponent>;
  let store: {
    products: () => { id: string; name: string; price: number; stock: number }[];
    loading: () => boolean;
    saving: () => boolean;
    error: () => string | null;
    totalStock: () => number;
    load: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    store = {
      products: () => [{ id: '1', name: 'Keyboard', price: 1200, stock: 5 }],
      loading: () => false,
      saving: () => false,
      error: () => null,
      totalStock: () => 5,
      load: vi.fn(),
      remove: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductStoreService,
          useValue: store,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads products on init', () => {
    expect(store.load).toHaveBeenCalledOnce();
  });

  it('deletes after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.componentInstance.deleteProduct('1');

    expect(store.remove).toHaveBeenCalledWith('1');
  });

  it('does not delete when confirmation is canceled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    fixture.componentInstance.deleteProduct('1');

    expect(store.remove).not.toHaveBeenCalled();
  });
});
