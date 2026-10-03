import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token) {
      const user = this.parseToken(token) || {};
      if (storedUsername) {
        user.username = storedUsername;
      }
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('roles', JSON.stringify(response.roles));
          this.currentUserSubject.next(response);
        })
      );
  }
  
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getUsername(): string {
    const user = this.currentUserSubject.value;
    if (user && user.username) {
      return user.username;
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      return storedUsername;
    }
    const token = this.getToken();
    if (token) {
      const parsed = this.parseToken(token);
      if (parsed && parsed.username) {
        return parsed.username;
      }
    }
    return '';
  }

  hasRole(role: string): boolean {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return roles.some((r: any) => {
      const roleStr = typeof r === 'string' ? r : (r?.authority || r?.name || '');
      return roleStr === role || roleStr === `ROLE_${role}` || roleStr.replace('ROLE_', '') === role;
    });
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('SUPERADMIN');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPERADMIN');
  }

  private getHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  getProfile(): Observable<any> {
    return this.http.get(`http://localhost:8080/api/user/profile`, { headers: this.getHeaders() }).pipe(
      tap((profile: any) => {
        if (profile?.email) {
          localStorage.setItem(`user_${profile.username}_email`, profile.email);
        }
      })
    );
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/user/profile`, profileData, { headers: this.getHeaders() }).pipe(
      tap((updated: any) => {
        if (updated?.email) {
          localStorage.setItem(`user_${updated.username}_email`, updated.email);
        }
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/user/change-password`, passwordData, { headers: this.getHeaders() });
  }

  private parseToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub,
        roles: payload.roles || []
      };
    } catch (error) {
      return null;
    }
  }
}