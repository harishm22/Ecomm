export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  adminUsername?: string;
  imageUrl?: string;
  category?: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  price: number;
  quantity: number;
  username: string;
  adminUsername?: string;
}