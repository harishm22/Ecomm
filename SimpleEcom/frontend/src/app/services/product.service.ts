import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';
  private directApiUrl = 'http://localhost:8082/api/products';

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

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.warn('API Gateway failed for getAllProducts, falling back to direct service on port 8082:', err);
        return this.http.get<Product[]>(this.directApiUrl, { headers: this.getHeaders() });
      }),
      tap(products => {
        if (products && products.length > 0) {
          localStorage.removeItem('products');
        }
      }),
      catchError(error => {
        console.error('Error fetching all products from backend:', error);
        return of([]);
      }),
      map(products => this.applyStockReductions(products))
    );
  }

  getProductsByAdmin(adminUsername: string): Observable<Product[]> {
    const username = (adminUsername || '').trim();
    if (!username) {
      return this.getAllProducts();
    }

    return this.http.get<Product[]>(`${this.apiUrl}/admin/${username}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.warn(`Gateway call to /api/products/admin/${username} failed, falling back to direct port 8082:`, err);
        return this.http.get<Product[]>(`${this.directApiUrl}/admin/${username}`, { headers: this.getHeaders() });
      }),
      catchError(err => {
        console.warn('Direct admin endpoint failed, falling back to getAllProducts with local filter:', err);
        return this.getAllProducts().pipe(
          map(all => (all || []).filter(p => !p.adminUsername || p.adminUsername.toLowerCase() === username.toLowerCase()))
        );
      }),
      tap(products => {
        if (products && products.length > 0) {
          localStorage.removeItem('products');
        }
      }),
      catchError(error => {
        console.error(`Error fetching products for admin ${username}:`, error);
        return of([]);
      }),
      map(products => this.applyStockReductions(products))
    );
  }

  getProductById(id: number): Observable<Product> {
    console.log('Getting product by ID:', id);
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => this.http.get<Product>(`${this.directApiUrl}/${id}`)),
      catchError(error => {
        console.log('Backend unavailable, using localStorage');
        const products = this.getProductsFromStorage();
        const product = products.find(p => p.id === id);
        return of(product || this.createEmptyProduct());
      })
    );
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.warn('Gateway addProduct failed, trying direct 8082:', err);
        return this.http.post<Product>(this.directApiUrl, product, { headers: this.getHeaders() });
      }),
      catchError(error => {
        if (error.status === 0) {
          console.warn('Backend unavailable (status 0), saving to localStorage as fallback');
          return of(this.addProductToStorage(product));
        }
        console.error('Backend returned error during addProduct:', error);
        throw error;
      })
    );
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    console.log('Updating product:', id, product);
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { headers: this.getHeaders() }).pipe(
      catchError(() => this.http.put<Product>(`${this.directApiUrl}/${id}`, product, { headers: this.getHeaders() })),
      catchError(error => {
        if (error.status === 0) {
          console.warn('Backend unavailable (status 0), updating localStorage as fallback');
          return of(this.updateProductInStorage(id, product));
        }
        console.error('Backend returned error during updateProduct:', error);
        throw error;
      })
    );
  }

  deleteProduct(id: number): Observable<any> {
    console.log('Deleting product with ID:', id);
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      catchError(() => this.http.delete(`${this.directApiUrl}/${id}`, {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      })),
      catchError(error => {
        if (error.status === 0) {
          console.warn('Backend unavailable (status 0), deleting from localStorage as fallback');
          this.deleteProductFromStorage(id);
          return of('Product deleted successfully');
        }
        console.error('Backend returned error during deleteProduct:', error);
        throw error;
      })
    );
  }

  reduceStock(items: { productId: number; quantity: number }[]): Observable<any> {
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      return of({ success: true });
    }
    return this.http.post(`${this.apiUrl}/reduce-stock`, validItems, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404 || err.status === 502 || err.status === 503) {
          console.warn('Gateway reduce-stock failed, trying direct port 8082:', err);
          return this.http.post(`${this.directApiUrl}/reduce-stock`, validItems, {
            headers: this.getHeaders(),
            responseType: 'text'
          });
        }
        return of({ success: false, error: err });
      }),
      catchError(err => {
        console.error('Failed to reduce stock on backend:', err);
        return of({ success: false, error: err });
      })
    );
  }

  revertStock(items: { productId: number; quantity: number }[]): Observable<any> {
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      return of({ success: true });
    }
    return this.http.post(`${this.apiUrl}/revert-stock`, validItems, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404 || err.status === 502 || err.status === 503) {
          console.warn('Gateway revert-stock failed, trying direct port 8082:', err);
          return this.http.post(`${this.directApiUrl}/revert-stock`, validItems, {
            headers: this.getHeaders(),
            responseType: 'text'
          });
        }
        return of({ success: false, error: err });
      }),
      catchError(err => {
        console.error('Failed to revert stock on backend:', err);
        return of({ success: false, error: err });
      })
    );
  }

  private getProductsFromStorage(): Product[] {
    const stored = localStorage.getItem('products');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private addProductToStorage(product: Product): Product {
    const products = this.getProductsFromStorage();
    const newProduct = {
      ...product,
      id: Date.now() // Generate unique ID
    };
    products.push(newProduct);
    this.saveProductsToStorage(products);
    return newProduct;
  }

  private updateProductInStorage(id: number, product: Product): Product {
    const products = this.getProductsFromStorage();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...product, id };
      this.saveProductsToStorage(products);
      return products[index];
    }
    return product;
  }

  private deleteProductFromStorage(id: number): void {
    const products = this.getProductsFromStorage();
    const filteredProducts = products.filter(p => p.id !== id);
    this.saveProductsToStorage(filteredProducts);
  }

  private saveProductsToStorage(products: Product[]): void {
    localStorage.setItem('products', JSON.stringify(products));
  }

  private applyStockReductions(products: Product[]): Product[] {
    const stockReductions = JSON.parse(localStorage.getItem('stockReductions') || '{}');
    
    return products.map(product => {
      const reduction = stockReductions[product.id!] || 0;
      const adjustedQuantity = Math.max(0, (product.quantity || 0) - reduction);
      
      if (reduction > 0) {
        console.log(`Applying stock reduction to ${product.name}: ${product.quantity} - ${reduction} = ${adjustedQuantity}`);
      }
      
      return {
        ...product,
        quantity: adjustedQuantity
      };
    });
  }

  private createEmptyProduct(): Product {
    return {
      id: 0,
      name: 'Product Not Found',
      description: 'This product could not be found',
      price: 0,
      category: 'Unknown',
      imageUrl: 'https://via.placeholder.com/300x200/95a5a6/ffffff?text=Not+Found',
      quantity: 0
    };
  }
}