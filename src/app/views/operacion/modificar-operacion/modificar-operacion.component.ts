import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperacionService } from '../operacion.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-operacion',
  templateUrl: './modificar-operacion.component.html',
  styleUrl: './modificar-operacion.component.scss',
  standalone:false
})
export class ModificarOperacionComponent {




  modelo: any;
  StateEnum = TipoAccion.Update;
  errores: string;

  constructor(private router: Router,
  private operacionService: OperacionService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService,
  private activatedRoute: ActivatedRoute) {

}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.operacionService.consultaId(params['id'])
          .subscribe({
            next: (respuesta) => {              
              if(respuesta.isSuccess == true)
                {
                  this.modelo = respuesta.result;
                }              
            },
            error: () => this.router.navigate(['/operacion'])
          });
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error))
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.operacionService.editar(this.modelo.idOperacion,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
  
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/operacion']);
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
