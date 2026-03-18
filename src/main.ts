/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
// import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base';
import { appConfig } from './app/app.config';
import { environment } from '@environment/environment';

//Actualación archivo de licencia Syncfusion
//registerLicense('Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXxcdXVXQmdfWEZ0XEc=');
//registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWH9fcXRVR2deUUd2W0M=');
// registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF1cW2hIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjW31ccXNWQWVaWUxzXA==');
//31x key
//registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWH5ednZVRGRYVUxwWEdWYEg=');

//32x key
registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWX5fdXZURGddWURzXEpWYEs=');



bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));


  // Registrar Service Worker para notificaciones push
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker registrado.'))
      .catch(() => console.log('Registro de Service Worker fallido.'));
  }

  // Diferir Tawk.to para no competir con la carga inicial de la app
  function cargarTawkDiferido(): void {
    setTimeout(() => {
      if (environment.production) {
        insertarTawkScript('https://embed.tawk.to/67fa2eb50d9928190ebbc849/1iokkctfp'); // Producción
      } else {
        insertarTawkScript('https://embed.tawk.to/67770aefaf5bfec1dbe5f59e/1igkg5eaq'); // Desarrollo/Test
      }
    }, 3000);
  }

  // Verificar si load ya ocurrió (SPA rápida) o esperar el evento
  if (document.readyState === 'complete') {
    cargarTawkDiferido();
  } else {
    window.addEventListener('load', cargarTawkDiferido);
  }

  function insertarTawkScript(src: string): void {
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = src;
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  document.head.appendChild(s1);
}