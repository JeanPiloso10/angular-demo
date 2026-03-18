import { Component, OnInit , inject, DestroyRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores'
import { firstValueFrom } from 'rxjs';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
         TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
         InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
         ButtonDirective, SpinnerModule , ColorModeService,
         GridModule} from '@coreui/angular';
import { NgStyle } from '@angular/common';
import { IconDirective, IconModule, IconSetService } from '@coreui/icons-angular';
import { SecurityService } from '@core/services/security.service'
import { ReactiveFormsModule } from '@angular/forms';
import { delay, filter, finalize, map, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ToastrService } from 'ngx-toastr';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';
import { iconSubset } from '@app/icons/icon-subset';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
            //ContainerComponent, 
            RowComponent, 
            ColComponent, 
            CardGroupComponent, 
            TextColorDirective, 
            CardComponent, 
            CardBodyComponent, 
            FormDirective, 
            InputGroupComponent, 
            InputGroupTextDirective, 
            IconDirective, 
            FormControlDirective, 
            ButtonDirective, 
            SpinnerModule,
            SharedFeaturesModule,
            ReactiveFormsModule,
            GridModule,
            IconModule
            // NgHcaptchaModule
          ],
   providers: [{
              provide: IconSetService,
              useFactory: () => {
                const iconSet = new IconSetService();
                iconSet.icons = {
                  ...iconSubset
                };
                return iconSet;
              }
            }]
          })

export class LoginComponent  implements OnInit {




  loading = false;
  loadingMicrosoftAuth = false;
  redirectURL = "";
  form: FormGroup = new FormGroup({});
  errores: string[] = [];
  captchaToken: string | null = null;
  isInTwoFactorAuthProcess = false;

  tema: string="";
  logo:string="/assets/img/brand/wave002_ISO.svg";
  showPassword = false;
  
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private securityService: SecurityService,
              private toastr: ToastrService,
              private colorModeService: ColorModeService,
              private destroyRef: DestroyRef) {

    initColorModeFromRoute({
      colorModeService: this.colorModeService,
      route: this.route,
      destroyRef: this.destroyRef,
    });
      this.tema= localStorage.getItem('coreui-free-angular-admin-template-theme-default');

      if(this.tema && this.tema.includes("dark")){
        this.logo="/assets/img/brand/wave003_color_V002.svg";
      }else{
        this.logo="/assets/img/brand/wave003_color_V003.svg";
      }
   }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }



  ngOnInit(): void {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  
    // Usar isLoggedIn() en lugar de getToken() para verificar si el token es válido y no está expirado
    const isLoggedIn = this.securityService.isLoggedIn();
    const redirectURL = this.route.snapshot.queryParams['redirectURL'] || '/dashboard';
  
    if (isLoggedIn) {
      this.router.navigateByUrl(decodeURIComponent(redirectURL));
    }
    
  }

  ngOnDestroy(): void {
    if (this.isInTwoFactorAuthProcess) {
      localStorage.removeItem('requiresTwoFactor');
    }
  }
    
    private async checkServerStatus(): Promise<boolean> {
      return firstValueFrom(this.securityService.checkServerStatus());
    }

    onVerify(token: string) {
      this.captchaToken = token;
    }
  
    onExpired() {
      this.captchaToken = null;
    }
  
    onError(error: any) {
      this.toastr.error('Error en la validación del captcha', 'Error');
    }

    async onSubmit() {
      try
      {
        if (this.form.invalid) {
          this.errores = ['Por favor complete todos los campos requeridos.'];
          return;
        }
      
        this.loading = true;
        if (await this.checkServerStatus()) {
          const loginData = { ...this.form.value, captchaToken: this.captchaToken };
          this.securityService.login(loginData).subscribe({
            next: (response: any) => {
              if (response.isSuccess && response.result.requiresTwoFactor) {
                // Guardar el estado de que se requiere 2FA
                this.isInTwoFactorAuthProcess = true;
                localStorage.setItem('requiresTwoFactor', 'true');
                // Obtén el redirectURL de los queryParams actuales
                let redirectURL = this.route.snapshot.queryParams['redirectURL'] || '/';
                this.router.navigate(['/verify-2fa'], { queryParams: { userId: response.result.userId, redirectURL: redirectURL } });
              } else if (response.isSuccess) {
                this.securityService.saveSession(response.result);
                
                // Limpia el estado de 2FA en caso de que se haya completado correctamente
                localStorage.removeItem('requiresTwoFactor');
                
                let params = this.route.snapshot.queryParams;
                let redirectURL = params['redirectURL'] || '/';
                
                // Redirigir a la URL capturada o a la raíz si no existe ninguna
                this.router.navigateByUrl(redirectURL).catch(() => this.router.navigate(['/']));
              } else {
                this.loading = false;
                this.errores = parsearErrores(response);
              }
            },
            error: (errors) => {
              this.loading = false;
              this.errores = parsearErrores(errors);
            }
          });
        } else {
          this.errores = [];
          this.loading = false;
        }
      }
      catch (error) {
        this.loading = false;
        this.toastr.error(cadenaErrores(error));
      }
      finally {
        this.loading = false;
      }
    }

    forgotPassword() {
      this.router.navigate(['/forgot-password']);
    }

  
  async loginWithMicrosoft() {
  
    this.loadingMicrosoftAuth= true;
    try {

      let params = this.route.snapshot.queryParams;
      let returnUrl = params['redirectURL'] || '';

        // 1. Llamar al servicio para obtener la configuración completa de autenticación
        const authConfig = await firstValueFrom(this.securityService.generateMicrosoftAuthConfig(returnUrl));


        // 2. Generar la URL de autenticación con los parámetros recibidos
        const authEndpoint = `${authConfig.baseUrl}/${authConfig.authEndpointTemplate.replace('{tenantId}', authConfig.tenantId)}`;
        const authUrl = `${authEndpoint}?client_id=${authConfig.clientId}&response_type=${authConfig.responseType}&redirect_uri=${encodeURIComponent(authConfig.redirectUri)}&scope=${authConfig.scope}&code_challenge=${authConfig.codeChallenge}&code_challenge_method=S256&state=${authConfig.state}`;

        
        this.loadingMicrosoftAuth= false;


        // 3. Redirige al usuario a Microsoft para autenticación
         window.location.href = authUrl;

  } catch (error) {
    this.loadingMicrosoftAuth= false;
    this.toastr.error(cadenaErrores(error),'Error al obtener la configuración de autenticación.');
  }

  }

}
