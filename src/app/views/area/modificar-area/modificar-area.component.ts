import { Component, inject, ViewChild } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router, ActivatedRoute } from '@angular/router';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../../core/services/spinner.service';
import { AreasService } from '../area.service';
import { FormularioAreaComponent } from '../formulario-area/formulario-area.component';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-modificar-area',
  templateUrl: './modificar-area.component.html',
  styleUrl: './modificar-area.component.scss',
  standalone:false
})
export class ModificarAreaComponent {

  private routeSub: Subscription;
  @ViewChild(FormularioAreaComponent) formulario: FormularioAreaComponent;

  public modelo: any;
  public StateEnum = TipoAccion.Update;
  public errores: string[] = [];
  public entidad = 'area';

  constructor(private toastr :ToastrService,
  private areaService :AreasService,
  private spinnerService :SpinnerService,
  private router :Router,
  private activatedRoute :ActivatedRoute)
  {

  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe({
      next: (params) => {
        const id = params['id'];
        if (id) {
          this.cargarDatos(id);
        } else {
          this.modelo = {};
        }
      },
      error: (err) => {
        this.toastr.error('Error al cargar la página', 'Error');
      }
    });
  }

  private cargarDatos(id: string) {
    this.spinnerService.showGlobalSpinner();
    this.areaService.consultaId(id).pipe(
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
    this.areaService.editar(this.modelo.codigo, data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess) {
          this.toastr.success('Acción exitosa');
          this.modelo = data;
          this.areaService.notificarActualizacion();
          this.router.navigate(['/'+this.entidad+'/ver', data.codigo]);
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
