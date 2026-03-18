import { Component, ElementRef, EventEmitter, inject, Input, input, OnInit, Output, ViewChild } from '@angular/core';
import { FormValidationService } from '@core/services/form-validation.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { ButtonCloseDirective } from '@coreui/angular';

import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule as GridCoreUI,
  ButtonGroupModule,
  BadgeModule,
  SpinnerModule,
} from '@coreui/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { iconSubset } from '@app/icons/icon-subset';

@Component({
  selector: 'app-sucursal-empresa',
  standalone: true,
  imports: [ButtonModule,
    ReactiveFormsModule,
    CardModule,
    FormModule,
    GridCoreUI,
    CommonModule,
    ButtonGroupModule,
    BadgeModule,
    SpinnerModule,
    CardModule,
    IconModule,
    ButtonCloseDirective,
  ],
  providers: [ {
        provide: IconSetService,
        useFactory: () => {
          const iconSet = new IconSetService();
          iconSet.icons = {
            ...iconSubset
          };
          return iconSet;
        }
      }],
  templateUrl: './sucursal-empresa.component.html',
  styleUrl: './sucursal-empresa.component.scss'
})
export class SucursalEmpresaComponent implements OnInit {
  Form: FormGroup;
  

  @Input() modelo: any;
  @Input() StateEnum: any;

  @Output() submitEvent = new EventEmitter<any>();
  @ViewChild('codigoSucursal') codigoSucursal!: ElementRef;
  @ViewChild('descripcion') descripcion!: ElementRef;

  constructor(private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private validationService: FormValidationService) {
    this.Form = this.initForm();
  }

  ngOnInit(): void {

    this.initializeComponent();
  }

  ngAfterViewInit(): void {

    setTimeout(() => { this.codigoSucursal.nativeElement.focus();}, 100);
}


  private async initializeComponent() {
    try {
      this.Form.disable();
      await this.patchFormValues();
      this.barraBotones();


    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  barraBotones(): void {
    if (this.StateEnum === TipoAccion.Update || this.StateEnum === TipoAccion.Read ) {
      this.Form.get('descripcion')?.enable();
      this.Form.get('activo')?.enable();
    }
    else
    {
      this.Form.enable();
    }
  }

  private async patchFormValues() {
    if ((this.StateEnum === TipoAccion.Update || this.StateEnum === TipoAccion.Read) && this.modelo) {
      this.Form.patchValue({
        codigoSucursal: this.modelo.codigoSucursal,
        codigoDivision: this.modelo.codigoDivision,
        descripcion: this.modelo.descripcion,
        activo:  this.modelo.activo,
        estado: this.modelo.estado
      });
    }
    else if (this.StateEnum === TipoAccion.Create)
    {
      this.Form.patchValue({
        estado: TipoAccion.Create
      });
    }
  }
  

  private initForm(): FormGroup {
    return this.initFormGroup({
      codigoSucursal: ['', [Validators.required,Validators.maxLength(2)]],
      codigoDivision: ['', [Validators.required,Validators.maxLength(2)]],
      descripcion: ['', [Validators.required,Validators.maxLength(50)]],
      estado: [null],
      activo: [true]
    });
  }
  private initFormGroup(config: any): FormGroup {
    return this.formBuilder.group(config);
  }
  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }
  toUpperCase(event: any): void {
    event.target.value = event.target.value.toUpperCase();
  }
  cerrar() {
    this.activeModal.close();
  }

  aceptar() {
    if (this.Form.valid) {
      const data = {
        codigoSucursal: this.Form.get("codigoSucursal")?.value.toUpperCase(),
        codigoDivision: this.Form.get("codigoDivision")?.value.toUpperCase(),
        descripcion: this.Form.get("descripcion")?.value.toUpperCase(),
        estado: this.Form.get("estado")?.value,
        activo: this.Form.get("activo")?.value,
      }
      this.submitEvent.emit(data);
      this.activeModal.close();
    } else {
      this.getInvalidControls();
    }
  }
  getInvalidControls() {
    const controls = this.Form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.Form.controls[name].markAsTouched();
      }
    }
  }
}
