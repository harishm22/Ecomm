import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { getDefaultProductImage, getProductImageUrl } from '../../utils/image-utils';

interface CardTilt {
  transform: string;
  glareX: number;
  glareY: number;
  isHovered: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <!-- Ambient 3D Mesh Lighting Backdrop (Soft Light Theme) -->
    <div class="mesh-backdrop">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
      <div class="mesh-orb orb-3"></div>
    </div>

    <!-- Vibrant Header Bar -->
    <div class="header">
      <div class="header-content">
        <div class="navbar-greeting">
          <span>Hi, <strong class="user-name">{{username}}</strong></span>
        </div>
        <div class="header-actions">
          <button class="action-btn cart-btn" (click)="viewCart()" [class.has-items]="cartItemCount > 0">
            <svg class="header-action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            <span>Cart</span>
            <span class="cart-count-badge" *ngIf="cartItemCount > 0">{{cartItemCount}}</span>
          </button>
          <button class="action-btn history-btn" (click)="viewOrderHistory()">
            <svg class="header-action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7.5 4.27 9 5.15"></path>
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
            <span>Orders</span>
          </button>
          <button class="action-btn logout-btn" (click)="logout()">
            <svg class="header-action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 3D Hero Stage Showcase (Light Gradient Backdrop) -->
      <div class="hero-stage">
        <div class="hero-text-content">
          <div class="hero-tag"><span class="pulse-dot"></span> Next-Gen Shopping Experience</div>
          <h1 class="hero-title">Experience Products in <span class="gradient-3d">Full 3D Depth</span></h1>
          <p class="hero-subtitle">Explore curated high-end products with interactive 3D perspective previews, specular light highlights, and instantaneous checkout.</p>
          <div class="hero-actions">
            <button class="hero-btn primary" (click)="viewProducts()">
              <span>Explore All Products</span>
              <span class="arrow-icon">→</span>
            </button>
            <button class="hero-btn secondary" (click)="viewCart()">
              <span>Quick View Cart</span>
            </button>
          </div>
          <!-- Platform Value Metrics -->
          <div class="hero-metrics">
            <div class="metric-item">
              <span class="metric-val">100%</span>
              <span class="metric-label">Verified Quality</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="metric-val">3D Tilt</span>
              <span class="metric-label">Interactive Cards</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="metric-val">⚡ Express</span>
              <span class="metric-label">Fast Shipping</span>
            </div>
          </div>
        </div>
        
        <!-- 3D Hero Featured Product Shuffle Deck Stage -->
        <div class="hero-3d-stage" *ngIf="products.length > 0">
          <div class="stage-pedestal">
            <div class="stage-glow"></div>
            
            <!-- 3D Card Shuffle Stack Deck (Supports Drag or Click to Shuffle) -->
            <div class="shuffle-deck-container" (click)="onDeckClick()" title="Drag or click card to shuffle">
              <div class="shuffle-card 3d-card"
                   *ngFor="let product of getDeckProducts(); let i = index"
                   [ngClass]="getCardDeckClass(i)"
                   [style.zIndex]="getCardZIndex(i)"
                   [style.transform]="getCardTransformStyle(i)"
                   (mousedown)="onCardMouseDown($event, i)"
                   (touchstart)="onCardTouchStart($event, i)">
                
                <div class="specular-glare" *ngIf="i === 0" [style.background]="getGlareStyle(product.id!)"></div>

                <div class="shuffle-card-header">
                  <span class="card-category-chip">{{product.category || 'Featured'}}</span>
                </div>

                <div class="shuffle-image-wrap">
                  <img *ngIf="getProductImageUrl(product)" [src]="getProductImageUrl(product)" [alt]="product.name" />
                  <div *ngIf="!getProductImageUrl(product)" class="default-3d-icon">{{getDefaultProductImage(product.category || 'default')}}</div>

                  <!-- Animated Floating Motion Add to Cart Button (Matching product card) -->
                  <button class="motion-cart-btn" 
                          *ngIf="product.quantity > 0"
                          (click)="$event.stopPropagation(); onQuickAdd($event, product)"
                          [class.added]="isAddedMap.get(product.id!)"
                          title="Add to Cart">
                    <div class="btn-motion-content">
                      <svg class="cart-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="12" y1="10" x2="12" y2="16"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                      </svg>
                      <span class="btn-label-text">Add</span>
                      <span class="btn-check-icon">✓</span>
                    </div>
                    
