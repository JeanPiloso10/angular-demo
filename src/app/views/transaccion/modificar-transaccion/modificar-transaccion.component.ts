import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TransaccionService } from '../transaccion.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-transaccion',
  templateUrl: './modificar-transaccion.component.html',
  styleUrl: './modificar-transaccion.component.scss',
  standalone:false
})
export class ModificarTransaccionComponent {

  


  modelo: any;
  StateEnum = TipoAccion.Update;
  errores: string;
  entidad = 'transaccion';

  constructor(private router: Router,
              private transaccionService: TransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.transaccionService.consultaId(params['id'])
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
    this.transaccionService.editar(this.modelo.idTransaccion,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/'+this.entidad]);
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

}
