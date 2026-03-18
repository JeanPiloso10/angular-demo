import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService ,ColumnChooserService, ExcelExportService, FilterService  } from '@syncfusion/ej2-angular-grids';
import { ListadoProvinciasComponent } from './listado-provincias/listado-provincias.component';
import { NuevaProvinciaComponent } from './nueva-provincia/nueva-provincia.component';
import { ModificarProvinciaComponent } from './modificar-provincia/modificar-provincia.component';
import { FormularioProvinciaComponent } from './formulario-provincia/formulario-provincia.component';
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
import { ProvinciasRoutingModule } from './provincias-routing.module';
import { VerProvinciaComponent } from './ver-provincia/ver-provincia.component';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [ListadoProvinciasComponent,
    VerProvinciaComponent,
  ],
  imports: [
    CommonModule,
    ProvinciasRoutingModule,
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
    NuevaProvinciaComponent,
    ModificarProvinciaComponent,
    FormularioProvinciaComponent
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
export class ProvinciasModule { }
