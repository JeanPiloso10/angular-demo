import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { ListadoNotificacionOperacionTransaccionComponent } from './listado-notificacion-operacion-transaccion/listado-notificacion-operacion-transaccion.component';
import { NuevaNotificacionOperacionTransaccionComponent } from './nueva-notificacion-operacion-transaccion/nueva-notificacion-operacion-transaccion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Notificación Operación Transacción'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'listado',
        component: ListadoNotificacionOperacionTransaccionComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaNotificacionOperacionTransaccionComponent,
        data: {
          title: 'Nuevo'
        }
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificacionOperacionTransaccionRoutingModule { }
