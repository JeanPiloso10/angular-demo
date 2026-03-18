import { Component, DestroyRef, inject, Input } from '@angular/core';
import {
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  SidebarToggleDirective,
  AlertModule
} from '@coreui/angular';
import { NgTemplateOutlet, CommonModule  } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { catchError, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuariosService } from '@app/views/usuarios/usuarios.service'
import { Router } from '@angular/router';
import { EnableTwoFactorAuthComponent } from '@shared/components/enable-two-factor-auth/enable-two-factor-auth.component';
import { ChangeProfilePicComponent } from '@shared/components/change-profile-pic/change-profile-pic.component';
import { ChangePasswordComponent } from '@shared/components/change-password/change-password.component';
import { ToastrService, ActiveToast } from 'ngx-toastr';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SecurityService } from '@core/services/security.service';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { AjustesUsuarioComponent } from '@shared/components/ajustes-usuario/ajustes-usuario.component'
import { DataCacheService } from '@core/services/data-cache.service';
import { SpinnerService } from '@core/services/spinner.service';
import { MainNotificationSignalrService } from '@core/services/signalR/main-notification-signalr.service';
import { NotificationHubMethods } from '@shared/enums/NotificationHubMethods';
import { NotificacionesPushService } from '@app/views/notificaciones-push/notificaciones-push.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';
import { ThemeSyncService } from '@app/core/services/theme-sync.service';
import { AiAssistantComponent } from '@app/shared-features/components/ai-assistant/ai-assistant.component';
import { AiChatSidebarService } from '@app/core/services/ai-chat-sidebar.service';
import { iconSubset } from '@app/icons/icon-subset';
import { LogoutService } from '@app/core/services/logout.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [CommonModule ,
    ContainerComponent, 
    HeaderTogglerDirective, 
    SidebarToggleDirective, 
    IconDirective, 
    HeaderNavComponent, 
    NavItemComponent, 
    RouterLink, 
    NgTemplateOutlet, 
    BreadcrumbRouterComponent, 
    DropdownComponent, 
    DropdownToggleDirective, 
    DropdownMenuDirective, 
    DropdownHeaderDirective, 
    DropdownItemDirective, 
    DropdownDividerDirective, 
    DropDownListModule,
    AlertModule
  ],
   providers: [{
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = { ...iconSubset };
        return iconSet;
      }
    }]
})
export class DefaultHeaderComponent extends HeaderComponent implements AfterViewInit {

  @Input() sidebarId: string = 'sidebar1';
  public aiChatEnabled: boolean = false;

  private aiChatService = inject(AiChatSidebarService);

  toggleAiSidebar(): void {
    this.aiChatService.toggle();
  }
  public imagenUrl: string = "./assets/img/avatars/default.png";
  public notificationCounter: number = 0;
  private notificacionToastRef: ActiveToast<any> | null = null;
  private consecutiveToastCount = 0;
  private readonly maxSequentialToasts = 3; // Evita bombardear con toasts en ráfaga
  private toastResetTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly toastResetDelay = 30000; // Permite reanudar toasts tras 30s sin ráfagas
  private burstActive = false;
  private burstInactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly burstInactivityDelay = 5000; // Espera 5s tras la última notificación para agrupar la ráfaga


  constructor(public router: Router,
              private renderer: Renderer2,
              private spinnerService: SpinnerService,
              private colorModeService: ColorModeService,
              private route: ActivatedRoute,
              private destroyRef: DestroyRef,
              private securityService : SecurityService,
              private userService : UsuariosService,
              private toastr : ToastrService,
              private cacheService : DataCacheService,
              private mainNotificationService : MainNotificationSignalrService,
              private notificacionesPushService: NotificacionesPushService,
              private modalHelperService: ModalHelperService,
              private themeSyncService: ThemeSyncService,
              private logoutService: LogoutService,
             @Inject(DOCUMENT) private document: Document) {
    super();

    initColorModeFromRoute({
      colorModeService: this.colorModeService,
      route: this.route,
      destroyRef: this.destroyRef,
    });

  }

  setColorTheme(mode: string)
  {
    this.colorModeService.colorMode.set(mode); 
  }

  colorMode() {
    return this.colorModeService.colorMode();
  }


  async ngOnInit() {

    // Diferir la solicitud de permisos para no bloquear la carga inicial
    setTimeout(() => this.requestNotificationPermission(), 2000);

    // Cargar permisos del asistente de analytics
    this.aiChatService.loadPermissions();
    this.aiChatService.hasAccess$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.aiChatEnabled = v);

    // Suscribirse a notificaciones - la conexión se inicia automáticamente
    this.subscribeToNotifications(NotificationHubMethods.mainNotificacionPushHub);

     // Ejecutar las llamadas en paralelo usando forkJoin
     forkJoin({
      profilePic: this.loadProfilePic().pipe(
        catchError((error) => {
              // console.error('Error loading profile picture:', error);
              return of(this.imagenUrl); // Devuelve null en caso de error
          })
      ),
      notificationCount: this.cargarCantidadNotificacionesNoLeidas()
  }).subscribe({
      next: (results) => {
          this.imagenUrl = results.profilePic;
          this.notificationCounter = results.notificationCount;

          // La verificación de conexión ahora es manejada automáticamente por el servicio
      },
      error: (error) => {
        //this.toastr.error(cadenaErrores(error));
        console.error(cadenaErrores(error));
      }
  });

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

