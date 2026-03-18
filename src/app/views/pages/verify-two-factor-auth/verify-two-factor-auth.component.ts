import { Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '@core/services/security.service';
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { NgStyle } from '@angular/common';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { delay, filter, finalize, map, tap } from 'rxjs/operators';

import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
  TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
  InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
  ButtonDirective, SpinnerModule,
  ColorModeService, ButtonGroupComponent} from '@coreui/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';

@Component({
  selector: 'app-verify-two-factor-auth',
  standalone: true,
  imports: [ContainerComponent, 
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
    ButtonGroupComponent
  ],
  templateUrl: './verify-two-factor-auth.component.html',
  styleUrl: './verify-two-factor-auth.component.scss'
})
export class VerifyTwoFactorAuthComponent {

  @ViewChild('totpCode') totpCode!: ElementRef;
  form: FormGroup;
  loading = false;
  userId: string;
  errores: string[] = [];
  redirectURL: string | null = null;


  constructor(private fb: FormBuilder,
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

   }
   

   cancel() {
    this.router.navigate(['/login']);
  }


  ngAfterViewInit(): void {
    this.totpCode.nativeElement.focus();
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.redirectURL = this.route.snapshot.queryParams['redirectURL'] || '/';  // Capturar la URL o establecer un valor por defecto
  
    this.form = this.fb.group({
      totpCode: ['', Validators.required]
    });
    
  }

onSubmit() {
  if (this.form.invalid) {
    this.toastr.info('Por favor, complete el campo de código de autenticación de dos factores');
    return;
  }

  this.loading = true;
  const data = { userId: this.userId, totpCode: this.form.value.totpCode };

  this.securityService.verifyTwoFactorAuth(data).pipe(
    finalize(() => this.loading = false)
  ).subscribe({
    next: (response) => {
      this.securityService.saveSession(response.result);
      
      // Redirigir a la URL capturada o a la raíz si no existe ninguna
      const redirectURL = this.redirectURL || '/';
      this.router.navigateByUrl(redirectURL).catch(() => this.router.navigate(['/']));
    },
    error: (err) => {
      this.toastr.error('Código de autenticación inválido');
    }
  });
}

requestAlternativeVerification() {
  this.loading = true;
  this.securityService.requestAlternativeTwoFactorAuthentication(this.userId).pipe(
    finalize(() => this.loading = false)
  ).subscribe({
    next: () => {
      this.toastr.success('Código de verificación enviado a su correo electrónico');
      
      // Obtén el redirectURL de los queryParams actuales y pásalo a la ruta de verificación alternativa
      let redirectURL = this.route.snapshot.queryParams['redirectURL'] || '/';
      this.router.navigate(['/verify-alternative-auth'], { queryParams: { userId: this.userId, redirectURL: redirectURL } });
    },
    error: (err) => {
      this.toastr.error('Error al enviar el código de verificación');
    }
  });
}

}
