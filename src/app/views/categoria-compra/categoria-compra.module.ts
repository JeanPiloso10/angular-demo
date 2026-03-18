import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriaCompraRoutingModule } from './categoria-compra-routing.module';
import { VerCategoriaCompraComponent } from './ver-categoria-compra/ver-categoria-compra.component';
import { FormularioCategoriaCompraComponent } from './formulario-categoria-compra/formulario-categoria-compra.component';
import { ListadoCategoriaCompraComponent } from './listado-categoria-compra/listado-categoria-compra.component';
import { ModificarCategoriaCompraComponent } from './modificar-categoria-compra/modificar-categoria-compra.component';
import { NuevaCategoriaCompraComponent } from './nueva-categoria-compra/nueva-categoria-compra.component';


import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, ButtonGroupModule, ModalModule, TableModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    VerCategoriaCompraComponent,
    FormularioCategoriaCompraComponent,
    ListadoCategoriaCompraComponent,
    ModificarCategoriaCompraComponent,
    NuevaCategoriaCompraComponent
  ],
  imports: [
    CommonModule,
    CategoriaCompraRoutingModule,
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
    SharedFeaturesModule
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
    FilterService,
    NgbActiveModal ]
})
export class CategoriaCompraModule { }
