import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { MotivoAuditoriaTransaccionService } from '../motivo-auditoria-transaccion.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-motivo-auditoria-transaccion',
  templateUrl: './modificar-motivo-auditoria-transaccion.component.html',
  styleUrl: './modificar-motivo-auditoria-transaccion.component.scss',
  standalone:false
})
export class ModificarMotivoAuditoriaTransaccionComponent {
  @Input() id: number; // Recibir el id como entrada

  

  StateEnum = TipoAccion.Update;
  errores: string[];
  entidad = 'secuencias';
  modelo: any;
  

  constructor(private motivoAuditoriaTransaccionService: MotivoAuditoriaTransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private activeModal: NgbActiveModal) {
  }


  ngOnInit(): void {
    this.loadModelo();
  }

  private loadModelo(): void {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaTransaccionService.consultaId(this.id)
      .subscribe({
        next: (respuesta) => {
          this.spinnerService.hideGlobalSpinner();
         
          if (respuesta.isSuccess) {
            this.modelo = respuesta.result;
          } else {
            this.toastr.error(cadenaErrores(respuesta.message));
            this.cerrar();
          }
        },
        error: (error) => {
          this.spinnerService.hideGlobalSpinner();
          this.toastr.error(cadenaErrores(error));
          this.cerrar();
        }
      });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaTransaccionService.editar(this.modelo.idMotivoAuditoriaTransaccion,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.cerrar();
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

  cerrar() {
    this.activeModal.close(); 
  }
  
}


