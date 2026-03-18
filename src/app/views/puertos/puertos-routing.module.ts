import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoPuertosComponent } from './listado-puertos/listado-puertos.component';
import { NuevoPuertoComponent } from './nuevo-puerto/nuevo-puerto.component';
import { ModificarPuertoComponent } from './modificar-puerto/modificar-puerto.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Puertos'
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
        component: ListadoPuertosComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevoPuertoComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarPuertoComponent,
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
export class PuertosRoutingModule { }
