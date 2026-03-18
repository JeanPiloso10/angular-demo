import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificacionOperacionTransaccionRoutingModule } from './notificacion-operacion-transaccion-routing.module';
import { FormularioNotificacionOperacionTransaccionComponent } from './formulario-notificacion-operacion-transaccion/formulario-notificacion-operacion-transaccion.component';
import { ListadoNotificacionOperacionTransaccionComponent } from './listado-notificacion-operacion-transaccion/listado-notificacion-operacion-transaccion.component';
import { NuevaNotificacionOperacionTransaccionComponent } from './nueva-notificacion-operacion-transaccion/nueva-notificacion-operacion-transaccion.component';
import { ModificarOperacionTransaccionComponent } from './modificar-operacion-transaccion/modificar-operacion-transaccion.component';

import { ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule, MultiSelectModule, ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';


import {
  AccordionModule, ButtonModule,
  CardModule, FormModule, NavModule,
  SharedModule, TabsModule, GridModule as GridModuleCoreUI,
  TableModule, UtilitiesModule, PaginationModule,
  HeaderModule, ModalModule, SpinnerModule, ButtonGroupModule
} from '@coreui/angular';


import { EditService, GridAllModule, PageService, SortService, GridModule, ExcelExportService } from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [
    FormularioNotificacionOperacionTransaccionComponent,
    ListadoNotificacionOperacionTransaccionComponent,
    NuevaNotificacionOperacionTransaccionComponent,
    ModificarOperacionTransaccionComponent
  ],
  imports: [
    CommonModule,
    NotificacionOperacionTransaccionRoutingModule,
    ReactiveFormsModule,
    AccordionModule, ButtonModule,
    CardModule, FormModule, NavModule,
    SharedModule, TabsModule,
    TableModule, UtilitiesModule, PaginationModule,
    HeaderModule, ModalModule, ToolbarModule, GridModuleCoreUI,
    DropDownListModule, SpinnerModule, MultiSelectModule, ComboBoxModule,
    GridModule, GridAllModule, SweetAlert2Module, ButtonGroupModule
  ],
  providers:[
    EditService,
    PageService,
    SortService,
    ExcelExportService
  ]
})
export class NotificacionOperacionTransaccionModule { }
