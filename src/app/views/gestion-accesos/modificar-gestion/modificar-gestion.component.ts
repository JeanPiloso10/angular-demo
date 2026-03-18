import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { SpinnerService } from '@core/services/spinner.service';
import { GestionAccesosService } from '../gestion-accesos.service';

@Component({
  selector: 'app-modificar-gestion',
  templateUrl: './modificar-gestion.component.html',
  styleUrl: './modificar-gestion.component.scss',
  standalone: false
})
export class ModificarGestionComponent implements OnInit {

  public modelo: any;
  public StateEnum = TipoAccion.Update;
  entidad = 'gestionaccesos';

  constructor(
    private toastr: ToastrService,
    private gestionService: GestionAccesosService,
    private spinnerService: SpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.spinnerService.showGlobalSpinner();
        this.gestionService.obtenerUsuarioPorId(params['id']).pipe(
          finalize(() => this.spinnerService.hideGlobalSpinner())
        ).subscribe({
          next: (respuesta) => {
            if (respuesta.isSuccess == true) {
              this.modelo = respuesta.result;
            }
          },
          error: () => this.router.navigate(['/' + this.entidad + '/ver'])
        });
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.gestionService.editarUsuario(this.modelo.id, data).pipe(
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
