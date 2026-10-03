import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { AdminSidebarComponent } from '../admin/admin-sidebar.component';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-admin-sidebar activePage="products"></app-admin-sidebar>

      <div class="main-content">
        <!-- Header -->
        <div class="header">
          <div class="header-title-area">
            <h1>Add New Product</h1>
            <p class="header-subtitle">Create a new item listing, set stock quantities, and preview in real time.</p>
          </div>
          <button class="back-btn" (click)="goBack()">
            ← Back to Products
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="container">
          <div class="editor-grid">
            <!-- Left: Product Form Card -->
            <div class="form-card">
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                
                <!-- Section 1: General Info -->
                <div class="card-section">
                  <h3 class="section-title">General Information</h3>
                  
                  <div class="form-field">
                    <label>Product Name <span class="req">*</span></label>
                    <input type="text" formControlName="name" placeholder="e.g. Wireless Noise-Cancelling Headphones">
                  </div>

                  <div class="form-field">
                    <label>Category <span class="req">*</span></label>
                    <select formControlName="category">
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Food">Food & Beverages</option>
                      <option value="Clothing">Clothing & Apparel</option>
                      <option value="Books">Books & Media</option>
                      <option value="Home">Home & Living</option>
                      <option value="Sports">Sports & Fitness</option>
                    </select>
                  </div>

                  <div class="form-field">
                    <label>Description <span class="req">*</span></label>
                    <textarea formControlName="description" placeholder="Write a detailed description highlighting key specifications..." rows="4"></textarea>
                  </div>
                </div>

                <!-- Section 2: Pricing & Stock -->
                <div class="card-section">
                  <h3 class="section-title">Pricing & Stock</h3>
                  
                  <div class="form-row">
                    <div class="form-field">
                      <label>Price (₹) <span class="req">*</span></label>
                      <div class="input-with-prefix">
                        <span class="prefix">₹</span>
                        <input type="number" formControlName="price" placeholder="0.00" step="0.01">
                      </div>
                    </div>
                    
                    <div class="form-field">
                      <label>Initial Stock Quantity <span class="req">*</span></label>
                      <input type="number" formControlName="quantity" placeholder="0" min="0">
                    </div>
                  </div>
                </div>

                <!-- Section 3: Media -->
                <div class="card-section">
                  <h3 class="section-title">Media & Imagery</h3>
                  
                  <div class="form-field">
                    <label>Image URL (Optional)</label>
                    <input type="url" formControlName="imageUrl" placeholder="https://example.com/product.jpg" (input)="imageFailed = false">
                    <span class="field-hint">Paste a valid public image URL to update the live preview on the right</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="form-actions">
                  <button type="button" class="cancel-btn" (click)="goBack()">Cancel</button>
                  <button type="submit" class="save-btn" [disabled]="productForm.invalid || isSubmitting">
                    <svg *ngIf="!isSubmitting" class="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>{{ isSubmitting ? 'Publishing Product...' : 'Publish Product' }}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Right: Live Card Preview Panel -->
            <div class="preview-panel">
              <div class="preview-header">
                <div class="preview-tag-group">
                  <span class="live-dot"></span>
                  <span class="preview-tag">LIVE CATALOG PREVIEW</span>
                </div>
                <span class="preview-sub">Real-time storefront visualization</span>
              </div>

              <div class="preview-card">
                <div class="preview-img-container">
                  <img *ngIf="productForm.value.imageUrl && !imageFailed" 
                       [src]="productForm.value.imageUrl" 
                       [alt]="productForm.value.name" 
                       (error)="imageFailed = true">
                  <div *ngIf="!productForm.value.imageUrl || imageFailed" class="fallback-preview-box">
                    <svg class="placeholder-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m7.5 4.27 9 5.15"></path>
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    <span class="placeholder-text">No Image Added</span>
                  </div>
                  <span class="category-chip">{{productForm.value.category || 'General'}}</span>
                  <span class="product-id-chip">NEW</span>
                </div>

                <div class="preview-info">
                  <h4 class="preview-title">{{productForm.value.name || 'New Product Title'}}</h4>
                  <p class="preview-desc">{{productForm.value.description || 'Enter product description to preview...'}}</p>

                  <div class="preview-metrics-row">
                    <div class="preview-price-block">
                      <span class="lbl">Price</span>
                      <span class="val">₹{{productForm.value.price || '0'}}</span>
                    </div>

                    <div class="stock-status-pill"
                         [class.in-stock]="(productForm.value.quantity || 0) > 5"
                         [class.low-stock]="(productForm.value.quantity || 0) <= 5 && (productForm.value.quantity || 0) > 0"
                         [class.out-of-stock]="(productForm.value.quantity || 0) === 0">
                      <span class="pill-dot"></span>
                      <span>{{(productForm.value.quantity || 0) === 0 ? 'Out of Stock' : ((productForm.value.quantity || 0) <= 5 ? 'Low: ' + productForm.value.quantity + ' left' : (productForm.value.quantity || 0) + ' in stock')}}</span>
                    </div>
                  </div>
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

    .back-btn {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .back-btn:hover {
      background: #f1f5f9;
      color: #7c3aed;
      border-color: #cbd5e1;
    }

    .container {
      padding: 32px 36px;
      flex: 1;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }

    .editor-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 32px;
      align-items: start;
    }

    /* Form Card */
    .form-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      min-width: 0;
    }

    .card-section {
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 8px;
    }

    .section-title {
      margin: 0 0 18px 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.2px;
    }

    .form-field {
      margin-bottom: 18px;
    }

    .form-field:last-child {
      margin-bottom: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .form-field label {
      display: block;
      color: #334155;
      font-weight: 600;
      margin-bottom: 7px;
      font-size: 13px;
    }

    .req {
      color: #ef4444;
    }

    .form-field input,
    .form-field select,
    .form-field textarea {
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

    .form-field textarea {
      resize: vertical;
      line-height: 1.5;
    }

    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      background: #ffffff;
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-prefix .prefix {
      position: absolute;
      left: 14px;
      color: #64748b;
      font-weight: 700;
      font-size: 14px;
      pointer-events: none;
    }

    .input-with-prefix input {
      padding-left: 28px;
    }

    .field-hint {
      display: block;
      font-size: 11.5px;
      color: #94a3b8;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .cancel-btn {
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

    .cancel-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .save-btn {
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

    .save-icon {
      width: 16px;
      height: 16px;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
    }

    .save-btn:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* Right Preview Panel */
    .preview-panel {
      position: sticky;
      top: 32px;
      width: 340px;
    }

    .preview-header {
      margin-bottom: 12px;
    }

    .preview-tag-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    }

    .preview-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.6px;
      color: #7c3aed;
      text-transform: uppercase;
    }

    .preview-sub {
      font-size: 12px;
      color: #64748b;
      display: block;
      margin-top: 2px;
    }

    .preview-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }

    .preview-img-container {
      position: relative;
      height: 200px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }

    .preview-img-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
    }

    .fallback-preview-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #94a3b8;
    }

    .placeholder-svg {
      width: 44px;
      height: 44px;
      color: #cbd5e1;
    }

    .placeholder-text {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
    }

    .category-chip {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid #e2e8f0;
      color: #7c3aed;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 9px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .product-id-chip {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .preview-info {
      padding: 18px 20px;
    }

    .preview-title {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .preview-desc {
      color: #64748b;
      font-size: 12.5px;
      line-height: 1.5;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
    }

    .preview-metrics-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .preview-price-block {
      display: flex;
      flex-direction: column;
    }

    .preview-price-block .lbl {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-price-block .val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }

    .stock-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
    }

    .stock-status-pill.in-stock {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .stock-status-pill.low-stock {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .stock-status-pill.out-of-stock {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    @media (max-width: 992px) {
      .editor-grid {
        grid-template-columns: 1fr;
      }
      .preview-panel {
        position: static;
        width: 100%;
      }
    }
  `]
})
export class AddProductComponent {
  productForm: FormGroup;
  imageFailed: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: [''],
      quantity: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const activeAdmin = this.authService.getUsername() || localStorage.getItem('username') || 'admin';
      const product: Product = {
        ...this.productForm.value,
        price: Number(this.productForm.value.price),
        quantity: Number(this.productForm.value.quantity),
        adminUsername: activeAdmin
      };
      
      this.productService.addProduct(product).subscribe({
        next: (response) => {
          this.router.navigate(['/product-management']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error adding product:', error);
          if (error.status === 403) {
            alert('Access denied. Please ensure you have admin permissions.');
          } else if (error.status === 0) {
            alert('Cannot connect to server. Please ensure the product service is running.');
          } else {
            alert(`Failed to add product: ${error.message}`);
          }
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/product-management']);
  }
}