import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';

import {
  ButtonDirective,
  CardModule,
  GridModule,
  NavbarModule ,
  TextColorDirective,
  GutterDirective,
  FormModule,
  NavModule,
  ButtonModule,
  ThemeDirective,
  BadgeModule 
} from '@coreui/angular';

import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '@app/views/usuarios/usuarios.service';
import { MenuManagerService } from '@app/core/services/menu-manager.service';
import { RouterModule } from '@angular/router'; // Asegúrate de importar esto
import { FormControl } from '@angular/forms';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { SecurityService } from '@app/core/services/security.service';
import { ToastrService } from 'ngx-toastr';
import { DataCacheService } from '@app/core/services/data-cache.service';
import { MainNotificationSignalrService } from '@app/core/services/signalR/main-notification-signalr.service';
import { NotificacionesPushService } from '@app/views/notificaciones-push/notificaciones-push.service';
import { NotificationHubMethods } from '@app/shared-features/enums/NotificationHubMethods';
import { cadenaErrores } from '@app/shared-features/utilities/parsearErrores';
import { forkJoin, map, Observable } from 'rxjs';

@Component({
  selector: 'app-menu-usuario',
  templateUrl: './menu-usuario.component.html',
  styleUrl: './menu-usuario.component.scss',
  standalone: true,

  imports: [CommonModule, NavbarModule , 
    CardModule,
    TextColorDirective, 
    ButtonDirective, 
    ReactiveFormsModule,
    RouterModule,
    FormModule,
    NavModule,
    ThemeDirective,
    GridModule,
    ButtonModule,
    IconModule,
    BadgeModule 
    ],
    providers: [GutterDirective,
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
export class MenuUsuarioComponent implements AfterViewInit {
 
  colors = [
    { color: 'primary', textColor: 'primary' },
    { color: 'secondary', textColor: 'secondary' },
    { color: 'success', textColor: 'success' },
    { color: 'danger', textColor: 'danger' },
    { color: 'warning', textColor: 'warning' },
    { color: 'info', textColor: 'info' },
    { color: 'light' },
    { color: 'dark' }
  ];


    @ViewChild('inputBusqueda') inputBusqueda!: ElementRef;

    busquedaControl = new FormControl('');
    fromUrl: string | null = null;

    public notificationCounter: number = 0;

    navMenu! : any [];
    filteredNavMenu: any [];
    leafNodes: any[] = [];
    
    constructor(private router: Router,
      private route: ActivatedRoute,
      private securityService: SecurityService,
      private  userService: UsuariosService,
      private  toastr:ToastrService,
      private  cacheService:DataCacheService,
      private  mainNotificationService:MainNotificationSignalrService,
      private  notificacionesPushService:NotificacionesPushService,
      private  menuManagerService: MenuManagerService
    ) {
        this.userService.getMenuUsuario().subscribe({
          next: (respuesta) => {
    
            respuesta.body;

          },
          error: (errores) => {
            console.error(errores);
          }
        });

        this.menuManagerService.filteredNavMenu$.subscribe(() => {
          this.leafNodes = this.menuManagerService.getLeafNodes();
        });

        // Cargar el menú inicial
        this.menuManagerService.loadMenuUsuario();
    
        // Cargar el menú desde el servicio (si no está cargado aún)
       
    }
  


  async ngOnInit() {

    this.route.queryParamMap.subscribe(params => {
      this.fromUrl = params.get('from');
    });

  //   setTimeout(() => this.requestNotificationPermission(), 2000);

  //   this.mainNotificationService.startConnection();
  //   this.subscribeToNotifications(NotificationHubMethods.mainNotificacionPushHub);

  //    // Ejecutar las llamadas en paralelo usando forkJoin
  //    forkJoin({
  //     notificationCount: this.cargarCantidadNotificacionesNoLeidas()
  // }).subscribe({
  //     next: (results) => {
  //         this.notificationCounter = results.notificationCount;

  //         // Verificar y reconectar si es necesario
  //     if (!this.mainNotificationService.isConnectionActive()) {
  //       // console.log('SignalR connection is not active, attempting to reconnect...');
  //       this.mainNotificationService.startConnection();
  //     }
  //     },
  //     error: (error) => {
  //       //this.toastr.error(cadenaErrores(error));
  //       console.error(cadenaErrores(error));
  //     }
  // });

  }

  private requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // this.toastr.success("Ha concedido el permiso para recibir notificaciones push del navegador.")
          console.log("Ha concedido el permiso para recibir notificaciones push del navegador.");
        } else {
          console.log("No ha concedido el permiso para recibir notificaciones push del navegado.");
          // this.toastr.error("No ha concedido el permiso para recibir notificaciones push del navegado.")
        }
      });
    }
  }


  private showBrowserNotification(message: string, title: string, urlNotificacionPush: string, notificationTag: string) {
    if ('Notification' in window && Notification.permission === 'granted') {

          // Verificar si la notificación ya ha sido mostrada
          const lastNotification = localStorage.getItem('lastNotificationId');
          if (lastNotification === notificationTag) {
              return; // Si es la misma, no mostrar la notificación
          }
  
          // Almacenar el ID de la notificación actual
          localStorage.setItem('lastNotificationId', notificationTag);

      const notification = new Notification(title, { 
        body: message, 
        data: { url: `/#${urlNotificacionPush}` },
        //tag: notificationTag // Utiliza el tag proporcionado por el backend
      });
      notification.onclick = (event) => {
        event.preventDefault(); // Evitar la acción predeterminada de la notificación
        window.open(notification.data.url, '_blank'); // Abrir la URL en una nueva pestaña
      };
    }
  }


  private subscribeToNotifications(eventHubName: string) {
    this.mainNotificationService.entityDataChangeListener(
      eventHubName,
      this.handleAddNotificacionPush.bind(this),
      this.handleUpdateNotificacionPush.bind(this),
      null
    );
  }

  cargarCantidadNotificacionesNoLeidas(): Observable<number> {
      return this.notificacionesPushService.obtenerCantidadNotificacionesNoLeidas().pipe(
          map(data => data.cantidad)
      );
  }

  ngOnDestroy() {
    this.mainNotificationService.removeEntityDataChangeListener(NotificationHubMethods.mainNotificacionPushHub);
    // No llamar stopConnection() - el servicio es singleton y otros componentes pueden usarlo
  }

  private handleAddNotificacionPush = (notificationPush: any) => {
    this.notificationCounter++;
    this.toastr.info(notificationPush?.mensaje,notificationPush?.titulo);
    this.showBrowserNotification(notificationPush?.mensaje, notificationPush?.titulo, notificationPush?.urlNotificacionPush, notificationPush?.notificationTag);
  }

  private handleUpdateNotificacionPush = (notificationPush: any) => {
    // console.log(notificationPush);
    this.notificationCounter = 0;
  }

