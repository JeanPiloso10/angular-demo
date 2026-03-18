import { Component, inject } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { RolesService } from '../roles.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-rol',
  templateUrl: './nuevo-rol.component.html',
  styleUrl: './nuevo-rol.component.scss',
  standalone:false
})
export class NuevoRolComponent {

  public StateEnum = TipoAccion.Create;
  
  constructor(private router: Router,
    private rolService: RolesService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService) { }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.rolService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/rol']);
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
