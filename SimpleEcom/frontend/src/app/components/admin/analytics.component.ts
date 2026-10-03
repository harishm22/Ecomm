import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="analytics"></app-admin-sidebar>

      <div class="main-content">
        <!-- Header -->
        <div class="header">
          <div class="header-title-area">
            <h1>Analytics & Business Intelligence</h1>
            <p class="header-subtitle" *ngIf="!isSuperAdmin">Sales performance, revenue velocity, and order distribution for <strong>{{currentAdmin}}</strong>'s products.</p>
            <p class="header-subtitle" *ngIf="isSuperAdmin">Store-wide performance breakdown, revenue velocity, and order distribution.</p>
          </div>
        </div>

        <div class="container">
          <!-- KPI Stats Grid -->
          <div class="stats-grid">
            
            <!-- Total Orders -->
            <div class="stat-card">
              <div class="stat-icon-wrapper orders-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Orders</span>
                <span class="stat-number">{{totalOrders}}</span>
              </div>
            </div>

            <!-- Total Revenue -->
            <div class="stat-card">
              <div class="stat-icon-wrapper revenue-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Revenue</span>
                <span class="stat-number">₹{{totalRevenue.toFixed(2)}}</span>
              </div>
            </div>

            <!-- Average Order -->
            <div class="stat-card">
              <div class="stat-icon-wrapper avg-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Average Order</span>
                <span class="stat-number">₹{{averageOrder.toFixed(2)}}</span>
              </div>
            </div>

            <!-- Pending Orders -->
            <div class="stat-card">
              <div class="stat-icon-wrapper pending-bg">
                <svg class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-label">Pending Orders</span>
                <span class="stat-number">{{pendingOrders}}</span>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="charts-section">
            <div class="chart-card">
              <div class="chart-header">
                <h3>Orders by Status</h3>
                <span class="chart-badge">Lifecycle</span>
              </div>
              
              <div class="status-chart" *ngIf="ordersByStatus.length > 0">
                <div class="status-item" *ngFor="let status of ordersByStatus">
                  <div class="status-info">
                    <span class="status-name">{{status.name | titlecase}}</span>
                    <span class="status-count">{{status.count}} ({{status.percentage}}%)</span>
                  </div>
                  <div class="status-bar">
                    <div class="bar-fill" [style.width.%]="status.percentage" [class]="status.name"></div>
                  </div>
                </div>
              </div>
              <div class="chart-empty" *ngIf="ordersByStatus.length === 0">
                <p>No order lifecycle data available</p>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3>Revenue by Category</h3>
                <span class="chart-badge">Distribution</span>
              </div>
              
              <div class="category-chart" *ngIf="revenueByCategory.length > 0">
                <div class="category-item" *ngFor="let category of revenueByCategory">
                  <div class="category-info">
                    <span class="category-name">{{category.name}}</span>
                    <span class="category-revenue">₹{{category.revenue.toFixed(2)}} ({{category.percentage}}%)</span>
                  </div>
                  <div class="category-bar">
                    <div class="bar-fill category-fill" [style.width.%]="category.percentage"></div>
                  </div>
                </div>
              </div>
              <div class="chart-empty" *ngIf="revenueByCategory.length === 0">
                <p>No category revenue data available</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders Card -->
          <div class="recent-orders-card">
            <div class="chart-header">
              <h3>Recent Order Stream</h3>
              <span class="chart-badge">Live Activity</span>
            </div>

            <div class="table-container" *ngIf="recentOrders.length > 0">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of recentOrders">
                    <td class="order-id">#{{order.id}}</td>
                    <td class="customer-cell">{{order.customerName}}</td>
                    <td class="date-cell">{{order.orderDate | date:'mediumDate'}}</td>
                    <td>
                      <span class="status-pill" [class]="order.status">
                        {{order.status | titlecase}}
                      </span>
                    </td>
                    <td class="total-cell">₹{{getOrderRevenue(order).toFixed(2)}}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="chart-empty" *ngIf="recentOrders.length === 0">
              <p>No recent orders recorded yet.</p>
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

    .container {
      padding: 32px 36px;
      flex: 1;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }

    /* KPI Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: #ffffff;
      padding: 20px 22px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.25s ease;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-svg {
      width: 24px;
      height: 24px;
    }

    .orders-bg {
      background: #eff6ff;
      color: #2563eb;
    }

    .revenue-bg {
      background: #ecfdf5;
      color: #059669;
    }

    .avg-bg {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .pending-bg {
      background: #fffbeb;
      color: #d97706;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 2px;
    }

    .stat-number {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-card {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .chart-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-item, .category-item {
      margin-bottom: 16px;
    }

    .status-item:last-child, .category-item:last-child {
      margin-bottom: 0;
    }

    .status-info, .category-info {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }

    .status-count, .category-revenue {
      color: #64748b;
      font-weight: 500;
    }

    .status-bar, .category-bar {
      height: 7px;
      background: #f1f5f9;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.4s ease;
    }

    .bar-fill.pending { background: #f59e0b; }
    .bar-fill.processing { background: #3b82f6; }
    .bar-fill.shipped { background: #8b5cf6; }
    .bar-fill.delivered { background: #10b981; }
    .bar-fill.cancelled { background: #ef4444; }
    
    .bar-fill.category-fill {
      background: linear-gradient(90deg, #a855f7 0%, #7c3aed 100%);
    }

    .chart-empty {
      padding: 40px 20px;
      text-align: center;
      color: #94a3b8;
      font-size: 13.5px;
    }

    /* Recent Orders Card */
    .recent-orders-card {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .table-container {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .modern-table th {
      padding: 12px 16px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .modern-table td {
      padding: 14px 16px;
      font-size: 13.5px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }

    .order-id {
      font-weight: 700;
      color: #7c3aed !important;
    }

    .customer-cell {
      font-weight: 600;
      color: #0f172a;
    }

    .total-cell {
      font-weight: 700;
      color: #0f172a;
    }

    .status-pill {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .status-pill.pending { background: #fffbeb; color: #d97706; }
    .status-pill.processing { background: #eff6ff; color: #2563eb; }
    .status-pill.shipped { background: #f3e8ff; color: #7c3aed; }
    .status-pill.delivered { background: #ecfdf5; color: #059669; }
    .status-pill.cancelled { background: #fef2f2; color: #dc2626; }

    @media (max-width: 900px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  totalOrders: number = 0;
  totalRevenue: number = 0;
  averageOrder: number = 0;
  pendingOrders: number = 0;
  ordersByStatus: any[] = [];
  revenueByCategory: any[] = [];
  recentOrders: Order[] = [];
  isSuperAdmin: boolean = false;
  currentAdmin: string = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentAdmin = (this.authService.getUsername() || localStorage.getItem('username') || '').trim();
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.orderService.refreshOrders();
    setTimeout(() => {
      this.loadAnalytics();
    }, 100);
  }

  loadAnalytics(): void {
    const ordersObservable = this.isSuperAdmin
      ? this.orderService.getAllOrders()
      : this.orderService.getOrdersByAdmin(this.currentAdmin);

    ordersObservable.subscribe({
      next: (orders) => {
        const rawOrders = orders || [];
        // For regular admins, filter each order's items to only include products owned by this admin
        const orderList = this.isSuperAdmin
          ? rawOrders
          : rawOrders.map(order => ({
              ...order,
              items: (order.items || []).filter(item => !item.adminUsername || item.adminUsername.toLowerCase() === this.currentAdmin.toLowerCase())
            })).filter(order => order.items.length > 0);

        this.calculateStats(orderList);
        this.calculateOrdersByStatus(orderList);
        this.calculateRevenueByCategory(orderList);
        this.recentOrders = [...orderList].reverse().slice(0, 8);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  calculateStats(orders: Order[]): void {
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    
    this.totalOrders = activeOrders.length;
    if (this.isSuperAdmin) {
      this.totalRevenue = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    } else {
      this.totalRevenue = activeOrders.reduce((sum, order) => {
        const itemsRevenue = (order.items || []).reduce((itemSum, item) => itemSum + ((item.price || 0) * (item.quantity || 1)), 0);
        return sum + itemsRevenue;
      }, 0);
    }
    this.averageOrder = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
    this.pendingOrders = orders.filter(order => order.status === 'pending').length;
  }

  calculateOrdersByStatus(orders: Order[]): void {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as any);

    this.ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      count: count as number,
      percentage: this.totalOrders > 0 ? Math.round(((count as number) / this.totalOrders) * 100) : 0
    }));
  }

  calculateRevenueByCategory(orders: Order[]): void {
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    
    const categoryRevenue = activeOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const category = item.category || 'Other';
        acc[category] = (acc[category] || 0) + (item.price * item.quantity);
      });
      return acc;
    }, {} as any);

    const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum: number, revenue) => sum + (revenue as number), 0);

    this.revenueByCategory = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      name: category,
      revenue: revenue as number,
      percentage: totalCategoryRevenue > 0 ? Math.round(((revenue as number) / totalCategoryRevenue) * 100) : 0
    }));
  }

  getOrderRevenue(order: Order): number {
    if (this.isSuperAdmin) {
      return order.total || 0;
    }
    return (order.items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}