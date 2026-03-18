import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ErrorlogRoutingModule } from './errorlog-routing.module';
import { ListadoErrorlogComponent } from './listado-errorlog/listado-errorlog.component';
import { EditService, ExcelExportService, FilterService, GridModule, PageService, ResizeService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, CardModule, CollapseDirective, FormModule, GridModule as GridCoreUI, NavModule, TabsModule, } from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';


@NgModule({
  declarations: [ListadoErrorlogComponent],
  imports: [
    CommonModule,
    ErrorlogRoutingModule,
    GridModule,
    ButtonModule,
    ToolbarModule,
    FormModule,
    ReactiveFormsModule,
    CardModule,
    GridCoreUI,
    SharedFeaturesModule,
    IconModule,
    TabsModule,
    NavModule,
    CollapseDirective
  ],
  providers: [DatePipe,
    EditService,
    ToolbarService,
    PageService,
    SortService,
    ResizeService,
    ExcelExportService,
  FilterService,
     {
          provide: IconSetService,
          useFactory: () => {
            const iconSet = new IconSetService();
            iconSet.icons = {
              ...iconSubset
            };
            return iconSet;
          }
        }
  ]
})
export class ErrorlogModule { }
