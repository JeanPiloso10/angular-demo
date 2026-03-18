import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { EditService, ToolbarService, 
  PageService, SortService, 
  GridModule,CommandColumnService ,
  ResizeService, FilterService,
  ExcelExportService, FreezeService, 
  ColumnChooserService } from '@syncfusion/ej2-angular-grids';
import { ListadoUsuariosComponent } from './listado-usuarios/listado-usuarios.component';
import { NuevoUsuarioComponent } from './nuevo-usuario/nuevo-usuario.component';
import { ModificarUsuarioComponent } from './modificar-usuario/modificar-usuario.component';
import { FormularioUsuarioComponent } from './formulario-usuario/formulario-usuario.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { ReactiveFormsModule} from '@angular/forms';
import { ToolbarModule  } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule as GridCoreUI,
  ButtonGroupModule,
  HeaderModule,
  BadgeModule,
  SpinnerModule,
} from '@coreui/angular';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { iconSubset } from '@app/icons/icon-subset';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [ListadoUsuariosComponent, 
    VerUsuarioComponent,
    NuevoUsuarioComponent,
    ModificarUsuarioComponent,
    FormularioUsuarioComponent
     ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    GridModule,
    ButtonModule,
    CardModule,
    HeaderModule,
    FormModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    IconModule,
    CardModule,
    BadgeModule,
    GridCoreUI,
    ToolbarModule,
    MultiSelectModule,
    ChipListModule,
    SpinnerModule,
    ComboBoxModule,
    TooltipModule,
    SharedFeaturesModule,
    SweetAlert2Module.forRoot(),
    SetPasswordComponent
  ],
  providers: [
    EditService,
    EditService,
    ExcelExportService,
    FilterService,
    ColumnChooserService,
    ToolbarService,
    PageService,
    SortService,
    ResizeService,
    CommandColumnService ,
     {
              provide: IconSetService,
              useFactory: () => {
                const iconSet = new IconSetService();
                iconSet.icons = {
                  ...iconSubset
                };
                return iconSet;
              }
            },
  ]
})


export class UsuariosModule { }
