import { Component, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SecurityService } from '@core/services/security.service';
import { UsuariosService } from '../../../views/usuarios/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ButtonModule, CardModule, FormModule, GridModule, ButtonGroupModule, BadgeModule, SpinnerModule } from '@coreui/angular';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-enable-two-factor-auth',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, FormModule, GridModule, ButtonGroupModule, BadgeModule, SpinnerModule, ReactiveFormsModule],
  templateUrl: './enable-two-factor-auth.component.html',
  styleUrls: ['./enable-two-factor-auth.component.scss']
})
export class EnableTwoFactorAuthComponent implements OnInit {
  form: FormGroup;


  public qrCodeUrl: string = '';
  public loading = false;
  public displayDiv = false;
  public isTwoFactorEnabled = false;
  public isEmailConfirmed = false;
  public qrCodeGenerated = false; // Variable para manejar el estado del botón

  constructor(private activeModal: NgbActiveModal,
              private securityService: SecurityService,
              private userService: UsuariosService,
              private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.checkTwoFactorAuthStatus();
    this.checkEmailConfirmation();
  }

  checkEmailConfirmation() {
    this.userService.isEmailConfirmed().subscribe({
      next: (response) => {

        this.isEmailConfirmed = response.isConfirmed;
      },
      error: (err) => {
        this.toastr.error('Error al verificar la confirmación del correo electrónico');
      }
    });
  }

  checkTwoFactorAuthStatus() {
    this.loading = true;
    this.userService.checkTwoFactorAuthStatus().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.isTwoFactorEnabled = response.isTwoFactorEnabled;
        this.qrCodeUrl = response.qrCodeUrl;
        if (!this.isTwoFactorEnabled) {
          this.displayDiv = true;
        }
        this.qrCodeGenerated = !!this.qrCodeUrl; // Si ya hay un QR generado, deshabilitar el botón
      },
      error: (err) => {
        this.toastr.error('Error al verificar el estado de 2FA');
      }
    });
  }

  enableTwoFactorAuth() {
    if (!this.isEmailConfirmed) {
      this.toastr.warning('Debe confirmar su correo electrónico antes de habilitar la autenticación de dos factores');
      return;
    }

    this.loading = true;
    this.userService.enableTwoFactorAuth().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.qrCodeUrl = response.qrCodeUrl;
        this.qrCodeGenerated = true; // Deshabilitar el botón después de generar el QR
        this.toastr.success('¡2FA habilitado con éxito!');
      },
      error: (err) => {
        this.toastr.error('Error al habilitar 2FA');
      }
    });
  }

  sendEmailConfirmation() {
    this.loading = true;
    this.userService.sendEmailConfirmation().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastr.success('Enlace de confirmación de correo enviado exitosamente');
      },
      error: (err) => {
        this.toastr.error('Error al enviar el enlace de confirmación de correo');
      }
    });
  }

  cerrar() {
    this.activeModal.close();
  }
}