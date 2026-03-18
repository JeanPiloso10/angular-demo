import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { OperacionTransaccionService } from '../operacion-transaccion.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-operacion-transaccion',
  templateUrl: './modificar-operacion-transaccion.component.html',
  styleUrl: './modificar-operacion-transaccion.component.scss',
  standalone:false
})
export class ModificarOperacionTransaccionComponent {

  


  entidad = 'operaciontransaccion';
  modelo: any;
  StateEnum = TipoAccion.Update;
  errores: string;

  constructor(private toastr: ToastrService,
              private spinnerService: SpinnerService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private operacionTransaccionService: OperacionTransaccionService) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.operacionTransaccionService.consultaId(params['id'])
          .subscribe({
            next: (respuesta) => {              
              if(respuesta.isSuccess == true)
                {
                  this.modelo = respuesta.result;
                }              
            },
            error: () => this.router.navigate(['/'+this.entidad])
          });
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error))
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.operacionTransaccionService.editar(this.modelo.idOperacionTransaccion,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
  
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/'+this.entidad]);
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

}
