import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PuertosRoutingModule } from './puertos-routing.module';
import { ListadoPuertosComponent } from './listado-puertos/listado-puertos.component';
import { NuevoPuertoComponent } from './nuevo-puerto/nuevo-puerto.component';
import { ModificarPuertoComponent } from './modificar-puerto/modificar-puerto.component';
import { FormularioPuertoComponent } from './formulario-puerto/formulario-puerto.component';

import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService ,ColumnChooserService, ExcelExportService, FilterService  } from '@syncfusion/ej2-angular-grids';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule , ComboBoxModule} from '@syncfusion/ej2-angular-dropdowns';

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
    ListadoPuertosComponent,
    NuevoPuertoComponent,
    ModificarPuertoComponent,
    FormularioPuertoComponent
  ],
  imports: [
    CommonModule,
    PuertosRoutingModule,
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
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    ColumnChooserService,
    ExcelExportService,
    FilterService
  ]
})
export class PuertosModule { }
