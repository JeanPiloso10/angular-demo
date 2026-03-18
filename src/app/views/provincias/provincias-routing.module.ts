import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoProvinciasComponent } from './listado-provincias/listado-provincias.component';
import { NuevaProvinciaComponent } from './nueva-provincia/nueva-provincia.component';
import { ModificarProvinciaComponent } from './modificar-provincia/modificar-provincia.component';
import { VerProvinciaComponent } from './ver-provincia/ver-provincia.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Provincias'
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
        component: ListadoProvinciasComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevaProvinciaComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarProvinciaComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver',
        component: VerProvinciaComponent,
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
export class ProvinciasRoutingModule { }
