import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // El login no necesita JWT. Evitamos mandar un token viejo/inválido.
  const isLogin = req.url.includes('/api/auth/login') || req.url.includes('/auth-api/login');
  const token = inject(AuthService).token();

  if (!token || isLogin) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
