import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotivoAuditoriaTransaccionRoutingModule } from './motivo-auditoria-transaccion-routing.module';
import { NuevoMotivoAuditoriaTransaccionComponent } from './nuevo-motivo-auditoria-transaccion/nuevo-motivo-auditoria-transaccion.component';
import { ModificarMotivoAuditoriaTransaccionComponent } from './modificar-motivo-auditoria-transaccion/modificar-motivo-auditoria-transaccion.component';
import { VerMotivoAuditoriaTransaccionComponent } from './ver-motivo-auditoria-transaccion/ver-motivo-auditoria-transaccion.component';
import { ListadoMotivoAuditoriaTransaccionComponent } from './listado-motivo-auditoria-transaccion/listado-motivo-auditoria-transaccion.component';


import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, ButtonGroupModule, ModalModule, TableModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '../../shared-features/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormularioMotivoAuditoriaTransaccionComponent } from './formulario-motivo-auditoria-transaccion/formulario-motivo-auditoria-transaccion.component';


@NgModule({
  declarations: [
    NuevoMotivoAuditoriaTransaccionComponent,
    ModificarMotivoAuditoriaTransaccionComponent,
    VerMotivoAuditoriaTransaccionComponent,
    ListadoMotivoAuditoriaTransaccionComponent,
    FormularioMotivoAuditoriaTransaccionComponent
  ],
  imports: [
    CommonModule,
    MotivoAuditoriaTransaccionRoutingModule,
    SharedFeaturesModule,
    ReactiveFormsModule,
    FormModule,
    UtilitiesModule,
    TabsModule,
    NavModule,
    GridModule,
    CardModule,
    HeaderModule,
    GridCoreUI,
    ButtonModule,
    ToolbarModule,
    MultiSelectModule,
    ComboBoxModule,
    ButtonGroupModule,
    ModalModule,
    TableModule
  ],
  providers:[
    EditService,
    ToolbarService,
    PageService,
    SortService,
    ColumnChooserService,
    CommandColumnService,
    ResizeService,
    ExcelExportService,
    FilterService]
})
export class MotivoAuditoriaTransaccionModule { }
