import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoMotivoAuditoriaTransaccionComponent } from './listado-motivo-auditoria-transaccion/listado-motivo-auditoria-transaccion.component';
import { NuevoMotivoAuditoriaTransaccionComponent } from './nuevo-motivo-auditoria-transaccion/nuevo-motivo-auditoria-transaccion.component';
import { ModificarMotivoAuditoriaTransaccionComponent } from './modificar-motivo-auditoria-transaccion/modificar-motivo-auditoria-transaccion.component';
import { VerMotivoAuditoriaTransaccionComponent } from './ver-motivo-auditoria-transaccion/ver-motivo-auditoria-transaccion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Motivos Auditoría por Transacción'
    },
   // canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'listado'
      },
      {
        path: 'listado',
        component: ListadoMotivoAuditoriaTransaccionComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoMotivoAuditoriaTransaccionComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarMotivoAuditoriaTransaccionComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerMotivoAuditoriaTransaccionComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerMotivoAuditoriaTransaccionComponent,
        data: {
          title: 'Ver'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MotivoAuditoriaTransaccionRoutingModule { }
