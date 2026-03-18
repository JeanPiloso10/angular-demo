import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { PaisesService } from '../paises.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { FormularioPaisComponent } from '../formulario-pais/formulario-pais.component';
import { ButtonModule } from '@coreui/angular';

@Component({
  selector: 'app-modificar-pais',
  templateUrl: './modificar-pais.component.html',
  styleUrl: './modificar-pais.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormularioPaisComponent,
    ButtonModule
  ]
})
export class ModificarPaisComponent {

  @Output() submitEvent = new EventEmitter<any>();

  public modelo: any;
  public StateEnum = TipoAccion.Update;
  @Input() codigo: String;

  constructor(private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private paisService: PaisesService,
    private activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    this.loadModelo();
  }

  private loadModelo(): void {
    this.spinnerService.showGlobalSpinner();
    this.paisService.consultaId(this.codigo).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.cerrar();
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
        this.cerrar();
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.paisService.editar(this.modelo.codigo,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.submitEvent.emit(respuesta.result);
          this.cerrar();
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

  cerrar() {
    this.activeModal.close(); 
  }
}
