import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperacionRoutingModule } from './operacion-routing.module';
import { FormularioOperacionComponent } from './formulario-operacion/formulario-operacion.component';
import { ListadoOperacionComponent } from './listado-operacion/listado-operacion.component';
import { NuevaOperacionComponent } from './nueva-operacion/nueva-operacion.component';
import { ModificarOperacionComponent } from './modificar-operacion/modificar-operacion.component';


import { EditService, ToolbarService, PageService, SortService, 
  GridModule,CommandColumnService ,ColumnChooserService,  
  ExcelExportService,
  FilterService, SearchService } from '@syncfusion/ej2-angular-grids';
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
  ListGroupDirective, ListGroupItemDirective
} from '@coreui/angular';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';



@NgModule({
  declarations: [
    FormularioOperacionComponent,
    ListadoOperacionComponent,
    NuevaOperacionComponent,
    ModificarOperacionComponent
  ],
  imports: [
    CommonModule,
    OperacionRoutingModule,
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
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    ColumnChooserService,
    ExcelExportService,
    FilterService,
    SearchService
  ]
})
export class OperacionModule { }
