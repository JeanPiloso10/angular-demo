import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReporteRoutingModule } from './reporte-routing.module';
import { ListadoReporteComponent } from '../reporte/listado-reporte/listado-reporte.component';
import { FormularioReporteComponent } from '../reporte/formulario-reporte/formulario-reporte.component';
import { NuevoReporteComponent } from '../reporte/nuevo-reporte/nuevo-reporte.component';
import { ModificarReporteComponent } from '../reporte/modificar-reporte/modificar-reporte.component';

import { DropDownListModule , MultiSelectModule, ComboBoxModule} from '@syncfusion/ej2-angular-dropdowns';
import { EditService, GridAllModule, PageService, SortService, GridModule, ExcelExportService, FilterService} from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';

import { AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule,GridModule as GridModuleCoreUI , 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule , SpinnerModule, ButtonGroupModule} from '@coreui/angular';
import { ReactiveFormsModule} from '@angular/forms';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

@NgModule({
  declarations: [ListadoReporteComponent, 
    FormularioReporteComponent,
    NuevoReporteComponent,
    ModificarReporteComponent
  ],
  imports: [
    CommonModule,
    ReporteRoutingModule,
    DropDownListModule , MultiSelectModule, ComboBoxModule,
    ToolbarModule,
    AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule,GridModuleCoreUI , 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule , SpinnerModule,
  GridAllModule,GridModule,ReactiveFormsModule,ButtonGroupModule,SharedFeaturesModule
  ],
  providers:[
    EditService,
    PageService,
    SortService,
    ExcelExportService,
    FilterService
  ]
})
export class ReporteModule { }
// Providers array is missing by default; add global providers via module-level providers
