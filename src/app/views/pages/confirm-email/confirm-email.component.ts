import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '@core/services/security.service'
import { ToastrService } from 'ngx-toastr';
import { IconDirective } from '@coreui/icons-angular';
import { NgStyle } from '@angular/common';
import { SharedFeaturesModule } from '@shared/shared-features.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { parsearErrores } from '@shared/utilities/parsearErrores'
import { delay, filter, map, tap } from 'rxjs/operators';

import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, 
  TextColorDirective, CardComponent, CardBodyComponent, FormDirective, 
  InputGroupComponent, InputGroupTextDirective, FormControlDirective, 
  ButtonDirective, SpinnerModule , ColorModeService, ButtonGroupComponent} from '@coreui/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initColorModeFromRoute } from '@app/shared-features/utilities/color-mode-theme';


@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
  standalone: true,
  imports: [ContainerComponent, 
    RowComponent, 
    ColComponent, 
    CardGroupComponent, 
    TextColorDirective, 
    CardComponent, 
    CardBodyComponent, 
    ButtonDirective, 
    SpinnerModule,
    SharedFeaturesModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ConfirmEmailComponent implements OnInit {


  loading = true;
  error = false;
  errorMessage = '';


  constructor(private router: Router,
              private securityService: SecurityService,
              private toastr: ToastrService,
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
    const token = this.route.snapshot.queryParams['token'];
    const userName = this.route.snapshot.queryParams['userName'];


    if (token && userName) {
      this.securityService.confirmEmail(token, userName).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastr.success('Correo electrónico confirmado exitosamente.');
        },
        error: (err) => {
          this.loading = false;
          this.error = true;
          this.errorMessage = err.error.message || 'Hubo un error al confirmar su correo electrónico.';
          this.toastr.error(this.errorMessage);
        }
      });
    } else {
      this.loading = false;
      this.error = true;
      this.errorMessage = 'Token o correo electrónico inválido.';
      this.toastr.error(this.errorMessage);
    }
  }


  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}