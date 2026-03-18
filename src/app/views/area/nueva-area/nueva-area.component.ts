import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AreasService } from '../area.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nueva-area',
  templateUrl: './nueva-area.component.html',
  styleUrl: './nueva-area.component.scss',
  standalone:false
})
export class NuevaAreaComponent {

  public StateEnum = TipoAccion.Create;
  public errores: string[];
  public entidad = 'area';

  constructor(private router :Router,
  private areaService :AreasService,
  private spinnerService :SpinnerService,
  private toastr :ToastrService) { }


  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.areaService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess == true) {

          this.toastr.success('Acción exitosa');
          this.router.navigate(['/' + this.entidad + '/ver', respuesta.result.codigo]);
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }

      },
      error: (error) => {
        this.spinnerService.hideGlobalSpinner();
        this.toastr.error(cadenaErrores(error));
      }
    });
  }

}
