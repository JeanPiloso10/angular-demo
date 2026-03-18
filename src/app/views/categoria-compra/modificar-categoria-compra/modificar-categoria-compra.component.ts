import { Component, inject, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { CategoriaCompraService } from '../categoria-compra.service';
import { FormularioCategoriaCompraComponent } from '../formulario-categoria-compra/formulario-categoria-compra.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-modificar-categoria-compra',
  templateUrl: './modificar-categoria-compra.component.html',
  styleUrl: './modificar-categoria-compra.component.scss',
  standalone:false
})
export class ModificarCategoriaCompraComponent {
  @Input() id: string; // Recibir el id como entrada


  @ViewChild(FormularioCategoriaCompraComponent) formulario: FormularioCategoriaCompraComponent;


  StateEnum = TipoAccion.Update;
  errores: string[] = [];
  entidad = 'categoriaCompra';
  modelo: any;
  titulo: string;

  constructor(private toastr: ToastrService,
              private spinnerService: SpinnerService,
              private activeModal: NgbActiveModal,
              private categoriaService: CategoriaCompraService) {
  }
  ngOnInit(): void {
    
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.categoriaService.editar(this.modelo.codigo, data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess) {
          this.toastr.success('Acción exitosa');
          this.modelo = data;
          this.categoriaService.notificarActualizacion();
          this.activeModal.close();
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.formulario.resetLoading();
        }
      },
      error: (error) => {
        this.spinnerService.hideGlobalSpinner();
        this.formulario.resetLoading();
        this.toastr.error(cadenaErrores(error));
      }
    });
  }
  cerrar() {
  }

}
