import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevaConfiguracionPersonalizadaComponent } from './nueva-configuracion-personalizada/nueva-configuracion-personalizada.component';
import { ModificarConfiguracionPersonalizadaComponent } from './modificar-configuracion-personalizada/modificar-configuracion-personalizada.component';
import { ListadoConfiguracionPersonalizadaComponent } from './listado-configuracion-personalizada/listado-configuracion-personalizada.component';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Configuración Personalizada'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'listado',
        component: ListadoConfiguracionPersonalizadaComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaConfiguracionPersonalizadaComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarConfiguracionPersonalizadaComponent,
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
export class ConfiguracionPersonalizadaRoutingModule { }
