import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoMenuComponent } from './listado-menu/listado-menu.component'
import { NuevoMenuComponent } from './nuevo-menu/nuevo-menu.component'
import { ModificarMenuComponent } from './modificar-menu/modificar-menu.component';

const routes: Routes = [

  {
    path: '',
    data: {
      title: 'Menú'
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
        component: ListadoMenuComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoMenuComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarMenuComponent,
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
export class MenuRoutingModule { }
