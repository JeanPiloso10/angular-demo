import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoAreaComponent } from './listado-area/listado-area.component';
import { NuevaAreaComponent } from './nueva-area/nueva-area.component';
import { ModificarAreaComponent } from './modificar-area/modificar-area.component';
import { VerAreaComponent } from './ver-area/ver-area.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Área'
    },
   // canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'listado'
      },
      {
        path: 'listado',
        component: ListadoAreaComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaAreaComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarAreaComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerAreaComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerAreaComponent,
        data: {
          title: 'Ver'
        }
      },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreaRoutingModule { }
