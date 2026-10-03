import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-fullscreen">
      <!-- Left Hero Image Section -->
      <div class="hero-image-side">
        <div class="brand-pill">
          <img src="ICON.png" alt="SimpleEcom" class="brand-pill-icon">
          <span>SimpleEcom</span>
        </div>
      </div>

      <!-- Organic Wave Divider -->
      <div class="curve-separator">
        <svg viewBox="0 0 100 500" preserveAspectRatio="none">
          <path d="M100,0 L100,500 L0,500 C75,370 15,180 100,0 Z" fill="#ffffff"></path>
        </svg>
      </div>

      <!-- Right Clean Form Section -->
      <div class="form-side">
        <div class="form-wrapper">
          <div class="form-header">
            <div class="header-icon">💡</div>
            <h2>Find it. Feel it.<br>Own it.</h2>
            <p class="subtitle">Sign in to access your products, inventory, and seamless shopping experience.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="input-field">
              <label>Username</label>
              <input type="text" formControlName="username" placeholder="your_username" autocomplete="username">
            </div>

            <div class="input-field">
              <div class="label-row">
                <label>Password</label>
              </div>
              <input type="password" formControlName="password" placeholder="••••••••••••" autocomplete="current-password">
            </div>

            <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="!isLoading">Sign In</span>
              <div class="spinner" *ngIf="isLoading"></div>
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a (click)="goToRegister()">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100%;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .auth-fullscreen {
      width: 100vw;
      min-height: 100vh;
      display: flex;
      position: relative;
      background: #ffffff;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    /* Left Hero Photo Side */
    .hero-image-side {
      flex: 1.15;
      min-height: 100vh;
      position: relative;
      background: url('/hero-bg.jpg') center center / cover no-repeat;
      padding: 36px 40px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-sizing: border-box;
    }

    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 10px 22px;
      border-radius: 30px;
      font-weight: 800;
      font-size: 15px;
      color: #7c3aed;
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.2);
      width: fit-content;
    }

    .brand-pill-icon {
      height: 28px;
      width: 28px;
      object-fit: contain;
    }

    /* Organic Wave Curve Divider */
    .curve-separator {
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(53.5% - 70px);
      width: 140px;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }

    .curve-separator svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Right Form Side */
    .form-side {
      flex: 1;
      min-height: 100vh;
      background: #ffffff;
      padding: 60px 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 3;
      box-sizing: border-box;
    }

    .form-wrapper {
      width: 100%;
      max-width: 440px;
    }

    .form-header {
      margin-bottom: 32px;
      position: relative;
    }

    .header-icon {
      position: absolute;
      top: -4px;
      right: 0;
      font-size: 26px;
      opacity: 0.8;
    }

    .form-header h2 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-field label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
    }

    .input-field input {
      width: 100%;
      padding: 14px 16px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      color: #0f172a;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .input-field input:focus {
      border-color: #a855f7;
      box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
    }

    .submit-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 15px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(168, 85, 247, 0.5);
    }

    .submit-btn:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-top: 2.5px solid #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .auth-footer {
      margin-top: 32px;
      text-align: center;
    }

    .auth-footer p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }

    .auth-footer a {
      color: #7c3aed;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }

    .auth-footer a:hover {
      color: #9333ea;
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .auth-fullscreen {
        flex-direction: column;
      }

      .hero-image-side {
        min-height: 240px;
        flex: none;
      }

      .curve-separator {
        display: none;
      }

      .form-side {
        padding: 40px 24px;
        flex: 1;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          let errorMessage = 'Invalid credentials';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Invalid username or password.';
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 4000 });
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}