import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoTransaccionComponent } from './listado-transaccion/listado-transaccion.component';
import { NuevaTransaccionComponent } from './nueva-transaccion/nueva-transaccion.component';
import { ModificarTransaccionComponent } from './modificar-transaccion/modificar-transaccion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Transacciones'
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
        component: ListadoTransaccionComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevaTransaccionComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarTransaccionComponent,
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
export class TransaccionRoutingModule { }
