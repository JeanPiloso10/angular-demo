import { Component, inject, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../usuarios.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subscription } from 'rxjs';


@Component({
  selector: 'app-ver-usuario',
  templateUrl: './ver-usuario.component.html',
  styleUrl: './ver-usuario.component.scss',
  standalone:false
})
export class VerUsuarioComponent implements OnInit {





  public modelo: any;
  public StateEnum = TipoAccion.Read;
  private routeSub: Subscription;
  entidad = 'usuario'; 

  constructor(  private  toastr : ToastrService,
  private  userService: UsuariosService,
  private  spinnerService : SpinnerService,
  private  router : Router,
  private  activatedRoute : ActivatedRoute) {
   
  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarDatos(id);
      } 
      else{
        this.modelo = [];
      }
    });
  }

  
  private cargarDatos(id: string): void {
    this.spinnerService.showGlobalSpinner();
    this.userService.consultaId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {              
        if(respuesta.isSuccess) {
     
          this.modelo = respuesta.result;
        }              
      },
      error: () => this.router.navigate(['/'+this.entidad+'/ver'])
    });
  }

  cerrar() {
    // this.activeModal.close(); 
  }
  

}
