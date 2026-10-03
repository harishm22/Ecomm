import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="users"></app-admin-sidebar>

      <div class="main-content">
        <!-- Top Header -->
        <div class="header">
          <div class="header-title-area">
            <h1>User Governance & Administration</h1>
            <p class="header-subtitle">Review administrator access requests and manage system permissions.</p>
          </div>
        </div>

        <div class="app-container">
      <!-- Priority Pending Admin Approval Section -->
      <div class="section-card pending-card" *ngIf="pendingAdmins.length > 0">
        <div class="card-title-row">
          <div class="title-with-pill">
            <h2>Pending Admin Access Requests</h2>
            <span class="amber-count-pill">{{pendingAdmins.length}} Pending Review</span>
          </div>
          <span class="muted-note">Administrator privilege requests require SuperAdmin confirmation</span>
        </div>

        <div class="pending-list">
          <div class="pending-item" *ngFor="let user of pendingAdmins">
            <div class="pending-user-meta">
              <div class="user-avatar-circle gradient-amber">
                {{user.username.charAt(0).toUpperCase()}}
              </div>
              <div class="user-text-info">
                <div class="name-line">
                  <span class="user-name">{{user.username}}</span>
                  <span class="role-pill admin-pill">SELLER REQUEST</span>
                </div>
                <span class="user-email-text">{{user.email}}</span>
              </div>
            </div>

            <div class="pending-action-btns">
              <button class="btn-solid-emerald" (click)="approveAdmin(user)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Approve Seller
              </button>
              <button class="btn-outline-rose" (click)="rejectAdmin(user)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Directory Section -->
      <div class="section-card">
        <div class="card-header-bar">
          <div class="header-left">
            <h2>User Accounts Directory</h2>
            <span class="total-users-badge">Total Accounts: {{allUsers.length}}</span>
          </div>

          <div class="directory-toolbar">
            <!-- Search Input -->
            <div class="search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-svg">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search username, email, role..." 
                [(ngModel)]="searchQuery"
                class="search-field"
              />
              <span class="clear-icon" *ngIf="searchQuery" (click)="searchQuery = ''">✕</span>
            </div>

            <!-- Filter Segment Buttons -->
            <div class="segment-group">
              <button class="segment-btn" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
                All ({{allUsers.length}})
              </button>
              <button class="segment-btn" [class.active]="activeFilter === 'ACTIVE'" (click)="setFilter('ACTIVE')">
                Active ({{getActiveUsersCount()}})
              </button>
              <button class="segment-btn" [class.active]="activeFilter === 'PENDING'" (click)="setFilter('PENDING')">
                Pending ({{pendingAdmins.length}})
              </button>
              <button class="segment-btn" [class.active]="activeFilter === 'SUPERADMIN'" (click)="setFilter('SUPERADMIN')">
                Superadmins ({{getSuperadminCount()}})
              </button>
            </div>
          </div>
        </div>

        <!-- Sleek Responsive User Directory Table -->
        <div class="table-wrapper" *ngIf="filteredUsers.length > 0">
          <table class="user-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Assigned Roles</th>
                <th>Account Status</th>
                <th>Specializations</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let user of filteredUsers"
                [class.superadmin-highlight]="user.roles.includes('SUPERADMIN')"
                [class.pending-highlight]="user.roles.includes('ADMIN') && !user.enabled"
              >
                <!-- User Profile Column -->
                <td>
                  <div class="user-profile-cell" (click)="openUserDrawer(user)">
                    <div class="user-avatar-circle" [class.gradient-purple]="user.roles.includes('SUPERADMIN')" [class.gradient-blue]="!user.roles.includes('SUPERADMIN')">
                      {{user.username.charAt(0).toUpperCase()}}
                    </div>
                    <div class="profile-details">
                      <span class="username">
                        {{user.username}}
                        <span class="super-crown" *ngIf="user.roles.includes('SUPERADMIN')" title="SuperAdmin Governance Account">👑</span>
                      </span>
                      <span class="email-subtext">{{user.email}}</span>
                    </div>
                  </div>
                </td>

                <!-- Roles Column -->
                <td>
                  <span class="role-pill" [class]="user.roles[0].toLowerCase()">
                    {{user.roles.join(', ')}}
                  </span>
                </td>

                <!-- Status Column -->
                <td>
                  <span class="status-pill" [class.active-pill]="user.enabled" [class.inactive-pill]="!user.enabled">
                    <span class="status-dot"></span>
                    {{user.enabled ? 'Active' : 'Disabled'}}
                  </span>
                </td>

                <!-- Specializations Column -->
                <td>
                  <div class="specs-pill-wrap" *ngIf="getUserSpecializations(user.username).length > 0">
                    <span class="spec-pill" *ngFor="let spec of getUserSpecializations(user.username)">
                      {{spec}}
                    </span>
                  </div>
                  <span class="no-data-dash" *ngIf="getUserSpecializations(user.username).length === 0">—</span>
                </td>

                <!-- Action Controls Column -->
                <td class="text-right">
                  <div class="row-actions" *ngIf="!user.roles.includes('SUPERADMIN')">
                    <button 
                      class="btn-status-toggle" 
                      [class.btn-is-active]="user.enabled"
                      (click)="toggleUser(user)"
                    >
                      {{user.enabled ? 'Disable' : 'Enable'}}
                    </button>
                    <button class="btn-delete-link" (click)="deleteUser(user)">
                      Delete
                    </button>
                  </div>

                  <span class="protected-tag" *ngIf="user.roles.includes('SUPERADMIN')">
                    Protected
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state-box" *ngIf="filteredUsers.length === 0">
          <p>No user accounts matched your search criteria.</p>
          <button class="btn-secondary-reset" (click)="resetFilters()">Reset Search & Filters</button>
        </div>
      </div>
    </div>

    <!-- Inspector Drawer Panel -->
    <div class="drawer-backdrop" *ngIf="inspectUser" (click)="inspectUser = null">
      <div class="drawer-content" (click)="$event.stopPropagation()">
        <div class="drawer-top-bar">
          <div class="drawer-profile">
            <div class="user-avatar-circle gradient-purple large">
              {{inspectUser.username.charAt(0).toUpperCase()}}
            </div>
            <div>
              <h3>{{inspectUser.username}}</h3>
              <span class="drawer-email-sub">{{inspectUser.email}}</span>
            </div>
          </div>
          <button class="drawer-close-btn" (click)="inspectUser = null">✕</button>
        </div>

        <div class="drawer-inner-body">
          <div class="drawer-group">
            <label>Assigned Permission Roles</label>
            <div class="drawer-roles">
              <span class="role-pill" *ngFor="let role of inspectUser.roles" [class]="role.toLowerCase()">
                {{role}}
              </span>
            </div>
          </div>

          <div class="drawer-group">
            <label>Account Status</label>
            <span class="status-pill" [class.active-pill]="inspectUser.enabled" [class.inactive-pill]="!inspectUser.enabled">
              <span class="status-dot"></span>
              {{inspectUser.enabled ? 'Active Account' : 'Disabled Account'}}
            </span>
          </div>

          <div class="drawer-group">
            <label>Specializations</label>
            <div class="specs-pill-wrap" *ngIf="getUserSpecializations(inspectUser.username).length > 0">
              <span class="spec-pill" *ngFor="let spec of getUserSpecializations(inspectUser.username)">
                {{spec}}
              </span>
            </div>
            <span class="no-data-dash" *ngIf="getUserSpecializations(inspectUser.username).length === 0">No specializations assigned</span>
          </div>

          <div class="drawer-group">
            <label>Security Audit Info</label>
            <div class="audit-card">
              <div class="audit-item"><span>User ID:</span> <strong>#{{inspectUser.id}}</strong></div>
              <div class="audit-item"><span>Governance Level:</span> <strong>{{inspectUser.roles.join(', ')}}</strong></div>
            </div>
          </div>
        </div>

        <div class="drawer-bottom-bar">
          <button class="btn-solid-dark full-width" (click)="inspectUser = null">Close Details</button>
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

    .app-container {
      width: 100%;
      padding: 24px 32px 60px 32px;
      background: #f8fafc;
      min-height: calc(100vh - 88px);
      box-sizing: border-box;
    }

    /* Section Cards */
    .section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    }

    .pending-card {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(90deg, #fffdf5 0%, #ffffff 100%);
    }

    .card-title-row {
      margin-bottom: 20px;
    }

    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-with-pill h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }

    .amber-count-pill {
      background: #fef3c7;
      color: #d97706;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid #fde68a;
    }

    .muted-note {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
      display: block;
    }

    /* Pending Request List */
    .pending-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pending-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      transition: all 0.15s ease;
    }

    .pending-item:hover {
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
      border-color: #cbd5e1;
    }

    .pending-user-meta {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .user-avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: #ffffff;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-avatar-circle.large {
      width: 48px;
      height: 48px;
      font-size: 18px;
    }

    .gradient-blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .gradient-purple { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); }
    .gradient-amber { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .user-text-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .name-line {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .user-email-text {
      font-size: 13px;
      color: #64748b;
    }

    .pending-action-btns {
      display: flex;
      gap: 10px;
    }

    .btn-solid-emerald {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-solid-emerald:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-outline-rose {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      color: #ef4444;
      border: 1px solid #fca5a5;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-outline-rose:hover {
      background: #fef2f2;
      border-color: #f87171;
    }

    /* Directory Card Header & Toolbar */
    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-left h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .total-users-badge {
      background: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .directory-toolbar {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .search-input-wrapper {
      position: relative;
      min-width: 240px;
    }

    .search-svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-field {
      width: 100%;
      padding: 8px 30px 8px 36px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      color: #0f172a;
      outline: none;
    }

    .search-field:focus {
      background: #ffffff;
      border-color: #a855f7;
    }

    .clear-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      cursor: pointer;
      font-size: 12px;
    }

    .segment-group {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
    }

    .segment-btn {
      background: transparent;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
    }

    .segment-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Table Component */
    .table-wrapper {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .user-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .user-table th {
      padding: 12px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .user-table td {
      padding: 16px 18px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .user-table tr:hover td {
      background: #f8fafc;
    }

    .user-table tr.superadmin-highlight {
      background: linear-gradient(90deg, #faf5ff 0%, #ffffff 100%);
      border-left: 4px solid #a855f7;
    }

    .user-profile-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .username {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .email-subtext {
      font-size: 13px;
      color: #64748b;
    }

    /* Role & Status Pills */
    .role-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }

    .role-pill.user { background: #eff6ff; color: #1d4ed8; }
    .role-pill.admin, .admin-pill { background: #e0e7ff; color: #3730a3; }
    .role-pill.superadmin { background: #f3e8ff; color: #6b21a8; }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-pill.active-pill { background: #ecfdf5; color: #047857; }
    .status-pill.inactive-pill { background: #fef2f2; color: #b91c1c; }

    .specs-pill-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .spec-pill {
      background: #f1f5f9;
      color: #334155;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #cbd5e1;
    }

    .no-data-dash { color: #94a3b8; font-size: 13px; }
    .text-right { text-align: right; }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }

    .btn-status-toggle {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-status-toggle.btn-is-active {
      background: #fffbeb;
      color: #b45309;
      border-color: #fde68a;
    }

    .btn-delete-link {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-delete-link:hover { text-decoration: underline; }

    .protected-tag {
      color: #64748b;
      font-size: 12px;
      font-style: italic;
    }

    .empty-state-box {
      padding: 40px;
      text-align: center;
      color: #64748b;
    }

    .btn-secondary-reset {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 10px;
      cursor: pointer;
    }

    /* Modal Drawer */
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }

    .drawer-content {
      width: 400px;
      max-width: 90vw;
      height: 100%;
      background: #ffffff;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .drawer-top-bar {
      padding: 24px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .drawer-profile {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .drawer-profile h3 { margin: 0; font-size: 17px; font-weight: 700; color: #ffffff; }
    .drawer-email-sub { font-size: 13px; color: #94a3b8; }
    .drawer-close-btn { background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; }

    .drawer-inner-body {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .drawer-group label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 6px;
    }

    .audit-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
    }

    .audit-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
    }

    .drawer-bottom-bar {
      padding: 18px 24px;
      border-top: 1px solid #e2e8f0;
    }

    .btn-solid-dark {
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  pendingAdmins: User[] = [];
  allUsers: User[] = [];

  searchQuery: string = '';
  activeFilter: 'ALL' | 'ACTIVE' | 'PENDING' | 'SUPERADMIN' = 'ALL';
  inspectUser: User | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.pendingAdmins = users.filter(user =>
          user.roles.includes('ADMIN') && !user.enabled
        );
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users.');
      }
    });
  }

  get filteredUsers(): User[] {
    return this.allUsers.filter(user => {
      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roles.some(r => r.toLowerCase().includes(query));

      let matchesFilter = true;
      if (this.activeFilter === 'ACTIVE') {
        matchesFilter = user.enabled;
      } else if (this.activeFilter === 'PENDING') {
        matchesFilter = user.roles.includes('ADMIN') && !user.enabled;
      } else if (this.activeFilter === 'SUPERADMIN') {
        matchesFilter = user.roles.includes('SUPERADMIN');
      }

      return matchesSearch && matchesFilter;
    });
  }

  setFilter(filter: 'ALL' | 'ACTIVE' | 'PENDING' | 'SUPERADMIN'): void {
    this.activeFilter = filter;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeFilter = 'ALL';
  }

  openUserDrawer(user: User): void {
    this.inspectUser = user;
  }

  getSuperadminCount(): number {
    return this.allUsers.filter(u => u.roles.includes('SUPERADMIN')).length;
  }

  getActiveUsersCount(): number {
    return this.allUsers.filter(u => u.enabled).length;
  }

  approveAdmin(user: User): void {
    if (confirm(`Approve ${user.username} as Admin?`)) {
      this.userService.toggleUser(user.id).subscribe({
        next: () => {
          alert(`${user.username} approved as Admin!`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error approving admin:', error);
          alert('Failed to approve admin.');
        }
      });
    }
  }

  rejectAdmin(user: User): void {
    if (confirm(`Reject ${user.username}'s admin request?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert(`${user.username}'s admin request rejected!`);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error rejecting admin:', error);
          alert('Failed to reject admin request.');
        }
      });
    }
  }

  toggleUser(user: User): void {
    const action = user.enabled ? 'disable' : 'enable';
    if (confirm(`${action} ${user.username}?`)) {
      this.userService.toggleUser(user.id).subscribe({
        next: () => {
          user.enabled = !user.enabled;
          alert(`${user.username} ${action}d successfully!`);
        },
        error: (error) => {
          console.error('Error toggling user:', error);
          alert('Failed to update user status.');
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Delete ${user.username}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(u => u.id !== user.id);
          alert(`${user.username} deleted successfully!`);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user.');
        }
      });
    }
  }

  getUserSpecializations(username: string, userObj?: User): string[] {
    const user = userObj || this.allUsers.find(u => u.username === username);
    if (user && user.specializations) {
      try {
        return JSON.parse(user.specializations);
      } catch (e) {
        return user.specializations.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    const specializations = localStorage.getItem(`user_${username}_specializations`);
    if (specializations) {
      try {
        return JSON.parse(specializations);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}