import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, ButtonGroupModule, ModalModule, TableModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '../../shared-features/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TipoArchivoAnexoTransaccionRoutingModule } from './tipo-archivo-anexo-transaccion-routing.module';
import { FormularioTipoArchivoAnexoTransaccionComponent } from './formulario-tipo-archivo-anexo-transaccion/formulario-tipo-archivo-anexo-transaccion.component';
import { ListadoTipoArchivoAnexoTransaccionComponent } from './listado-tipo-archivo-anexo-transaccion/listado-tipo-archivo-anexo-transaccion.component';
import { ModificarTipoArchivoAnexoTransaccionComponent } from './modificar-tipo-archivo-anexo-transaccion/modificar-tipo-archivo-anexo-transaccion.component';
import { NuevoTipoArchivoAnexoTransaccionComponent } from './nuevo-tipo-archivo-anexo-transaccion/nuevo-tipo-archivo-anexo-transaccion.component';
import { VerTipoArchivoAnexoTransaccionComponent } from './ver-tipo-archivo-anexo-transaccion/ver-tipo-archivo-anexo-transaccion.component';

@NgModule({
  declarations: [
    FormularioTipoArchivoAnexoTransaccionComponent,
    ListadoTipoArchivoAnexoTransaccionComponent,
    ModificarTipoArchivoAnexoTransaccionComponent,
    NuevoTipoArchivoAnexoTransaccionComponent,
    VerTipoArchivoAnexoTransaccionComponent
  ],
  imports: [
    CommonModule,
    TipoArchivoAnexoTransaccionRoutingModule,
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
    ExcelExportService,
    FilterService,
    ResizeService]
})
export class TipoArchivoAnexoTransaccionModule { }
