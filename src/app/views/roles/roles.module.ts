import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesRoutingModule } from './roles-routing.module';
import { EditService, ToolbarService, PageService, SortService, GridModule,CommandColumnService, ResizeService, ExcelExportService, FilterService, ColumnChooserService  } from '@syncfusion/ej2-angular-grids';
import { ListadoRolesComponent } from './listado-roles/listado-roles.component';
import { NuevoRolComponent } from './nuevo-rol/nuevo-rol.component';
import { ModificarRolComponent } from './modificar-rol/modificar-rol.component';
import { FormularioRolComponent } from './formulario-rol/formulario-rol.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';

import {
  ButtonModule,
  CardModule,
  FormModule,
  ButtonGroupModule,
  GridModule as GridCoreUI
} from '@coreui/angular';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

@NgModule({
  declarations: [ListadoRolesComponent, NuevoRolComponent, ModificarRolComponent, FormularioRolComponent ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    GridModule,
    ButtonModule,
    CardModule,
    FormModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    ButtonModuleSyncfusion,
    GridCoreUI,
    ToolbarModule,
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    ResizeService,
    CommandColumnService,
    ExcelExportService,
    FilterService,
    ColumnChooserService
  ]
})
export class RolesModule { }
