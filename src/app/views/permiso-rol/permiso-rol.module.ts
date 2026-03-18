import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermisoRolRoutingModule } from './permiso-rol-routing.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { PageService as PageServiceTree
       , SortService as SortServiceTree
       , FilterService as FilterServiceTree
       , TreeGridModule
       , TreeGridAllModule
       , ToolbarService
       , CommandColumnService
       , ColumnChooserService} from '@syncfusion/ej2-angular-treegrid'

import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns'
import { GridAllModule, PageService, SortService, GridModule, ResizeService} from '@syncfusion/ej2-angular-grids';
import { AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule,GridModule as GridModuleCoreUI , 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule } from '@coreui/angular';
  
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule as ButtonModuleSyncfusion } from '@syncfusion/ej2-angular-buttons';
import { FormularioPermisoRolComponent } from './formulario-permiso-rol/formulario-permiso-rol.component';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

@NgModule({
  declarations: [
    FormularioPermisoRolComponent
  ],
  imports: [
    CommonModule,
    PermisoRolRoutingModule,
    ReactiveFormsModule,
    ButtonModuleSyncfusion,
    UtilitiesModule,
    TabsModule,
    GridModuleCoreUI,
    GridModule,
    TreeGridModule,
    TreeGridAllModule,
    DropDownListAllModule,
    CardModule,
    HeaderModule,
    ButtonModule,
    FormModule,
    AccordionModule,
    SharedModule,
    TableModule,
    PaginationModule,
    GridAllModule,
    ModalModule,
    RouterModule,
    ToolbarModule,
    CheckBoxModule,
    ComboBoxModule,
    MultiSelectModule,
    DropDownListModule,
    SharedFeaturesModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    PageServiceTree,
    SortServiceTree,
    FilterServiceTree,
    ToolbarService,
    CommandColumnService,
    ColumnChooserService,
    ResizeService
  ]
})
export class PermisoRolModule { }
