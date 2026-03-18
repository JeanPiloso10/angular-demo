import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { FormValidationService } from '@core/services/form-validation.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { GestionAccesosService } from '../gestion-accesos.service';

@Component({
  selector: 'app-crear-rol-dialog',
  templateUrl: './crear-rol-dialog.component.html',
  styleUrl: './crear-rol-dialog.component.scss',
  standalone: false
})
export class CrearRolDialogComponent implements AfterViewInit {

  @ViewChild('rolNameInput') rolNameInput!: ElementRef;

  form: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private validationService: FormValidationService,
    private gestionService: GestionAccesosService
  ) {
    this.form = this.formBuilder.group({
      Name: ['', [Validators.required, Validators.minLength(3),
                  this.validationService.primeraLetraMayuscula()]]
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.rolNameInput?.nativeElement?.focus(), 100);
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.gestionService.crearRol(this.form.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess) {
          this.activeModal.close(respuesta.result);
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }
      },
      error: (error) => this.toastr.error(cadenaErrores(error))
    });
  }

  cerrar(): void {
    if (this.loading) {
      this.toastr.warning('Espere a que se complete la operación.');
      return;
    }
    this.activeModal.dismiss();
  }

  obtenerError(campo: string): string {
    const ctrl = this.form.get(campo);
    return ctrl && (ctrl.dirty || ctrl.touched) && ctrl.invalid
      ? this.validationService.obtenerMensajeError(ctrl)
      : '';
  }
}
