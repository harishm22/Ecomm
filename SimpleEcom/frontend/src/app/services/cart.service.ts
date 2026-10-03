import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartItem } from '../models/product.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) {
    this.loadCart();
    this.syncCartWithLatestPrices().subscribe();
  }

  addToCart(productId: number, price: number, username: string, maxStock?: number): { success: boolean; message?: string } {
    const existingItem = this.cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      if (maxStock !== undefined && existingItem.quantity >= maxStock) {
        return { success: false, message: `Only ${maxStock} items available in stock.` };
      }
      existingItem.quantity += 1;
      existingItem.price = price; // Ensure latest price
    } else {
      if (maxStock !== undefined && maxStock <= 0) {
        return { success: false, message: 'This product is out of stock.' };
      }
      this.cartItems.push({
        productId,
        price,
        quantity: 1,
        username
      });
    }
    
    this.saveCart();
    this.cartSubject.next([...this.cartItems]);
    return { success: true };
  }

  getItemQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  }

  updateItemPrice(productId: number, newPrice: number): void {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item && item.price !== newPrice) {
      console.log(`[CartService] Updating cart price for product #${productId}: ${item.price} -> ${newPrice}`);
      item.price = newPrice;
      this.saveCart();
      this.cartSubject.next([...this.cartItems]);
    }
  }

  syncCartWithLatestPrices(): Observable<CartItem[]> {
    if (this.cartItems.length === 0) {
      return of([]);
    }

    return this.productService.getAllProducts().pipe(
      map(products => {
        let priceUpdated = false;
        this.cartItems = this.cartItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (product && product.price !== undefined && product.price !== item.price) {
            console.log(`[CartService] Price sync updated product #${item.productId} (${product.name}): ${item.price} -> ${product.price}`);
            priceUpdated = true;
            return {
              ...item,
              price: product.price
            };
          }
          return item;
        });

        if (priceUpdated) {
          this.saveCart();
          this.cartSubject.next([...this.cartItems]);
        }
        return this.cartItems;
      }),
      catchError(err => {
        console.warn('[CartService] Could not sync latest prices from backend:', err);
        return of(this.cartItems);
      })
    );
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
    this.cartSubject.next([...this.cartItems]);
  }

  updateQuantity(productId: number, quantity: number, maxStock?: number): { success: boolean; message?: string } {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item) {
      if (maxStock !== undefined && quantity > maxStock) {
        return { success: false, message: `Cannot exceed available stock of ${maxStock}.` };
      }
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.cartSubject.next([...this.cartItems]);
      }
      return { success: true };
    }
    return { success: false };
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
    this.cartSubject.next([]);
  }

  checkout(customerInfo: any): Observable<any> {
    return this.productService.getAllProducts().pipe(
      map(products => {
        const cartItems = this.getCartItems().map(item => {
          const product = products.find((p: any) => p.id === item.productId);
          return {
            ...item,
            price: product ? product.price : item.price,
            productName: product ? product.name : `Product ${item.productId}`,
            category: product ? product.category : 'Other',
            adminUsername: product ? product.adminUsername : undefined
          };
        });
        return cartItems;
      }),
      catchError(() => {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const cartItems = this.getCartItems().map(item => {
          const product = products.find((p: any) => p.id === item.productId);
          return {
            ...item,
            productName: product ? product.name : `Product ${item.productId}`,
            category: product ? product.category : 'Other',
            adminUsername: product ? product.adminUsername : undefined
          };
        });
        return of(cartItems);
      })
    );
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCart(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
        this.cartSubject.next([...this.cartItems]);
      } catch (e) {
        this.cartItems = [];
      }
    }
  }
}