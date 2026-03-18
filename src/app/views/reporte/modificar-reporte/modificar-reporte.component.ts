import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReporteService } from '../reporte.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-reporte',
  templateUrl: './modificar-reporte.component.html',
  styleUrl: './modificar-reporte.component.scss',
  standalone:false
})
export class ModificarReporteComponent {

  
  @Input() id: number; // Recibir el id como entrada



  StateEnum = TipoAccion.Update;
  errores: string;
  entidad = 'reporte';
  modelo: any;

  constructor(private activeModal: NgbActiveModal,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private reporteService: ReporteService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.loadModelo();
  }

  private loadModelo(): void {
    this.spinnerService.showGlobalSpinner();
    this.reporteService.consultaId(this.id).pipe(
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

  
  cerrar() {
    this.activeModal.close(); 
  }

}
