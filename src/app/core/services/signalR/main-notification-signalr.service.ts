import { Injectable } from '@angular/core';
import { SignalrNotificationService } from './signalr-notification.service';

/**
 * @deprecated Usar SignalrNotificationService directamente.
 * Este servicio existe solo por compatibilidad - internamente usa SignalrNotificationService.
 * 
 * Ambos servicios comparten la misma conexión WebSocket al hub de notificaciones.
 * No es necesario tener servicios separados para mensajes de usuario vs broadcast,
 * ya que una sola conexión puede recibir ambos tipos de mensajes.
 */
@Injectable({
  providedIn: 'root',
  useExisting: SignalrNotificationService
})
export class MainNotificationSignalrService extends SignalrNotificationService {
}
