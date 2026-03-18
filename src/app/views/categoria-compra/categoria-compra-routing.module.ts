import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoCategoriaCompraComponent } from './listado-categoria-compra/listado-categoria-compra.component';
import { NuevaCategoriaCompraComponent } from './nueva-categoria-compra/nueva-categoria-compra.component';
import { ModificarCategoriaCompraComponent } from './modificar-categoria-compra/modificar-categoria-compra.component';
import { VerCategoriaCompraComponent } from './ver-categoria-compra/ver-categoria-compra.component';
import { AuthGuard } from '@core/guards/auth.guard';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Categoría Compra'
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
        component: ListadoCategoriaCompraComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaCategoriaCompraComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarCategoriaCompraComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerCategoriaCompraComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerCategoriaCompraComponent,
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
export class CategoriaCompraRoutingModule { }
