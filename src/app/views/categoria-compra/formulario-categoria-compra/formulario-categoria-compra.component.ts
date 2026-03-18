import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { FormValidationService } from '@core/services/form-validation.service';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ChangeDetectorRef } from '@angular/core';
import { TipoCompra } from '../../tipo-compra/interface';
import { TipoCompraService } from '../../tipo-compra/tipo-compra.service';
import { OperacionesDto } from '@app/core/models/operaciones-dto';
import { PermissionService } from '@app/core/services/permission.service';
import { TransactionCode } from '@app/shared-features/enums/TransactionCode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-categoria-compra',
  templateUrl: './formulario-categoria-compra.component.html',
  styleUrl: './formulario-categoria-compra.component.scss',
  standalone:false
})
export class FormularioCategoriaCompraComponent {
  
  public Form: FormGroup;

  @Input() titulo?: string;
  @Input() errores: string[] = [];
  @Input() modelo: any;
  @Input() StateEnum!: TipoAccion;

  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('CategoriaCompraCodigo') CategoriaCompraCodigo!: ElementRef;
  @ViewChild('CategoriaCompraDescripcion') CategoriaCompraDescripcion!: ElementRef;
  @ViewChild('CategoriaCompraTipo') CategoriaCompraTipo!: ComboBoxComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;


  public localFieldsTipoCompra: Object = { text: 'descripcion', value: 'codigo' };
  public cbTipoCompras: TipoCompra[] = [];
  public allowCustomValue: boolean = true;
  public multiselectWaterMark: string = '';
  public default: string = 'Default';
  public estadoBotones = { btnGrabar: false, };
  public loading: boolean = false;
  public tipoCompraSeleccionada: boolean = false;
  permissions: OperacionesDto[] = [];

  
  constructor(
    private router: Router,
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private toastr: ToastrService,
    private tipoCompraService: TipoCompraService,
    private validationService: FormValidationService,
    private activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef) {
    this.initForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      
      if(this.StateEnum === TipoAccion.Create) {
          this.CategoriaCompraCodigo.nativeElement.focus();
      }
      else{
          this.CategoriaCompraDescripcion.nativeElement.focus();
      }
        }, 100);
  }

  async ngOnInit() {
    await this.initializeComponent();
    if (this.StateEnum !== TipoAccion.Create && this.modelo) {
      this.Form.patchValue({
        codigo: this.modelo.codigo,
        descripcion: this.modelo.descripcion,
        tipoCompras: this.modelo.tipoCompras,
        activo: this.modelo.activo, // Obtener el año de la fecha de la orden
      });
    }
    if (this.StateEnum === TipoAccion.Update) {
      this.Form.get('codigo')?.disable();
      this.Form.get('activo')?.enable();
      
    } else {
      this.Form.get('codigo')?.enable();
      this.Form.get('activo')?.disable();

    }

  };

  private async initializeComponent() {
    try {

      this.Form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });

      await this.getPermissions();

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }

      this.Form.get('activo').patchValue(true); 

      this.allowCustomValue = true;
      this.spinnerService.showGlobalSpinner();
      this.loadInitialData();
      this.spinnerService.hideGlobalSpinner();
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    // Establecer allowCustomValue a false después de la carga de datos
    this.allowCustomValue = false;
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

    
    async getPermissions() {
      try {
  
        const results = await firstValueFrom(forkJoin({
          permission: this.permissionService.getPermissionByTransaction(TransactionCode.categoriaCompra).pipe(catchError(error => of({ result: [] })))
    
        }));
  
        
    
          this.permissions = results.permission.result as OperacionesDto[];
  
          if (this.permissions.length === 0) {
            this.router.navigate(['/pages/403']);
        };
        
  
      } catch (error) {
        this.toastr.error(cadenaErrores(error));
      }
    }

  async loadInitialData() {
    try {
      const results = await firstValueFrom(forkJoin({
        tipoCompras: this.tipoCompraService.listado().pipe(catchError(error => of({ result: [] }))),
      }));

      this.cbTipoCompras = results.tipoCompras.result;
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private initForm() {
    this.Form = new FormGroup({
      codigo: new FormControl({ value: null, disabled: false }, [Validators.required, Validators.maxLength(3)]),
      descripcion: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      tipoCompras: new FormControl(null),
      activo: new FormControl(true),
      usuarioCreacion: new FormControl(null),
      fechaCreacion: new FormControl(null),
      equipoCreacion: new FormControl(null),
      usuarioModificacion: new FormControl(null),
      fechaModificacion: new FormControl(null),
      equipoModificacion: new FormControl(null),
    });

  }

  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  cerrar() {
    this.activeModal.close();
  }
  
  guardarCambios(): void {
    // if (this.loading) {
    //   return;
    // }
    // this.loading = true; 
    if (this.Form.valid) {
      const codigo = this.Form.get('codigo')?.value?.toUpperCase();
      const descripcion = this.Form.get('descripcion')?.value?.toUpperCase();
      const updateData = {
        codigo: codigo,
        descripcion: descripcion,
        usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
        fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
        usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
        fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
        accion: this.StateEnum
      };
      this.Form.patchValue(updateData);
      this.onSubmit.emit(this.Form.getRawValue());
    }else {
      this.Form.markAllAsTouched();
      // Verificar qué control tiene error y enfocar
      if (this.Form.get('codigo')?.invalid) {
        this.CategoriaCompraCodigo.nativeElement.focus();
      } else if (this.Form.get('descripcion')?.invalid) {
        this.CategoriaCompraDescripcion.nativeElement.focus();
      } else if (this.Form.get('tipoCompras')?.invalid) {
        this.CategoriaCompraTipo.focusIn();
      }
    }
  }


  async onFocusInput(celda: string) {
    if (celda == "codigo") {
      if (this.Form.get("codigo").value == null) {
        this.toastr.warning(`Ingrese un código.`, 'Información del Sistema');
      } else {
        this.CategoriaCompraDescripcion.nativeElement.focus();
      }
    }
    if (celda == "descripcion") {
      if (this.Form.get("descripcion").value == null) {
        this.toastr.warning(`Seleccione una descripción.`, 'Información del Sistema');
      } else {
        this.CategoriaCompraTipo.focusIn();
      }
    }
  }

  // Método para resetear el estado de carga (puede llamarse desde el padre cuando se complete la acción)
  resetLoading() {
    this.loading = false;
  }

  valueChangeTipoCompra(event: any) {
    // Verificamos si hay elementos seleccionados
    if (event && Array.isArray(event) && event.length > 0) {
      this.tipoCompraSeleccionada = true;  // Habilitar el botón si hay selección
    } else {
      this.tipoCompraSeleccionada = false; // Deshabilitar el botón si no hay selección
    }
    this.cdr.detectChanges(); // Forzar actualización del DOM
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+G' - Grabar
    if (event.altKey && event.key.toLowerCase() === 'g') {
      this.guardarCambios();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

}

