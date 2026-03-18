import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReporteService } from '../reporte.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';


@Component({
  selector: 'app-nuevo-reporte',
  templateUrl: './nuevo-reporte.component.html',
  styleUrl: './nuevo-reporte.component.scss',
  standalone:false
})
export class NuevoReporteComponent {

  


  StateEnum = TipoAccion.Create;
  errores: string;
  entidad = 'reporte';
  
  constructor(private toastr: ToastrService,
              private spinnerService: SpinnerService,
              private router: Router,
              private activeModal: NgbActiveModal,
              private reporteService: ReporteService) {
  }


cerrar() {
  this.activeModal.close(); 
}


}
