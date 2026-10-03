import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
            <h1>Checkout</h1>
            <p class="header-subtitle">Complete your delivery address and finalize your order securely.</p>
          </div>
          <div class="header-nav-actions">
            <button class="nav-btn secondary-nav-btn" (click)="goBack()">
              ← Back to Cart
            </button>
            <button class="nav-btn primary-nav-btn" (click)="goToProducts()">
              Browse Catalog
            </button>
          </div>
        </div>
      </div>

      <div class="checkout-container">
        <div class="checkout-grid" *ngIf="cartItems.length > 0">
          
          <!-- Left Column: Delivery Information Form -->
          <div class="delivery-card">
            <div class="card-header">
              <div class="header-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h2>Shipping & Delivery Details</h2>
                <p class="header-desc">Enter the destination address where your items should be delivered.</p>
              </div>
            </div>

            <form [formGroup]="deliveryForm" (ngSubmit)="onSubmit()" class="form-body">
              
              <div class="form-row">
                <div class="form-group">
                  <label>First Name <span class="req">*</span></label>
                  <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input type="text" formControlName="firstName" placeholder="" required>
                  </div>
                </div>

                <div class="form-group">
                  <label>Last Name <span class="req">*</span></label>
                  <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input type="text" formControlName="lastName" placeholder="" required>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email Address <span class="req">*</span></label>
                  <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input type="email" formControlName="email" placeholder="example@domain.com" required>
                  </div>
                  <div *ngIf="deliveryForm.get('email')?.touched && deliveryForm.get('email')?.invalid" class="field-error">
                    <span *ngIf="deliveryForm.get('email')?.errors?.['required']">Email address is required.</span>
                    <span *ngIf="deliveryForm.get('email')?.errors?.['pattern']">Please enter a valid email with a domain (e.g. name&#64;gmail.com).</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Phone Number <span class="req">*</span></label>
                  <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <input type="tel" formControlName="phone" placeholder="+91 " required>
                  </div>
                  <div *ngIf="deliveryForm.get('phone')?.touched && deliveryForm.get('phone')?.invalid" class="field-error">
                    <span *ngIf="deliveryForm.get('phone')?.errors?.['required']">Phone number is required.</span>
                    <span *ngIf="deliveryForm.get('phone')?.errors?.['pattern']">Must be a valid 10-digit number starting with 6, 7, 8, or 9.</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Street Address <span class="req">*</span></label>
                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <input type="text" formControlName="address" placeholder="" required>
                </div>
              </div>

              <div class="form-row-3">
                <div class="form-group">
                  <label>City <span class="req">*</span></label>
                  <input type="text" class="standard-input" formControlName="city" list="city-suggestions" placeholder="" required>
                  <datalist id="city-suggestions">
                    <option *ngFor="let suggestion of citySuggestions" [value]="suggestion"></option>
                  </datalist>
                </div>

                <div class="form-group">
                  <label>State / Province <span class="req">*</span></label>
                  <select class="standard-input" formControlName="state" required>
                    <option value="" disabled selected>Select State</option>
                    <option *ngFor="let state of indianStates" [value]="state">{{ state }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>ZIP / Postal Code <span class="req">*</span></label>
                  <input type="text" class="standard-input" formControlName="zipCode" placeholder="" required (input)="onZipCodeChange($event)">
                </div>
              </div>

              <div class="form-group">
                <label>Delivery Instructions (Optional)</label>
                <textarea formControlName="instructions" placeholder="" rows="3"></textarea>
              </div>

              <!-- Submit Button for mobile -->
              <button type="submit" class="submit-order-cta" [disabled]="deliveryForm.invalid || cartItems.length === 0">
                <span>Place Order • ₹{{getTotalPrice().toFixed(2)}}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>

          <!-- Right Column: Sticky Order Summary Card -->
          <div class="summary-panel">
            <div class="summary-card">
              <div class="summary-header">
                <h2>Order Summary</h2>
                <span class="items-badge">{{cartItems.length}} {{cartItems.length === 1 ? 'item' : 'items'}}</span>
              </div>

              <!-- Itemized List -->
              <div class="items-list">
                <div class="summary-item-row" *ngFor="let item of cartItemsWithNames">
                  <div class="item-meta">
                    <span class="item-name">{{item.productName}}</span>
                    <span class="item-tag">{{item.category || 'Product'}}</span>
                  </div>
                  <div class="item-pricing">
                    <span class="qty-pill">×{{item.quantity}}</span>
                    <span class="price-val">₹{{(item.price * item.quantity).toFixed(2)}}</span>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- Cost Calculations -->
              <div class="cost-breakdown">
                <div class="cost-row">
                  <span class="lbl">Subtotal</span>
                  <span class="val">₹{{getTotalPrice().toFixed(2)}}</span>
                </div>

                <div class="cost-row">
                  <span class="lbl">
                    Standard Shipping
                    <span class="sub-lbl-date">(Est. 3–5 Days)</span>
                  </span>
                  <span class="val free-pill" *ngIf="getShippingFee() === 0">FREE</span>
                  <span class="val fee-tag" *ngIf="getShippingFee() > 0">₹{{getShippingFee().toFixed(2)}}</span>
                </div>

                <div class="cost-row">
                  <span class="lbl">Estimated Taxes & GST</span>
                  <span class="val muted-pill">Included</span>
                </div>

                <div class="divider"></div>

                <div class="total-row">
                  <span class="total-lbl">Total to Pay</span>
                  <span class="total-val">₹{{getGrandTotal().toFixed(2)}}</span>
                </div>
              </div>

              <!-- Primary Submit CTA on Summary Card -->
              <button type="button" class="summary-place-order-btn" 
                      [disabled]="deliveryForm.invalid || cartItems.length === 0 || isSubmitting"
                      (click)="onSubmit()">
                <span *ngIf="!isSubmitting">Place Order • ₹{{getGrandTotal().toFixed(2)}}</span>
                <span *ngIf="isSubmitting">Placing Order...</span>
                <svg *ngIf="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <div class="security-trust">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Guaranteed 256-Bit SSL Encrypted Checkout</span>
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

    /* Ambient Lighting */
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

    /* Header Bar */
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

    /* Checkout Container Layout */
    .checkout-container {
      max-width: 1200px;
      margin: 36px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 2;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 32px;
      align-items: start;
    }

    /* Delivery Card */
    .delivery-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      padding: 32px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 24px;
    }

    .header-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #f3e8ff;
      color: #7c3aed;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon-box svg {
      width: 24px;
      height: 24px;
    }

    .card-header h2 {
      margin: 0 0 4px 0;
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
    }

    .header-desc {
      margin: 0;
      font-size: 13.5px;
      color: #64748b;
    }

    /* Form Styles */
    .form-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }

    .req {
      color: #ef4444;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      width: 17px;
      height: 17px;
      color: #94a3b8;
      pointer-events: none;
    }

    .input-wrapper input {
      width: 100%;
      padding: 12px 14px 12px 42px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .standard-input {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
      resize: vertical;
    }

    input:focus, textarea:focus, .standard-input:focus {
      outline: none;
      background: #ffffff;
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
    }

    .field-error {
      color: #ef4444;
      font-size: 12px;
      font-weight: 500;
      margin-top: 2px;
      line-height: 1.3;
    }

    .submit-order-cta {
      display: none; /* Shown on small screens */
      width: 100%;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 15px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 10px;
    }

    /* Right Sticky Summary Panel */
    .summary-panel {
      position: sticky;
      top: 100px;
    }

    .summary-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      padding: 28px;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .summary-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .items-badge {
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 8px;
    }

    /* Itemized List in Summary */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 240px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .summary-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .item-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
    }

    .item-tag {
      font-size: 11px;
      color: #94a3b8;
    }

    .item-pricing {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .qty-pill {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .price-val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }

    .divider {
      height: 1px;
      background: #f1f5f9;
      margin: 16px 0;
    }

    /* Cost Breakdown */
    .cost-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13.5px;
      color: #475569;
    }

    .sub-lbl-date {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }

    .fee-tag {
      color: #0f172a !important;
      font-weight: 800;
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 12px;
    }

    .free-pill {
      color: #059669;
      font-weight: 800;
      background: #ecfdf5;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 12px;
    }

    .muted-pill {
      color: #64748b;
      font-size: 12px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
    }

    .total-lbl {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .total-val {
      font-size: 24px;
      font-weight: 800;
      color: #7c3aed;
      letter-spacing: -0.5px;
    }

    /* Place Order CTA */
    .summary-place-order-btn {
      width: 100%;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 15px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
      transition: all 0.25s ease;
      margin-bottom: 16px;
    }

    .summary-place-order-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(124, 58, 237, 0.5);
    }

    .summary-place-order-btn:disabled {
      background: #cbd5e1;
      color: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }

    .summary-place-order-btn svg {
      width: 17px;
      height: 17px;
      transition: transform 0.2s ease;
    }

    .summary-place-order-btn:hover:not(:disabled) svg {
      transform: translateX(3px);
    }

    .security-trust {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11.5px;
      color: #64748b;
      font-weight: 600;
    }

    .security-trust svg {
      width: 14px;
      height: 14px;
      color: #10b981;
    }

    @media (max-width: 992px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
      .summary-panel {
        position: static;
      }
      .submit-order-cta {
        display: flex;
      }
    }

    @media (max-width: 640px) {
      .form-row, .form-row-3 {
        grid-template-columns: 1fr;
      }
      .delivery-card {
        padding: 20px;
      }
      .header-inner {
        padding: 20px;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartItemsWithNames: any[] = [];
  deliveryForm: FormGroup;
  isSubmitting: boolean = false;

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.deliveryForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phone: ['+91 ', [Validators.required, Validators.pattern(/^(\+91[\-\s]?)?[6-9]\d{9}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      instructions: ['']
    });
  }

  citySuggestions: string[] = [];

  onZipCodeChange(event: any): void {
    const zip = (event.target.value || '').trim();
    if (zip && zip.length === 6 && /^\d{6}$/.test(zip)) {
      fetch(`https://api.postalpincode.in/pincode/${zip}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffices: any[] = data[0].PostOffice;
            const resolvedCity = this.resolveCityName(postOffices);
            const resolvedState = this.matchState(postOffices[0].State);

            // Collect unique locality and area suggestions for the datalist dropdown
            const suggestions = new Set<string>();
            if (resolvedCity) suggestions.add(resolvedCity);
            postOffices.forEach(po => {
              if (po.Name) suggestions.add(this.cleanName(po.Name));
              if (po.Block && po.Block !== 'NA') suggestions.add(this.cleanName(po.Block));
              if (po.District) suggestions.add(this.cleanName(po.District));
            });
            this.citySuggestions = Array.from(suggestions).filter(s => s && s.length > 1);

            this.deliveryForm.patchValue({
              city: resolvedCity || this.cleanName(postOffices[0].District),
              state: resolvedState
            });
          }
        })
        .catch(err => console.error('Error fetching pincode details', err));
    }
  }

  private cleanName(name: string): string {
    if (!name) return '';
    return name
      .replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/\s+(H\.?O\.?|S\.?O\.?|B\.?O\.?|G\.?P\.?O\.?)$/i, '')
      .trim();
  }

  private resolveCityName(postOffices: any[]): string {
    if (!postOffices || postOffices.length === 0) return '';

    // 1. Head Post Office (H.O.) is virtually always named after the principal city
    const headOffice = postOffices.find(po => po.BranchType === 'Head Post Office');
    if (headOffice && headOffice.Name) {
      const cleanHead = this.cleanName(headOffice.Name);
      if (cleanHead && cleanHead.length > 2) {
        return cleanHead;
      }
    }

    const first = postOffices[0];
    const district = (first.District || '').trim();

    // 2. Known district-to-city mappings in India
    const districtToCity: Record<string, string> = {
      'Gautam Buddha Nagar': 'Noida',
      'Ernakulam': 'Kochi',
      'Kamrup': 'Guwahati',
      'Kamrup Metropolitan': 'Guwahati',
      'Khordha': 'Bhubaneswar',
      'Khorda': 'Bhubaneswar',
      'S.A.S Nagar': 'Mohali',
      'K.V.Rangareddy': 'Hyderabad',
      'Rangareddy': 'Hyderabad',
      'Medchal Malkajgiri': 'Hyderabad',
      'Central Delhi': 'New Delhi',
      'North Delhi': 'New Delhi',
      'South Delhi': 'New Delhi',
      'East Delhi': 'New Delhi',
      'West Delhi': 'New Delhi',
      'North East Delhi': 'New Delhi',
      'North West Delhi': 'New Delhi',
      'South West Delhi': 'New Delhi'
    };

    if (districtToCity[district]) {
      // Check if Greater Noida specific post office
      const hasGreaterNoida = postOffices.some(po => 
        (po.Name && po.Name.toLowerCase().includes('greater noida')) || 
        (po.Block && po.Block.toLowerCase().includes('greater noida'))
      );
      if (hasGreaterNoida && district === 'Gautam Buddha Nagar') {
        return 'Greater Noida';
      }
      return districtToCity[district];
    }

    // 3. Division hints
    if (first.Division) {
      const divLower = first.Division.toLowerCase();
      if (divLower.includes('new mumbai') || divLower.includes('navi mumbai')) {
        return 'Navi Mumbai';
      }
    }

    // 4. Block name if valid and not administrative
    if (first.Block && first.Block !== 'NA' && !/corporation|north|south|east|west|taluk|tehsil/i.test(first.Block)) {
      return this.cleanName(first.Block);
    }

    // 5. Default fallback to clean district
    return this.cleanName(district);
  }

  private matchState(apiState: string): string {
    if (!apiState) return '';
    const trimmed = apiState.trim().toLowerCase();
    const match = this.indianStates.find(s => s.toLowerCase() === trimmed);
    if (match) return match;
    if (trimmed === 'orissa') return 'Odisha';
    if (trimmed === 'pondicherry') return 'Puducherry';
    return this.indianStates.find(s => s.toLowerCase().includes(trimmed) || trimmed.includes(s.toLowerCase())) || apiState;
  }

  ngOnInit(): void {
    console.log('🛒 Checkout component initialized');
    this.cartService.syncCartWithLatestPrices().subscribe(() => {
      this.loadProductNames();
    });
    this.cartService.cart$.subscribe(items => {
      console.log('📦 Cart items received:', items);
      this.cartItems = items;
      if (items.length === 0) {
        console.log('⚠️ No items in cart, redirecting to cart page');
        this.router.navigate(['/cart']);
      } else {
        this.loadProductNames();
      }
    });
  }

  loadProductNames(): void {
    if (this.cartItems.length === 0) {
      this.cartItemsWithNames = [];
      return;
    }

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.cartItemsWithNames = this.cartItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          const currentPrice = product && product.price !== undefined ? product.price : item.price;
          
          if (product && product.price !== undefined && product.price !== item.price) {
            this.cartService.updateItemPrice(item.productId, product.price);
          }

          return {
            ...item,
            price: currentPrice,
            productName: product ? product.name : `Product #${item.productId}`,
            category: product ? product.category : 'General',
            adminUsername: product ? product.adminUsername : undefined
          };
        });
      },
      error: () => {
        this.cartItemsWithNames = this.cartItems.map(item => ({
          ...item,
          productName: `Product #${item.productId}`,
          category: 'General',
          adminUsername: undefined
        }));
      }
    });
  }

  getTotalPrice(): number {
    return this.cartItemsWithNames.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  }

  getShippingFee(): number {
    return this.getTotalPrice() >= 500 || this.cartItems.length === 0 ? 0 : 50;
  }

  getGrandTotal(): number {
    return this.getTotalPrice() + this.getShippingFee();
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      console.log('⚠️ Checkout submission already in flight, ignoring duplicate click');
      return;
    }

    console.log('=== CHECKOUT DEBUG START ===');
    console.log('1. Form submitted');
    console.log('2. Form valid:', this.deliveryForm.valid);
    console.log('3. Cart items count:', this.cartItems.length);
    console.log('4. Cart items with names:', this.cartItemsWithNames);
    
    if (this.deliveryForm.valid && this.cartItems.length > 0) {
      this.isSubmitting = true;
      console.log('5. Validation passed, proceeding...');
      const formData = this.deliveryForm.value;
      const currentUser = this.authService.getCurrentUser()?.username || localStorage.getItem('username') || 'user';
      
      const customerInfo = {
        name: currentUser,
        username: currentUser,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'India'
        }
      };
      
      const cartItemsForOrder = this.cartItemsWithNames.map(item => ({
        ...item,
        category: item.category || 'Other'
      }));
      
      console.log('📦 Final cart items for order:', cartItemsForOrder);
      console.log('Creating order with customer info:', customerInfo);
      console.log('Cart items for order:', cartItemsForOrder);
      
      this.orderService.createOrder(cartItemsForOrder, customerInfo).subscribe({
        next: (order) => {
          console.log('13. ✅ Order created successfully:', order);
          alert('Order placed successfully! You will receive a confirmation email shortly.');
          this.cartService.clearCart();
          
          this.orderService.refreshOrders();
          setTimeout(() => {
            this.router.navigate(['/order-history']);
          }, 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('ERROR: Order creation failed', error);
          alert('Failed to place order. Check console for details.');
        }
      });
    } else {
      console.log('VALIDATION FAILED: Form valid=', this.deliveryForm.valid);
      if (!this.deliveryForm.valid) {
        Object.keys(this.deliveryForm.controls).forEach(key => {
          const control = this.deliveryForm.get(key);
          if (control && control.invalid) {
            console.log(`- ${key} errors:`, control.errors);
          }
        });
      }
    }
    console.log('=== CHECKOUT DEBUG END ===');
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}