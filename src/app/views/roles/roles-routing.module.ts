import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoRolesComponent } from './listado-roles/listado-roles.component';
import { NuevoRolComponent } from './nuevo-rol/nuevo-rol.component';
import { ModificarRolComponent } from './modificar-rol/modificar-rol.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Roles'
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
        component: ListadoRolesComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevoRolComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarRolComponent,
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
export class RolesRoutingModule { }
