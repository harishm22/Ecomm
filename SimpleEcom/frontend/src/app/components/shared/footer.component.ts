import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="minimal-footer" *ngIf="showFooter">
      <div class="footer-container">
        
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="brand-logo" (click)="navigate('/dashboard')">
            <div class="brand-logo-badge">
              <img src="ICON.png" alt="SimpleEcom" class="brand-logo-img">
            </div>
            <span class="logo-text">Simple<span class="highlight">Ecom</span></span>
          </div>
        </div>

        <!-- Clean Navigation Links -->
        <nav class="footer-nav">
          <a (click)="navigate('/products')" class="nav-link">Catalog</a>
          <span class="nav-separator">•</span>
          <a (click)="navigate('/cart')" class="nav-link">Cart</a>
          <span class="nav-separator">•</span>
          <a (click)="navigate('/order-history')" class="nav-link">My Orders</a>
          <span class="nav-separator">•</span>
          <a (click)="navigate('/dashboard')" class="nav-link">Dashboard</a>
        </nav>

        <!-- Divider -->
        <div class="footer-divider"></div>

        <!-- Bottom Trust & Copyright -->
        <div class="footer-bottom">
          <span class="copyright">© {{currentYear}} SimpleEcom. All rights reserved.</span>
          
          <div class="trust-tags">
            <span class="trust-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              256-Bit SSL Secure
            </span>
            <span class="trust-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Free Delivery > ₹500
            </span>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .minimal-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 36px 0 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      z-index: 10;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
    }

    /* Brand */
    .brand-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .brand-logo:hover {
      transform: scale(1.02);
    }

    .brand-logo-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .brand-logo:hover .brand-logo-badge {
      border-color: #c084fc;
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
    }

    .logo-text {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.4px;
    }

    .logo-text .highlight {
      color: #7c3aed;
    }

    /* Navigation */
    .footer-nav {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .nav-link {
      font-size: 13.5px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .nav-link:hover {
      color: #7c3aed;
      background: #f3e8ff;
    }

    .nav-separator {
      color: #cbd5e1;
      font-size: 12px;
    }

    /* Divider */
    .footer-divider {
      width: 100%;
      height: 1px;
      background: #f1f5f9;
      margin: 4px 0;
    }

    /* Bottom Row */
    .footer-bottom {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12.5px;
    }

    .copyright {
      color: #94a3b8;
      font-weight: 500;
    }

    .trust-tags {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .trust-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-weight: 600;
      font-size: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .trust-tag svg {
      width: 14px;
      height: 14px;
      color: #7c3aed;
    }

    @media (max-width: 640px) {
      .footer-bottom {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  showFooter: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.updateVisibility(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateVisibility(event.urlAfterRedirects || event.url);
    });
  }

  private updateVisibility(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isAuthPage = cleanUrl === '' || cleanUrl === '/' || cleanUrl === '/login' || cleanUrl === '/register';
    const isAdminPage = cleanUrl.startsWith('/admin') ||
                        cleanUrl.startsWith('/user-management') ||
                        cleanUrl.startsWith('/user_management') ||
                        cleanUrl.startsWith('/product-management') ||
                        cleanUrl.startsWith('/order-management') ||
                        cleanUrl.startsWith('/analytics') ||
                        cleanUrl.startsWith('/add-product') ||
                        cleanUrl.startsWith('/edit-product');
    
    this.showFooter = !isAuthPage && !isAdminPage;
  }

  navigate(path: string): void {
    if (!this.authService.isAuthenticated() && path !== '/login' && path !== '/register') {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([path]);
  }
}
