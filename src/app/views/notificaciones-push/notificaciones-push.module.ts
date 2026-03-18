import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificacionesPushRoutingModule } from './notificaciones-push-routing.module';

import { EditService, ToolbarService, PageService, 
  SortService, GridModule,CommandColumnService ,
  ColumnChooserService  } from '@syncfusion/ej2-angular-grids';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import {
  ButtonModule,
  CardModule,
  FormModule,
  ButtonGroupModule,
  GridModule as GridCoreUI,
  ListGroupDirective, 
  ListGroupItemDirective,
  AlertComponent
} from '@coreui/angular';
import { ListadoNotificacionesPushComponent } from './listado-notificaciones-push/listado-notificaciones-push.component';


@NgModule({
  declarations: [ListadoNotificacionesPushComponent],
  imports: [
    CommonModule,
    NotificacionesPushRoutingModule,
    GridModule,
    ButtonModule,
    CardModule,
    FormModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    ButtonModuleSyncfusion,
    GridCoreUI,
    ToolbarModule,
    DropDownListModule,
    ListGroupDirective, 
    ListGroupItemDirective,
    AlertComponent,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    ColumnChooserService
  ]
})
export class NotificacionesPushModule { }
