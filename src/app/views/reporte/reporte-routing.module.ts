import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListadoReporteComponent } from './listado-reporte/listado-reporte.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Reportes'
    },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'listado',
        component: ListadoReporteComponent,
        data: {
          title: 'Listado'
        }
      }
    ]
    }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteRoutingModule { }
