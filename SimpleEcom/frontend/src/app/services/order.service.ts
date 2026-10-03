import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductService } from './product.service';

export interface Order {
  id: number;
  idempotencyKey?: string;
  customerName: string;
  username?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping?: number;
  total: number;
  items: Array<{
    productId?: number;
    productName: string;
    category: string;
    quantity: number;
    price: number;
    tax: number;
    adminUsername?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private directApiUrl = 'http://localhost:8083/api/orders';

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {
    this.loadOrdersFromStorage();
    this.fetchOrdersFromBackend();
  }

  private loadOrdersFromStorage(): void {
    const stored = localStorage.getItem('orders');
    if (stored && stored !== 'null' && stored !== '[]') {
      try {
        const orders = JSON.parse(stored).map((order: any) => this.normalizeOrder(order));
        this.ordersSubject.next(orders);
      } catch (error) {
        this.ordersSubject.next([]);
      }
    } else {
      this.ordersSubject.next([]);
    }
  }

  private saveOrdersToStorage(orders: Order[]): void {
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  private normalizeOrder(order: any): Order {
    return {
      id: order.id,
      idempotencyKey: order.idempotencyKey || '',
      customerName: order.customerName || 'Customer',
      username: order.username || '',
      email: order.email || '',
      phone: order.phone || '',
      address: order.address || {
        street: order.street || '',
        city: order.city || '',
        state: order.state || '',
        zipCode: order.zipCode || '',
        country: order.country || 'India'
      },
      street: order.street || order.address?.street || '',
      city: order.city || order.address?.city || '',
      state: order.state || order.address?.state || '',
      zipCode: order.zipCode || order.address?.zipCode || '',
      country: order.country || order.address?.country || 'India',
      orderDate: new Date(order.orderDate || Date.now()),
      status: (order.status || 'pending').toLowerCase() as any,
      subtotal: Number(order.subtotal || 0),
      tax: Number(order.tax || 0),
      shipping: Number(order.shipping || 0),
      total: Number(order.total || 0),
      items: (order.items || []).map((item: any) => ({
        productId: item.productId,
        productName: item.productName || 'Product',
        category: item.category || 'General',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        tax: Number(item.tax || 0),
        adminUsername: item.adminUsername || ''
      }))
    };
  }

  fetchOrdersFromBackend(): void {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.get<any[]>(this.directApiUrl, { headers: this.getHeaders() })),
      catchError(err => {
        console.warn('[OrderService] Backend not reachable, using local order cache:', err);
        return of(null);
      })
    ).subscribe(backendOrders => {
      if (backendOrders && Array.isArray(backendOrders)) {
        const normalized = backendOrders.map(o => this.normalizeOrder(o));
        this.ordersSubject.next(normalized);
        this.saveOrdersToStorage(normalized);
      }
    });
  }

  getAllOrders(): Observable<Order[]> {
    this.fetchOrdersFromBackend();
    return this.orders$;
  }

