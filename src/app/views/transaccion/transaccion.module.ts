import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransaccionRoutingModule } from './transaccion-routing.module';
import { FormularioTransaccionComponent } from './formulario-transaccion/formulario-transaccion.component';
import { ListadoTransaccionComponent } from './listado-transaccion/listado-transaccion.component';
import { NuevaTransaccionComponent } from './nueva-transaccion/nueva-transaccion.component';
import { ModificarTransaccionComponent } from './modificar-transaccion/modificar-transaccion.component';



import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService ,ColumnChooserService, ExcelExportService, FilterService  } from '@syncfusion/ej2-angular-grids';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

import {
  ButtonModule,
  CardModule,
  FormModule,
  ButtonGroupModule,
  GridModule as GridCoreUI
} from '@coreui/angular';



@NgModule({
  declarations: [
    FormularioTransaccionComponent,
    ListadoTransaccionComponent,
    NuevaTransaccionComponent,
    ModificarTransaccionComponent
  ],
  imports: [
    CommonModule,
    TransaccionRoutingModule,
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
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    FilterService,
    ColumnChooserService,
    ExcelExportService
  ]
})
export class TransaccionModule { }
