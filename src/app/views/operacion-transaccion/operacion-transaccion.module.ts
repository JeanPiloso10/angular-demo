import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperacionTransaccionRoutingModule } from './operacion-transaccion-routing.module';
import { ListadoOperacionTransaccionComponent } from './listado-operacion-transaccion/listado-operacion-transaccion.component';
import { FormularioOperacionTransaccionComponent } from './formulario-operacion-transaccion/formulario-operacion-transaccion.component';
import { NuevoOperacionTransaccionComponent } from './nuevo-operacion-transaccion/nuevo-operacion-transaccion.component';
import { ModificarOperacionTransaccionComponent } from './modificar-operacion-transaccion/modificar-operacion-transaccion.component';


import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService ,ColumnChooserService, FilterService, ExcelExport, ExcelExportService  } from '@syncfusion/ej2-angular-grids';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import {
  ButtonModule,
  CardModule,
  FormModule,
  ButtonGroupModule,
  GridModule as GridCoreUI
} from '@coreui/angular';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [
    ListadoOperacionTransaccionComponent,
    FormularioOperacionTransaccionComponent,
    NuevoOperacionTransaccionComponent,
    ModificarOperacionTransaccionComponent
  ],
  imports: [
    CommonModule,
    OperacionTransaccionRoutingModule,
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
    ComboBoxModule,
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    FilterService,
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    ColumnChooserService,
    ExcelExportService
  ]
})
export class OperacionTransaccionModule { }
