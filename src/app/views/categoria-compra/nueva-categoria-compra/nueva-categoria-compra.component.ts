import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriaCompraService } from '../categoria-compra.service';
import { FormularioCategoriaCompraComponent } from '../formulario-categoria-compra/formulario-categoria-compra.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-nueva-categoria-compra',
  templateUrl: './nueva-categoria-compra.component.html',
  styleUrl: './nueva-categoria-compra.component.scss',
  standalone:false
})
export class NuevaCategoriaCompraComponent {


  @ViewChild(FormularioCategoriaCompraComponent) formulario: FormularioCategoriaCompraComponent;


  modelo: any;
  errores: string[] = [];
  titulo: string;
  
  public StateEnum = TipoAccion.Create;

  constructor(private categoriaCompraService: CategoriaCompraService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private activeModal: NgbActiveModal) {
    this.titulo = "Nueva Categoría Compra"
  }

  ngOnInit(): void {
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.categoriaCompraService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.categoriaCompraService.notificarActualizacion();
          this.activeModal.close();
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

