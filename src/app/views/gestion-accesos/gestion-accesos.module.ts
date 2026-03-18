import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestionAccesosRoutingModule } from './gestion-accesos-routing.module';

import { FormularioGestionComponent } from './formulario-gestion/formulario-gestion.component';
import { NuevoGestionComponent } from './nuevo-gestion/nuevo-gestion.component';
import { VerGestionComponent } from './ver-gestion/ver-gestion.component';
import { ModificarGestionComponent } from './modificar-gestion/modificar-gestion.component';
import { CrearRolDialogComponent } from './crear-rol-dialog/crear-rol-dialog.component';
import { AsignacionMasivaComponent } from './asignacion-masiva/asignacion-masiva.component';

// Syncfusion
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, EditService, ToolbarService, PageService, SortService,
         ResizeService, FilterService, ExcelExportService, ColumnChooserService,
         CommandColumnService } from '@syncfusion/ej2-angular-grids';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

// CoreUI
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule as GridCoreUI,
  ButtonGroupModule,
  HeaderModule,
  BadgeModule,
  SpinnerModule,
  TabsModule,
  NavModule,
  SharedModule as SharedCoreUI
} from '@coreui/angular';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [
    FormularioGestionComponent,
    NuevoGestionComponent,
    VerGestionComponent,
    ModificarGestionComponent,
    CrearRolDialogComponent,
    AsignacionMasivaComponent
  ],
  imports: [
    CommonModule,
    GestionAccesosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // Syncfusion
    ToolbarModule,
    ComboBoxModule,
    MultiSelectModule,
    GridModule,
    ChipListModule,
    TooltipModule,
    // CoreUI
    ButtonModule,
    CardModule,
    FormModule,
    GridCoreUI,
    ButtonGroupModule,
    HeaderModule,
    BadgeModule,
    SpinnerModule,
    TabsModule,
    NavModule,
    SharedCoreUI,
    IconModule,
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    ResizeService,
    FilterService,
    ExcelExportService,
    ColumnChooserService,
    CommandColumnService,
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = { ...iconSubset };
        return iconSet;
      }
    }
  ]
})
export class GestionAccesosModule {}
