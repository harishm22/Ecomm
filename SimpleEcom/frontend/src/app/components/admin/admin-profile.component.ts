import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="profile"></app-admin-sidebar>

      <div class="main-content">
        <!-- Top Header -->
        <div class="header">
          <div class="header-title-area">
            <h1>Admin Profile & Security</h1>
            <p class="header-subtitle">Manage your account credentials, notifications, and store specializations.</p>
          </div>
        </div>

        <div class="container">
          <div class="profile-grid">
            
            <!-- Left: Profile & Security Form Card -->
            <div class="profile-card">
              
              <!-- Profile Hero Header -->
              <div class="profile-hero">
                <div class="avatar-box">
                  <div class="avatar-circle">{{username.charAt(0).toUpperCase()}}</div>
                </div>
                <div class="profile-hero-meta">
                  <h2 class="profile-username">{{username}}</h2>
                  <div class="badge-group">
                    <span class="role-badge" [class.super-admin]="isSuperAdmin">
                      <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span>{{isSuperAdmin ? 'Super Administrator' : 'Administrator'}}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Form Sections -->
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                
                <!-- Section 1: Personal Info -->
                <div class="form-section">
                  <div class="section-heading">
                    <div class="sec-icon-box">
                      <svg class="sec-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div>
                      <h3>Personal Information</h3>
                      <p class="sec-sub">Account identification and contact details</p>
                    </div>
                  </div>
                  
                  <div class="form-grid">
                    <div class="form-field">
                      <label>Username</label>
                      <div class="locked-input-box">
                        <input type="text" formControlName="username" readonly class="readonly-input">
                        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div class="form-field">
                      <label>Email Address <span class="req">*</span></label>
                      <input type="email" formControlName="email" placeholder="e.g. admin@simpleecom.com" required>
                    </div>
                    
                    <div class="form-field">
                      <label>First Name (Optional)</label>
                      <input type="text" formControlName="firstName" placeholder="Enter first name">
                    </div>

                    <div class="form-field">
                      <label>Last Name (Optional)</label>
                      <input type="text" formControlName="lastName" placeholder="Enter last name">
                    </div>
                    
                    <div class="form-field full-width">
                      <label>Phone Number (Optional)</label>
                      <input type="tel" formControlName="phone" placeholder="+91 98765 43210">
                    </div>
                  </div>
                  
                  <!-- Product Specializations -->
                  <div class="form-field full-width specializations-area">
                    <label>Product Specializations</label>
                    <span class="field-hint">Categories you actively manage in catalog listings</span>
                    <div class="specialization-chips">
                      <button type="button" 
                              class="spec-chip" 
                              *ngFor="let category of categories"
                              [class.selected]="selectedCategories.includes(category)"
                              (click)="toggleCategory(category)">
                        <svg class="chip-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" *ngIf="selectedCategories.includes(category)">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{{category}}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Section 2: Security & Password -->
                <div class="form-section">
                  <div class="section-heading">
                    <div class="sec-icon-box">
                      <svg class="sec-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <div>
                      <h3>Security & Credentials</h3>
                      <p class="sec-sub">Update password to keep your administrator session protected</p>
                    </div>
                  </div>
                  
                  <div class="form-grid">
                    <div class="form-field">
                      <label>Current Password</label>
                      <input type="password" formControlName="currentPassword" placeholder="Enter existing password">
                    </div>
                    
                    <div class="form-field">
                      <label>New Password</label>
                      <input type="password" formControlName="newPassword" placeholder="Min. 6 characters">
                    </div>
                    
                    <div class="form-field full-width">
                      <label>Confirm New Password</label>
                      <input type="password" formControlName="confirmPassword" placeholder="Repeat new password">
                    </div>
                  </div>
                </div>

                <!-- Footer Buttons -->
                <div class="form-actions">
                  <button type="button" class="btn-secondary" (click)="resetForm()">Reset Fields</button>
                  <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || isSaving">
                    <svg class="save-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isSaving">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>{{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Right: System Preferences Card -->
            <div class="settings-card">
              <div class="section-heading">
                <div class="sec-icon-box">
                  <svg class="sec-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <div>
                  <h3>Preferences</h3>
                  <p class="sec-sub">System automation and notifications</p>
                </div>
              </div>
              
              <div class="settings-list">
                <div class="setting-toggle-item">
                  <div class="toggle-text">
                    <span class="toggle-title">Email Notifications</span>
                    <p class="toggle-desc">Receive email alerts for key inventory & sales updates</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [checked]="settings.emailNotifications" (change)="toggleSetting('emailNotifications')">
                    <span class="switch-slider"></span>
                  </label>
                </div>
                
                <div class="setting-toggle-item">
                  <div class="toggle-text">
                    <span class="toggle-title">Order Alerts</span>
                    <p class="toggle-desc">Instant notification whenever a new customer order arrives</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [checked]="settings.orderAlerts" (change)="toggleSetting('orderAlerts')">
                    <span class="switch-slider"></span>
                  </label>
                </div>
                
                <div class="setting-toggle-item">
                  <div class="toggle-text">
                    <span class="toggle-title">Low Stock Alerts</span>
                    <p class="toggle-desc">Warn when product inventory reaches warning threshold</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [checked]="settings.lowStockAlerts" (change)="toggleSetting('lowStockAlerts')">
                    <span class="switch-slider"></span>
                  </label>
                </div>
                
                <div class="setting-toggle-item">
                  <div class="toggle-text">
                    <span class="toggle-title">Dark Theme</span>
                    <p class="toggle-desc">Enable dark interface for nighttime store operations</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [checked]="settings.darkMode" (change)="toggleSetting('darkMode')">
                    <span class="switch-slider"></span>
                  </label>
                </div>
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

    .container {
      max-width: 1400px;
      padding: 32px 36px;
      flex: 1;
      width: 100%;
      box-sizing: border-box;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) 380px;
      gap: 32px;
      align-items: start;
    }

    .profile-card, .settings-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      min-width: 0;
    }

    /* Profile Hero Header */
    .profile-hero {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 24px;
      margin-bottom: 28px;
      border-bottom: 1px solid #f1f5f9;
    }

    .avatar-box {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: 800;
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.28);
    }

    .live-status-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10b981;
      border: 2.5px solid #ffffff;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    .profile-hero-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .profile-username {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.4px;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .role-badge.super-admin {
      background: #fdf2f8;
      color: #db2777;
      border-color: #fbcfe8;
    }

    .badge-icon {
      width: 13px;
      height: 13px;
    }

    .session-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .active-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }

    /* Section Headings */
    .form-section {
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 8px;
    }

    .section-heading {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;
    }

    .sec-icon-box {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 10px;
      background: #f3e8ff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }

    .sec-svg {
      width: 18px;
      height: 18px;
    }

    .section-heading h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .sec-sub {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }

    /* Form Inputs */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      color: #334155;
      font-weight: 600;
      margin-bottom: 7px;
      font-size: 13px;
    }

    .req {
      color: #ef4444;
    }

    .field-hint {
      font-size: 11.5px;
      color: #94a3b8;
      margin-bottom: 10px;
    }

    .form-field input {
      width: 100%;
      padding: 11px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      box-sizing: border-box;
      outline: none;
    }

    .form-field input:focus {
      background: #ffffff;
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
    }

    .locked-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .readonly-input {
      background: #f1f5f9 !important;
      color: #64748b !important;
      cursor: not-allowed;
      padding-right: 36px !important;
    }

    .lock-icon {
      position: absolute;
      right: 12px;
      width: 15px;
      height: 15px;
      color: #94a3b8;
      pointer-events: none;
    }

    /* Specialization Chips */
    .specializations-area {
      margin-top: 10px;
    }

    .specialization-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .spec-chip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .spec-chip:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .spec-chip.selected {
      background: #f3e8ff;
      border-color: #c084fc;
      color: #7c3aed;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.12);
    }

    .chip-check {
      width: 12px;
      height: 12px;
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-secondary {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-primary {
      padding: 10px 24px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s ease;
    }

    .save-svg {
      width: 16px;
      height: 16px;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
    }

    .btn-primary:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* System Preferences Card */
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 14px;
    }

    .setting-toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      gap: 16px;
    }

    .toggle-text {
      flex: 1;
    }

    .toggle-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      display: block;
    }

    .toggle-desc {
      margin: 2px 0 0 0;
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.4;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: .25s;
      border-radius: 24px;
    }

    .switch-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .25s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    input:checked + .switch-slider {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    }

    input:checked + .switch-slider:before {
      transform: translateX(20px);
    }

    @media (max-width: 992px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  username: string = 'Admin';
  isSuperAdmin: boolean = false;
  isSaving: boolean = false;

  categories: string[] = [
    'Electronics',
    'Clothing & Fashion',
    'Food & Beverages',
    'Books & Education',
    'Home & Garden',
    'Sports & Fitness',
    'Beauty & Care',
    'General Merchandise'
  ];

  selectedCategories: string[] = ['Electronics'];

  settings = {
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: false,
    darkMode: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      phone: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.username = user.username;
      this.isSuperAdmin = this.authService.isSuperAdmin();

      const savedProfile = JSON.parse(localStorage.getItem(`profile_${this.username}`) || '{}');
      const savedSettings = JSON.parse(localStorage.getItem(`settings_${this.username}`) || '{}');

      if (Object.keys(savedSettings).length > 0) {
        this.settings = { ...this.settings, ...savedSettings };
      }

      this.selectedCategories = savedProfile.categories || ['Electronics'];

      this.profileForm.patchValue({
        username: this.username,
        email: savedProfile.email || user.email || `${this.username.toLowerCase()}@simpleecom.com`,
        firstName: savedProfile.firstName || '',
        lastName: savedProfile.lastName || '',
        phone: savedProfile.phone || ''
      });
    }
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
  }

  toggleSetting(settingKey: keyof typeof this.settings): void {
    this.settings[settingKey] = !this.settings[settingKey];
    localStorage.setItem(`settings_${this.username}`, JSON.stringify(this.settings));
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      const formVal = this.profileForm.value;

      if (formVal.newPassword) {
        if (formVal.newPassword.length < 6) {
          alert('New password must be at least 6 characters long.');
          this.isSaving = false;
          return;
        }
        if (formVal.newPassword !== formVal.confirmPassword) {
          alert('New passwords do not match.');
          this.isSaving = false;
          return;
        }
      }

      const profileData = {
        email: formVal.email,
        firstName: formVal.firstName,
        lastName: formVal.lastName,
        phone: formVal.phone,
        categories: this.selectedCategories
      };

      localStorage.setItem(`profile_${this.username}`, JSON.stringify(profileData));

      setTimeout(() => {
        this.isSaving = false;
        alert('Profile and security preferences updated successfully!');
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 400);
    }
  }

  resetForm(): void {
    this.ngOnInit();
  }
}