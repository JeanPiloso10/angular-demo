import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoMotivoAuditoriaComponent } from './listado-motivo-auditoria/listado-motivo-auditoria.component';
import { NuevoMotivoAuditoriaComponent } from './nuevo-motivo-auditoria/nuevo-motivo-auditoria.component';
import { ModificarMotivoAuditoriaComponent } from './modificar-motivo-auditoria/modificar-motivo-auditoria.component';
import { VerMotivoAuditoriaComponent } from './ver-motivo-auditoria/ver-motivo-auditoria.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Motivos Auditoría'
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
        component: ListadoMotivoAuditoriaComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoMotivoAuditoriaComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarMotivoAuditoriaComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerMotivoAuditoriaComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerMotivoAuditoriaComponent,
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
export class MotivoAuditoriaRoutingModule { }
