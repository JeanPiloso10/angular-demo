import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { FormularioConfiguracionComponent } from './formulario-configuracion/formulario-configuracion.component';
import { ListadoConfiguracionComponent } from './listado-configuracion/listado-configuracion.component';
import { NuevaConfiguracionComponent } from './nueva-configuracion/nueva-configuracion.component';
import { ModificarConfiguracionComponent } from './modificar-configuracion/modificar-configuracion.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Parámetros Generales'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'listado',
        component: ListadoConfiguracionComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'nuevo',
        component: NuevaConfiguracionComponent,
        data: {
          title: 'Nuevo'
        }
      }
      ,
      {
        path: 'modificar/:id',
        component: ModificarConfiguracionComponent,
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
export class ConfiguracionRoutingModule { }
