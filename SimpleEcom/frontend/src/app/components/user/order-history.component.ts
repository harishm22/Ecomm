import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper">
      <!-- Ambient Lighting Background -->
      <div class="mesh-backdrop">
        <div class="mesh-orb orb-1"></div>
        <div class="mesh-orb orb-2"></div>
      </div>

      <!-- Top Header Navigation -->
      <div class="header">
        <div class="header-inner">
          <div class="header-title-area">
            <h1>My Order History</h1>
            <p class="header-subtitle">Track deliveries, inspect itemized invoices, and review your previous purchases.</p>
          </div>
          <div class="header-nav-actions">
            <button class="nav-btn secondary-nav-btn" (click)="goBack()">
              ← Dashboard
            </button>
            <button class="nav-btn primary-nav-btn" (click)="goShopping()">
              Browse Catalog
            </button>
            <button class="nav-btn danger-nav-btn" (click)="clearOrderHistory()" *ngIf="userOrders.length > 0" title="Clear All History">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear History</span>
            </button>
          </div>
        </div>
      </div>

      <div class="orders-container">
        <!-- Active Orders List -->
        <div class="orders-grid" *ngIf="userOrders.length > 0">
          <div class="order-card" *ngFor="let order of userOrders">
            
            <!-- Order Card Header -->
            <div class="order-card-header">
              <div class="order-identity">
                <div class="order-id-badge">
                  <span class="id-hash">#</span>
                  <span class="id-num">{{order.id}}</span>
                </div>
                <div class="order-meta-info">
                  <div class="order-date-row">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{{order.orderDate | date:'medium'}}</span>
                  </div>
                  <div class="status-badge" [ngClass]="order.status.toLowerCase()">
                    <span class="status-dot"></span>
                    <span class="status-label">{{order.status | titlecase}}</span>
                  </div>
                </div>
              </div>

              <!-- Order Grand Total -->
              <div class="order-grand-total">
                <span class="price-label">Order Total</span>
                <span class="price-value">₹{{order.total.toFixed(2)}}</span>
              </div>
            </div>

            <!-- Items List in Order Card -->
            <div class="order-items-preview">
              <div class="item-row" *ngFor="let item of order.items">
                <div class="item-left">
                  <div class="item-icon-box">📦</div>
                  <div class="item-info">
                    <span class="item-title">{{item.productName}}</span>
                    <span class="item-category" *ngIf="item.category">{{item.category}}</span>
                  </div>
                </div>
                <div class="item-right">
                  <span class="item-qty-tag">{{item.quantity}} × ₹{{item.price.toFixed(2)}}</span>
                  <span class="item-line-total">₹{{(item.price * item.quantity).toFixed(2)}}</span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Actions -->
            <div class="order-card-footer">
              <div class="footer-left">
                <span class="total-items-tag">{{order.items.length}} {{order.items.length === 1 ? 'item' : 'items'}}</span>
              </div>
              <div class="footer-actions">
                <button class="action-btn view-details-btn" (click)="viewOrder(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>View Details</span>
                </button>
                <button class="action-btn cancel-order-btn" (click)="cancelOrder(order)" *ngIf="order.status === 'pending' || order.status === 'processing'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Empty Orders State -->
        <div class="empty-orders-card" *ngIf="userOrders.length === 0">
          <div class="empty-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet. Discover trending 3D products and get exclusive deals today!</p>
          <button class="start-shop-btn" (click)="goShopping()">
            <span>Start Shopping</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modern Glassmorphic Order Details Modal -->
      <div class="modal-backdrop" *ngIf="selectedOrder" (click)="closeOrderDetails()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <span class="modal-order-badge">Invoice Receipt</span>
              <h2>Order #{{selectedOrder.id}}</h2>
              <span class="modal-date">{{selectedOrder.orderDate | date:'medium'}}</span>
            </div>
            <button class="modal-close-btn" (click)="closeOrderDetails()" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Customer & Delivery Two-Column Card -->
            <div class="details-cards-grid">
              <div class="info-section-card">
                <div class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Customer Details</span>
                </div>
                <div class="info-key-val">
                  <span class="k">Name:</span>
                  <span class="v">{{selectedOrder.customerName}}</span>
                </div>
                <div class="info-key-val">
                  <span class="k">Email:</span>
                  <span class="v">{{selectedOrder.email}}</span>
                </div>
                <div class="info-key-val">
                  <span class="k">Phone:</span>
                  <span class="v">{{selectedOrder.phone}}</span>
                </div>
              </div>

              <div class="info-section-card">
                <div class="section-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Shipping Address</span>
                </div>
                <p class="address-text">{{selectedOrder.address.street}}</p>
                <p class="address-text">{{selectedOrder.address.city}}, {{selectedOrder.address.state}} {{selectedOrder.address.zipCode}}</p>
                <p class="address-text">{{selectedOrder.address.country}}</p>
              </div>
            </div>

            <!-- Ordered Items List -->
            <div class="items-table-section">
              <h3 class="section-heading">Purchased Items</h3>
              <div class="modal-items-list">
                <div class="modal-item-row" *ngFor="let item of selectedOrder.items">
                  <div class="modal-item-left">
                    <span class="modal-item-name">{{item.productName}}</span>
                    <span class="modal-item-cat">{{item.category || 'General'}}</span>
                  </div>
                  <div class="modal-item-right">
                    <span class="modal-item-price-calc">{{item.quantity}} × ₹{{item.price.toFixed(2)}}</span>
                    <span class="modal-item-price-sum">₹{{(item.price * item.quantity).toFixed(2)}}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Summary Box -->
            <div class="invoice-summary-box">
              <div class="summary-line">
                <span>Subtotal</span>
                <span>₹{{selectedOrder.subtotal.toFixed(2)}}</span>
              </div>
              <div class="summary-line">
                <span>Taxes & GST</span>
                <span>₹{{selectedOrder.tax.toFixed(2)}}</span>
              </div>
              <div class="summary-line">
                <span>Shipping</span>
                <span class="free-pill">FREE</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-line total-highlight">
                <span>Total Paid</span>
                <span class="total-number">₹{{selectedOrder.total.toFixed(2)}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow-x: hidden;
      padding-bottom: 60px;
    }

    /* Ambient Lighting Background */
    .mesh-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .mesh-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.45;
    }

    .orb-1 {
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, #e9d5ff 0%, #c084fc 60%, transparent 80%);
      top: -120px;
      left: -80px;
    }

    .orb-2 {
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, #ddd6fe 0%, #a78bfa 60%, transparent 80%);
      bottom: 50px;
      right: -80px;
    }

    /* Header Navigation */
    .header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      position: relative;
      z-index: 10;
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-title-area h1 {
      margin: 0 0 4px 0;
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }

    .header-nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-btn {
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      border: none;
    }

    .nav-btn svg {
      width: 15px;
      height: 15px;
    }

    .primary-nav-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
    }

    .primary-nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
    }

    .secondary-nav-btn {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }

    .secondary-nav-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: translateY(-1px);
    }

    .danger-nav-btn {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;
    }

    .danger-nav-btn:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }

    /* Orders Container */
    .orders-container {
      max-width: 1140px;
      margin: 36px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 2;
    }

    .orders-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Modern Order Card */
    .order-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      padding: 24px 28px;
      transition: all 0.25s ease;
    }

    .order-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(124, 58, 237, 0.08);
      border-color: #cbd5e1;
    }

    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 14px;
    }

    .order-identity {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .order-id-badge {
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      color: #7c3aed;
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: baseline;
      gap: 2px;
      border: 1px solid #d8b4fe;
    }

    .id-hash {
      font-size: 13px;
      opacity: 0.7;
    }

    .order-meta-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .order-date-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #64748b;
      font-weight: 500;
    }

    .meta-icon {
      width: 14px;
      height: 14px;
      color: #94a3b8;
    }

    /* Status Pills */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .status-badge.pending .status-dot {
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
      animation: pulseDot 1.5s infinite;
    }

    .status-badge.processing {
      background: #e0e7ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
    }
    .status-badge.processing .status-dot {
      background: #6366f1;
    }

    .status-badge.shipped {
      background: #f3e8ff;
      color: #7c3aed;
      border: 1px solid #e9d5ff;
    }
    .status-badge.shipped .status-dot {
      background: #a855f7;
    }

    .status-badge.delivered {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .status-badge.delivered .status-dot {
      background: #10b981;
    }

    .status-badge.cancelled {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .status-badge.cancelled .status-dot {
      background: #ef4444;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    .order-grand-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .price-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .price-value {
      font-size: 24px;
      font-weight: 800;
      color: #059669;
      letter-spacing: -0.5px;
    }

    /* Items Preview */
    .order-items-preview {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .item-icon-box {
      font-size: 18px;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #1e293b;
    }

    .item-category {
      font-size: 11.5px;
      color: #64748b;
      font-weight: 500;
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .item-qty-tag {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }

    .item-line-total {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      min-width: 80px;
      text-align: right;
    }

    /* Card Footer */
    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 12px;
    }

    .total-items-tag {
      font-size: 12.5px;
      color: #64748b;
      font-weight: 600;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-btn {
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      border: none;
    }

    .action-btn svg {
      width: 14px;
      height: 14px;
    }

    .view-details-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      box-shadow: 0 3px 12px rgba(124, 58, 237, 0.25);
    }

    .view-details-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4);
    }

    .cancel-order-btn {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;
    }

    .cancel-order-btn:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }

    /* Empty State */
    .empty-orders-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px dashed #cbd5e1;
      padding: 80px 32px;
      text-align: center;
      max-width: 520px;
      margin: 40px auto 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .empty-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f3e8ff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .empty-icon-circle svg {
      width: 38px;
      height: 38px;
    }

    .empty-orders-card h2 {
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .empty-orders-card p {
      margin: 0 0 28px 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .start-shop-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 13px 28px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
      transition: all 0.2s ease;
    }

    .start-shop-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
    }

    .start-shop-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Modal Overlay */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      position: relative;
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalPop {
      from { opacity: 0; transform: scale(0.94) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 24px;
    }

    .modal-order-badge {
      font-size: 11px;
      font-weight: 800;
      color: #7c3aed;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: #f3e8ff;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 6px;
    }

    .modal-title-wrap h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }

    .modal-date {
      font-size: 13px;
      color: #64748b;
    }

    .modal-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .modal-close-btn svg {
      width: 16px;
      height: 16px;
    }

    .modal-close-btn:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .details-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-section-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 18px;
    }

    .section-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .section-card-title svg {
      width: 16px;
      height: 16px;
      color: #7c3aed;
    }

    .info-key-val {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      margin-bottom: 6px;
    }

    .info-key-val .k {
      color: #64748b;
      font-weight: 500;
    }

    .info-key-val .v {
      color: #0f172a;
      font-weight: 700;
    }

    .address-text {
      margin: 0 0 3px 0;
      font-size: 12.5px;
      color: #334155;
      line-height: 1.4;
    }

    .items-table-section {
      margin-bottom: 24px;
    }

    .section-heading {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 14px 0;
    }

    .modal-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .modal-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .modal-item-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .modal-item-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .modal-item-cat {
      font-size: 11px;
      color: #64748b;
    }

    .modal-item-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .modal-item-price-calc {
      font-size: 12.5px;
      color: #64748b;
      font-weight: 600;
    }

    .modal-item-price-sum {
      font-size: 14.5px;
      font-weight: 800;
      color: #0f172a;
      min-width: 80px;
      text-align: right;
    }

    .invoice-summary-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13.5px;
      color: #475569;
      font-weight: 500;
    }

    .free-pill {
      background: #ecfdf5;
      color: #059669;
      font-weight: 800;
      font-size: 11.5px;
      padding: 2px 7px;
      border-radius: 6px;
    }

    .summary-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 4px 0;
    }

    .total-highlight {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      padding-top: 4px;
    }

    .total-number {
      font-size: 22px;
      font-weight: 800;
      color: #7c3aed;
    }

    @media (max-width: 768px) {
      .details-cards-grid {
        grid-template-columns: 1fr;
      }
      .header-inner {
        padding: 20px;
      }
      .orders-container {
        padding: 0 16px;
      }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  userOrders: Order[] = [];
  currentUsername: string = '';
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.authService.getCurrentUser()?.username || localStorage.getItem('username') || '';
    console.log('OrderHistory component initialized for user:', this.currentUsername);
    
    // Force refresh orders from storage first
    this.orderService.refreshOrders();
    
    // Then load user orders
    setTimeout(() => {
      this.loadUserOrders();
    }, 100);
  }

  loadUserOrders(): void {
    console.log('Loading orders for user:', this.currentUsername);
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        console.log('All orders loaded:', orders);
        this.userOrders = orders.filter(order => {
          const matchByName = order.customerName === this.currentUsername;
          const matchByUsername = order.customerName.toLowerCase().includes(this.currentUsername.toLowerCase());
          const matchByEmail = order.email && order.email.toLowerCase().includes(this.currentUsername.toLowerCase());
          const match = matchByName || matchByUsername || matchByEmail;
          console.log(`Order ${order.id}: customer='${order.customerName}', email='${order.email}', user='${this.currentUsername}', match=${match}`);
          return match;
        });
        console.log('Filtered user orders:', this.userOrders);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  cancelOrder(order: Order): void {
    if (confirm(`Cancel Order #${order.id}?`)) {
      this.orderService.updateOrderStatus(order.id, 'cancelled').subscribe({
        next: () => {
          order.status = 'cancelled';
          alert('Order cancelled successfully!');
        },
        error: () => alert('Failed to cancel order.')
      });
    }
  }

  goShopping(): void {
    this.router.navigate(['/products']);
  }

  clearOrderHistory(): void {
    if (confirm('Clear all order history? This cannot be undone.')) {
      localStorage.removeItem('orders');
      this.orderService.refreshOrders();
      this.userOrders = [];
      alert('Order history cleared successfully!');
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}