import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { PuertosService } from '../puertos.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-puerto',
  templateUrl: './modificar-puerto.component.html',
  styleUrl: './modificar-puerto.component.scss',
  standalone:false
})
export class ModificarPuertoComponent {



  modelo: any;
  StateEnum = TipoAccion.Update;
  errores: string;
  entidad = 'puerto';

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private puertoService: PuertosService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.puertoService.consultaId(params['id'])
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
    this.puertoService.editar(this.modelo.codigo,data).pipe(
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
