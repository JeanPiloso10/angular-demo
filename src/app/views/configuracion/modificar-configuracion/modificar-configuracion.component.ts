import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionService } from '../configuracion.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-configuracion',
  templateUrl: './modificar-configuracion.component.html',
  styleUrl: './modificar-configuracion.component.scss',
  standalone:false
})
export class ModificarConfiguracionComponent {

  
  @Input() id: number; // Recibir el id como entrada



  StateEnum = TipoAccion.Update;
  errores: string;
  entidad = 'configuracion';
  modelo: any;

  constructor(private activeModal: NgbActiveModal,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private configuracionService: ConfiguracionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService) {
                
  }

  ngOnInit(): void {
    this.loadModelo();
  }

  private loadModelo(): void {
    this.spinnerService.showGlobalSpinner();

    this.configuracionService.consultaId(this.id)
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
    this.configuracionService.editar(this.modelo.idConfiguracion,data).pipe(
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
