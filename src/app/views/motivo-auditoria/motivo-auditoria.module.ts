import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotivoAuditoriaRoutingModule } from './motivo-auditoria-routing.module';
import { FormularioMotivoAuditoriaComponent } from './formulario-motivo-auditoria/formulario-motivo-auditoria.component';
import { VerMotivoAuditoriaComponent } from './ver-motivo-auditoria/ver-motivo-auditoria.component';
import { ListadoMotivoAuditoriaComponent } from './listado-motivo-auditoria/listado-motivo-auditoria.component';
import { ModificarMotivoAuditoriaComponent } from './modificar-motivo-auditoria/modificar-motivo-auditoria.component';
import { NuevoMotivoAuditoriaComponent } from './nuevo-motivo-auditoria/nuevo-motivo-auditoria.component';


import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, ButtonGroupModule, ModalModule, TableModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '../../shared-features/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FormularioMotivoAuditoriaComponent,
    VerMotivoAuditoriaComponent,
    ListadoMotivoAuditoriaComponent,
    ModificarMotivoAuditoriaComponent,
    NuevoMotivoAuditoriaComponent
  ],
  imports: [
    CommonModule,
    MotivoAuditoriaRoutingModule,
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
    TableModule,
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
export class MotivoAuditoriaModule { }
