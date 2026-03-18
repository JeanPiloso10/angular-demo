import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionPersonalizadaRoutingModule } from './configuracion-personalizada-routing.module';
import { NuevaConfiguracionPersonalizadaComponent } from './nueva-configuracion-personalizada/nueva-configuracion-personalizada.component';
import { ModificarConfiguracionPersonalizadaComponent } from './modificar-configuracion-personalizada/modificar-configuracion-personalizada.component';
import { ListadoConfiguracionPersonalizadaComponent } from './listado-configuracion-personalizada/listado-configuracion-personalizada.component';
import { FormularioConfiguracionPersonalizadaComponent } from './formulario-configuracion-personalizada/formulario-configuracion-personalizada.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

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
  declarations: [
    NuevaConfiguracionPersonalizadaComponent,
    ModificarConfiguracionPersonalizadaComponent,
    ListadoConfiguracionPersonalizadaComponent,
    FormularioConfiguracionPersonalizadaComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionPersonalizadaRoutingModule,
    CommonModule,
    DropDownListModule , MultiSelectModule, ComboBoxModule,
    ToolbarModule,
    AccordionModule, ButtonModule, 
    CardModule, FormModule, NavModule,
    SharedModule,TabsModule,GridModuleCoreUI , 
    TableModule, UtilitiesModule, PaginationModule, 
    HeaderModule, ModalModule , SpinnerModule,
    SweetAlert2Module,
    SharedFeaturesModule,
    GridAllModule,GridModule,ReactiveFormsModule,ButtonGroupModule
    ],
    providers:[
      EditService,
      PageService,
      SortService,
      ExcelExportService,
      FilterService
    ]
})
export class ConfiguracionPersonalizadaModule { }
