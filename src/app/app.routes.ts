import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { TransaccionesComponent } from './features/transacciones/transacciones.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'transacciones', component: TransaccionesComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
