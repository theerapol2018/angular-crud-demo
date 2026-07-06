export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export type ProductCreate = Omit<Product, 'id'>;
export type ProductUpdate = ProductCreate;
