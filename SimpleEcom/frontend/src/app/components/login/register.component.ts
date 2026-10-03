import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
            <div class="header-icon">✨</div>
            <h2>Create Account</h2>
            <p class="subtitle">Join SimpleEcom today for exclusive offers and seamless shopping.</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="input-field">
              <label>Username</label>
              <input type="text" formControlName="username" placeholder="Choose username" autocomplete="username">
              <span class="field-error" *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
                <span *ngIf="registerForm.get('username')?.errors?.['required']">Username is required</span>
                <span *ngIf="registerForm.get('username')?.errors?.['minlength']">At least 3 characters</span>
                <span *ngIf="registerForm.get('username')?.errors?.['maxlength']">Max 20 characters</span>
                <span *ngIf="registerForm.get('username')?.errors?.['pattern']">Only letters, numbers, and underscores</span>
              </span>
            </div>

            <div class="input-field">
              <label>Email Address</label>
              <input type="email" formControlName="email" placeholder="name@example.com" autocomplete="email">
              <span class="field-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Enter a valid email address</span>
              </span>
            </div>

            <div class="input-field">
              <label>Password</label>
              <input type="password" formControlName="password" placeholder="Create strong password" autocomplete="new-password">
              <span class="field-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">At least 8 characters</span>
                <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Must contain uppercase, lowercase and a number</span>
              </span>
            </div>

            <div class="input-field">
              <label>Account Type</label>
              <select formControlName="role">
                <option value="USER">Customer / Regular User</option>
                <option value="ADMIN">Register as Seller / Admin (Requires Approval)</option>
              </select>
            </div>

            <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || isLoading">
              <span *ngIf="!isLoading">Create Account</span>
              <div class="spinner" *ngIf="isLoading"></div>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a (click)="goToLogin()">Sign in</a></p>
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
      height: 26px;
      width: auto;
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
      padding: 50px 70px;
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
      margin-bottom: 24px;
      position: relative;
    }

    .header-icon {
      position: absolute;
      top: -4px;
      right: 0;
      font-size: 24px;
      opacity: 0.8;
    }

    .form-header h2 {
      margin: 0 0 8px 0;
      font-size: 30px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.4;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .input-field label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
    }

    .input-field input, .input-field select {
      width: 100%;
      padding: 12px 14px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .input-field input:focus, .input-field select:focus {
      border-color: #a855f7;
      box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
    }

    .field-error {
      color: #ef4444;
      font-size: 11px;
      font-weight: 600;
      margin-top: 2px;
    }

    .submit-btn {
      margin-top: 6px;
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
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
      margin-top: 24px;
      text-align: center;
    }

    .auth-footer p {
      margin: 0;
      font-size: 13px;
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
        min-height: 220px;
        flex: none;
      }

      .curve-separator {
        display: none;
      }

      .form-side {
        padding: 36px 20px;
        flex: 1;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      role: ['USER', Validators.required]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (this.registerForm.value.role === 'ADMIN') {
            this.snackBar.open(
              'Seller account created! Please wait for Admin approval before logging in.',
              'Close',
              { duration: 6000 }
            );
          } else {
            this.snackBar.open(
              'Registration successful! Welcome to SimpleEcom.',
              'Close',
              { duration: 4000 }
            );
          }
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 4000 });
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}