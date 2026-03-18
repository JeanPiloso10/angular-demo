import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoOperacionComponent } from './listado-operacion/listado-operacion.component';
import { NuevaOperacionComponent } from './nueva-operacion/nueva-operacion.component';
import { ModificarOperacionComponent } from './modificar-operacion/modificar-operacion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Operaciones'
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
        component: ListadoOperacionComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevaOperacionComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarOperacionComponent,
        data: {
          title: 'Modificar'
        }
      }
    ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperacionRoutingModule { }
