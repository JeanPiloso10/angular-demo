import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Page404Component } from './page404/page404.component';
import { Page401Component } from './page401/page401.component';
import { Page500Component } from './page500/page500.component';
import { ButtonModule, CardModule, FormModule, GridModule , SpinnerModule} from '@coreui/angular';
import { IconModule, IconSetService ,} from '@coreui/icons-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedFeaturesModule } from './../../shared-features/shared-features.module'
import { Page403Component } from './page403/page403.component';
import { iconSubset } from '@app/icons/icon-subset';

@NgModule({
  declarations: [
    // LoginComponent,
    // RegisterComponent,
    Page404Component,
    Page403Component
    // Page401Component,
    // Page500Component
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    CardModule,
    ButtonModule,
    GridModule,
    IconModule,
    FormModule,
    ReactiveFormsModule,
    SpinnerModule,
    SharedFeaturesModule
  ],
  providers:[
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

export class PagesModule {
}
