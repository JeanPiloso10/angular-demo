import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '@core/services/security.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { parsearErrores } from '@shared/utilities/parsearErrores';
import { delay, filter, finalize, map, tap } from 'rxjs/operators';
import { IconDirective } from '@coreui/icons-angular';
import { NgStyle } from '@angular/common';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';


import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
  TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
  InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
  ButtonDirective, SpinnerModule , ColorModeService, ButtonGroupComponent} from '@coreui/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';


@Component({
  selector: 'app-verify-alternative-auth',
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
  templateUrl: './verify-alternative-auth.component.html',
  styleUrl: './verify-alternative-auth.component.scss'
})
export class VerifyAlternativeAuthComponent {

  @ViewChild('verificationCode') verificationCode!: ElementRef;
  form: FormGroup;
  loading = false;
  userId: string;
  errores: string[] = [];
  redirectURL: string | null = null;
 

  constructor( private fb: FormBuilder,
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
   
   ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.redirectURL = this.route.snapshot.queryParams['redirectURL'] || '/';
    
    this.form = this.fb.group({
      verificationCode: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.verificationCode.nativeElement.focus();
  }

  
  cancel() {
    this.router.navigate(['/login']);
  }


  onSubmit() {
    if (this.form.invalid) {
      this.toastr.info('Por favor, complete el campo de código de verificación.');
      return;
    }
  
    this.loading = true;
    const data = { userId: this.userId, verificationCode: this.form.value.verificationCode };
  
    this.securityService.verifyAlternativeTwoFactorAuth(data).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.securityService.saveSession(response.result);
        
        // Redirigir a la URL capturada o a la raíz si no existe ninguna
        this.router.navigateByUrl(this.redirectURL).catch(() => this.router.navigate(['/']));
      },
      error: (err) => {
        this.toastr.error('Código de verificación inválido');
      }
    });
  }
}
