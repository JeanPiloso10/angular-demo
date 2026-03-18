import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SecurityService } from './../security.service';
import { BaseSignalrService } from './base-signalr.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrNotificationService extends BaseSignalrService {

  constructor(securityService: SecurityService, ngZone: NgZone) { 
    super(securityService, ngZone);
  }

  protected getHubUrl(): string {
    return `${environment.signalrNotificationURL}`;
  }
}