  getUserOrders(username: string): Observable<Order[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${username}`, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.get<any[]>(`${this.directApiUrl}/user/${username}`, { headers: this.getHeaders() })),
      map(orders => (orders || []).map(o => this.normalizeOrder(o))),
      catchError(() => {
        const allOrders = this.ordersSubject.value;
        const userOrders = allOrders.filter(o => !username || o.username === username || o.customerName === username);
        return of(userOrders);
      })
    );
  }

  getOrdersByAdmin(adminUsername: string): Observable<Order[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/${adminUsername}`, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.get<any[]>(`${this.directApiUrl}/admin/${adminUsername}`, { headers: this.getHeaders() })),
      map(orders => (orders || []).map(o => this.normalizeOrder(o))),
      catchError(err => {
        console.warn('[OrderService] Could not fetch admin orders:', err);
        return of([]);
      })
    );
  }

  createOrder(cartItems: any[], customerInfo: any, idempotencyKey?: string): Observable<Order> {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalTax = cartItems.reduce((sum, item) => sum + (item.tax || 0), 0);
    const shippingFee = subtotal >= 500 ? 0 : 50;
    const currentUser = customerInfo.username || customerInfo.name || localStorage.getItem('username') || 'user';
    const key = idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

    const orderPayload = {
      idempotencyKey: key,
      customerName: customerInfo.name || currentUser,
      username: currentUser,
      email: customerInfo.email || 'customer@example.com',
      phone: customerInfo.phone || '+91 ',
      street: customerInfo.address?.street || customerInfo.street || '',
      city: customerInfo.address?.city || customerInfo.city || '',
      state: customerInfo.address?.state || customerInfo.state || '',
      zipCode: customerInfo.address?.zipCode || customerInfo.zipCode || '',
      country: customerInfo.address?.country || customerInfo.country || 'India',
      orderDate: new Date(),
      status: 'pending',
      subtotal: subtotal,
      tax: totalTax,
      shipping: shippingFee,
      total: subtotal + totalTax + shippingFee,
      items: cartItems.map(item => ({
        productId: Number(item.productId || item.id),
        productName: item.productName || `Product #${item.productId}`,
        category: item.category || 'General',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        tax: Number(item.tax || 0),
        adminUsername: item.adminUsername || null
      }))
    };

    // Reduce stock quantities in MySQL
    this.reduceStockQuantities(cartItems);

    return this.http.post<any>(this.apiUrl, orderPayload, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.post<any>(this.directApiUrl, orderPayload, { headers: this.getHeaders() })),
      map(res => this.normalizeOrder(res)),
      catchError(err => {
        console.warn('[OrderService] Backend save failed, saving to local order store as fallback:', err);
        const currentOrders = this.ordersSubject.value;
        const newOrderId = Math.max(0, ...currentOrders.map(o => o.id)) + 1;
        const localOrder: Order = this.normalizeOrder({
          ...orderPayload,
          id: newOrderId
        });
        return of(localOrder);
      }),
      tap(createdOrder => {
        const current = this.ordersSubject.value;
        const updated = [createdOrder, ...current.filter(o => o.id !== createdOrder.id)];
        this.ordersSubject.next(updated);
        this.saveOrdersToStorage(updated);
        window.dispatchEvent(new CustomEvent('stockUpdated'));
      })
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const currentOrders = this.ordersSubject.value;
    const orderToUpdate = currentOrders.find(order => order.id === orderId);
    const previousStatus = orderToUpdate ? orderToUpdate.status : null;

    // Handle inventory sync on status transition
    if (orderToUpdate && status === 'cancelled' && previousStatus !== 'cancelled') {
      this.revertStockQuantities(orderToUpdate);
    } else if (orderToUpdate && previousStatus === 'cancelled' && status !== 'cancelled') {
      this.reduceStockQuantities(orderToUpdate.items);
    }

    // Update local state immediately
    const updatedOrders = currentOrders.map(order => 
      order.id === orderId ? { ...order, status: status as any } : order
    );
    this.ordersSubject.next(updatedOrders);
    this.saveOrdersToStorage(updatedOrders);
    window.dispatchEvent(new CustomEvent('stockUpdated'));

    // Send update to backend
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { status }, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.put(`${this.directApiUrl}/${orderId}/status`, { status }, { headers: this.getHeaders() })),
      catchError(err => {
        console.warn('[OrderService] Backend status update fallback:', err);
        return of({ success: true, localOnly: true });
      })
    );
  }

  deleteOrder(orderId: number): Observable<any> {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.filter(order => order.id !== orderId);
    this.ordersSubject.next(updatedOrders);
    this.saveOrdersToStorage(updatedOrders);

    return this.http.delete(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.delete(`${this.directApiUrl}/${orderId}`, { headers: this.getHeaders() })),
      catchError(err => {
        console.warn('[OrderService] Backend delete fallback:', err);
        return of({ success: true });
      })
    );
  }

  refreshOrders(): void {
    this.fetchOrdersFromBackend();
  }

  private reduceStockQuantities(cartItems: any[]): void {
    const itemsToReduce = cartItems.map(cartItem => ({
      productId: Number(cartItem.productId || cartItem.id || cartItem.product_id),
      quantity: Number(cartItem.quantity || 1)
    })).filter(item => item.productId > 0 && item.quantity > 0);

    if (itemsToReduce.length > 0) {
      this.productService.reduceStock(itemsToReduce).subscribe({
        next: () => {
          console.log('✅ Stock reduced in database successfully');
          window.dispatchEvent(new CustomEvent('stockUpdated'));
        },
        error: (err) => {
          console.error('❌ Failed to reduce stock in database:', err);
        }
      });
    }
  }

  private revertStockQuantities(order: Order): void {
    const itemsToRevert = (order.items || []).map((item: any) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity || 1)
    })).filter(item => item.productId > 0 && item.quantity > 0);

    if (itemsToRevert.length > 0) {
      this.productService.revertStock(itemsToRevert).subscribe({
        next: () => {
          console.log('✅ Stock reverted in database successfully');
          window.dispatchEvent(new CustomEvent('stockUpdated'));
        },
        error: (err) => {
          console.error('❌ Failed to revert stock in database:', err);
        }
      });
    }
  }
}