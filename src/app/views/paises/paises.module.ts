import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService ,ColumnChooserService, ExcelExportService, FilterService  } from '@syncfusion/ej2-angular-grids';
import { ListadoPaisesComponent } from './listado-paises/listado-paises.component';
import { NuevoPaisComponent } from './nuevo-pais/nuevo-pais.component';
import { ModificarPaisComponent } from './modificar-pais/modificar-pais.component';
import { FormularioPaisComponent } from './formulario-pais/formulario-pais.component';
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

import { PaisesRoutingModule } from './paises-routing.module';
import { VerPaisComponent } from './ver-pais/ver-pais.component';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [ListadoPaisesComponent, VerPaisComponent],
  imports: [
    CommonModule,
    PaisesRoutingModule,
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
    NuevoPaisComponent,
    ModificarPaisComponent,
    FormularioPaisComponent
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
export class PaisesModule { }
