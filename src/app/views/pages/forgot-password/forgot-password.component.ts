import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '@core/services/security.service'
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { parsearErrores } from '@shared/utilities/parsearErrores'
import { finalize } from 'rxjs';

import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
  TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
  InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
  ButtonDirective, SpinnerModule , ColorModeService, ButtonGroupComponent} from '@coreui/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
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
    ButtonGroupComponent,
    CommonModule
  ]
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;

  public loading = false;
  errores: string[] = [];

  @ViewChild('email') email!: ElementRef;
  
  constructor(private fb: FormBuilder,
              private securityService: SecurityService,
              private toastr: ToastrService,
              private router: Router,
              private colorModeService: ColorModeService,
              private route: ActivatedRoute,
              private destroyRef: DestroyRef) {

     initColorModeFromRoute({
      colorModeService: this.colorModeService,
      route: this.route,
      destroyRef: this.destroyRef,
    });

   }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngAfterViewInit(): void {
    this.email.nativeElement.focus();
  }


  cancel() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errores = ['Por favor ingrese un correo electrónico válido.'];
      return;
    }
    

    this.loading = true;
    this.securityService.forgotPassword(this.form.value.email).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.toastr.success('Enlace de recuperación enviado a su correo electrónico');
        this.router.navigate(['/login']);
      },
      error: (errors) => {
        this.errores = parsearErrores(errors);
      }
    });
  }
}