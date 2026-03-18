import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SecurityInterceptorService } from './core/interceptors/security.interceptor.service';
import { ToastrModule } from 'ngx-toastr';
import { iconSubset } from './icons/icon-subset';

// 🔹 Importar ServiceWorkerModule y environment
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environment/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    importProvidersFrom(
      SidebarModule, 
      DropdownModule,
      HttpClientModule,
      ToastrModule.forRoot(),

     // 🔹 Agregar ServiceWorkerModule para habilitar SwUpdate
     ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production  || environment.test
    })
    ),
     {
      provide: HTTP_INTERCEPTORS,
      useClass: SecurityInterceptorService,
      multi: true,
    },
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
    provideAnimations()
  ]
};