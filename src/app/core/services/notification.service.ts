import { Injectable , inject} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr : ToastrService) { }

  showServerError(): void {
    this.toastr.error('El servidor no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.', 'Error de Conexión', {
      //positionClass: 'toast-center-center', // Asegúrate de usar tu clase personalizada para centralizar el mensaje
      timeOut: 3000,
    });
  }


  
}
