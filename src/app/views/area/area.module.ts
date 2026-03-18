import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CardModule, GridModule as GridCoreUI, FormModule, HeaderModule, NavModule, TabsModule, UtilitiesModule, ButtonModule, SharedModule, ButtonGroupModule } from '@coreui/angular';
import { ColumnChooserService,CommandColumnService, EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import {ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { AreaRoutingModule } from './area-routing.module';
import { FormularioAreaComponent } from './formulario-area/formulario-area.component';
import { ModificarAreaComponent } from './modificar-area/modificar-area.component';
import { NuevaAreaComponent } from './nueva-area/nueva-area.component';
import { ListadoAreaComponent } from './listado-area/listado-area.component';
import { VerAreaComponent } from './ver-area/ver-area.component';
import { SharedFeaturesModule } from '@shared/shared-features.module';


@NgModule({
  declarations: [
    FormularioAreaComponent,
    ModificarAreaComponent,
    NuevaAreaComponent,
    ListadoAreaComponent,
    VerAreaComponent
  ],
  imports: [
    CommonModule,
    AreaRoutingModule,
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
    FilterService]
})
export class AreaModule { }
