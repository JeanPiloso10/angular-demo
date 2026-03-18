import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoNotificacionesPushComponent } from '../notificaciones-push/listado-notificaciones-push/listado-notificaciones-push.component'

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Notificaciones'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'listado'
      },
      {
        path: 'listado',
        component: ListadoNotificacionesPushComponent,
        data: {
          title: 'Listado'
        }
      }
     
    ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificacionesPushRoutingModule { }
