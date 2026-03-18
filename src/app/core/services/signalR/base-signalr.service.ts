import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { SecurityService } from './../security.service';
import { NotificationHubMethods } from '@shared/enums/NotificationHubMethods';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseSignalrService {

  protected hubConnection: signalR.HubConnection | null = null;
  protected abstract getHubUrl(): string;
  private subscribedEvents = new Map<string, Set<(action: string, entity: any) => void>>();
  private connectionPromise: Promise<void> | null = null;
  private reconnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected securityService: SecurityService,
    protected ngZone: NgZone
  ) {}

  /**
   * Inicia la conexión de forma lazy y no bloqueante.
   * Múltiples llamadas son seguras - solo se crea una conexión.
   */
  public startConnection(): void {
    // Ejecutar fuera de Angular para no bloquear change detection
    this.ngZone.runOutsideAngular(() => {
      this.ensureConnection();
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.securityService.isLoggedIn()) {
      return;
    }

    // Si ya hay una conexión activa o en proceso, no hacer nada
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Evitar conexiones en proceso de reconexión automática
    if (this.hubConnection?.state === signalR.HubConnectionState.Connecting ||
        this.hubConnection?.state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    this.connectionPromise = this.createAndStartConnection();
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async createAndStartConnection(): Promise<void> {
    this.reconnecting = true;

    // Verificar si el usuario está logueado (esto ya valida el token con el huso horario correcto)
    if (!this.securityService.isLoggedIn()) {
      if (!environment.production) console.warn('[SignalR] Usuario no logueado o token expirado');
      return;
    }

    // Limpiar conexión anterior si existe
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch {
        // Ignorar errores al detener
      }
      this.hubConnection = null;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => {
          const token = this.securityService.getToken();
          if (!token && !environment.production) {
            console.warn('[SignalR] No hay token disponible');
          }
          return token ?? '';
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Si hay error de handshake, esperar más tiempo
          if (retryContext.retryReason?.message?.includes('handshake')) {
            return 5000;
          }
          // Backoff exponencial: 2s, 4s, 8s, 16s, luego 30s máximo
          if (retryContext.previousRetryCount < 4) {
            return 2000 * Math.pow(2, retryContext.previousRetryCount);
          }
          return 30000;
        }
      })
      .configureLogging(!environment.production ? signalR.LogLevel.Warning : signalR.LogLevel.None)
      .build();

    // Timeouts más tolerantes
    this.hubConnection.serverTimeoutInMilliseconds = 60000;
    this.hubConnection.keepAliveIntervalInMilliseconds = 15000;

    // Mensaje de confirmación del servidor
    this.hubConnection.on(NotificationHubMethods.receiveMessage, () => {
      this.reconnectAttempts = 0;
    });

    // Eventos de ciclo de vida
    this.hubConnection.onreconnecting(() => {
      if (!environment.production) console.debug('[SignalR] Reconectando...');
    });

    this.hubConnection.onreconnected(() => {
      if (!environment.production) console.debug('[SignalR] Reconectado');
      this.reconnectAttempts = 0;
      this.resubscribeAllEvents();
    });

    this.hubConnection.onclose((error) => {
      if (!environment.production) console.debug('[SignalR] Conexión cerrada', error?.message);
      if (this.reconnecting && this.securityService.isLoggedIn()) {
        this.scheduleManualReconnect();
      }
    });

    try {
      await this.hubConnection.start();
      if (!environment.production) console.debug('[SignalR] Conectado exitosamente');
      this.reconnectAttempts = 0;
      this.resubscribeAllEvents();
    } catch (error: any) {
      if (!environment.production) console.warn('[SignalR] Error al conectar:', error?.message || error);
      
      // Si es error de handshake cancelado, puede ser problema de token
      if ((error?.message?.includes('Handshake was canceled') || 
          error?.message?.includes('handshake')) && !environment.production) {
        console.warn('[SignalR] Error de handshake - posible problema de autenticación');
      }
      
      this.hubConnection = null;
      this.scheduleManualReconnect();
    }
  }

  /**
   * Reconexión manual con backoff exponencial - cuando falla la reconexión automática
   */
  private scheduleManualReconnect(): void {
    this.clearReconnectTimeout();

    if (!this.reconnecting || !this.securityService.isLoggedIn()) {
      return;
    }

    this.reconnectAttempts++;
    
    // Delays: 30s, 60s, 120s, luego 5 min máximo
    const delay = this.reconnectAttempts <= 3
      ? 30000 * Math.pow(2, this.reconnectAttempts - 1)
      : 300000;

    this.reconnectTimeoutId = setTimeout(() => {
      if (this.reconnecting && this.securityService.isLoggedIn()) {
        this.ensureConnection();
      }
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  public stopConnection(): void {
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    this.clearReconnectTimeout();
    
    // Limpiar todas las suscripciones
    this.subscribedEvents.clear();
    
    if (this.hubConnection) {
      this.hubConnection.stop().catch(() => {});
      this.hubConnection = null;
    }
    
    // Resetear promise de conexión
    this.connectionPromise = null;
    
    if (!environment.production) {
      console.debug('[SignalR] Conexión detenida por logout');
    }
  }

  /**
   * Fuerza un intento de reconexión inmediato.
   * Útil para llamar después de detectar que el servidor está disponible.
   */
  public retryConnection(): void {
    // Ejecutar fuera de Angular para no afectar UI
    this.ngZone.runOutsideAngular(() => {
      if (!this.securityService.isLoggedIn()) {
        return;
      }
      
      this.clearReconnectTimeout();
      this.reconnectAttempts = 0;
      this.hubConnection = null;
      this.connectionPromise = null;
      this.reconnecting = true;
      this.ensureConnection();
    });
  }

  public isConnectionActive(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Registra listeners para eventos de datos.
   * La conexión se inicia automáticamente si no está activa.
   */
  public entityDataChangeListener(
    eventHubName: string,
    handleCreate?: (entity: any) => void, 
    handleUpdate?: (entity: any) => void, 
    handleDelete?: (entity: any) => void
  ): void {
    const handler = (action: string, entity: any) => {
      // Ejecutar dentro de Angular para trigger change detection
      this.ngZone.run(() => {
        switch (action) {
          case 'Create':
            handleCreate?.(entity);
            break;
          case 'Update':
            handleUpdate?.(entity);
            break;
          case 'Delete':
            handleDelete?.(entity);
            break;
        }
      });
    };

    // Guardar en el mapa de suscripciones
    if (!this.subscribedEvents.has(eventHubName)) {
      this.subscribedEvents.set(eventHubName, new Set());
    }
    this.subscribedEvents.get(eventHubName)!.add(handler);

    // Si la conexión está activa, suscribir inmediatamente
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.on(eventHubName, handler);
    }

    // Asegurar que la conexión esté iniciada (no bloqueante)
    this.startConnection();
  }

  public removeEntityDataChangeListener(eventHubName: string): void {
    this.subscribedEvents.delete(eventHubName);
    this.hubConnection?.off(eventHubName);
    if (!environment.production) {
      console.debug(`[SignalR] Handler removido: ${eventHubName}, total suscripciones: ${this.subscribedEvents.size}`);
    }
  }

  private resubscribeAllEvents(): void {
    if (!this.hubConnection) return;

    if (!environment.production) {
      console.debug(`[SignalR] Re-suscribiendo ${this.subscribedEvents.size} eventos...`);
    }

    this.subscribedEvents.forEach((handlers, eventHubName) => {
      this.hubConnection!.off(eventHubName);
      handlers.forEach(handler => {
        this.hubConnection!.on(eventHubName, handler);
      });
      if (!environment.production) {
        console.debug(`[SignalR] Re-suscrito: ${eventHubName} (${handlers.size} handlers)`);
      }
    });
  }
}
