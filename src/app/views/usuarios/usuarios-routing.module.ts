import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoUsuariosComponent } from './listado-usuarios/listado-usuarios.component';
import { NuevoUsuarioComponent } from './nuevo-usuario/nuevo-usuario.component';
import { ModificarUsuarioComponent } from './modificar-usuario/modificar-usuario.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Usuarios'
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
        component: ListadoUsuariosComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoUsuarioComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarUsuarioComponent,
        data: {
          title: 'Modificar'
        }

      }
      ,
      {
        path: 'ver',
        component: VerUsuarioComponent,
        data: {
          title: 'Ver'
        }

      }
      ,
      {
        path: 'ver/:id',
        component: VerUsuarioComponent,
        data: {
          title: 'Ver'
        }

      }
    ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