async ngAfterViewInit() {    
  this.inputBusqueda.nativeElement.focus();
}

limpiarBusqueda() {
  this.busquedaControl.setValue('');
  this.menuManagerService.limpiarBusqueda();
  setTimeout(() => this.inputBusqueda.nativeElement.focus(), 0);
}

getColorClass(nombre: string): string {
  const colores = ['primary', 'success', 'warning', 'danger', 'info', 'secondary'];
  const index = nombre.length % colores.length;
  return colores[index];
}

logout(): void {
  try {
   
      this.cacheService.clearAllCache();
      this.securityService.logout();
      this.router.navigate(['/login']);
  } catch (error) {
      this.toastr.error('Error al cerrar sesion...');
  }
}

agruparPorPadre(lista: { parentName: string; name: string; url: string }[]) {
  const grupos: { name: string; children: any[] }[] = [];

  lista.forEach(item => {
    let grupo = grupos.find(g => g.name === item.parentName);
    if (!grupo) {
      grupo = { name: item.parentName, children: [] };
      grupos.push(grupo);
    }
    grupo.children.push(item);
  });

  return grupos;
}

irARuta(url: string) {
  if (url && url !== '#') {
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;
    setTimeout(() => {
      this.router.navigate([formattedUrl]);
    }, 0);
  }
}

onBuscar(valor: any) {

  // console.log(valor.target.value);
  this.menuManagerService.filtrarMenu(valor.target.value);
}

volver(): void {
  if (this.fromUrl) {
    this.router.navigateByUrl(this.fromUrl);
  } else {
    this.router.navigate(['/dashboard']);
  }
}


}