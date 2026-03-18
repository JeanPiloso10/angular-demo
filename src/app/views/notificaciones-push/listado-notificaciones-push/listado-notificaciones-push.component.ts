import { Component, HostListener, OnInit } from '@angular/core';
import { NotificacionesPushService } from '../notificaciones-push.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { formatearFechaEstandard } from '@shared/utilities/formatearFecha'
import { LoadNotificationSignalrService } from '@core/services/signalR/load-notification-signalr.service';
import { NotificationHubMethods } from '@shared/enums/NotificationHubMethods';
import { SecurityService } from '@core/services/security.service';

import { finalize, Subscription } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-listado-notificaciones-push',
  templateUrl: './listado-notificaciones-push.component.html',
  styleUrl: './listado-notificaciones-push.component.scss',
  standalone:false,
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', [
        animate(500) // Duración de la animación: 500ms
      ]),
    ])
  ]
})
export class ListadoNotificacionesPushComponent  implements OnInit {

 
  notificacionesNoLeidas: any[] = [];
  notificacionesLeidas: any[] = [];
  page = 1;
  pageSize = 10;
  isLoading = false;
  hasMore = true;
  // private notificationSubscription: Subscription;
  private isFocused = false; // Indica si la ventana está en foco
  private focusTimerSubscription: Subscription;
  notificacionesNoLeidasCounter: number = 0;


  constructor(
    private notificacionesPushService: NotificacionesPushService,
    private spinnerService: SpinnerService,
    private securityService: SecurityService,
    private loadNotifications: LoadNotificationSignalrService,
    private toastr: ToastrService
  ) { 

    // this.onFocus = this.onFocus.bind(this);
    // this.onBlur = this.onBlur.bind(this);

  }

  ngOnInit(): void {
    this.loadNotifications.startConnection();
    this.subscribeToNotifications(NotificationHubMethods.loadNotificacionPushHub);

    this.cargarNotificacionesNoLeidas();
    this.cargarNotificacionesLeidas();
  }

  private subscribeToNotifications(eventHubName: string) {
    // console.log(eventHubName);
    this.loadNotifications.entityDataChangeListener(
      eventHubName,
      this.handleAddLoadNotificacionPush.bind(this),
      this.handleUpdateLoadNotificacionPush.bind(this),
      null
    );
  }



  private handleAddLoadNotificacionPush = (notificationPush: any) => {
   this.recargarNotificaciones();
  }

  private handleUpdateLoadNotificacionPush = (notificationPush: any) => {

  }


  
  ngOnDestroy(): void {
    this.marcarNotificacionesComoLeidas();
    this.loadNotifications.removeEntityDataChangeListener(NotificationHubMethods.loadNotificacionPushHub);
    // No llamar stopConnection() - el servicio es singleton y otros componentes pueden usarlo
  }


  recargarNotificaciones(): void {
    this.spinnerService.showGlobalSpinner();
    this.notificacionesPushService.obtenerNotificacionesNoLeidas().pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (data) => {
        const nuevasNotificaciones = data.filter(nuevaNotificacion => 
            !this.notificacionesNoLeidas.some(
                notificacion => notificacion.idNotificacionUsuario === nuevaNotificacion.idNotificacionUsuario
            )
        );
        
        // Agregar nuevas notificaciones a la lista existente
        this.notificacionesNoLeidas.push(...nuevasNotificaciones);
        
        // Ordenar la lista por fecha de creación, de más reciente a más antigua
        this.notificacionesNoLeidas.sort((a, b) => {
          return new Date(b.notificacionPush.fechaCreacion).getTime() - new Date(a.notificacionPush.fechaCreacion).getTime();
        });
        
        // Actualizar el contador de notificaciones no leídas
        this.notificacionesNoLeidasCounter = this.notificacionesNoLeidas.length;
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });

    this.page = 1;
    this.notificacionesLeidas = [];
    this.hasMore = true;
    this.cargarNotificacionesLeidas();
}
  
  cargarNotificacionesNoLeidas(): void {
    this.spinnerService.showGlobalSpinner();

    this.notificacionesPushService.obtenerNotificacionesNoLeidas().pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (data) => {
        this.notificacionesNoLeidas = data;

        this.notificacionesNoLeidasCounter = this.notificacionesNoLeidas.length;

        // // Llamar al método para marcar las notificaciones como leídas
        // if (this.notificacionesNoLeidasCounter > 0) {
        //   this.marcarNotificacionesComoLeidas();
        // }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }


  cargarNotificacionesLeidas(): void {

    try
    {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;
      this.spinnerService.showGlobalSpinner();
      this.notificacionesPushService.obtenerNotificacionesLeidas(this.page, this.pageSize).pipe(
        finalize(() => {
          this.spinnerService.hideGlobalSpinner();
          this.isLoading = false;
        })
      ).subscribe({
        next: (data) => {
          // console.log(data);
          this.notificacionesLeidas.push(...data);
  
          if (data.length < this.pageSize) {
            this.hasMore = false; // No hay más notificaciones leídas
          } else {
            this.page++;
          }
        },
        error: (error) => {
          this.toastr.error(cadenaErrores(error));
        }
      });
    }
    catch(error)
    {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    
  }

  marcarNotificacionesComoLeidas(): void {

    
    if (this.notificacionesNoLeidasCounter>0) {
      this.notificacionesPushService.marcarNotificacionesComoLeidas().subscribe({
        next: () => {
          this.notificacionesNoLeidasCounter = 0;
        },
        error: (error) => {
          // this.toastr.error('Error al marcar las notificaciones como leídas.');
        }
      });
    }
  }

  onNotificacionClick(notificacion: any): void {
    if (!notificacion.notificacionPush.clicked) {
        this.notificacionesPushService.marcarNotificacionComoClickeada(notificacion.idNotificacionUsuario).subscribe({
            next: () => {
                // Marcar la notificación como clickeada en la interfaz de usuario
                notificacion.notificacionPush.clicked = true;
            },
            error: (error) => {
                this.toastr.error('Error al marcar la notificación como clickeada');
            }
        });
    }
}

  getDateLabel(date: string): string {
    const notificationDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (notificationDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (notificationDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return 'Notificaciones Anteriores'; // Formato por defecto de fecha
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true; // Mostrar separador para la primera notificación
    const currentDate = new Date(this.notificacionesLeidas[index].notificacionPush.fechaCreacion);
    const previousDate = new Date(this.notificacionesLeidas[index - 1].notificacionPush.fechaCreacion);
    return currentDate.getDate() !== previousDate.getDate();
  }

  formatearFecha(fecha: Date): string {
    return formatearFechaEstandard(fecha);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
      this.cargarNotificacionesLeidas();
    }
  }
}