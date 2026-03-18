import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { FormularioPermisoRolComponent } from './formulario-permiso-rol/formulario-permiso-rol.component';


const routes: Routes = [
  {
    
    path: '',
    data: {
      title: 'Permiso Rol'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'formulario',
        component: FormularioPermisoRolComponent,
        data: {
          title: 'Formulario'
        }
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermisoRolRoutingModule { }
