import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product.model';
import { getDefaultProductImage, getProductImageUrl } from '../../utils/image-utils';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebarComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Shared Reusable Collapsible Admin Sidebar -->
      <app-admin-sidebar activePage="dashboard"></app-admin-sidebar>
      
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Top Header Bar -->
        <div class="header">
          <div class="header-title-area">
            <h1>Dashboard Overview</h1>
            <p class="header-subtitle">Welcome back, <strong>{{username}}</strong>! Here is your live product catalog and store inventory status.</p>
          </div>
        </div>

        <div class="dashboard-body">
          <!-- Quick Stat KPI Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrapper products-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7.5 4.27 9 5.15"></path>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{totalProducts}}</span>
                <span class="stat-title">Total Products</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper stock-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{totalStockUnits}}</span>
                <span class="stat-title">Units in Stock</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper orders-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{totalOrders}}</span>
                <span class="stat-title">Total Orders</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper alerts-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{lowStockCount}}</span>
                <span class="stat-title">Low / Out of Stock</span>
              </div>
            </div>
          </div>

          <!-- Feature Quick Navigation Cards -->
          <div class="quick-nav-grid">
            <div class="feature-card" (click)="manageProducts()">
              <div class="card-header">
                <div class="card-icon products">
                  <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                    <path d="m3.3 7 8.7 5 8.7-5"></path>
                    <path d="M12 22V12"></path>
                  </svg>
                </div>
                <h3>Product Management</h3>
              </div>
              <p>Manage full product catalog, pricing, categories & inventory</p>
              <div class="card-action">
                <span>Manage Products →</span>
              </div>
            </div>
            
            <div class="feature-card" (click)="manageOrders()">
              <div class="card-header">
                <div class="card-icon orders">
                  <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <path d="M12 11h4"></path>
                    <path d="M12 16h4"></path>
                    <path d="M8 11h.01"></path>
                    <path d="M8 16h.01"></path>
                  </svg>
                </div>
                <h3>Order Management</h3>
              </div>
              <p>Track and manage customer orders and deliveries</p>
              <div class="card-action">
                <span>View Orders →</span>
              </div>
            </div>
            
            <div class="feature-card" *ngIf="isSuperAdmin" (click)="manageUsers()">
              <div class="card-header">
                <div class="card-icon users">
                  <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>User Management</h3>
              </div>
              <p>Manage user accounts and administrator permissions</p>
              <div class="card-action">
                <span>Manage Users →</span>
              </div>
            </div>
            
            <div class="feature-card" (click)="viewAnalytics()">
              <div class="card-header">
                <div class="card-icon analytics">
                  <svg class="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3>Analytics & Reports</h3>
              </div>
              <p>View sales performance and business metrics</p>
              <div class="card-action">
                <span>View Analytics →</span>
              </div>
            </div>
          </div>

          <!-- Products Table Section (Visible right on Dashboard) -->
          <div class="products-section-card">
            <div class="section-top-bar">
              <div class="section-title-wrap">
                <h2>My Products & Inventory</h2>
                <span class="product-count-chip">{{filteredProducts.length}} Item(s)</span>
              </div>
              
              <div class="table-controls">
                <div class="search-box">
                  <svg class="search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    (input)="filterProducts()" 
                    placeholder="Search by name or category...">
                  <button *ngIf="searchQuery" class="clear-search-btn" (click)="searchQuery = ''; filterProducts()">✕</button>
                </div>
                <button class="add-product-btn-sm" (click)="addProduct()">+ New Product</button>
              </div>
            </div>

            <!-- Loading State -->
            <div class="loading-state" *ngIf="isLoading">
              <div class="spinner"></div>
              <p>Loading products from database...</p>
            </div>

            <!-- Products Table -->
            <div class="table-responsive" *ngIf="!isLoading && filteredProducts.length > 0">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let product of filteredProducts">
                    <td class="product-cell">
                      <div class="product-thumbnail">
                        <img 
                          *ngIf="getProductImageUrl(product)" 
                          [src]="getProductImageUrl(product)" 
                          [alt]="product.name"
                          (error)="onImageError($event)">
                        <div class="thumbnail-fallback" *ngIf="!getProductImageUrl(product)">
                          {{getDefaultProductImage(product.category || 'default')}}
                        </div>
                      </div>
                      <div class="product-title-group">
                        <span class="product-name">{{product.name}}</span>
                        <span class="product-desc-snippet">{{product.description}}</span>
                      </div>
                    </td>
                    <td>
                      <span class="id-badge">#{{product.id}}</span>
                    </td>
                    <td>
                      <span class="category-tag">{{product.category || 'General'}}</span>
                    </td>
                    <td>
                      <span class="price-val">₹{{product.price}}</span>
                    </td>
                    <td>
                      <span class="stock-qty" [class.low-stock]="(product.quantity || 0) <= 5 && (product.quantity || 0) > 0" [class.out-of-stock]="(product.quantity || 0) === 0">
                        {{product.quantity || 0}} units
                      </span>
                    </td>
                    <td>
                      <span class="status-pill in-stock" *ngIf="(product.quantity || 0) > 5">In Stock</span>
                      <span class="status-pill low" *ngIf="(product.quantity || 0) <= 5 && (product.quantity || 0) > 0">Low Stock</span>
                      <span class="status-pill out" *ngIf="(product.quantity || 0) === 0">Out of Stock</span>
                    </td>
                    <td class="actions-cell text-right">
                      <button class="action-btn edit" (click)="editProduct(product)" title="Edit Product">
                        <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button class="action-btn delete" (click)="deleteProduct(product)" title="Delete Product">
                        <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div class="empty-products" *ngIf="!isLoading && filteredProducts.length === 0">
              <div class="empty-box-icon">
                <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m7.5 4.27 9 5.15"></path>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
              </div>
              <h3 *ngIf="!searchQuery">No products found for admin "{{username}}"</h3>
              <h3 *ngIf="searchQuery">No products matching "{{searchQuery}}"</h3>
              <p *ngIf="!searchQuery">Your product catalog is currently empty. Click below to add your first product.</p>
              <p *ngIf="searchQuery">Try adjusting your search query or clear the filter.</p>
              <div class="empty-actions">
                <button class="add-product-btn" (click)="addProduct()" *ngIf="!searchQuery">+ Add First Product</button>
                <button class="reset-filter-btn" (click)="searchQuery = ''; filterProducts()" *ngIf="searchQuery">Clear Search</button>
                <button class="refresh-secondary-btn" (click)="loadDashboardData()">
                  <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Refresh Data</span>
                </button>
              </div>
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
    
    /* Main Content */
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
      align-items: center;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .refresh-btn.spinning .refresh-icon {
      animation: spin 1s linear infinite;
    }

    .add-product-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }

    .add-product-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(168, 85, 247, 0.45);
    }

    .dashboard-body {
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* KPI Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-svg {
      width: 24px;
      height: 24px;
    }

    .products-bg { background: #f3e8ff; color: #7c3aed; }
    .stock-bg { background: #ecfdf5; color: #059669; }
    .orders-bg { background: #eff6ff; color: #2563eb; }
    .alerts-bg { background: #fffbeb; color: #d97706; }

    .stat-number {
      display: block;
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }

    .stat-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
      display: block;
    }

    /* Quick Nav Grid */
    .quick-nav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }

    .feature-card {
      background: white;
      border-radius: 14px;
      padding: 18px 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      transform: translateY(-3px);
      border-color: #a855f7;
      box-shadow: 0 10px 24px rgba(168, 85, 247, 0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .card-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .feature-svg {
      width: 18px;
      height: 18px;
    }

    .card-icon.products { background: #f3e8ff; color: #7c3aed; }
    .card-icon.orders { background: #eff6ff; color: #2563eb; }
    .card-icon.users { background: #f0fdf4; color: #16a34a; }
    .card-icon.analytics { background: #fdf2f8; color: #db2777; }

    .feature-card h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }

    .feature-card p {
      color: #64748b;
      font-size: 12px;
      line-height: 1.4;
      margin: 0 0 12px 0;
    }

    .card-action {
      color: #7c3aed;
      font-weight: 600;
      font-size: 13px;
      transition: transform 0.2s;
    }

    .feature-card:hover .card-action {
      transform: translateX(3px);
    }

    /* Products Section Card */
    .products-section-card {
      background: white;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      overflow: hidden;
    }

    .section-top-bar {
      padding: 22px 26px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-title-wrap h2 {
      margin: 0;
      font-size: 19px;
      font-weight: 700;
      color: #0f172a;
    }

    .product-count-chip {
      background: #f3e8ff;
      color: #7e22ce;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      font-size: 13px;
      pointer-events: none;
    }

    .search-box input {
      padding: 8px 32px 8px 34px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 13px;
      width: 240px;
      outline: none;
      transition: all 0.2s;
    }

    .search-box input:focus {
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
      width: 280px;
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 12px;
      padding: 4px;
    }

    .add-product-btn-sm {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-product-btn-sm:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .add-product-btn-sm:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .products-table th {
      background: #f8fafc;
      padding: 14px 20px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
    }

    .products-table td {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #334155;
      vertical-align: middle;
    }

    .products-table tr:hover td {
      background: #f8fafc;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 320px;
    }

    .product-thumbnail {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 10px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-fallback {
      font-size: 20px;
    }

    .product-title-group {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .product-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-desc-snippet {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    .id-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .category-tag {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 600;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 8px;
      display: inline-block;
    }

    .price-val {
      font-weight: 800;
      color: #059669;
      font-size: 15px;
    }

    .stock-qty {
      font-weight: 600;
      color: #334155;
    }

    .stock-qty.low-stock { color: #d97706; }
    .stock-qty.out-of-stock { color: #dc2626; }

    .status-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-pill.in-stock {
      background: #dcfce7;
      color: #15803d;
    }

    .status-pill.low {
      background: #fef3c7;
      color: #b45309;
    }

    .status-pill.out {
      background: #fee2e2;
      color: #b91c1c;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .text-right {
      text-align: right;
    }

    .search-svg {
      position: absolute;
      left: 10px;
      width: 15px;
      height: 15px;
      color: #94a3b8;
      pointer-events: none;
    }

    .refresh-svg {
      width: 15px;
      height: 15px;
    }

    .action-btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      margin-left: 6px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .btn-svg {
      width: 14px;
      height: 14px;
    }

    .action-btn.edit {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    .action-btn.edit:hover {
      background: #2563eb;
      color: white;
    }

    .action-btn.delete {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .action-btn.delete:hover {
      background: #dc2626;
      color: white;
    }

    /* Loading & Empty States */
    .loading-state {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      margin: 0 auto 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-products {
      padding: 60px 20px;
      text-align: center;
      max-width: 480px;
      margin: 0 auto;
    }

    .empty-box-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .empty-svg {
      width: 32px;
      height: 32px;
    }

    .empty-products h3 {
      margin: 0 0 6px 0;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .empty-products p {
      color: #64748b;
      font-size: 14px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .reset-filter-btn, .refresh-secondary-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .reset-filter-btn:hover, .refresh-secondary-btn:hover {
      background: #e2e8f0;
    }

    @media (max-width: 900px) {
      .dashboard-container {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        min-width: 100%;
      }

      .header {
        padding: 16px 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .dashboard-body {
        padding: 20px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  username: string = '';
  isSuperAdmin: boolean = false;
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  
  totalProducts: number = 0;
  totalStockUnits: number = 0;
  totalOrders: number = 0;
  lowStockCount: number = 0;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const realUsername = this.authService.getUsername() || localStorage.getItem('username') || '';
    this.username = realUsername || 'Admin';
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const activeAdmin = (this.authService.getUsername() || localStorage.getItem('username') || '').trim();
    console.log('[AdminDashboard] Loading products for activeAdmin:', activeAdmin, 'isSuperAdmin:', this.isSuperAdmin);

    const productObs = this.isSuperAdmin
      ? this.productService.getAllProducts()
      : this.productService.getProductsByAdmin(activeAdmin);

    productObs.subscribe({
      next: (products) => {
        console.log('[AdminDashboard] Received products from backend:', products);
        this.products = products || [];
        this.totalProducts = this.products.length;
        
        // Calculate inventory stats
        this.totalStockUnits = this.products.reduce((acc, p) => acc + (p.quantity || 0), 0);
        this.lowStockCount = this.products.filter(p => (p.quantity || 0) <= 5).length;
        
        this.filterProducts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[AdminDashboard] Error fetching products:', err);
        this.products = [];
        this.filteredProducts = [];
        this.totalProducts = 0;
        this.totalStockUnits = 0;
        this.lowStockCount = 0;
        this.isLoading = false;
      }
    });

    const ordersObs = this.isSuperAdmin
      ? this.orderService.getAllOrders()
      : this.orderService.getOrdersByAdmin(activeAdmin);

    ordersObs.subscribe({
      next: (orders) => {
        if (this.isSuperAdmin) {
          this.totalOrders = (orders || []).length;
        } else {
          const adminOrders = (orders || []).filter(o =>
            (o.items || []).some(item => !item.adminUsername || item.adminUsername.toLowerCase() === activeAdmin.toLowerCase())
          );
          this.totalOrders = adminOrders.length;
        }
      },
      error: () => {
        this.totalOrders = 0;
      }
    });
  }

  filterProducts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const q = this.searchQuery.toLowerCase().trim();
      this.filteredProducts = this.products.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.id && p.id.toString().includes(q))
      );
    }
  }

  addProduct(): void {
    this.router.navigate(['/add-product']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/edit-product', product.id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"? This will permanently remove it from the database.`)) {
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.totalProducts = this.products.length;
          this.totalStockUnits = this.products.reduce((acc, p) => acc + (p.quantity || 0), 0);
          this.lowStockCount = this.products.filter(p => (p.quantity || 0) <= 5).length;
          this.filterProducts();
          alert(`Product "${product.name}" deleted successfully.`);
        },
        error: (err) => {
          console.error('[AdminDashboard] Failed to delete product:', err);
          alert('Failed to delete product. Please verify server connection.');
        }
      });
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  getProductImageUrl(product: Product): string {
    return getProductImageUrl(product);
  }

  getDefaultProductImage(category: string | undefined): string {
    return getDefaultProductImage(category || 'default');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  manageProducts(): void {
    this.router.navigate(['/product-management']);
  }

  manageUsers(): void {
    this.router.navigate(['/user-management']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  manageOrders(): void {
    this.router.navigate(['/order-management']);
  }

  viewProfile(): void {
    this.router.navigate(['/admin-profile']);
  }
}