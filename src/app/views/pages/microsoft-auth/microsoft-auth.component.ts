import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '@core/services/security.service'
import { ColorModeService} from '@coreui/angular';
import { delay, filter, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContainerComponent, RowComponent, ColComponent, InputGroupComponent, 
  InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';


@Component({
  selector: 'app-microsoft-auth',
  standalone: true,
  imports: [CommonModule, ContainerComponent, RowComponent, ColComponent, InputGroupComponent, ButtonDirective],
  templateUrl: './microsoft-auth.component.html',
  styleUrl: './microsoft-auth.component.scss'
})
export class MicrosoftAuthComponent {
  showError: boolean = false;   // Inicialmente, no hay error
  errorMessage: string = '';    // Inicialmente, no hay mensaje de error

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private securityService: SecurityService,
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
    this.route.queryParams.subscribe(params => {
        const loginResponseJson = params['loginResponse'];

        if (loginResponseJson) {
          try {
              const response = JSON.parse(decodeURIComponent(loginResponseJson));


              if (response.isSuccess) {

                const userId = response.result.user.id;
                const requiresTwoFactor =  response.result.user.twoFactorEnabled;
                const returnUrl = response.returnUrl;
                
                if(requiresTwoFactor)
                {
                  localStorage.setItem('requiresTwoFactor', 'true');
                  this.router.navigate(['/verify-2fa'], { queryParams: { userId: userId, redirectURL: returnUrl } });
                }
                else
                {

                  // Si la autenticación fue exitosa
                  this.securityService.saveSession(response.result);

                  // Limpia el estado de 2FA en caso de que se haya completado correctamente
                  localStorage.removeItem('requiresTwoFactor');

                  this.router.navigateByUrl(returnUrl).catch(() => this.router.navigate(['/']));
                }

              } else {
                  // Si hubo un error en la autenticación
                  // console.error('Error en la autenticación:', response.message);
                  this.showError = true; // Mostrar mensaje de error
                  this.errorMessage = response.message; // Guardar mensaje de error
              }
          } catch (error) {
              // console.error('Error al procesar loginResponse', error);
              this.showError = true; // Mostrar mensaje de error genérico
              this.errorMessage = 'Error al procesar la respuesta de autenticación.';
          }
      } else {
          // console.error('No se recibió loginResponse en la autenticación con Microsoft');
          this.showError = true; // Mostrar mensaje de error genérico
          this.errorMessage = 'No se recibió la respuesta de autenticación.';
      }
  });
  }

  navigate() {
    this.router.navigateByUrl("/login");
 }

}
