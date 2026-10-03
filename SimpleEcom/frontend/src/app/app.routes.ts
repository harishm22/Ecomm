import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/login/register.component';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { ProductManagementComponent } from './components/admin/product-management.component';
import { AdminProfileComponent } from './components/admin/admin-profile.component';
import { OrderManagementComponent } from './components/admin/order-management.component';
import { ProductListComponent } from './components/products/product-list.component';
import { AddProductComponent } from './components/products/add-product.component';
import { EditProductComponent } from './components/products/edit-product.component';
import { OrderHistoryComponent } from './components/user/order-history.component';
import { AnalyticsComponent } from './components/admin/analytics.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/cart/checkout.component';

import { AuthGuard, AdminGuard, SuperAdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [SuperAdminGuard] },
  { path: 'user_management', component: UserManagementComponent, canActivate: [SuperAdminGuard] },
  { path: 'product-management', component: ProductManagementComponent, canActivate: [AdminGuard] },
  { path: 'admin-profile', component: AdminProfileComponent, canActivate: [AdminGuard] },
  { path: 'order-management', component: OrderManagementComponent, canActivate: [AdminGuard] },
  { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'add-product', component: AddProductComponent, canActivate: [AdminGuard] },
  { path: 'edit-product/:id', component: EditProductComponent, canActivate: [AdminGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AdminGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
