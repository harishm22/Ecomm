import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { getDefaultProductImage, getProductImageUrl } from '../../utils/image-utils';

interface CardTilt {
  transform: string;
  glareX: number;
  glareY: number;
  isHovered: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Ambient Backdrop Mesh -->
    <div class="mesh-backdrop">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
    </div>

    <!-- Header Navigation -->
    <div class="header">
      <div class="header-inner">
        <div class="header-title">
          <h1>Product Catalog</h1>
          <span class="subtitle" *ngIf="selectedCategory">Filtering by {{selectedCategory}}</span>
        </div>
        <button class="back-btn" (click)="goBack()">
          <span>← Back to Dashboard</span>
        </button>
      </div>
    </div>

    <div class="products-container">
      <!-- Category Filter Pills Bar -->
      <div class="filter-bar">
        <button class="filter-pill" [class.active]="!selectedCategory" (click)="selectCategory('')">
          All Products
        </button>
        <button class="filter-pill" 
                *ngFor="let cat of categories" 
                [class.active]="selectedCategory.toLowerCase() === cat.name.toLowerCase()" 
                (click)="selectCategory(cat.name)">
          <svg *ngIf="cat.key === 'electronics'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
            <path d="M12 18h.01"></path>
          </svg>
          <svg *ngIf="cat.key === 'food'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          </svg>
          <svg *ngIf="cat.key === 'clothing'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
          </svg>
          <svg *ngIf="cat.key === 'books'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
          </svg>
          <svg *ngIf="cat.key === 'home'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <svg *ngIf="cat.key === 'sports'" class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m4.93 4.93 4.24 4.24"></path>
            <path d="m14.83 9.17 4.24-4.24"></path>
          </svg>
          <span>{{cat.name}}</span>
        </button>
      </div>

      <!-- Skeleton Loading State -->
      <div class="skeleton-grid" *ngIf="loading">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6,7,8]">
          <div class="skeleton-img"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
      
      <!-- Interactive 3D Product Cards Grid -->
      <div class="products-grid" *ngIf="!loading && products.length > 0">
        <div class="product-card 3d-card" 
             *ngFor="let product of products"
             (mousemove)="onCardMouseMove($event, product.id!)"
             (mouseleave)="onCardMouseLeave(product.id!)"
             [style.transform]="getCardTransform(product.id!)">
          
          <!-- Specular Light Overlay -->
          <div class="specular-glare" [style.background]="getGlareStyle(product.id!)"></div>
          
          <div class="card-header">
            <span class="category-chip">{{product.category || 'General'}}</span>
            <span class="stock-badge urgency" *ngIf="product.quantity > 0 && product.quantity <= 5">
              Only {{product.quantity}} Left!
            </span>
            <span class="stock-badge out" *ngIf="product.quantity === 0">
              Out of Stock
            </span>
          </div>

          <div class="product-image">
            <img *ngIf="getProductImageUrl(product)" [src]="getProductImageUrl(product)" [alt]="product.name" />
            <div *ngIf="!getProductImageUrl(product)" class="default-icon">{{getDefaultProductImage(product.category || 'default')}}</div>

            <!-- Animated Motion Quick-Add Button (Matching user screenshot) -->
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

          <div class="product-details">
            <h3>{{product.name}}</h3>
            <p class="description">{{product.description}}</p>
            
            <div class="card-footer">
              <div class="price-container">
                <span class="price-label">Price</span>
                <span class="price-val">₹{{product.price}}</span>
              </div>
              <span class="stock-badge out" *ngIf="product.quantity === 0">Out of Stock</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div class="no-products" *ngIf="!loading && products.length === 0">
        <div class="empty-icon">🔎</div>
        <h2>No products found</h2>
        <p>No products matched your selected category filter.</p>
        <button class="reset-filter-btn" (click)="selectCategory('')">View All Products</button>
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
    }

    .mesh-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
    }

    .mesh-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.25;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #818cf8 0%, transparent 70%);
      top: -100px;
      right: -100px;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #38bdf8 0%, transparent 70%);
      bottom: -50px;
      left: -50px;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.3);
      padding: 20px 0;
      color: white;
    }

    .header-inner {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      color: white;
    }

    .subtitle {
      font-size: 13px;
      color: #fef08a;
    }

    .back-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: white;
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateX(-3px);
    }

    .products-container {
      position: relative;
      z-index: 1;
      max-width: 1300px;
      margin: 0 auto;
      padding: 32px 24px 60px;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }

    .filter-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }

    .filter-pill:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #a855f7;
    }

    .pill-svg {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }

    .filter-pill.active {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
    }

    /* 3D Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
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
      transition: transform 0.15s ease-out, box-shadow 0.3s ease;
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

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .category-chip {
      background: #eef2ff;
      color: #4f46e5;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 8px;
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

    .product-image {
      height: 180px;
      background: #f8fafc;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      padding: 12px;
    }

    .product-image img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      filter: drop-shadow(0 8px 8px rgba(0,0,0,0.08));
      transition: transform 0.3s ease;
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

    .motion-cart-btn:hover .btn-label-text {
      max-width: 50px;
      opacity: 1;
    }

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

    .product-card:hover .product-image img {
      transform: scale(1.06) translateZ(15px);
    }

    .default-icon {
      font-size: 48px;
    }

    .product-details h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .description {
      color: #64748b;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 18px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;
    }

    .price-container {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
    }

    .price-val {
      font-size: 20px;
      font-weight: 800;
      color: #059669;
    }

    .add-to-cart-btn {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(168, 85, 247, 0.5);
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
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 28px;
    }

    .skeleton-card {
      background: #ffffff;
      border-radius: 22px;
      padding: 20px;
      height: 360px;
      border: 1px solid #e2e8f0;
    }

    .skeleton-img {
      height: 180px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 16px;
      margin-bottom: 16px;
    }

    .skeleton-line {
      height: 18px;
      background: #f1f5f9;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .skeleton-line.short {
      width: 50%;
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

    .reset-filter-btn {
      margin-top: 16px;
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  loading: boolean = true;
  selectedCategory: string = '';

  categories = [
    { name: 'Electronics', key: 'electronics' },
    { name: 'Food', key: 'food' },
    { name: 'Clothing', key: 'clothing' },
    { name: 'Books', key: 'books' },
    { name: 'Home', key: 'home' },
    { name: 'Sports', key: 'sports' }
  ];

  cardTilts: Map<number, CardTilt> = new Map();
  isAddedMap: Map<number, boolean> = new Map();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      if (category) {
        this.selectedCategory = category;
        this.filterProductsByCategory(category);
      }
    });
    
    window.addEventListener('stockUpdated', () => {
      console.log('Stock updated, reloading products...');
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products || [];
        this.products = products || [];
        this.loading = false;
        
        if (this.selectedCategory) {
          this.filterProductsByCategory(this.selectedCategory);
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

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

  getDefaultProductImage(category: string | undefined): string {
    return getDefaultProductImage(category || 'default');
  }

  getProductImageUrl(product: Product): string {
    return getProductImageUrl(product);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProductsByCategory(category);
  }

  filterProductsByCategory(category: string): void {
    if (category && this.allProducts.length > 0) {
      this.products = this.allProducts.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    } else {
      this.products = [...this.allProducts];
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}