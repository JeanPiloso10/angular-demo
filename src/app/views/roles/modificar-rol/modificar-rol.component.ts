import { Component, inject, OnInit } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router, ActivatedRoute } from '@angular/router';
import { RolesService } from '../roles.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-rol',
  templateUrl: './modificar-rol.component.html',
  styleUrl: './modificar-rol.component.scss',
  standalone:false
})
export class ModificarRolComponent  implements OnInit {



  public modelo: any;
  public StateEnum = TipoAccion.Update;

  constructor(private activatedRoute: ActivatedRoute,
              private toastr: ToastrService,
              private rolService: RolesService,
              private spinnerService: SpinnerService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.rolService.consultaId(params['id'])
          .subscribe({
            next: (respuesta) => {              
              if(respuesta.isSuccess == true)
                {
                  this.modelo = respuesta.result;
                }              
            },
            error: () => this.router.navigate(['/rol'])
          });
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error))
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.rolService.editar(this.modelo.id,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/rol']);
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
