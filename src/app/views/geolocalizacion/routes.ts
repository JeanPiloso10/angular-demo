import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: { title: 'Geolocalización' },
    canActivate: [AuthGuard],
    loadComponent: () => import('./geolocalizacion.component').then(m => m.GeolocalizacionComponent)
  }
];
