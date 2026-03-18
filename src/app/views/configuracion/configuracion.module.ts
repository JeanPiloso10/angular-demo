import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { ListadoConfiguracionComponent } from './listado-configuracion/listado-configuracion.component';
import { FormularioConfiguracionComponent } from './formulario-configuracion/formulario-configuracion.component';
import { NuevaConfiguracionComponent } from './nueva-configuracion/nueva-configuracion.component';
import { ModificarConfiguracionComponent } from './modificar-configuracion/modificar-configuracion.component';


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
    ListadoConfiguracionComponent,
    FormularioConfiguracionComponent,
    NuevaConfiguracionComponent,
    ModificarConfiguracionComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionRoutingModule,
    CommonModule,
    DropDownListModule , MultiSelectModule, ComboBoxModule,
    ToolbarModule,
    AccordionModule, ButtonModule, 
  CardModule, FormModule, NavModule,
  SharedModule,TabsModule,GridModuleCoreUI , 
  TableModule, UtilitiesModule, PaginationModule, 
  HeaderModule, ModalModule , SpinnerModule,
  GridAllModule,GridModule,ReactiveFormsModule,ButtonGroupModule,
  SharedFeaturesModule
  ],
  providers: [ExcelExportService, FilterService]
})
export class ConfiguracionModule { }
