import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '@core/services/security.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { parsearErrores } from '@shared/utilities/parsearErrores';
import { delay, filter, finalize, map, tap } from 'rxjs/operators';
import { IconDirective, IconModule, IconSetService } from '@coreui/icons-angular';
import { NgStyle } from '@angular/common';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';

import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
  TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
  InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
  ButtonDirective, SpinnerModule , ColorModeService} from '@coreui/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';
import { iconSubset } from '@app/icons/icon-subset';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
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
    CommonModule,
    IconModule
  ],
  providers: [{
    provide: IconSetService,
    useFactory: () => {
      const iconSet = new IconSetService();
      iconSet.icons = { ...iconSubset };
      return iconSet;
    }
  }]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  token: string;
  userName: string;
  errores: string[] = [];
  showPassword = false;
  showConfirmPassword = false;

  @ViewChild('password') password!: ElementRef;


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

   }

   ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = decodeURIComponent(params['token']);
      this.userName = decodeURIComponent(params['userName']);
    });
  
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatch });
  }

  
  ngAfterViewInit(): void {
    this.password.nativeElement.focus();
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errores = ['Por favor complete todos los campos requeridos.'];
      return;
    }

    this.loading = true;
    const resetPasswordData = {
      userName: this.userName,
      token: this.token,
      newPassword: this.form.value.password
    };

    this.securityService.resetPassword(resetPasswordData).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastr.success('Contraseña restablecida con éxito.');
        this.router.navigate(['/login']);
      },
      error: (errors) => {
        this.errores = parsearErrores(errors);
      }
    });
  }
}