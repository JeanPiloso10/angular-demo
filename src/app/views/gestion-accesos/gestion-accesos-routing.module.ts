import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { NuevoGestionComponent } from './nuevo-gestion/nuevo-gestion.component';
import { VerGestionComponent } from './ver-gestion/ver-gestion.component';
import { ModificarGestionComponent } from './modificar-gestion/modificar-gestion.component';
import { AsignacionMasivaComponent } from './asignacion-masiva/asignacion-masiva.component';

const routes: Routes = [
  {
    path: '',
    data: { title: 'Gestión de Accesos' },
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ver' },
      {
        path: 'nuevo',
        component: NuevoGestionComponent,
        data: { title: 'Nuevo Usuario' }
      },
      {
        path: 'ver',
        component: VerGestionComponent,
        data: { title: 'Ver Usuario' }
      },
      {
        path: 'ver/:id',
        component: VerGestionComponent,
        data: { title: 'Ver Usuario' }
      },
      {
        path: 'modificar/:id',
        component: ModificarGestionComponent,
        data: { title: 'Modificar Usuario' }
      },
      {
        path: 'asignacion-masiva',
        component: AsignacionMasivaComponent,
        data: { title: 'Asignación Masiva' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionAccesosRoutingModule {}
