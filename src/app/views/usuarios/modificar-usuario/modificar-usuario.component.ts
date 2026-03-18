import { Component, inject, OnInit } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../usuarios.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrl: './modificar-usuario.component.scss',
  standalone:false
})
export class ModificarUsuarioComponent  implements OnInit  {



  public modelo: any;
  public StateEnum = TipoAccion.Update;
  entidad = 'usuario';

  constructor(  private  toastr :ToastrService,
  private  userService :UsuariosService,
  private  spinnerService :SpinnerService,
  private  router :Router,
  private  activatedRoute :ActivatedRoute)
  {

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.spinnerService.showGlobalSpinner();
        this.userService.consultaId(params['id']).pipe(
          finalize(() => this.spinnerService.hideGlobalSpinner())
        ).subscribe({
            next: (respuesta) => {
              if(respuesta.isSuccess == true) {
                this.modelo = respuesta.result;
              }              
            },
            error: () => this.router.navigate(['/usuario'])
          });
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error))
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.userService.editar(this.modelo.id,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/'+ this.entidad +'/ver', respuesta.result.id]);
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