                    <!-- Radiating Motion Sparks -->
                    <div class="spark-ring" *ngIf="isAddedMap.get(product.id!)">
                      <span class="spark s1"></span>
                      <span class="spark s2"></span>
                      <span class="spark s3"></span>
                      <span class="spark s4"></span>
                      <span class="spark s5"></span>
                      <span class="spark s6"></span>
                      <span class="spark s7"></span>
                      <span class="spark s8"></span>
                    </div>
                  </button>
                </div>

                <div class="shuffle-card-info">
                  <h3>{{product.name}}</h3>
                  <p class="shuffle-desc">{{product.description}}</p>
                  
                  <div class="shuffle-footer">
                    <span class="shuffle-price">₹{{product.price}}</span>
                    <span class="stock-tag" *ngIf="product.quantity === 0">Out of Stock</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Deck Indicator Dots -->
            <div class="deck-indicators" *ngIf="products.length > 1">
              <span *ngFor="let p of getDeckProducts(); let idx = index" 
                    class="indicator-dot" 
                    [class.active]="idx === 0"
                    (click)="$event.stopPropagation(); jumpToDeckIndex(idx)"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="categories-section">
        <div class="section-title-wrap">
          <h2>Shop By Category</h2>
          <p>Pick a category to filter products in real-time</p>
        </div>
        <div class="category-grid">
          <div class="category-card" *ngFor="let category of categories" (click)="filterByCategory(category.name)">
            <div class="category-icon-box" [ngClass]="'cat-' + category.key">
              <!-- Electronics -->
              <svg *ngIf="category.key === 'electronics'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                <path d="M12 18h.01"></path>
              </svg>

              <!-- Food -->
              <svg *ngIf="category.key === 'food'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>

              <!-- Clothing -->
              <svg *ngIf="category.key === 'clothing'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
              </svg>

              <!-- Books -->
              <svg *ngIf="category.key === 'books'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>

              <!-- Home -->
              <svg *ngIf="category.key === 'home'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>

              <!-- Sports -->
              <svg *ngIf="category.key === 'sports'" class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m4.93 4.93 4.24 4.24"></path>
                <path d="m14.83 9.17 4.24-4.24"></path>
                <path d="m14.83 14.83 4.24 4.24"></path>
                <path d="m9.17 14.83-4.24 4.24"></path>
              </svg>
            </div>
            <span class="category-name">{{category.name}}</span>
          </div>
        </div>
      </div>

      <!-- Products Catalog Section -->
      <div class="products-section">
        <div class="section-header">
          <div>
            <h2>Featured Product Catalog</h2>
            <p>Interactive 3D preview card grid</p>
          </div>
          <div class="header-buttons">
            <button class="view-all-btn" (click)="viewProducts()">View Full Catalog →</button>
          </div>
        </div>
        
