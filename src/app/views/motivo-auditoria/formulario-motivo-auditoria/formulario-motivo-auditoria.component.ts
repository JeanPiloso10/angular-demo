import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Query } from '@syncfusion/ej2-data';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, forkJoin, of, Subject, switchMap } from 'rxjs';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import { FormValidationService } from '@core/services/form-validation.service';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { CommandModel, EditSettingsModel, IEditCell, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { Router } from '@angular/router';
import { Operacion } from '@shared/enums/Operacion';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { MotivoAuditoriaService } from '../motivo-auditoria.service';
import { MotivoAuditoria } from '../interfaces';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-formulario-motivo-auditoria',
  templateUrl: './formulario-motivo-auditoria.component.html',
  styleUrl: './formulario-motivo-auditoria.component.scss',
  standalone:false
})
export class FormularioMotivoAuditoriaComponent {
  public Form: FormGroup;
  @Input() titulo?: string;
  @Input() errores: string[] = [];
  @Input() modelo: any;
  @Input() StateEnum!: TipoAccion;
  @Input() modalTransaccion: string[] = [];
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() modificarEvent = new EventEmitter<string>();
  @ViewChild('MotivoAuditoriaId') MotivoAuditoriaId!: ElementRef;
  @ViewChild('MotivoAuditoriaDescripcion') MotivoAuditoriaDescripcion!: ComboBoxComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  public data?: Object[];
  public editSettings?: EditSettingsModel;
  public commands?: CommandModel;
  public allowCustomValue: boolean = true;
  public multiselectWaterMark: string = '';
  public default: string = 'Default';
  public nombreIcono: string = "cil3d";
  public estadoBotones = { btnNuevo: false, btnModificar: false, btnGrabar: false, btnAnular: false, btnSalir: false };
  public editSettings2?: EditSettingsModel;
  public toolbar?: ToolbarItems[];
  public stringParams?: IEditCell;
  public loading: boolean = false;
  public tipoSeleccionado: boolean = false;
  public permissions: OperacionesDto[] = [];
  public searchTextMotivoAuditoriaChanged = new Subject<string>();
  public motivoAuditoriaList: any[];
  public fieldsMotivoAuditoria: Object = { text: 'descripcion', value: 'idMotivoAuditoria' };
  private entidad = 'motivoAuditoria';
  public isLoadingSearchMotivoAuditoria = false;
  
  constructor(
    private router: Router,
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private motivoAuditoriaService: MotivoAuditoriaService,
    private toastr: ToastrService,
    private validationService: FormValidationService) {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.MotivoAuditoriaId.nativeElement.focus();
  }

