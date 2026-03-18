import { Component , inject} from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { MenuService } from '../menu.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-menu',
  templateUrl: './nuevo-menu.component.html',
  styleUrl: './nuevo-menu.component.scss',
  standalone:false
})
export class NuevoMenuComponent {



  StateEnum = TipoAccion.Create;
  errores: string;
  padre_id: null;

constructor(private router: Router,
  private menuService: MenuService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService) {

}

  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.menuService.crear(data).pipe(
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
    error: (error) => {
      this.toastr.error(cadenaErrores(error));
    }
  });
}


}