        <!-- Skeleton Loading State -->
        <div class="skeleton-grid" *ngIf="loading">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]">
            <div class="skeleton-img"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
        
        <!-- Interactive 3D Products Grid -->
        <div class="products-grid" *ngIf="!loading && products.length > 0">
          <div class="product-card 3d-card" 
               *ngFor="let product of products.slice(0, 6)"
               (mousemove)="onCardMouseMove($event, product.id!)"
               (mouseleave)="onCardMouseLeave(product.id!)"
               [style.transform]="getCardTransform(product.id!)">
            
            <!-- Specular Light Reflection -->
            <div class="specular-glare" [style.background]="getGlareStyle(product.id!)"></div>
            
            <div class="product-header">
              <span class="category-chip">{{product.category || 'General'}}</span>
              <span class="stock-badge urgency" *ngIf="product.quantity > 0 && product.quantity <= 5">
                🔥 Only {{product.quantity}} Left
              </span>
              <span class="stock-badge out" *ngIf="product.quantity === 0">
                Out of Stock
              </span>
            </div>
            
            <div class="product-image-wrap">
              <img *ngIf="getProductImageUrl(product)" [src]="getProductImageUrl(product)" [alt]="product.name" />
              <div *ngIf="!getProductImageUrl(product)" class="default-icon">{{getDefaultProductImage(product.category || 'default')}}</div>

              <!-- Animated Motion Quick-Add Button (Matching user screenshots) -->
              <button class="motion-cart-btn" 
                      *ngIf="product.quantity > 0"
                      (click)="onQuickAdd($event, product)"
                      [class.added]="isAddedMap.get(product.id!)"
                      title="Add to Cart">
                <div class="btn-motion-content">
                  <svg class="cart-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="12" y1="10" x2="12" y2="16"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                  </svg>
                  <span class="btn-label-text">Add</span>
                  <span class="btn-check-icon">✓</span>
                </div>
                
                <!-- Radiating Motion Sparks (Screenshot 3 Burst) -->
                <div class="spark-ring" *ngIf="isAddedMap.get(product.id!)">
                  <span class="spark s1"></span>
                  <span class="spark s2"></span>
                  <span class="spark s3"></span>
                  <span class="spark s4"></span>
                  <span class="spark s5"></span>
                  <span class="spark s6"></span>
                  <span class="spark s7"></span>
                  <span class="spark s8"></span>
                </div>
              </button>
            </div>
            
            <div class="product-info">
              <h3>{{product.name}}</h3>
              <p class="description">{{product.description}}</p>
              
              <div class="product-footer">
                <div class="price-wrap">
                  <span class="price-label">Price</span>
                  <span class="price-value">₹{{product.price}}</span>
                </div>
                <span class="stock-badge out" *ngIf="product.quantity === 0">Out of Stock</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="no-products" *ngIf="!loading && products.length === 0">
          <div class="empty-icon">📦</div>
          <h3>No products available at the moment</h3>
          <p>Please check back later or start the backend service!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
      color: #0f172a;
      position: relative;
      overflow-x: hidden;
    }

    /* Ambient 3D Mesh Backdrop */
    .mesh-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .mesh-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.25;
      animation: meshRotate 22s infinite alternate ease-in-out;
    }

    .orb-1 {
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, #818cf8 0%, rgba(129, 140, 248, 0) 70%);
      top: -100px;
      left: -100px;
    }

    .orb-2 {
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, #f472b6 0%, rgba(244, 114, 182, 0) 70%);
      bottom: -150px;
      right: -100px;
      animation-delay: -5s;
    }

    .orb-3 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, #38bdf8 0%, rgba(56, 189, 248, 0) 70%);
      top: 35%;
      left: 30%;
      animation-delay: -10s;
    }

    /* Modern Clean Vibrant Purple Navbar (#a855f7 -> #7c3aed) */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 20px -2px rgba(124, 58, 237, 0.35);
      padding: 14px 0;
      color: white;
    }

    .header-content {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Clean Minimal Navbar Greeting */
    .navbar-greeting {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.4px;
    }

    .greeting-wave {
      font-size: 22px;
      display: inline-block;
      animation: wave 2.5s infinite ease-in-out;
      transform-origin: 70% 70%;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(14deg); }
      40% { transform: rotate(-8deg); }
      60% { transform: rotate(14deg); }
      80% { transform: rotate(-4deg); }
    }

    .user-name {
      color: #fef08a;
      font-weight: 800;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.28);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    }

    .cart-btn.has-items {
      background: rgba(255, 255, 255, 0.25);
    }

    .cart-count-badge {
      background: #ef4444;
      color: white;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      animation: cartBounce 0.4s ease;
    }

    /* Main Container */
    .main-content {
      position: relative;
      z-index: 1;
      max-width: 1300px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    /* 3D Hero Stage */
    .hero-stage {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
      align-items: center;
      background: linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #fae8ff 100%);
      border: 1px solid #e0e7ff;
      border-radius: 28px;
      padding: 48px;
      margin-bottom: 50px;
      box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.12);
      position: relative;
      overflow: hidden;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      color: #3730a3;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4f46e5;
      box-shadow: 0 0 10px #4f46e5;
      animation: pulseGlow 1.5s infinite;
    }

    .hero-title {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -1px;
      color: #0f172a;
    }

    .gradient-3d {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      color: #475569;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 540px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 36px;
    }

    .hero-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .hero-btn.primary {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.4);
    }

    .hero-btn.primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px -5px rgba(124, 58, 237, 0.6);
    }

    .hero-btn.secondary {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .hero-btn.secondary:hover {
      background: #f8fafc;
    }

    .hero-metrics {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .metric-val {
      display: block;
      font-size: 18px;
      font-weight: 800;
      color: #2563eb;
    }

    .metric-label {
      font-size: 12px;
      color: #64748b;
    }

    .metric-divider {
      width: 1px;
      height: 30px;
      background: #cbd5e1;
    }

    /* 3D Pedestal Stage */
    .hero-3d-stage {
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
    }

    .stage-pedestal {
      position: relative;
      width: 310px;
    }

    .deck-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      z-index: 20;
      position: relative;
    }

    .shuffle-trigger-btn {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .shuffle-trigger-btn:hover {
      background: #4f46e5;
      color: white;
      transform: scale(1.05);
    }

    /* 3D Interactive Card Shuffle Stack Deck */
    .shuffle-deck-container {
      position: relative;
      width: 290px;
      height: 385px;
      margin: 0 auto;
      cursor: pointer;
      perspective: 1200px;
    }

    .shuffle-card {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 18px;
      box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.12);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transform-origin: center bottom;
      user-select: none;
    }

    .shuffle-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .card-category-chip {
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      text-transform: uppercase;
    }

    .tap-hint {
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
    }

    .shuffle-image-wrap {
      height: 160px;
      background: #f8fafc;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      position: relative;
    }

    .shuffle-image-wrap img {
      max-width: 85%;
      max-height: 85%;
      object-fit: contain;
      filter: drop-shadow(0 8px 8px rgba(0,0,0,0.1));
    }

    .shuffle-card-info h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .shuffle-desc {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .shuffle-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .shuffle-price {
      font-size: 20px;
      font-weight: 800;
      color: #059669;
    }

    .shuffle-add-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .shuffle-add-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    /* Stack Deck Positioning Classes */
    .shuffle-card.deck-top {
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
      opacity: 1;
      border-color: #818cf8;
      box-shadow: 0 20px 45px -10px rgba(79, 70, 229, 0.22);
    }

    .shuffle-card.deck-2 {
      transform: translate3d(22px, -10px, -40px) rotate(6deg) scale(0.95);
      opacity: 0.88;
      pointer-events: none;
    }

    .shuffle-card.deck-3 {
      transform: translate3d(-24px, -20px, -80px) rotate(-8deg) scale(0.90);
      opacity: 0.70;
      pointer-events: none;
    }

    .shuffle-card.deck-back {
      transform: translate3d(0, -30px, -120px) rotate(0deg) scale(0.85);
      opacity: 0;
      pointer-events: none;
    }

    .shuffle-card.shuffling-out {
      animation: shuffleFlyOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes shuffleFlyOut {
      0% {
        transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
        opacity: 1;
      }
      50% {
        transform: translate3d(-140%, 15px, 40px) rotate(-28deg) scale(0.85);
        opacity: 0.7;
      }
      100% {
        transform: translate3d(0, -30px, -120px) rotate(0deg) scale(0.85);
        opacity: 0;
      }
    }

    /* Indicators */
    .deck-indicators {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #cbd5e1;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator-dot.active {
      width: 24px;
      border-radius: 12px;
      background: #4f46e5;
    }

    .featured-badge {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-block;
    }

    .featured-image {
      height: 180px;
      background: #f8fafc;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .featured-image img {
      max-width: 85%;
      max-height: 85%;
      object-fit: contain;
      filter: drop-shadow(0 10px 10px rgba(0,0,0,0.15));
    }

    .default-3d-icon {
      font-size: 64px;
      animation: float 4s infinite ease-in-out;
    }

    .featured-info h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: #0f172a;
    }

    .featured-price {
      font-size: 22px;
      font-weight: 800;
      color: #059669;
      display: block;
      margin-bottom: 14px;
    }

    .add-to-cart-hero {
      width: 100%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 10px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .add-to-cart-hero:hover:not(:disabled) {
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    /* Categories */
    .categories-section {
      margin-bottom: 60px;
    }

    .section-title-wrap {
      margin-bottom: 24px;
    }

    .section-title-wrap h2 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }

    .section-title-wrap p {
      color: #64748b;
      font-size: 14px;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 20px;
    }

    .category-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.04);
    }

    .category-card:hover {
      transform: translateY(-6px) scale(1.02);
      border-color: #6366f1;
      box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.2);
    }

    .header-action-svg {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
    }

    .category-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .cat-svg {
      width: 24px;
      height: 24px;
      transition: transform 0.3s ease;
    }

    .category-card:hover .cat-svg {
      transform: scale(1.15);
    }

    .cat-electronics {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    .cat-food {
      background: #fff7ed;
      color: #ea580c;
      border: 1px solid #fed7aa;
    }

    .cat-clothing {
      background: #fdf2f8;
      color: #db2777;
      border: 1px solid #fbcfe8;
    }

    .cat-books {
      background: #f3e8ff;
      color: #7c3aed;
      border: 1px solid #e9d5ff;
    }

    .cat-home {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .cat-sports {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    .category-name {
      font-weight: 700;
      font-size: 14px;
      color: #1e293b;
    }

    /* Products Section */
    .products-section {
      margin-bottom: 60px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 30px;
    }

    .section-header h2 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
    }

    .section-header p {
      color: #64748b;
      font-size: 14px;
    }

    .view-all-btn {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .view-all-btn:hover {
      background: #4f46e5;
      color: white;
      transform: translateX(4px);
    }

    /* Interactive 3D Product Cards */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 28px;
      perspective: 1000px;
    }

    .product-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 22px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transform-style: preserve-3d;
      transition: transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .product-card:hover {
      border-color: #818cf8;
      box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.25), 0 0 15px rgba(99, 102, 241, 0.1);
    }

    .specular-glare {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      border-radius: 22px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .specular-glare {
      opacity: 1;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .category-chip {
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    .stock-badge.urgency {
      background: #fffbebfb;
      color: #d97706;
      border: 1px solid #fde68a;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .stock-badge.out {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .product-image-wrap {
      height: 190px;
      background: #f8fafc;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
      padding: 16px;
      position: relative;
    }

    /* Animated Floating Motion Add to Cart Button (Matching user screenshot) */
    .motion-cart-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      height: 44px;
      min-width: 44px;
      border-radius: 22px;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      z-index: 15;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: visible;
    }

    .motion-cart-btn:hover {
      border-color: #4f46e5;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
      transform: translateY(-2px) scale(1.05);
    }

    .btn-motion-content {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #0f172a;
    }

    .cart-plus-icon {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease;
      color: #0f172a;
    }

    .btn-label-text {
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-width 0.35s ease, opacity 0.25s ease;
    }

    /* Expand into "Add" Pill Capsule on Hover (Screenshot #2) */
    .motion-cart-btn:hover .btn-label-text {
      max-width: 50px;
      opacity: 1;
    }

    /* Added Checkmark Morph State (Screenshot #3) */
    .motion-cart-btn.added {
      background: #ffffff;
      border-color: #10b981;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
      animation: buttonSuccessPulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .btn-check-icon {
      display: none;
      font-size: 16px;
      font-weight: 900;
      color: #10b981;
    }

    .motion-cart-btn.added .cart-plus-icon,
    .motion-cart-btn.added .btn-label-text {
      display: none;
    }

    .motion-cart-btn.added .btn-check-icon {
      display: inline-block;
      animation: checkPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Radiating Motion Sparks (Screenshot #3 Burst Lines) */
    .spark-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 60px;
      height: 60px;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .spark {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 3px;
      height: 10px;
      background: #10b981;
      border-radius: 2px;
      animation: sparkOut 0.6s cubic-bezier(0, 0, 0.2, 1) forwards;
    }

    .spark.s1 { transform: translate(-50%, -50%) rotate(0deg) translateY(-24px); }
    .spark.s2 { transform: translate(-50%, -50%) rotate(45deg) translateY(-24px); }
    .spark.s3 { transform: translate(-50%, -50%) rotate(90deg) translateY(-24px); }
    .spark.s4 { transform: translate(-50%, -50%) rotate(135deg) translateY(-24px); }
    .spark.s5 { transform: translate(-50%, -50%) rotate(180deg) translateY(-24px); }
    .spark.s6 { transform: translate(-50%, -50%) rotate(225deg) translateY(-24px); }
    .spark.s7 { transform: translate(-50%, -50%) rotate(270deg) translateY(-24px); }
    .spark.s8 { transform: translate(-50%, -50%) rotate(315deg) translateY(-24px); }

    @keyframes sparkOut {
      0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-8px) scaleY(0.4); }
      100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-32px) scaleY(1.3); }
    }

    .product-image-wrap img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transition: transform 0.3s ease;
      filter: drop-shadow(0 8px 8px rgba(0,0,0,0.08));
    }

    .product-card:hover .product-image-wrap img {
      transform: scale(1.06) translateZ(20px);
    }

    .default-icon {
      font-size: 52px;
      transition: transform 0.3s ease;
    }

    .product-card:hover .default-icon {
      transform: scale(1.15) rotate(4deg);
    }

    .product-info h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .description {
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;
    }

    .price-wrap {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
    }

    .price-value {
      font-size: 22px;
      font-weight: 800;
      color: #059669;
    }

    .add-to-cart-btn {
      position: relative;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.5);
    }

    .add-to-cart-btn:disabled {
      background: #e2e8f0;
      color: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Skeleton Loading State */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 28px;
    }

    .skeleton-card {
      background: #ffffff;
      border-radius: 22px;
      padding: 20px;
      height: 380px;
      border: 1px solid #e2e8f0;
    }

    .skeleton-img {
      height: 190px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 16px;
      margin-bottom: 20px;
    }

    .skeleton-text {
      height: 20px;
      background: #f1f5f9;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .skeleton-text.short {
      width: 60%;
    }

    /* Empty state */
    .no-products {
      text-align: center;
      padding: 80px 20px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 24px;
    }

    .empty-icon {
      font-size: 56px;
      margin-bottom: 16px;
    }

    @media (max-width: 992px) {
      .hero-stage {
        grid-template-columns: 1fr;
      }
      .hero-3d-stage {
        display: none;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  username: string = '';
  cartItemCount: number = 0;
  products: Product[] = [];
  featuredProduct: Product | null = null;
  loading: boolean = true;

  categories = [
    { name: 'Electronics', key: 'electronics' },
    { name: 'Food', key: 'food' },
    { name: 'Clothing', key: 'clothing' },
    { name: 'Books', key: 'books' },
    { name: 'Home', key: 'home' },
    { name: 'Sports', key: 'sports' }
  ];

  // 3D Card Tilt State Map
  cardTilts: Map<number, CardTilt> = new Map();
  // Motion Quick Add State Map
  isAddedMap: Map<number, boolean> = new Map();

  // 3D Card Shuffle Stack Deck State
  activeDeckIndex: number = 0;
  isShufflingDeck: boolean = false;

  // Drag-to-Shuffle State
  isDraggingCard: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragCurrentX: number = 0;
  dragCurrentY: number = 0;

  getDeckProducts(): Product[] {
    if (!this.products || this.products.length === 0) return [];
    const count = Math.min(5, this.products.length);
    const deck: Product[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (this.activeDeckIndex + i) % this.products.length;
      deck.push(this.products[idx]);
    }
    return deck;
  }

  getCardDeckClass(i: number): string {
    if (i === 0 && this.isShufflingDeck) {
      return 'deck-top shuffling-out';
    }
    if (i === 0) return 'deck-top';
    if (i === 1) return 'deck-2';
    if (i === 2) return 'deck-3';
    return 'deck-back';
  }

  getCardZIndex(i: number): number {
    return 10 - i;
  }

  onDeckClick(): void {
    if (Math.abs(this.dragCurrentX) < 10) {
      this.shuffleDeck();
    }
  }

  onCardMouseDown(event: MouseEvent, i: number): void {
    if (i !== 0 || this.isShufflingDeck) return;
    this.isDraggingCard = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragCurrentX = 0;
    this.dragCurrentY = 0;
  }

  onCardTouchStart(event: TouchEvent, i: number): void {
    if (i !== 0 || this.isShufflingDeck) return;
    this.isDraggingCard = true;
    const touch = event.touches[0];
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;
    this.dragCurrentX = 0;
    this.dragCurrentY = 0;
  }

  onGlobalMouseMove(event: MouseEvent): void {
    if (!this.isDraggingCard) return;
    this.dragCurrentX = event.clientX - this.dragStartX;
    this.dragCurrentY = event.clientY - this.dragStartY;
  }

  onGlobalTouchMove(event: TouchEvent): void {
    if (!this.isDraggingCard) return;
    const touch = event.touches[0];
    this.dragCurrentX = touch.clientX - this.dragStartX;
    this.dragCurrentY = touch.clientY - this.dragStartY;
  }

  onGlobalMouseUp(): void {
    if (!this.isDraggingCard) return;
    this.finishCardDrag();
  }

  onGlobalTouchEnd(): void {
    if (!this.isDraggingCard) return;
    this.finishCardDrag();
  }

  finishCardDrag(): void {
    const dragDistance = Math.abs(this.dragCurrentX);
    this.isDraggingCard = false;
    
    if (dragDistance > 60) {
      this.shuffleDeck();
    }
    
    this.dragCurrentX = 0;
    this.dragCurrentY = 0;
  }

  getCardTransformStyle(i: number): string {
    if (i === 0 && this.isDraggingCard) {
      const rotateDeg = (this.dragCurrentX / 12).toFixed(2);
      return `translate3d(${this.dragCurrentX}px, ${this.dragCurrentY}px, 0) rotate(${rotateDeg}deg)`;
    }
    return '';
  }

  shuffleDeck(): void {
    if (this.products.length <= 1 || this.isShufflingDeck) return;
    this.isShufflingDeck = true;
    setTimeout(() => {
      this.activeDeckIndex = (this.activeDeckIndex + 1) % this.products.length;
      this.isShufflingDeck = false;
    }, 450);
  }

  jumpToDeckIndex(idx: number): void {
    if (this.isShufflingDeck) return;
    this.activeDeckIndex = (this.activeDeckIndex + idx) % this.products.length;
  }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || localStorage.getItem('username') || 'User';
    
    this.cartService.cart$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
    
    this.loadProducts();
    
    window.addEventListener('stockUpdated', () => {
      console.log('Stock updated, reloading products...');
      this.loadProducts();
    });

    window.addEventListener('mousemove', (e) => this.onGlobalMouseMove(e));
    window.addEventListener('mouseup', () => this.onGlobalMouseUp());
    window.addEventListener('touchmove', (e) => this.onGlobalTouchMove(e));
    window.addEventListener('touchend', () => this.onGlobalTouchEnd());
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products || [];
        if (this.products.length > 0) {
          this.featuredProduct = this.products[0];
        } else {
          this.featuredProduct = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  // 3D Card Mouse Move Math Calculation
  onCardMouseMove(event: MouseEvent, productId: number): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    
    this.cardTilts.set(productId, {
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      glareX,
      glareY,
      isHovered: true
    });
  }

  onCardMouseLeave(productId: number): void {
    this.cardTilts.set(productId, {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  }

  getCardTransform(productId: number): string {
    return this.cardTilts.get(productId)?.transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }

  getGlareStyle(productId: number): string {
    const tilt = this.cardTilts.get(productId);
    if (!tilt || !tilt.isHovered) return 'none';
    return `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.6) 0%, transparent 60%)`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewProducts(): void {
    this.router.navigate(['/products']);
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  viewOrderHistory(): void {
    this.router.navigate(['/order-history']);
  }

  addToCart(product: Product): void {
    if (product.quantity === 0) {
      alert('This product is currently out of stock!');
      return;
    }
    
    const currentInCart = this.cartService.getItemQuantity(product.id!);
    if (currentInCart >= product.quantity) {
      alert(`Only ${product.quantity} units available in stock. You already have all ${product.quantity} in your cart.`);
      return;
    }

    const username = this.authService.getCurrentUser()?.username || localStorage.getItem('username') || 'user';
    const res = this.cartService.addToCart(product.id!, product.price, username, product.quantity);
    if (!res.success && res.message) {
      alert(res.message);
    }
  }

  onQuickAdd(event: Event, product: Product): void {
    event.stopPropagation();
    if (product.quantity === 0) return;
    
    const currentInCart = this.cartService.getItemQuantity(product.id!);
    if (currentInCart >= product.quantity) {
      alert(`Only ${product.quantity} units available in stock. You already have all ${product.quantity} in your cart.`);
      return;
    }

    this.addToCart(product);
    this.isAddedMap.set(product.id!, true);
    
    setTimeout(() => {
      this.isAddedMap.set(product.id!, false);
    }, 1600);
  }

  filterByCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category: category } });
  }

  getDefaultProductImage(category: string | undefined): string {
    return getDefaultProductImage(category || 'default');
  }

  getProductImageUrl(product: Product): string {
    return getProductImageUrl(product);
  }
}