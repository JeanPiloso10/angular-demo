import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoTipoArchivoAnexoTransaccionComponent } from './listado-tipo-archivo-anexo-transaccion/listado-tipo-archivo-anexo-transaccion.component';
import { NuevoTipoArchivoAnexoTransaccionComponent } from './nuevo-tipo-archivo-anexo-transaccion/nuevo-tipo-archivo-anexo-transaccion.component';
import { ModificarTipoArchivoAnexoTransaccionComponent } from './modificar-tipo-archivo-anexo-transaccion/modificar-tipo-archivo-anexo-transaccion.component';
import { VerTipoArchivoAnexoTransaccionComponent } from './ver-tipo-archivo-anexo-transaccion/ver-tipo-archivo-anexo-transaccion.component';
import { AuthGuard } from '@app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tipo Archivos Anexos por Transacción'
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
        component: ListadoTipoArchivoAnexoTransaccionComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevoTipoArchivoAnexoTransaccionComponent,
        data: {
          title: 'Nuevo'
        }
      },
      {
        path: 'modificar/:id',
        component: ModificarTipoArchivoAnexoTransaccionComponent,
        data: {
          title: 'Modificar'
        }
      },
      {
        path: 'ver/:id',
        component: VerTipoArchivoAnexoTransaccionComponent,
        data: {
          title: 'Ver'
        }
      },
      {
        path: 'ver',
        component: VerTipoArchivoAnexoTransaccionComponent,
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
export class TipoArchivoAnexoTransaccionRoutingModule { }
