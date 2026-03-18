import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuariosService } from '../../../views/usuarios/usuarios.service'
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';
import {  ButtonModule,
          CardModule,
          FormModule,
          GridModule,
          ButtonGroupModule,
          BadgeModule,
          SpinnerModule} from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-profile-pic',
  templateUrl: './change-profile-pic.component.html',
  styleUrl: './change-profile-pic.component.scss',
  standalone: true,
  imports: [ButtonModule,
            CardModule,
            FormModule,
            GridModule,
            ButtonGroupModule,
            BadgeModule,
            SpinnerModule,
            ReactiveFormsModule]
})
export class ChangeProfilePicComponent {



  public loading = false;
  public imageModel: any;
  public selectedFile: any = null;


  @Input() errores: string[] = [];
  

  constructor(  private  activeModal : NgbActiveModal,
  private  userService : UsuariosService,
  private  toastr : ToastrService) {
   
  }

  grabar() {
    if (this.selectedFile == null) {

      this.toastr.error('Seleccione una imagen válida.');
      
    } else if (!this.selectedFile.type.startsWith('image/')) {
      this.selectedFile = null;

      this.toastr.error('Sólo se permiten archivos tipo imagen.');

    } else {
      if (this.selectedFile.size > 1000000) {

        this.toastr.error('El tamaño de la imagen es mayor a 1MB.');

        return;
      } else {

        this.loading = true;
        this.userService.changeProfilePic(this.selectedFile).pipe(
          finalize(() => this.loading = false)
        ).subscribe({
          next: (respuesta) => {
              this.toastr.success('Imagen de perfil actualizada correctamente.');
              this.activeModal.close();
          },
          error: (error) => {
            this.toastr.error(cadenaErrores(error));
          }
        });
      }
    }    
  }

  onFileSelected(event: any) {
    this.selectedFile = <File>event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (_event) => {
      this.imageModel = reader.result;
    };
  }

  
cerrar()
{
  this.activeModal.close(); // O usar .close() según corresponda
}
}
