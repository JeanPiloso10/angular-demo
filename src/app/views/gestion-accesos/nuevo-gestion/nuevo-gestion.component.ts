import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { SpinnerService } from '@core/services/spinner.service';
import { GestionAccesosService } from '../gestion-accesos.service';

@Component({
  selector: 'app-nuevo-gestion',
  templateUrl: './nuevo-gestion.component.html',
  styleUrl: './nuevo-gestion.component.scss',
  standalone: false
})
export class NuevoGestionComponent {

  public StateEnum = TipoAccion.Create;
  public errores: string;
  entidad = 'gestionaccesos';

  constructor(
    private router: Router,
    private gestionService: GestionAccesosService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService
  ) {}

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.gestionService.crearUsuario(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/' + this.entidad + '/ver', respuesta.result.id]);
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }
}
