import { Component , inject} from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { UsuariosService } from '../usuarios.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styleUrl: './nuevo-usuario.component.scss',
  standalone:false
})
export class NuevoUsuarioComponent {

 

  public StateEnum = TipoAccion.Create;
  public errores: string;
  entidad = 'usuario';
  
  constructor( private router : Router,
  private usuarioService :UsuariosService,
  private spinnerService :SpinnerService,
  private toastr:ToastrService) { }


guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.usuarioService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      if (respuesta.isSuccess && respuesta.isSuccess==true) {
        this.toastr.success('Acción exitosa');
        this.router.navigate(['/'+ this.entidad +'/ver', respuesta.result.id]);
      }
      else {
        this.toastr.error(cadenaErrores(respuesta.message));
      }
    },
    error: (error) => {
      this.toastr.error(cadenaErrores(error));
    }
  });
}


}
