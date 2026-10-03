import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { CartItem, Product } from '../../models/product.model';
import { getDefaultProductImage, getProductImageUrl } from '../../utils/image-utils';

@Component({
  selector: 'app-cart',
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
            <h1>Shopping Cart</h1>
            <p class="header-subtitle">Review your selected items, adjust quantities, and proceed to secure checkout.</p>
          </div>
          <div class="header-nav-actions">
            <button class="nav-btn secondary-nav-btn" (click)="goBack()">
              ← Dashboard
            </button>
            <button class="nav-btn primary-nav-btn" (click)="goToProducts()">
              Browse Catalog
            </button>
          </div>
        </div>
      </div>

      <div class="cart-container">
        <!-- Active Cart with Items (2-Column Modern Grid) -->
        <div class="cart-grid" *ngIf="cartItems.length > 0">
          
          <!-- Left: Cart Items List -->
          <div class="items-card">
            <div class="card-header">
              <div class="header-left">
                <h2>Cart Items</h2>
                <span class="items-count-badge">{{cartItems.length}} {{cartItems.length === 1 ? 'item' : 'items'}}</span>
              </div>
              <button class="clear-cart-text-btn" (click)="clearCart()" title="Remove all items from cart">
                <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Clear All</span>
              </button>
            </div>

            <div class="items-list">
              <div class="cart-item-row" *ngFor="let item of cartItemsWithNames">
                
                <!-- Product Thumbnail -->
                <div class="item-thumbnail">
                  <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.productName">
                  <div *ngIf="!item.imageUrl" class="fallback-thumb-icon">
                    {{getDefaultProductImage(item.category || 'default')}}
                  </div>
                </div>

                <!-- Product Information -->
                <div class="item-details">
                  <span class="category-chip">{{item.category || 'General'}}</span>
                  <h3 class="item-name">{{item.productName}}</h3>
                  <span class="unit-price">₹{{item.price.toFixed(2)}} / unit</span>
                  <span class="max-stock-tag" *ngIf="item.maxStock !== undefined && item.quantity >= item.maxStock">
                    Max Stock Limit ({{item.maxStock}} Available)
                  </span>
                </div>

                <!-- Quantity Stepper Controls -->
                <div class="qty-stepper">
                  <button class="stepper-btn minus" (click)="decreaseQuantity(item)" title="Decrease Quantity">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <span class="stepper-val">{{item.quantity}}</span>
                  <button class="stepper-btn plus" 
                          [disabled]="item.maxStock !== undefined && item.quantity >= item.maxStock"
                          (click)="increaseQuantity(item)" 
                          [title]="item.maxStock !== undefined && item.quantity >= item.maxStock ? 'Maximum stock reached (' + item.maxStock + ')' : 'Increase Quantity'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>

                <!-- Total Line Price -->
                <div class="line-total-block">
                  <span class="line-label">Total</span>
                  <span class="line-val">₹{{(item.price * item.quantity).toFixed(2)}}</span>
                </div>

                <!-- Delete Item Button -->
                <button class="delete-item-btn" (click)="removeItem(item)" title="Remove item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Sticky Order Summary Card -->
          <div class="summary-panel">
            <div class="summary-card">
              <h2 class="summary-title">Order Summary</h2>

              <!-- Free Shipping Threshold Banner -->
              <div class="shipping-threshold-banner" *ngIf="getTotalPrice() < 500">
                <div class="threshold-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span>Add <strong>₹{{getAmountNeededForFreeShipping().toFixed(2)}}</strong> more for <strong>FREE Delivery</strong></span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" [style.width.%]="getFreeShippingProgress()"></div>
                </div>
              </div>

              <div class="shipping-unlocked-banner" *ngIf="getTotalPrice() >= 500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>You've unlocked <strong>FREE Standard Shipping</strong>!</span>
              </div>

              <div class="summary-breakdown">
                <div class="breakdown-row">
                  <span class="lbl">Subtotal ({{cartItems.length}} items)</span>
                  <span class="val">₹{{getTotalPrice().toFixed(2)}}</span>
                </div>

                <div class="breakdown-row">
                  <span class="lbl">
                    Estimated Delivery
                    <span class="sub-lbl-date">(Est. {{getEstimatedDeliveryRange()}})</span>
                  </span>
                  <span class="val free-tag" *ngIf="getShippingFee() === 0">FREE</span>
                  <span class="val fee-tag" *ngIf="getShippingFee() > 0">₹{{getShippingFee().toFixed(2)}}</span>
                </div>

                <div class="breakdown-row">
                  <span class="lbl">Taxes & GST</span>
                  <span class="val muted-tag">Included</span>
                </div>

                <div class="divider"></div>

                <div class="total-row">
                  <span class="total-lbl">Total Amount</span>
                  <span class="total-val">₹{{getGrandTotal().toFixed(2)}}</span>
                </div>
              </div>

              <!-- Primary Checkout Action -->
              <button class="checkout-cta-btn" (click)="proceedToCheckout()">
                <span>Proceed to Checkout</span>
                <svg class="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <!-- Security Trust Badge -->
              <div class="security-badge">
                <svg class="lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Guaranteed 256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Cart State -->
        <div class="empty-cart-card" *ngIf="cartItems.length === 0">
          <div class="empty-cart-icon-box">
            <svg class="empty-bag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
          </div>
          <h2>Your shopping bag is empty</h2>
          <p>Explore our curated 3D catalog to discover trending products and great deals.</p>
          <button class="start-shop-btn" (click)="goToProducts()">
            <span>Start Shopping</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
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
    }

    /* Ambient Lighting */
    .mesh-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 600px;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .mesh-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.45;
    }

    .orb-1 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(216, 180, 254, 0) 70%);
      top: -150px;
      left: 10%;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(191, 219, 254, 0) 70%);
      top: -100px;
      right: 15%;
    }

    /* Header Bar */
    .header {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }

    .header-inner {
      max-width: 1300px;
      margin: 0 auto;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      font-size: 13px;
      color: #64748b;
    }

    .header-nav-actions {
      display: flex;
      gap: 10px;
    }

    .nav-btn {
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .secondary-nav-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .secondary-nav-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .primary-nav-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }

    .primary-nav-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
    }

    /* Container & 2-Column Grid */
    .cart-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 36px 32px 80px;
      position: relative;
      z-index: 1;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    /* Left Card: Items List */
    .items-card {
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      padding: 28px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .items-count-badge {
      font-size: 11.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #64748b;
    }

    .clear-cart-text-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: color 0.2s ease;
    }

    .clear-cart-text-btn:hover {
      color: #ef4444;
    }

    .trash-icon {
      width: 14px;
      height: 14px;
    }

    /* Items List & Rows */
    .items-list {
      display: flex;
      flex-direction: column;
    }

    .cart-item-row {
      display: grid;
      grid-template-columns: 72px 1fr auto auto auto;
      gap: 20px;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s ease;
    }

    .cart-item-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .item-thumbnail {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 6px;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .item-thumbnail img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .fallback-thumb-icon {
      font-size: 26px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .category-chip {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7c3aed;
      margin-bottom: 4px;
    }

    .item-name {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unit-price {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .max-stock-tag {
      display: inline-block;
      margin-top: 4px;
      font-size: 10.5px;
      font-weight: 700;
      color: #d97706;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 2px 7px;
      border-radius: 5px;
      width: fit-content;
    }

    /* Stepper Controls */
    .qty-stepper {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 4px 6px;
    }

    .stepper-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      border: none;
      background: #ffffff;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }

    .stepper-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      background: #f1f5f9;
      color: #94a3b8;
      box-shadow: none;
    }

    .stepper-btn svg {
      width: 12px;
      height: 12px;
    }

    .stepper-btn:hover:not(:disabled) {
      background: #7c3aed;
      color: #ffffff;
    }

    .stepper-val {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      min-width: 26px;
      text-align: center;
    }

    /* Line Total */
    .line-total-block {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 90px;
    }

    .line-label {
      font-size: 10.5px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }

    .line-val {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Delete Item */
    .delete-item-btn {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .delete-item-btn svg {
      width: 15px;
      height: 15px;
    }

    .delete-item-btn:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 3px 10px rgba(220, 38, 38, 0.25);
    }

    /* Right: Order Summary Card */
    .summary-panel {
      position: sticky;
      top: 100px;
    }

    .summary-card {
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      padding: 28px;
    }

    .summary-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    /* Free Shipping Progress Banners */
    .shipping-threshold-banner {
      background: #fdf4ff;
      border: 1px solid #f5d0fe;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 20px;
    }

    .threshold-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: #86198f;
      margin-bottom: 8px;
    }

    .threshold-text svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: #a21caf;
    }

    .progress-bar-track {
      width: 100%;
      height: 6px;
      background: #f0abfc;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #c026d3 0%, #7c3aed 100%);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .shipping-unlocked-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }

    .shipping-unlocked-banner svg {
      width: 16px;
      height: 16px;
      color: #059669;
      flex-shrink: 0;
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

    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13.5px;
      color: #475569;
    }

    .breakdown-row .val {
      font-weight: 700;
      color: #0f172a;
    }

    .free-tag {
      color: #059669 !important;
      font-weight: 800;
      background: #ecfdf5;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 12px;
    }

    .muted-tag {
      color: #64748b !important;
      font-size: 12.5px;
    }

    .divider {
      height: 1px;
      background: #f1f5f9;
      margin: 6px 0;
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

    /* Checkout Action CTA */
    .checkout-cta-btn {
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

    .checkout-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(124, 58, 237, 0.5);
    }

    .arrow-svg {
      width: 17px;
      height: 17px;
      transition: transform 0.2s ease;
    }

    .checkout-cta-btn:hover .arrow-svg {
      transform: translateX(3px);
    }

    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11.5px;
      color: #64748b;
      font-weight: 600;
    }

    .lock-svg {
      width: 13px;
      height: 13px;
      color: #10b981;
    }

    /* Empty Cart State */
    .empty-cart-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px dashed #cbd5e1;
      padding: 80px 32px;
      text-align: center;
      max-width: 540px;
      margin: 40px auto 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .empty-cart-icon-box {
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

    .empty-bag-svg {
      width: 38px;
      height: 38px;
    }

    .empty-cart-card h2 {
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .empty-cart-card p {
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

    @media (max-width: 992px) {
      .cart-grid {
        grid-template-columns: 1fr;
      }
      .summary-panel {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .cart-item-row {
        grid-template-columns: 60px 1fr auto;
        gap: 12px;
      }
      .line-total-block {
        grid-column: 2;
        align-items: flex-start;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartItemsWithNames: any[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.syncCartWithLatestPrices().subscribe(() => {
      this.loadProductNames();
    });
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.loadProductNames();
    });
  }

  getDefaultProductImage(category: string): string {
    return getDefaultProductImage(category);
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
            imageUrl: product ? product.imageUrl : '',
            maxStock: product && product.quantity !== undefined ? product.quantity : 99
          };
        });
      },
      error: () => {
        this.cartItemsWithNames = this.cartItems.map(item => ({
          ...item,
          productName: `Product #${item.productId}`,
          maxStock: 99
        }));
      }
    });
  }

  increaseQuantity(item: any): void {
    if (item.maxStock !== undefined && item.quantity >= item.maxStock) {
      alert(`Cannot add more. Only ${item.maxStock} items available in stock for "${item.productName}".`);
      return;
    }
    this.cartService.updateQuantity(item.productId, item.quantity + 1, item.maxStock);
  }

  decreaseQuantity(item: any): void {
    this.cartService.updateQuantity(item.productId, item.quantity - 1, item.maxStock);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId);
  }

  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  getShippingFee(): number {
    return this.getTotalPrice() >= 500 || this.cartItems.length === 0 ? 0 : 50;
  }

  getGrandTotal(): number {
    return this.getTotalPrice() + this.getShippingFee();
  }

  getAmountNeededForFreeShipping(): number {
    return Math.max(0, 500 - this.getTotalPrice());
  }

  getFreeShippingProgress(): number {
    if (this.getTotalPrice() === 0) return 0;
    return Math.min(100, (this.getTotalPrice() / 500) * 100);
  }

  getEstimatedDeliveryRange(): string {
    return '3–5 Business Days';
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}