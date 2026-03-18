import { Component,  inject, ViewChild } from '@angular/core';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TipoArchivoAnexoService } from '../tipo-archivo-anexo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { FormularioTipoArchivoAnexoComponent } from '../formulario-tipo-archivo-anexo/formulario-tipo-archivo-anexo.component';

@Component({
  selector: 'app-modificar-tipo-archivo-anexo',
  templateUrl: './modificar-tipo-archivo-anexo.component.html',
  styleUrl: './modificar-tipo-archivo-anexo.component.scss',
  standalone:false
})
export class ModificarTipoArchivoAnexoComponent {

  private routeSub: Subscription;
  @ViewChild(FormularioTipoArchivoAnexoComponent) formulario: FormularioTipoArchivoAnexoComponent;

  StateEnum = TipoAccion.Update;
  errores: string[] = [];
  entidad = 'tipoArchivoAnexo';
  modelo: any;
  titulo: string;

  
  constructor(private tipoArchivoAnexoService: TipoArchivoAnexoService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.routeSub = this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarDatos(id);
      } else {
        this.modelo = {};
      }
    });
  }
  private cargarDatos(id: number) {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoAnexoService.consultaId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }
        else {
          this.modelo = {};
          this.toastr.warning(`No existe tipo archivo con descripción ingresada.`, 'Información del Sistema');
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
        this.router.navigate(['/' + this.entidad + '/ver'])
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoAnexoService.editar(this.modelo.idTipoArchivoAnexo, data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess) {
          this.toastr.success('Acción exitosa');
          this.modelo = data;
          this.tipoArchivoAnexoService.notificarActualizacion();
          // this.router.navigate(['/'+this.entidad+'/ver', data.idTipoArchivoAnexo]);
          this.router.navigate(['/'+this.entidad+'/listado']);
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.formulario.resetLoading();
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
        this.formulario.resetLoading();
      }
    });
  }


}
