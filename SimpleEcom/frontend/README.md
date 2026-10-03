# SimpleEcom Frontend

Angular frontend application for the SimpleEcom microservices backend.

## Features

- **Separate Login Interfaces**: Dedicated login tabs for users and admins
- **Role-Based Access Control**: Different dashboards for users and admins
- **Material Design UI**: Clean and modern interface using Angular Material
- **JWT Authentication**: Secure token-based authentication
- **Route Guards**: Protected routes based on user roles

## User Roles

1. **USER**: Regular customers who can browse products and manage their cart
2. **ADMIN**: Can manage products and view analytics
3. **SUPERADMIN**: Full access including user management and cart oversight

## API Endpoints Used

### Authentication (User Service)
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/register` - User registration

### Products (Product Service)
- `GET /api/products` - Get all products (public)
- `POST /api/products` - Add product (ADMIN only)
- `PUT /api/products/{id}` - Update product (ADMIN only)
- `DELETE /api/products/{id}` - Delete product (ADMIN only)

### Cart (Cart Service)
- `GET /api/cart/user/{username}` - Get user cart (SUPERADMIN only)

### Admin (User Service)
- `GET /api/admin/profile` - Admin profile (ADMIN only)
- `GET /api/admin/user/{username}` - Get user by username (SUPERADMIN only)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access Application**:
   - Open browser to `http://localhost:4200`
   - Default route redirects to login page

## Backend Configuration

Make sure your backend services are running:
- API Gateway: `http://localhost:8080`
- Eureka Server: `http://localhost:8761`
- User Service: Registered with Eureka
- Product Service: Registered with Eureka
- Cart Service: Registered with Eureka

## Default Test Users

You can register new users or use the registration form to create:
- Regular users (role: USER)
- Admin users (role: ADMIN)
- Super admin users (role: SUPERADMIN)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   └── register.component.ts
│   │   ├── dashboard/
│   │   │   └── user-dashboard.component.ts
│   │   └── admin/
│   │       └── admin-dashboard.component.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── auth.interceptor.ts
│   ├── app.routes.ts
│   └── app.config.ts
└── styles.css
```

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.