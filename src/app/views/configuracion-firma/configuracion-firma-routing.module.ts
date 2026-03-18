import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoConfiguracionFirmaComponent } from './listado-configuracion-firma/listado-configuracion-firma.component';
import { NuevaConfiguracionFirmaComponent } from './nueva-configuracion-firma/nueva-configuracion-firma.component';
import { ModificarConfiguracionFirmaComponent } from './modificar-configuracion-firma/modificar-configuracion-firma.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Firmantes'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'listado',
        component: ListadoConfiguracionFirmaComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaConfiguracionFirmaComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarConfiguracionFirmaComponent,
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
export class ConfiguracionFirmaRoutingModule { }
