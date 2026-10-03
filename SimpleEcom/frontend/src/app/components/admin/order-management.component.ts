import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="orders"></app-admin-sidebar>

      <div class="main-content">
        <!-- Header -->
        <div class="header">
          <div class="header-title-area">
            <h1>Order Management</h1>
            <p class="header-subtitle">Track customer orders, process real-time shipping statuses, and generate official invoices.</p>
          </div>
          <div class="header-stats">
            <div class="stat-pill">
              <span class="stat-lbl">Total Revenue</span>
              <span class="stat-val">₹{{getTotalRevenue().toFixed(2)}}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-lbl">Total Orders</span>
              <span class="stat-val purple">{{orders.length}}</span>
            </div>
          </div>
        </div>

        <div class="container">
          <!-- Status Filter Tabs -->
          <div class="filters-bar">
            <button class="filter-btn" [class.active]="selectedStatus === 'all'" (click)="filterOrders('all')">
              <span>All Orders</span>
              <span class="count-badge">{{orders.length}}</span>
            </button>
            <button class="filter-btn" [class.active]="selectedStatus === 'pending'" (click)="filterOrders('pending')">
              <span class="status-dot dot-pending"></span>
              <span>Pending</span>
              <span class="count-badge">{{getOrderCount('pending')}}</span>
            </button>
            <button class="filter-btn" [class.active]="selectedStatus === 'processing'" (click)="filterOrders('processing')">
              <span class="status-dot dot-processing"></span>
              <span>Processing</span>
              <span class="count-badge">{{getOrderCount('processing')}}</span>
            </button>
            <button class="filter-btn" [class.active]="selectedStatus === 'shipped'" (click)="filterOrders('shipped')">
              <span class="status-dot dot-shipped"></span>
              <span>Shipped</span>
              <span class="count-badge">{{getOrderCount('shipped')}}</span>
            </button>
            <button class="filter-btn" [class.active]="selectedStatus === 'delivered'" (click)="filterOrders('delivered')">
              <span class="status-dot dot-delivered"></span>
              <span>Delivered</span>
              <span class="count-badge">{{getOrderCount('delivered')}}</span>
            </button>
            <button class="filter-btn" [class.active]="selectedStatus === 'cancelled'" (click)="filterOrders('cancelled')">
              <span class="status-dot dot-cancelled"></span>
              <span>Cancelled</span>
              <span class="count-badge">{{getOrderCount('cancelled')}}</span>
            </button>
          </div>

          <!-- Orders Grid List -->
          <div class="orders-list" *ngIf="filteredOrders.length > 0">
            <div class="order-card" *ngFor="let order of filteredOrders">
              
              <!-- Card Header -->
              <div class="order-header">
                <div class="order-meta-group">
                  <div class="order-badge-row">
                    <span class="order-num-pill">Order #{{order.id}}</span>
                    <span class="order-date">{{order.orderDate | date:'mediumDate'}} at {{order.orderDate | date:'shortTime'}}</span>
                  </div>
                  <div class="customer-info-box">
                    <div class="avatar-circle">{{getCustomerInitials(order.customerName)}}</div>
                    <div class="customer-details">
                      <span class="customer-name">{{order.customerName}}</span>
                      <span class="customer-email">{{order.email}}</span>
                    </div>
                  </div>
                </div>

                <!-- Status Select Dropdown & Total -->
                <div class="order-status-group">
                  <div class="status-select-wrap">
                    <label class="status-label">{{ (order.status === 'cancelled' || order.status === 'delivered') ? 'Status:' : 'Update Status:' }}</label>
                    
                    <!-- Terminal State: Cancelled -->
                    <div *ngIf="order.status === 'cancelled'" class="terminal-status-badge cancelled-badge">
                      <span class="status-dot"></span>
                      <span>Cancelled</span>
                    </div>

                    <!-- Terminal State: Delivered -->
                    <div *ngIf="order.status === 'delivered'" class="terminal-status-badge delivered-badge">
                      <span class="status-dot"></span>
                      <span>Delivered</span>
                    </div>

                    <!-- Active States: Editable -->
                    <div *ngIf="order.status !== 'cancelled' && order.status !== 'delivered'" class="select-container" [attr.data-status]="order.status">
                      <select [value]="order.status" (change)="updateOrderStatus(order, $event)">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel Order</option>
                      </select>
                    </div>
                  </div>

                  <div class="order-total-box">
                    <span class="total-lbl">{{isSuperAdmin ? 'Order Total' : 'Your Share'}}</span>
                    <span class="total-val">₹{{getOrderDisplayTotal(order).toFixed(2)}}</span>
                  </div>
                </div>
              </div>

              <!-- Itemized Products Preview -->
              <div class="order-items-preview">
                <span class="items-header">Ordered Items ({{order.items.length}})</span>
                <div class="items-chips-grid">
                  <div class="item-chip" *ngFor="let item of order.items">
                    <span class="chip-name">{{item.productName}}</span>
                    <span class="chip-qty">×{{item.quantity}}</span>
                    <span class="chip-price">₹{{(item.price * item.quantity).toFixed(2)}}</span>
                  </div>
                </div>
              </div>

              <!-- Actions Footer -->
              <div class="order-actions">
                <button class="action-btn view-btn" (click)="viewOrderDetails(order)" title="View full order details">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>View Details</span>
                </button>

                <button class="action-btn print-btn" (click)="printOrder(order)" title="Print Invoice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  <span>Invoice</span>
                </button>

                <button class="action-btn delete-btn" (click)="deleteOrder(order)" title="Delete this order">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state-wrap" *ngIf="filteredOrders.length === 0">
            <div class="empty-state">
              <div class="empty-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3>No Orders Found</h3>
              <p>There are no orders currently under the "{{selectedStatus | titlecase}}" status tab.</p>
              <button class="empty-action-btn" (click)="filterOrders('all')">Show All Orders</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div class="modal-backdrop" *ngIf="showOrderDetails" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()" *ngIf="selectedOrder">
        
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>Order Details #{{selectedOrder.id}}</h2>
            <span class="modal-status-pill" [attr.data-status]="selectedOrder.status">
              {{selectedOrder.status | titlecase}}
            </span>
          </div>
          <button class="modal-close-icon" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body-scroll">
          
          <!-- Customer & Destination -->
          <div class="modal-section-grid">
            <div class="info-card">
              <h4>Customer Details</h4>
              <div class="info-line"><strong>Name:</strong> <span>{{selectedOrder.customerName}}</span></div>
              <div class="info-line"><strong>Email:</strong> <span>{{selectedOrder.email}}</span></div>
              <div class="info-line"><strong>Phone:</strong> <span>{{selectedOrder.phone}}</span></div>
            </div>

            <div class="info-card">
              <h4>Delivery Address</h4>
              <div class="info-line"><span>{{selectedOrder.address.street}}</span></div>
              <div class="info-line"><span>{{selectedOrder.address.city}}, {{selectedOrder.address.state}} {{selectedOrder.address.zipCode}}</span></div>
              <div class="info-line"><strong>Country:</strong> <span>{{selectedOrder.address.country}}</span></div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="table-card">
            <h4>Ordered Items</h4>
            <table class="details-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of selectedOrder.items">
                  <td class="font-bold">{{item.productName}}</td>
                  <td><span class="cat-pill">{{item.category || 'General'}}</span></td>
                  <td>{{item.quantity}}</td>
                  <td>₹{{item.price.toFixed(2)}}</td>
                  <td class="font-bold">₹{{(item.price * item.quantity).toFixed(2)}}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary Breakdown -->
          <div class="summary-breakdown-card">
            <div class="breakdown-line">
              <span>Subtotal:</span>
              <span>₹{{selectedOrder.subtotal.toFixed(2)}}</span>
            </div>
            <div class="breakdown-line">
              <span>Standard Shipping:</span>
              <span class="free-text">{{(selectedOrder.shipping || 0) === 0 ? 'FREE' : '₹' + (selectedOrder.shipping || 0).toFixed(2)}}</span>
            </div>
            <div class="breakdown-line">
              <span>Estimated Taxes & GST:</span>
              <span>Included</span>
            </div>
            <div class="divider"></div>
            <div class="breakdown-line grand-total">
              <span>{{isSuperAdmin ? 'Total Paid:' : 'Your Products Subtotal:'}}</span>
              <span class="purple-val">₹{{getOrderDisplayTotal(selectedOrder).toFixed(2)}}</span>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="primary-modal-btn" (click)="printOrder(selectedOrder)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>View Full Invoice</span>
          </button>
          <button class="secondary-modal-btn" (click)="closeModal()">Close</button>
        </div>

      </div>
    </div>

    <!-- Invoice Modal -->
    <div class="modal-backdrop" *ngIf="showInvoice" (click)="closeModal()">
      <div class="invoice-paper" (click)="$event.stopPropagation()" *ngIf="selectedOrder">
        
        <div class="invoice-header-row">
          <div class="brand-invoice-area">
            <div class="invoice-logo">
              <img src="ICON.png" alt="SimpleEcom" class="invoice-logo-img">
              <h2>SimpleEcom</h2>
            </div>
            <p class="company-sub">Commerce Plaza, Cyber City, India<br>support&#64;simpleecom.com</p>
          </div>
          <div class="invoice-id-area">
            <h1 class="inv-title">TAX INVOICE</h1>
            <p class="inv-meta"><strong>Invoice #:</strong> INV-{{selectedOrder.id}}</p>
            <p class="inv-meta"><strong>Date:</strong> {{selectedOrder.orderDate | date:'mediumDate'}}</p>
            <p class="inv-meta"><strong>Status:</strong> {{selectedOrder.status | uppercase}}</p>
          </div>
        </div>

        <div class="invoice-parties-row">
          <div class="party-col">
            <span class="party-lbl">Billed To:</span>
            <strong class="party-name">{{selectedOrder.customerName}}</strong>
            <p class="party-addr">
              {{selectedOrder.address.street}}<br>
              {{selectedOrder.address.city}}, {{selectedOrder.address.state}} {{selectedOrder.address.zipCode}}<br>
              {{selectedOrder.address.country}}<br>
              Email: {{selectedOrder.email}}<br>
              Phone: {{selectedOrder.phone}}
            </p>
          </div>
        </div>

        <table class="invoice-data-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of selectedOrder.items">
              <td class="font-bold">{{item.productName}}</td>
              <td>{{item.category || 'Product'}}</td>
              <td>{{item.quantity}}</td>
              <td>₹{{item.price.toFixed(2)}}</td>
              <td class="font-bold">₹{{(item.price * item.quantity).toFixed(2)}}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-calc-box">
          <div class="calc-row">
            <span>Subtotal:</span>
            <span>₹{{selectedOrder.subtotal.toFixed(2)}}</span>
          </div>
          <div class="calc-row">
            <span>Shipping:</span>
            <span>{{(selectedOrder.shipping || 0) === 0 ? 'FREE' : '₹' + (selectedOrder.shipping || 0).toFixed(2)}}</span>
          </div>
          <div class="calc-row">
            <span>GST / Taxes:</span>
            <span>Included</span>
          </div>
          <div class="calc-row total-calc">
            <span>{{isSuperAdmin ? 'Total Payable:' : 'Your Share:'}}</span>
            <span>₹{{getOrderDisplayTotal(selectedOrder).toFixed(2)}}</span>
          </div>
        </div>

        <div class="invoice-actions no-print">
          <button class="print-cta-btn" onclick="window.print()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print Invoice</span>
          </button>
          <button class="close-cta-btn" (click)="closeModal()">Close</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* Header Bar */
    .header {
      background: #ffffff;
      padding: 24px 36px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-title-area h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 13.5px;
      color: #64748b;
    }

    .header-stats {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-pill {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-lbl {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-val {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .stat-val.purple {
      color: #7c3aed;
    }

    /* Container */
    .container {
      padding: 32px 36px;
      flex: 1;
      max-width: 1200px;
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 9px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 700;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .filter-btn:hover:not(.active) {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #7c3aed;
      transform: translateY(-1px);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      border-color: transparent;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }

    .count-badge {
      background: rgba(0, 0, 0, 0.06);
      padding: 2px 7px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 800;
    }

    .filter-btn.active .count-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-pending { background: #f59e0b; }
    .dot-processing { background: #3b82f6; }
    .dot-shipped { background: #8b5cf6; }
    .dot-delivered { background: #10b981; }
    .dot-cancelled { background: #ef4444; }

    /* Orders Grid List */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .order-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      padding: 24px 28px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }

    .order-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
      gap: 20px;
      flex-wrap: wrap;
    }

    .order-meta-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .order-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-num-pill {
      background: #f3e8ff;
      color: #7c3aed;
      border: 1px solid #e9d5ff;
      font-size: 13px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .order-date {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .customer-info-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
    }

    .customer-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .customer-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .customer-email {
      font-size: 13px;
      color: #64748b;
    }

    /* Status Select & Total */
    .order-status-group {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .status-select-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
    }

    .status-label {
      font-size: 11.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .select-container select {
      padding: 8px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      background: #f8fafc;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .select-container select:focus {
      border-color: #a855f7;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
    }

    .terminal-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .cancelled-badge {
      background: #fef2f2;
      color: #dc2626;
      border: 1.5px solid #fecaca;
    }

    .cancelled-badge .status-dot {
      background: #dc2626;
    }

    .delivered-badge {
      background: #f0fdf4;
      color: #16a34a;
      border: 1.5px solid #bbf7d0;
    }

    .delivered-badge .status-dot {
      background: #16a34a;
    }

    .order-total-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .total-lbl {
      font-size: 11.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .total-val {
      font-size: 22px;
      font-weight: 800;
      color: #7c3aed;
      letter-spacing: -0.5px;
    }

    /* Items Preview */
    .order-items-preview {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .items-header {
      font-size: 12.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-chips-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .item-chip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 7px 12px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .chip-name {
      font-weight: 700;
      color: #1e293b;
    }

    .chip-qty {
      color: #64748b;
      font-weight: 600;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 6px;
      font-size: 11.5px;
    }

    .chip-price {
      font-weight: 800;
      color: #0f172a;
    }

    /* Action Buttons */
    .order-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }

    .action-btn {
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .action-btn svg {
      width: 15px;
      height: 15px;
    }

    .view-btn {
      background: #f3e8ff;
      color: #7c3aed;
      border-color: #e9d5ff;
    }

    .view-btn:hover {
      background: #e9d5ff;
      transform: translateY(-1px);
    }

    .print-btn {
      background: #ecfdf5;
      color: #059669;
      border-color: #a7f3d0;
    }

    .print-btn:hover {
      background: #d1fae5;
      transform: translateY(-1px);
    }

    .delete-btn {
      background: #fff1f2;
      color: #e11d48;
      border-color: #fecdd3;
      margin-left: auto;
    }

    .delete-btn:hover {
      background: #ffe4e6;
      transform: translateY(-1px);
    }

    /* Empty State */
    .empty-state-wrap {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .empty-state {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 40px 48px;
      text-align: center;
      max-width: 420px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .empty-icon-box {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: #f3e8ff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .empty-icon-box svg {
      width: 30px;
      height: 30px;
    }

    .empty-state h3 {
      margin: 0 0 6px 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      font-size: 13.5px;
      color: #64748b;
    }

    .empty-action-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 24px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .modal-header {
      padding: 24px 30px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-title-group h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }

    .modal-status-pill {
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      background: #f3e8ff;
      color: #7c3aed;
    }

    .modal-close-icon {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 20px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close-icon:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .modal-body-scroll {
      padding: 24px 30px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .modal-section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
    }

    .info-card h4 {
      margin: 0 0 10px 0;
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .info-line {
      font-size: 13px;
      color: #475569;
      margin-bottom: 4px;
    }

    .info-line strong {
      color: #0f172a;
    }

    .table-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
    }

    .table-card h4 {
      margin: 0 0 12px 0;
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .details-table th {
      text-align: left;
      padding: 8px 10px;
      color: #64748b;
      font-weight: 700;
      border-bottom: 1px solid #e2e8f0;
    }

    .details-table td {
      padding: 10px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }

    .cat-pill {
      background: #e2e8f0;
      color: #475569;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }

    .font-bold {
      font-weight: 700;
      color: #0f172a;
    }

    .summary-breakdown-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .breakdown-line {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #475569;
    }

    .free-text {
      color: #059669;
      font-weight: 800;
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 4px 0;
    }

    .grand-total {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      padding-top: 4px;
    }

    .purple-val {
      color: #7c3aed;
      font-size: 20px;
    }

    .modal-footer {
      padding: 20px 30px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: #fafafa;
    }

    .primary-modal-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .primary-modal-btn svg {
      width: 16px;
      height: 16px;
    }

    .secondary-modal-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Invoice Paper */
    .invoice-paper {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 760px;
      max-height: 92vh;
      overflow-y: auto;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
    }

    .invoice-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .invoice-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .invoice-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .invoice-logo h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .company-sub {
      margin: 0;
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.5;
    }

    .inv-title {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 900;
      color: #7c3aed;
      text-align: right;
      letter-spacing: -0.5px;
    }

    .inv-meta {
      margin: 2px 0;
      font-size: 13px;
      color: #475569;
      text-align: right;
    }

    .invoice-parties-row {
      margin-bottom: 28px;
    }

    .party-lbl {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }

    .party-name {
      font-size: 16px;
      color: #0f172a;
      display: block;
      margin-bottom: 4px;
    }

    .party-addr {
      margin: 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }

    .invoice-data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13.5px;
    }

    .invoice-data-table th {
      background: #f8fafc;
      padding: 12px 14px;
      text-align: left;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }

    .invoice-data-table td {
      padding: 12px 14px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }

    .invoice-calc-box {
      max-width: 280px;
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 32px;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      color: #475569;
    }

    .total-calc {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 4px;
    }

    .invoice-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .print-cta-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 11px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .print-cta-btn svg {
      width: 16px;
      height: 16px;
    }

    .close-cta-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    @media print {
      .no-print, .dashboard-container app-admin-sidebar, .modal-backdrop {
        display: none !important;
      }
      .invoice-paper {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
    }

    @media (max-width: 768px) {
      .order-status-group {
        flex-direction: column;
        align-items: flex-start;
      }
      .modal-section-grid {
        grid-template-columns: 1fr;
      }
      .container {
        padding: 20px;
      }
    }
  `]
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'all';
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;
  showInvoice: boolean = false;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.orderService.refreshOrders();
    setTimeout(() => {
      this.loadOrders();
    }, 100);
  }

  isSuperAdmin: boolean = false;
  currentAdmin: string = '';

  loadOrders(): void {
    this.currentAdmin = (this.authService.getUsername() || localStorage.getItem('username') || '').trim();
    this.isSuperAdmin = this.authService.isSuperAdmin();

    // SuperAdmin sees all orders, regular admins see only orders for their products
    const ordersObservable = this.isSuperAdmin 
      ? this.orderService.getAllOrders() 
      : this.orderService.getOrdersByAdmin(this.currentAdmin);

    ordersObservable.subscribe({
      next: (orders) => {
        if (this.isSuperAdmin) {
          this.orders = orders || [];
        } else {
          this.orders = (orders || []).map(order => ({
            ...order,
            items: (order.items || []).filter(item => !item.adminUsername || item.adminUsername.toLowerCase() === this.currentAdmin.toLowerCase())
          })).filter(order => order.items.length > 0);
        }
        this.filterOrders(this.selectedStatus);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.filteredOrders = [];
      }
    });
  }

  filterOrders(status: string): void {
    this.selectedStatus = status;
    if (status === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === status);
    }
  }

  getOrderCount(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  getTotalRevenue(): number {
    if (this.isSuperAdmin) {
      return this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    }
    return this.orders.reduce((sum, order) => sum + this.getOrderDisplayTotal(order), 0);
  }

  getOrderDisplayTotal(order: Order | null): number {
    if (!order) return 0;
    if (this.isSuperAdmin) {
      return order.total || 0;
    }
    return (order.items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  }

  getCustomerInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  updateOrderStatus(order: Order, event: any): void {
    if (order.status === 'cancelled') {
      alert('This order has already been cancelled and cannot be modified.');
      return;
    }
    const newStatus = event.target.value;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status.');
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetails = true;
    this.showInvoice = false;
  }

  printOrder(order: Order): void {
    this.selectedOrder = order;
    this.showInvoice = true;
    this.showOrderDetails = false;
  }

  closeModal(): void {
    this.showOrderDetails = false;
    this.showInvoice = false;
    this.selectedOrder = null;
  }

  deleteOrder(order: Order): void {
    if (confirm(`Delete Order #${order.id}? This action cannot be undone.`)) {
      this.orderService.deleteOrder(order.id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== order.id);
          this.filterOrders(this.selectedStatus);
        },
        error: () => alert('Failed to delete order.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}