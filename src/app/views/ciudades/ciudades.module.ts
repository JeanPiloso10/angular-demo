import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListadoCiudadesComponent } from './listado-ciudades/listado-ciudades.component';
import { NuevaCiudadComponent } from './nueva-ciudad/nueva-ciudad.component';
import { ModificarCiudadComponent } from './modificar-ciudad/modificar-ciudad.component';
import { FormularioCiudadComponent } from './formulario-ciudad/formulario-ciudad.component';

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
import { CiudadesRoutingModule } from './ciudades-routing.module';
import { VerCiudadComponent } from './ver-ciudad/ver-ciudad.component';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [
    ListadoCiudadesComponent,
    VerCiudadComponent
  ],
  imports: [
    CommonModule,
    CiudadesRoutingModule,
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
    SweetAlert2Module.forRoot(),
    NuevaCiudadComponent,
    ModificarCiudadComponent,
    FormularioCiudadComponent
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
export class CiudadesModule { }
