import { Component, inject, OnInit } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from '../menu.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-modificar-menu',
  templateUrl: './modificar-menu.component.html',
  styleUrl: './modificar-menu.component.scss',
  standalone:false
})
export class ModificarMenuComponent implements OnInit {


  public modelo: any;
  public StateEnum = TipoAccion.Update;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private menuService: MenuService,
              private toastr: ToastrService,
              private spinnerService: SpinnerService) {
  }


  ngOnInit(): void {
    // this.spinnerService.showGlobalSpinner();
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.menuService.consultaId(params['id'])
          .subscribe({
            next: (respuesta:any) => {    
              // this.spinnerService.hideGlobalSpinner();          
              if(respuesta.isSuccess == true)
                {
                  this.modelo = respuesta.result;
                }              
            },
            error: () => this.router.navigate(['/menu'])
          });
      },
      error: (error) => {
        // this.spinnerService.hideGlobalSpinner();
        this.toastr.error(cadenaErrores(error))
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.menuService.editar(this.modelo.id,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.router.navigate(['/menu']);
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }        
      },
      error: (error: any) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }
}
