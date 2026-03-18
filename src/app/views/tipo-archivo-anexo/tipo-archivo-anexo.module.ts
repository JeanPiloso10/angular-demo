import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TipoArchivoAnexoRoutingModule } from './tipo-archivo-anexo-routing.module';
import { FormularioTipoArchivoAnexoComponent } from './formulario-tipo-archivo-anexo/formulario-tipo-archivo-anexo.component';
import { NuevoTipoArchivoAnexoComponent } from './nuevo-tipo-archivo-anexo/nuevo-tipo-archivo-anexo.component';
import { ModificarTipoArchivoAnexoComponent } from './modificar-tipo-archivo-anexo/modificar-tipo-archivo-anexo.component';
import { ListadoTipoArchivoAnexoComponent } from './listado-tipo-archivo-anexo/listado-tipo-archivo-anexo.component';
import { VerTipoArchivoAnexoComponent } from './ver-tipo-archivo-anexo/ver-tipo-archivo-anexo.component';


import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, SharedModule, ButtonGroupModule, ModalModule, TableModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '../../shared-features/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FormularioTipoArchivoAnexoComponent,
    NuevoTipoArchivoAnexoComponent,
    ModificarTipoArchivoAnexoComponent,
    ListadoTipoArchivoAnexoComponent,
    VerTipoArchivoAnexoComponent
  ],
  imports: [
    CommonModule,
    TipoArchivoAnexoRoutingModule,
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
export class TipoArchivoAnexoModule { }
