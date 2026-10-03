import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="admin-sidebar">
      <!-- Brand Header -->
      <div class="brand" (click)="navigate('/admin')">
        <div class="brand-left">
          <div class="brand-logo-box">
            <img src="ICON.png" alt="SimpleEcom" class="sidebar-logo-img">
          </div>
          <div class="brand-text">
            <h2>SimpleEcom</h2>
            <span class="brand-badge">ADMIN</span>
          </div>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <div class="nav-item" [class.active]="activePage === 'dashboard'" (click)="navigate('/admin')" title="Dashboard">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          <span class="nav-label">Dashboard</span>
        </div>

        <div class="nav-item" [class.active]="activePage === 'products'" (click)="navigate('/product-management')" title="Products">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7.5 4.27 9 5.15"></path>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
          <span class="nav-label">Products</span>
        </div>

        <div class="nav-item" [class.active]="activePage === 'orders'" (click)="navigate('/order-management')" title="Orders">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="nav-label">Orders</span>
        </div>

        <div class="nav-item" *ngIf="isSuperAdmin" [class.active]="activePage === 'users'" (click)="navigate('/user-management')" title="Users">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="nav-label">Users</span>
        </div>

        <div class="nav-item" [class.active]="activePage === 'analytics'" (click)="navigate('/analytics')" title="Analytics">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span class="nav-label">Analytics</span>
        </div>

        <div class="nav-item" [class.active]="activePage === 'profile'" (click)="navigate('/admin-profile')" title="Profile">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="nav-label">Profile</span>
        </div>
      </nav>
      
      <!-- Footer User Profile & Logout (Integrated Modern Row) -->
      <div class="sidebar-footer">
        <div class="user-footer-card">
          <div class="user-info-group" (click)="navigate('/admin-profile')" title="View Profile & Settings">
            <div class="avatar-container">
              <div class="user-avatar">{{username.charAt(0).toUpperCase()}}</div>
              <span class="status-dot" title="Active Session"></span>
            </div>
            <div class="user-meta">
              <span class="user-name">{{username}}</span>
              <span class="user-email">{{userEmail}}</span>
            </div>
          </div>
          
          <button class="logout-icon-btn" (click)="logout(); $event.stopPropagation()" title="Logout Session">
            <svg class="logout-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 100;
      width: 76px;
      flex-shrink: 0;
    }

    .admin-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      width: 76px;
      height: 100vh;
      background: #ffffff;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e2e8f0;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03);
      transition: width 0.28s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.28s ease;
      overflow-x: hidden;
      overflow-y: auto;
      box-sizing: border-box;
      z-index: 100;
    }

    /* Hover Expansion */
    .admin-sidebar:hover {
      width: 260px;
      box-shadow: 8px 0 30px rgba(0, 0, 0, 0.09);
    }

    /* Brand Header */
    .brand {
      padding: 16px 18px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      min-height: 72px;
      box-sizing: border-box;
      cursor: pointer;
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .brand-logo-box {
      width: 38px;
      height: 38px;
      min-width: 38px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      flex-shrink: 0;
    }

    .sidebar-logo-img {
      max-height: 26px;
      max-width: 26px;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .admin-sidebar:hover .brand-text {
      opacity: 1;
      transform: translateX(0);
    }

    .brand-text h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: #0f172a;
    }

    .brand-badge {
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: 5px;
      background: #f3e8ff;
      color: #7c3aed;
      border: 1px solid #e9d5ff;
      letter-spacing: 0.5px;
    }

    /* Nav Menu */
    .nav-menu {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 11px 17px;
      border-radius: 12px;
      color: #475569;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #7c3aed;
    }

    .nav-item.active {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      min-width: 20px;
      flex-shrink: 0;
      color: #64748b;
      transition: color 0.2s;
    }

    .nav-item:hover .nav-icon {
      color: #7c3aed;
    }

    .nav-item.active .nav-icon {
      color: #ffffff;
    }

    .nav-label {
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .admin-sidebar:hover .nav-label {
      opacity: 1;
      transform: translateX(0);
    }

    /* Footer User Profile & Logout Row (Matching Provided Reference) */
    .sidebar-footer {
      padding: 12px 10px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .user-footer-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 6px;
      border-radius: 12px;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .user-info-group {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
      cursor: pointer;
    }

    .avatar-container {
      position: relative;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #ffffff;
      box-shadow: 0 3px 10px rgba(124, 58, 237, 0.3);
      letter-spacing: -0.5px;
    }

    .status-dot {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #ffffff;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      min-width: 0;
    }

    .admin-sidebar:hover .user-meta {
      opacity: 1;
      transform: translateX(0);
    }

    .user-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e1b4b;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .user-email {
      font-size: 11.5px;
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    .logout-icon-btn {
      background: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.2s ease;
      flex-shrink: 0;
      margin-left: 4px;
    }

    .admin-sidebar:hover .logout-icon-btn {
      opacity: 1;
      transform: scale(1);
    }

    .logout-icon-btn:hover {
      background: #fee2e2;
      color: #ef4444;
      transform: scale(1.08);
    }

    .logout-svg {
      width: 17px;
      height: 17px;
    }
  `]
})
export class AdminSidebarComponent implements OnInit {
  @Input() activePage: 'dashboard' | 'products' | 'orders' | 'users' | 'analytics' | 'profile' = 'dashboard';

  username: string = 'Admin';
  userEmail: string = 'admin@simpleecom.com';
  isSuperAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.userEmail = user.email || `${user.username.toLowerCase()}@simpleecom.com`;
      this.isSuperAdmin = this.authService.isSuperAdmin();
    }
  }

  navigate(path: string): void {
    if (this.router.url !== path) {
      this.router.navigate([path]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