  async ngOnInit() {
    try {

      // Suscripción a los cambios de valor del checkbox
      this.Form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });
      
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }

    this.initializeComponent();
  };

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.motivoAuditoria).pipe(catchError(error => of({ result: [] })))
      }));
      this.permissions = results.permission.result as OperacionesDto[];
      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
      };
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async btnNuevoRegistro() {
    this.router.navigate(['/' + this.entidad + '/nuevo']);
  }

  async btnModificarRegistro() {
    try {
      let idMotivoAuditoria = this.Form.get("idMotivoAuditoria")?.value;
      if (idMotivoAuditoria != undefined && idMotivoAuditoria != "") {
        this.router.navigate(['/' + this.entidad + '/modificar', idMotivoAuditoria]);
      } else {
        this.toastr.warning('Seleccione descripción');
      }
    } catch (error) {
      this.errores = parsearErrores(error);
      const mensajeError = this.errores.join(', ');
      this.toastr.error(mensajeError);
    }
  }

  barraBotones() {
    if (this.StateEnum == TipoAccion.Read) {
      this.estadoBotones.btnNuevo = this.modalTransaccion && this.modalTransaccion[0] ? false : this.tienePermiso(Operacion.Crear) ? true : false;
      this.estadoBotones.btnModificar = (this.modelo && this.tienePermiso(Operacion.Modificar) == true) ? true : false;
      this.estadoBotones.btnAnular = (this.modelo && this.tienePermiso(Operacion.Anular) == true) ? true : false;
      this.estadoBotones.btnGrabar = false;
      this.estadoBotones.btnSalir = this.modalTransaccion && this.modalTransaccion[0] ? false : true;
      this.Form.disable();
      this.Form.get('idMotivoAuditoria')?.enable();
      this.Form.get('descripcion')?.enable();
      if (this.modalTransaccion && this.modalTransaccion[0] == Operacion.Leer) {
        this.Form.get('descripcion')?.disable();
      }
      this.MotivoAuditoriaId.nativeElement.focus();
    } else if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
      this.estadoBotones.btnNuevo = false;
      this.estadoBotones.btnModificar = false;
      this.estadoBotones.btnAnular = false;
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnSalir = this.modalTransaccion && this.modalTransaccion[0] ? false : true;
      this.Form.enable();
      this.Form.get('idMotivoAuditoria')?.disable();
      if (this.StateEnum == TipoAccion.Create) {
        this.MotivoAuditoriaDescripcion.focusIn();
        this.Form.get('activo')?.disable();
      } else if (this.StateEnum == TipoAccion.Update) {

        this.MotivoAuditoriaDescripcion.focusIn();
        this.Form.get('activo')?.disable();
      } else {
        this.MotivoAuditoriaId.nativeElement.focusIn();
        this.Form.get('activo')?.enable();
      }

      this.Form.get('usuarioCreacion')?.disable();
      this.Form.get('equipoCreacion')?.disable();
      this.Form.get('fechaCreacion')?.disable();
      this.Form.get('usuarioModificacion')?.disable();
      this.Form.get('fechaModificacion')?.disable();
      this.Form.get('equipoModificacion')?.disable();
    }
    if (this.modelo) {
      if (this.modelo.usuarioCreacion) {
      }
    }
  }

  debouncedGetMotivoAuditoria(event: FilteringEventArgs) {
    if (this.StateEnum === TipoAccion.Read) {
      const query: string = event.text;
      if (query.length >= 3 && !this.isLoadingSearchMotivoAuditoria) { // Solo emitir si no hay una petición en curso
        this.searchTextMotivoAuditoriaChanged.next(query);
      }
    }
  }

  debounceMotivoAuditoria() {
    if (this.StateEnum === TipoAccion.Read) {
      this.searchTextMotivoAuditoriaChanged.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(query => {
          this.isLoadingSearchMotivoAuditoria = true;
          return this.motivoAuditoriaService.getMotivoAuditoriaFilter(query).pipe(
            catchError(error => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoadingSearchMotivoAuditoria = false)
          );
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            if (response.isSuccess) {
              this.motivoAuditoriaList = response.result;
            } else {
              this.toastr.error(response.message || 'Error al cargar los productos.');
            }
          }
        },
        error: (err) => {
          this.toastr.error(cadenaErrores(err));
        }
      });
    }
  }

 
 async cancelar() {
   if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
     const result = await Swal.fire({
             title: 'Confirmación',
             text: '¿Desea cancelar la operación?',
             icon: 'warning',
             showCancelButton: true,
             confirmButtonColor: '#3085d6',
             cancelButtonColor: '#d33',
             confirmButtonText: 'Sí, cancelar!',
             cancelButtonText: 'Cancelar'
           });
           if (result.isConfirmed) {
             try {
               this.cancelarFormulario();
     
             } catch (errores) {
               this.toastr.error(cadenaErrores(errores));
             } finally {
               this.spinnerService.hideGlobalSpinner();
             }
           }
   }
   else {
     this.cancelarFormulario();
   }
  
 }
 cancelarFormulario() {
   if (this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Create) {
     this.router.navigate(['/'+ this.entidad +'/ver']);
     //this.router.navigate(['/'+ this.entidad +'/listado']);
 
   }
   else {
     this.router.navigate(['/'+ this.entidad +'/listado']);
   }
 }
 

  onBuscarMotivoAuditoria(): void {
    try {
      if (this.StateEnum == TipoAccion.Read) {
        this.spinnerService.showGlobalSpinner();
        const idMotivoAuditoria = this.Form.get("idMotivoAuditoria")?.value;
        if (idMotivoAuditoria != undefined && idMotivoAuditoria != "") {
          this.motivoAuditoriaService.consultaId(idMotivoAuditoria).subscribe((response: any) => {
            if (response.isSuccess && response.result != null) {
              const idMotivoAuditoria = response.result.idMotivoAuditoria;
              this.router.navigate(['/' + this.entidad + '/ver', idMotivoAuditoria]);
            } else {
              this.toastr.warning('No existe motivo de auditoría con el código ingresado.');
              this.Form.reset();
              this.Form.get("idMotivoAuditoria")?.patchValue(idMotivoAuditoria);
              this.MotivoAuditoriaId.nativeElement.focus();
            };
            this.spinnerService.hideGlobalSpinner();
          });
        } else {
          this.toastr.warning('Ingrese un código del tipo de archivo.');
          this.spinnerService.hideGlobalSpinner();
        }
      }
    }
    catch (error) {
      this.errores = parsearErrores(error);
      const mensajeError = this.errores.join(', ');
      this.toastr.error(mensajeError);
      this.spinnerService.hideGlobalSpinner();
    }
  }

  async guardarCambios() {
    if (this.loading) {
      return; // Si ya se está ejecutando, salir del método.
    }

    if (this.Form.valid) {
      this.loading = true;

      if(this.StateEnum === TipoAccion.Create){
        const id = await this.getGenerarId();
        this.Form.get('idMotivoAuditoria')?.setValue(id);
      }

      const descripcion = this.Form.get('descripcion')?.value?.toUpperCase();
      const updateData = {
        descripcion:descripcion,
        usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : this.Form.get('usuarioCreacion').value,
        fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : this.Form.get('fechaCreacion').value,
        usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
        fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      };
      this.Form.patchValue(updateData);
      const datosCabecera = { ...this.Form.getRawValue() };
      const dataAGuardar: MotivoAuditoria = { ...datosCabecera };
      this.onSubmit.emit(dataAGuardar);
    }
  }

  private handleError(error: any) {
    this.toastr.error(cadenaErrores(error));
    this.spinnerService.hideGlobalSpinner();
  }

  private async initForm() {
    this.Form = new FormGroup({
      idMotivoAuditoria: new FormControl({ value: null, disabled: false }, [Validators.required, Validators.maxLength(4)]),
      descripcion: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      activo: new FormControl(true, Validators.maxLength(1)),
      usuarioCreacion: new FormControl(null),
      fechaCreacion: new FormControl(null),
      equipoCreacion: new FormControl(null),
      usuarioModificacion: new FormControl(null),
      fechaModificacion: new FormControl(null),
      equipoModificacion: new FormControl(null),
    });
  }

  private async initializeComponent() {
    try {
      this.Form.get('activo').patchValue(true); 
      this.spinnerService.showGlobalSpinner();
      await this.patchFormValues();
      this.barraBotones();
      this.spinnerService.hideGlobalSpinner();
      this.debounceMotivoAuditoria();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    // Establecer allowCustomValue a false después de la carga de datos
    this.allowCustomValue = false;
  }

  private async patchFormValues() {
    if ((this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Read) && this.modelo) {
      this.Form.patchValue({
        idMotivoAuditoria: this.modelo.idMotivoAuditoria,
        descripcion: this.modelo.descripcion,
        activo: this.modelo.activo,
        usuarioCreacion: this.modelo.usuarioCreacion,
        fechaCreacion: this.modelo.fechaCreacion,
        equipoCreacion: this.modelo.equipoCreacion,
        usuarioModificacion: this.modelo.usuarioModificacion,
        fechaModificacion: this.modelo.fechaModificacion,
        equipoModificacion: this.modelo.equipoModificacion,
      });
      this.tipoSeleccionado = true
    }
    this.Form.get('idMotivoAuditoria')?.disable();
    if (this.StateEnum === TipoAccion.Update) {
      this.Form.get('activo')?.enable();
    }
    if (this.StateEnum === TipoAccion.Read) {
      this.Form.get('idMotivoAuditoria')?.enable();
      this.Form.get('activo')?.enable();
    }
    if (this.StateEnum === TipoAccion.Create) {
      this.Form.get('activo')?.disable();
      try {
        const id = await this.getGenerarId();
        this.Form.get('idMotivoAuditoria')?.setValue(id);
      } catch (error) {
        this.toastr.error('Error al generar el ID');
      }
    }
  }

  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes['modelo'] && !changes['modelo'].isFirstChange()) {

        this.spinnerService.showGlobalSpinner();
        this.patchFormValues();
        if (this.StateEnum == TipoAccion.Read) {
          this.barraBotones();
        }
      }
    }
    catch (error) {
      this.handleError(error);
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], property: string) => {
    let query = new Query();
    query = (e.text != "") ? query.where(property, "contains", e.text, true) : query;
    e.updateData(list, query);
  };

 
  async onEnterKeyPressed() {
    const idMotivoAuditoria = this.Form.get("idMotivoAuditoria").value;
    const reponse = await firstValueFrom(this.motivoAuditoriaService.consultaId(idMotivoAuditoria));
    if (reponse && reponse.result && reponse.result != null) {
      this.router.navigate(['/' + this.entidad + '/', idMotivoAuditoria]);
    }
    else {
      this.toastr.error("Código de tipo archivo no encontrado.")
    }
  }

  async onFocusInput(celda: string) {
    if (this.StateEnum == TipoAccion.Read) return;
    if (celda == "idMotivoAuditoria") {
      if (this.Form.get("idMotivoAuditoria").value == null) {
        this.toastr.warning(`Ingrese un código.`);
      } else {
        this.MotivoAuditoriaDescripcion.focusIn();
      }
    }
    if (celda == "descripcion") {
      if (this.Form.get("descripcion").value == null) {
        this.toastr.warning(`Seleccione una descripción.`);
      }
    }
  }

  onDescripcionChange(event: any) {
    if (this.StateEnum === TipoAccion.Read) {
      if (event.isInteracted) {
        const selectedValue = event.itemData;
        if (selectedValue) {
          const selectedId = selectedValue.idMotivoAuditoria;
          this.router.navigate(['/' + this.entidad + '/ver', selectedId]);
        }
      }
    }
  }

  resetLoading() {
    this.loading = false;
  }

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some((e: any) => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }

  async getGenerarId() {
    try {
      const responseSecuenciaId: any = await firstValueFrom(this.motivoAuditoriaService.getGenerarId());
      return responseSecuenciaId

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+G' - Grabar
    if (event.altKey && event.key.toLowerCase() === 'g') {
      if (this.estadoBotones.btnGrabar) {
        this.guardarCambios();
      }
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
    // Combinación para 'Alt+N' - Nuevo
    else if (event.altKey && event.key.toLowerCase() === 'n') {
      if (this.estadoBotones.btnNuevo) {
        this.btnNuevoRegistro();
      }
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
    // Combinación para 'Alt+M' - Modificar
    else if (event.altKey && event.key.toLowerCase() === 'm') {
      if (this.estadoBotones.btnModificar) {
        this.btnModificarRegistro();
      }
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
    // Combinación para 'Alt+C' - Cancelar
    else if (event.altKey && event.key.toLowerCase() === 'c') {
      this.cancelar();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

}

