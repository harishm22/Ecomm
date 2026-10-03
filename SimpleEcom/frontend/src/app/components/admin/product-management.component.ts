import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { getDefaultProductImage, getProductImageUrl } from '../../utils/image-utils';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="products"></app-admin-sidebar>

      <div class="main-content">
        <div class="header">
          <div class="header-title-area">
            <h1>Product Catalog Management</h1>
            <p class="header-subtitle">Manage inventory, pricing, categories and product listings.</p>
          </div>
          <div class="header-actions">
            <button class="add-btn" (click)="addProduct()">+ Add New Product</button>
          </div>
        </div>

        <div class="container">
          <div class="loading" *ngIf="loading">
            <p>Loading products...</p>
          </div>

          <div class="products-grid" *ngIf="!loading && products.length > 0">
            <div class="product-card" *ngFor="let product of products">
              <!-- Top Image Area with Floating Badges -->
              <div class="product-image-container">
                <div class="image-wrapper">
                  <img *ngIf="getProductImageUrl(product)" [src]="getProductImageUrl(product)" [alt]="product.name" />
                  <div *ngIf="!getProductImageUrl(product)" class="default-icon">{{getDefaultProductImage(product.category || 'default')}}</div>
                </div>
                
                <!-- Floating Badges -->
                <span class="category-chip">{{product.category || 'General'}}</span>
                <span class="product-id-badge">#{{product.id}}</span>
              </div>

              <!-- Content Body -->
              <div class="product-info">
                <h3 class="product-title" [title]="product.name">{{product.name}}</h3>
                <p class="description" [title]="product.description">{{product.description || 'No product description provided.'}}</p>

                <!-- Metrics Row (Price + Stock Status) -->
                <div class="product-metrics-row">
                  <div class="price-block">
                    <span class="price-label">Price</span>
                    <span class="price-val">₹{{product.price}}</span>
                  </div>

                  <div class="stock-status-badge" 
                    [class.in-stock]="(product.quantity || 0) > 5"
                    [class.low-stock]="(product.quantity || 0) <= 5 && (product.quantity || 0) > 0"
                    [class.out-of-stock]="(product.quantity || 0) === 0">
                    <span class="status-indicator-dot"></span>
                    <span>{{(product.quantity || 0) === 0 ? 'Out of Stock' : ((product.quantity || 0) <= 5 ? 'Low: ' + product.quantity + ' left' : product.quantity + ' in stock')}}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="product-actions">
                  <button class="action-btn edit-action" (click)="editProduct(product)">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    <span>Edit Product</span>
                  </button>
                  <button class="action-btn delete-action" (click)="deleteProduct(product)" title="Delete Product">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="no-products" *ngIf="!loading && products.length === 0">
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7.5 4.27 9 5.15"></path>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
              </div>
              <h3>No Products Found</h3>
              <p>Start by adding your first product to the inventory.</p>
              <button class="add-btn" (click)="addProduct()">+ Add First Product</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      max-height: 100vh;
    }

    .header {
      background: white;
      padding: 24px 36px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    
    .header-title-area h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748b;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .add-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }
    
    .add-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
    }
    
    .container {
      padding: 32px 36px;
      flex: 1;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .product-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(124, 58, 237, 0.12);
      border-color: #cbd5e1;
    }

    /* Product Image Area */
    .product-image-container {
      position: relative;
      height: 200px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 16px;
    }

    .image-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-wrapper img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.06));
    }

    .product-card:hover .image-wrapper img {
      transform: scale(1.06);
    }

    .default-icon {
      font-size: 48px;
    }

    .category-chip {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid #e2e8f0;
      color: #7c3aed;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 9px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .product-id-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
    }

    /* Product Info */
    .product-info {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-title {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.3px;
    }

    .description {
      color: #64748b;
      font-size: 12.5px;
      line-height: 1.5;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
    }

    .product-metrics-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }

    .price-block {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 10.5px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .stock-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .stock-status-badge.in-stock {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .stock-status-badge.low-stock {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .stock-status-badge.out-of-stock {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .status-indicator-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Action Buttons */
    .product-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }

    .action-btn {
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .btn-icon {
      width: 15px;
      height: 15px;
    }

    .edit-action {
      flex: 1;
      background: #f3e8ff;
      color: #7c3aed;
      border-color: #e9d5ff;
    }

    .edit-action:hover {
      background: #7c3aed;
      color: #ffffff;
      border-color: #7c3aed;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }

    .delete-action {
      width: 40px;
      background: #fef2f2;
      color: #dc2626;
      border-color: #fee2e2;
      padding: 9px;
    }

    .delete-action:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }
    
    .loading {
      text-align: center;
      padding: 60px;
      color: #6c757d;
      font-size: 18px;
    }
    
    .no-products {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .empty-state {
      text-align: center;
      max-width: 400px;
    }
    
    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 24px;
    }
    
    .empty-state p {
      color: #6c757d;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .empty-state .add-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const activeAdmin = (this.authService.getUsername() || localStorage.getItem('username') || '').trim();
    console.log('[ProductManagement] activeAdmin resolved to:', activeAdmin);
    
    if (this.authService.isSuperAdmin()) {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          console.log('[ProductManagement] superadmin products:', products);
          this.products = products || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('[ProductManagement] superadmin error:', error);
          this.loading = false;
        }
      });
    } else {
      console.log('[ProductManagement] Calling getProductsByAdmin for:', activeAdmin);
      this.productService.getProductsByAdmin(activeAdmin).subscribe({
        next: (products) => {
          console.log('[ProductManagement] seller products received:', products);
          this.products = products || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('[ProductManagement] seller error:', error);
          this.loading = false;
        }
      });
    }
  }

  addProduct(): void {
    this.router.navigate(['/add-product']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/edit-product', product.id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
      console.log('Attempting to delete product:', product);
      this.productService.deleteProduct(product.id!).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          this.products = this.products.filter(p => p.id !== product.id);
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          if (error.status === 0) {
            alert('Cannot connect to server. Please ensure the product service is running.');
          } else {
            alert(`Failed to delete product: ${error.message}`);
          }
        }
      });
    }
  }

  getDefaultProductImage(category: string | undefined): string {
    return getDefaultProductImage(category || 'default');
  }

  getProductImageUrl(product: Product): string {
    return getProductImageUrl(product);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}