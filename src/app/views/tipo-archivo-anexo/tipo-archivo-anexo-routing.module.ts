import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevoTipoArchivoAnexoComponent } from './nuevo-tipo-archivo-anexo/nuevo-tipo-archivo-anexo.component';
import { ListadoTipoArchivoAnexoComponent } from './listado-tipo-archivo-anexo/listado-tipo-archivo-anexo.component';
import { ModificarTipoArchivoAnexoComponent } from './modificar-tipo-archivo-anexo/modificar-tipo-archivo-anexo.component';
import { VerTipoArchivoAnexoComponent } from './ver-tipo-archivo-anexo/ver-tipo-archivo-anexo.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tipo Archivos Anexos'
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
        component: ListadoTipoArchivoAnexoComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoTipoArchivoAnexoComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarTipoArchivoAnexoComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerTipoArchivoAnexoComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerTipoArchivoAnexoComponent,
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
export class TipoArchivoAnexoRoutingModule { }
