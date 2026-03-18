import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoOperacionTransaccionComponent } from './listado-operacion-transaccion/listado-operacion-transaccion.component';
import { NuevoOperacionTransaccionComponent } from './nuevo-operacion-transaccion/nuevo-operacion-transaccion.component';
import { ModificarOperacionTransaccionComponent } from './modificar-operacion-transaccion/modificar-operacion-transaccion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Operaciones por Transacción'
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
        component: ListadoOperacionTransaccionComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevoOperacionTransaccionComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarOperacionTransaccionComponent,
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
export class OperacionTransaccionRoutingModule { }