  ngOnDestroy() {
    this.mainNotificationService.removeEntityDataChangeListener(NotificationHubMethods.mainNotificacionPushHub);
    // No llamar stopConnection() - el servicio es singleton y otros componentes pueden usarlo
    this.flushBurstSummary();
    this.clearToastResetTimer();
    this.clearBurstSummaryTimer();
  }

  private handleAddNotificacionPush = (notificationPush: any) => {
    this.notificationCounter++;
    if (this.burstActive) {
      this.bufferNotificationForBurst();
    } else {
      this.consecutiveToastCount++;

      this.mostrarToastNotificacion(notificationPush?.titulo, notificationPush?.mensaje);

      if (this.consecutiveToastCount === this.maxSequentialToasts) {
        this.startBurstMode();
      } else {
        this.scheduleToastReset();
      }
    }

    this.showBrowserNotification(notificationPush?.mensaje, notificationPush?.titulo, notificationPush?.urlNotificacionPush, notificationPush?.notificationTag);
  }

  private handleUpdateNotificacionPush = (notificationPush: any) => {
    // console.log(notificationPush);
    this.notificationCounter = 0;
    this.consecutiveToastCount = 0;
    this.resetBurstState();
    this.clearToastResetTimer();
  }

  private scheduleToastReset(): void {
    if (this.toastResetTimer) {
      clearTimeout(this.toastResetTimer);
    }

    this.toastResetTimer = setTimeout(() => {
      this.consecutiveToastCount = 0;
      this.toastResetTimer = null;
    }, this.toastResetDelay);
  }

  private clearToastResetTimer(): void {
    if (!this.toastResetTimer) {
      return;
    }

    clearTimeout(this.toastResetTimer);
    this.toastResetTimer = null;
  }

  private startBurstMode(): void {
    this.burstActive = true;
    this.clearToastResetTimer();
    this.scheduleBurstSummary();
  }

  private bufferNotificationForBurst(): void {
    this.scheduleBurstSummary();
  }

  private scheduleBurstSummary(): void {
    this.clearBurstSummaryTimer();
    this.burstInactivityTimer = setTimeout(() => {
      this.flushBurstSummary();
    }, this.burstInactivityDelay);
  }

  private clearBurstSummaryTimer(): void {
    if (!this.burstInactivityTimer) {
      return;
    }

    clearTimeout(this.burstInactivityTimer);
    this.burstInactivityTimer = null;
  }

  private flushBurstSummary(): void {
    if (!this.burstActive) {
      this.resetBurstState();
      return;
    }

    this.mostrarToastNotificacion(undefined, 'Tiene nuevas notificaciones sin leer');
    this.resetBurstState();
  }

  private resetBurstState(): void {
    this.burstActive = false;
    this.consecutiveToastCount = 0;
    this.clearBurstSummaryTimer();
  }

  private mostrarToastNotificacion(titulo?: string, mensaje?: string): void {
    try {
      if (this.notificacionToastRef) {
        try {
          this.notificacionToastRef.toastRef.close();
        } catch { /* ignore close errors */ }
      }
      this.notificacionToastRef = this.toastr.info(mensaje ?? '', titulo);
    } catch (error) {
      console.error('Error mostrando notificación', error);
    }
  }

  ngAfterViewInit() {

    let temaPredeterminado = localStorage.getItem('coreui-free-angular-admin-template-theme-default') || 'light'; // Ejemplo: 'light' como predeterminado
    // Remueve las comillas del valor recuperado
    temaPredeterminado = temaPredeterminado?.replace(/"/g, '') || 'light'; // Remplaza las comillas dobles y usa 'light' como valor predeterminado si es null

    // this.setTheme(temaPredeterminado);
  }
  
  logout(): void {
    // Usar servicio centralizado de logout con spinner
    this.logoutService.logout(true);
  }

  changeProfilePic() {
      const modalRef = this.modalHelperService.abrirModal(ChangeProfilePicComponent);

      modalRef.result.then(() => {
        
        forkJoin({
          profilePic: this.loadProfilePic().pipe(
            catchError((error) => {
                  return of(this.imagenUrl); // Devuelve null en caso de error
              })
          )
      }).subscribe({
          next: (results) => {
              this.imagenUrl = results.profilePic;
          },
          error: (error) => {
            this.toastr.error(cadenaErrores(error));
          }
      });
      });
  }

  ajustesUsuario() {
    const modalRef = this.modalHelperService.abrirModal(AjustesUsuarioComponent);
   
}



  getUserName(): string {
   return this.securityService.getUserName();
  }


 

  cargarCantidadNotificacionesNoLeidas(): Observable<number> {
    return this.notificacionesPushService.obtenerCantidadNotificacionesNoLeidas().pipe(
        map(data => data.cantidad)
    );
}

loadProfilePic(): Observable<string | null> {
    return this.userService.getProfilePic().pipe(
        map((blob: Blob) => {
            if (blob) {
                return URL.createObjectURL(blob);
            }
            return 'assets/img/avatars/default.png';
        })
    );
}

  // Placeholder to open the AI assistant modal/panel
  openAIAssistant(): void {
    const modalRef = this.modalHelperService.abrirModal(AiAssistantComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    } as any);

  }

  changePassword() {
     
      const modalRef = this.modalHelperService.abrirModal(ChangePasswordComponent);

  }

  show2FAModal() {
    const modalRef = this.modalHelperService.abrirModal(EnableTwoFactorAuthComponent);
    
}

}