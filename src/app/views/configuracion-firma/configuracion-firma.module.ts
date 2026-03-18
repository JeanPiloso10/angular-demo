import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionFirmaRoutingModule } from './configuracion-firma-routing.module';
import { FormularioConfiguracionFirmaComponent } from './formulario-configuracion-firma/formulario-configuracion-firma.component';
import { ListadoConfiguracionFirmaComponent } from './listado-configuracion-firma/listado-configuracion-firma.component';
import { NuevaConfiguracionFirmaComponent } from './nueva-configuracion-firma/nueva-configuracion-firma.component';
import { ModificarConfiguracionFirmaComponent } from './modificar-configuracion-firma/modificar-configuracion-firma.component';

import { ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule , MultiSelectModule, ComboBoxModule} from '@syncfusion/ej2-angular-dropdowns';


import { AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule,GridModule as GridModuleCoreUI , 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule , SpinnerModule, ButtonGroupModule} from '@coreui/angular';


import { EditService, GridAllModule, PageService, SortService, GridModule, ExcelExportService, FilterService} from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

@NgModule({
  declarations: [
    FormularioConfiguracionFirmaComponent,
    ListadoConfiguracionFirmaComponent,
    NuevaConfiguracionFirmaComponent,
    ModificarConfiguracionFirmaComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionFirmaRoutingModule,
    ReactiveFormsModule,
    AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule, 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule ,ToolbarModule,GridModuleCoreUI,
  DropDownListModule,SpinnerModule, MultiSelectModule,ComboBoxModule,
  GridModule,GridAllModule,SweetAlert2Module,ButtonGroupModule, SharedFeaturesModule
  ],
  providers:[
    EditService,
    PageService,
    SortService,
    ExcelExportService,
    FilterService
  ]
})
export class ConfiguracionFirmaModule { }
