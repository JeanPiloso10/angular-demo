import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContainerComponent, RowComponent, ColComponent, SpinnerComponent, ButtonDirective, ColorModeService } from '@coreui/angular';
import { SecurityService } from '@core/services/security.service';
import { FirmaTransaccionService } from '@core/services/firma-transaccion.service';
import { TransactionCode } from '@app/shared-features/enums/TransactionCode';
import { SharedFeaturesModule } from "@app/shared-features/shared-features.module";
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';

@Component({
  selector: 'app-aprobar-email',
  templateUrl: './aprobar-email.component.html',
  styleUrls: ['./aprobar-email.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    SpinnerComponent,
    ButtonDirective,
    SharedFeaturesModule
]
})
export class AprobarEmailComponent implements OnInit {
 // Estados del componente
 loading = true;
 procesando = false;
 showConfirmacion = false;
 showError = false;
 showSuccess = false;
 errorMessage = '';
 successMessage = '';

 // Datos del documento (ya no usamos token)
 codigoTransaccion: string = '';
 idDocumento: number = 0;
 idSucursal: number = 0;

 // Resultado de la aprobación
 resultado: any = null;

 constructor(
   private route: ActivatedRoute,
   private router: Router,
   private securityService: SecurityService,
   private firmaTransaccionService: FirmaTransaccionService,
   private colorModeService: ColorModeService,
   private destroyRef: DestroyRef
 ) {
   initColorModeFromRoute({
     colorModeService: this.colorModeService,
     route: this.route,
     destroyRef: this.destroyRef,
   });
 }

 ngOnInit() {
   this.route.queryParams
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe(async params => {
     // Leer parámetros del URL
     this.codigoTransaccion = params['codigoTransaccion'] || '';
     this.idDocumento = parseInt(params['idDocumento'], 10) || 0;
     this.idSucursal = parseInt(params['idSucursal'], 10) || 0;
     
     // Verificar parámetros
     if (!this.codigoTransaccion || !this.idDocumento || !this.idSucursal) {
       this.mostrarError('El enlace de aprobación no es válido. Faltan parámetros requeridos.');
       return;
     }

     // Verificar si el usuario está autenticado
     if (!this.securityService.isLoggedIn()) {
       // Guardar la URL actual para redirigir después del login
       const currentUrl = `/aprobar-email?codigoTransaccion=${this.codigoTransaccion}&idDocumento=${this.idDocumento}&idSucursal=${this.idSucursal}`;
       await this.iniciarLoginMicrosoft(currentUrl);
       return;
     }

     // Usuario autenticado, mostrar confirmación
     this.mostrarConfirmacion();
   });
 }

 private async iniciarLoginMicrosoft(returnUrl: string) {
   try {
     const authConfig = await firstValueFrom(
       this.securityService.generateMicrosoftAuthConfig(returnUrl)
     );
     const authEndpoint = `${authConfig.baseUrl}/${authConfig.authEndpointTemplate.replace('{tenantId}', authConfig.tenantId)}`;
     const authUrl = `${authEndpoint}?client_id=${authConfig.clientId}&response_type=${authConfig.responseType}&redirect_uri=${encodeURIComponent(authConfig.redirectUri)}&scope=${authConfig.scope}&code_challenge=${authConfig.codeChallenge}&code_challenge_method=S256&state=${authConfig.state}`;
     window.location.href = authUrl;
   } catch (error: any) {
     this.mostrarError('Error al iniciar la autenticación: ' + (error?.message || 'Error desconocido'));
   }
 }

 private mostrarConfirmacion() {
   this.loading = false;
   this.showConfirmacion = true;
 }

 async confirmarAprobacion() {
   this.showConfirmacion = false;
   this.procesando = true;
   await this.procesarAprobacion();
 }

 cancelarAprobacion() {
   this.showConfirmacion = false;
   this.cerrarPestana();
 }

 private async procesarAprobacion() {

   try {
     // Llamar al endpoint con los datos del documento (sin token)
     const request = {
       codigoTransaccion: this.codigoTransaccion,
       idDocumento: this.idDocumento,
       idSucursal: this.idSucursal
       // usuarioFirma y equipoFirma se llenan en el backend desde el contexto [Authorize]
     };

     const response = await firstValueFrom(
       this.firmaTransaccionService.aprobarPorEmail(request)
     );

     if (response.isSuccess) {
       this.resultado = response.result;
       this.mostrarExito(response.message || 'Documento aprobado exitosamente');
     } else {
       this.mostrarError(response.message || 'Error al aprobar el documento');
     }
   } catch (error: any) {
     this.mostrarError(error?.error?.message || error?.message || 'Error al procesar la aprobación');
   } finally {
     this.procesando = false;
   }
 }

 private mostrarError(mensaje: string) {
   this.loading = false;
   this.procesando = false;
   this.showError = true;
   this.showSuccess = false;
   this.errorMessage = mensaje;
 }

 private mostrarExito(mensaje: string) {
   this.loading = false;
   this.procesando = false;
   this.showError = false;
   this.showSuccess = true;
   this.successMessage = mensaje;
 }

 irAlDocumento() {
   if (!this.resultado) {
     this.irAlInicio();
     return;
   }

   const { codigoTransaccion, idDocumento } = this.resultado;
   
   switch (codigoTransaccion) {
     case TransactionCode.ordencompra:
       this.router.navigate(['/ordencompra', idDocumento]);
       break;
     case TransactionCode.requisicion:
       this.router.navigate(['/requisicion/ver', idDocumento]);
       break;
     default:
       this.irAlInicio();
   }
 }

 irAlInicio() {
   this.router.navigate(['/']);
 }

 /**
  * Intenta cerrar la pestaña actual.
  * Nota: window.close() solo funciona en pestañas abiertas por script.
  * Si no se puede cerrar, redirige al inicio como fallback.
  */
 cerrarPestana() {
   window.close();
   // Fallback: si no se cerró después de un pequeño delay, redirigir al inicio
   setTimeout(() => {
     this.router.navigate(['/']);
   }, 100);
 }

 getNombreTransaccion(): string {
   if (!this.resultado?.codigoTransaccion) return 'Documento';
   
   const nombres: { [key: string]: string } = {
     [TransactionCode.ordencompra]: 'Orden de Compra',
     [TransactionCode.requisicion]: 'Requisición',
     [TransactionCode.loteRecepcionCompra]: 'Lote de Recepción',
     [TransactionCode.reposicionCaja]: 'Reposición de Caja',
     [TransactionCode.solicitudAnticipo]: 'Solicitud de Anticipo'
   };
   
   return nombres[this.resultado.codigoTransaccion] || 'Documento';
 }

 getEstadoTexto(): string {
   const estado = this.resultado?.resultado;
   if (!estado) return 'Procesado';
   
   const estados: { [key: string]: string } = {
     'A': 'Aprobado',
     'P': 'Pendiente de Aprobación',
     'N': 'Negado'
   };
   
   return estados[estado] || estado;
 }

 getEstadoBadgeClass(): string {
   const estado = this.resultado?.resultado;
   
   switch (estado) {
     case 'A': return 'bg-success';
     case 'P': return 'bg-warning text-dark';
     case 'N': return 'bg-danger';
     default: return 'bg-secondary';
   }
 }

}
