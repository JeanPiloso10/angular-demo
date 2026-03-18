import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadoErrorlogComponent } from './listado-errorlog/listado-errorlog.component';

const routes: Routes = [
   {
      path: '',
      data: {
        title: 'Error Log'
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
          component: ListadoErrorlogComponent,
          data: {
            title: 'Listado'
          }
        },    
  
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorlogRoutingModule { }
