import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoPaisesComponent } from './listado-paises/listado-paises.component';
import { NuevoPaisComponent } from './nuevo-pais/nuevo-pais.component';
import { ModificarPaisComponent } from './modificar-pais/modificar-pais.component';import { VerPaisComponent } from './ver-pais/ver-pais.component';
;

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Paises'
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
        component: ListadoPaisesComponent,
        data: {
          title: 'Listado'
        }
      }
      ,
      {
        path: 'ver',
        component: VerPaisComponent,
        data: {
          title: 'Ver'
        }
      }
      ,
      {
        path: 'ver/:id',
        component: VerPaisComponent,
        data: {
          title: 'Ver'
        }
      }
      ,
      {
        path: 'nuevo',
        component: NuevoPaisComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarPaisComponent,
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
export class PaisesRoutingModule { }
