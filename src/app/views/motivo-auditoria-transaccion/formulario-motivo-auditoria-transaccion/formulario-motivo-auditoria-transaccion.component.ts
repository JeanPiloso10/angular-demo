import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Query } from '@syncfusion/ej2-data';
import { catchError, firstValueFrom, forkJoin, of, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { CommandModel, EditSettingsModel, IEditCell, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { OperacionesDto } from '../../../core/models/operaciones-dto';
import { SecurityService } from '../../../core/services/security.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { PermissionService } from '../../../core/services/permission.service';
import { FormValidationService } from '../../../core/services/form-validation.service';
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import { Operacion } from '@shared/enums/Operacion';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { MotivoAuditoriaTransaccion } from '../interfaces';
import { MotivoAuditoriaService } from '../../motivo-auditoria/motivo-auditoria.service';

@Component({
  selector: 'app-formulario-motivo-auditoria-transaccion',
  templateUrl: './formulario-motivo-auditoria-transaccion.component.html',
  styleUrl: './formulario-motivo-auditoria-transaccion.component.scss',
  standalone:false
})
export class FormularioMotivoAuditoriaTransaccionComponent {
  

  @Input() titulo?: string;
  @Input() errores: string[] = [];
  @Input() modelo: any;
  @Input() StateEnum!: TipoAccion;
  @Input() modalTransaccion: string[] = [];
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() modificarEvent = new EventEmitter<string>();
  @ViewChild('MotivoAuditoriaId') MotivoAuditoriaId!: ComboBoxComponent;
  @ViewChild('MotivoAuditoriaCodigoTransaccion') MotivoAuditoriaCodigoTransaccion!: ComboBoxComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  
  public Form: FormGroup;
  public data?: Object[];
  public editSettings?: EditSettingsModel;
  public commands?: CommandModel;
  public allowCustomValue: boolean = true;
  public multiselectWaterMark: string = '';
  public default: string = 'Default';
  public nombreIcono: string = "cil3d";
  public estadoBotones = { btnNuevo: false, btnModificar: false, btnGrabar: false, btnAnular: false, btnSalir: false };
  public toolbar?: ToolbarItems[];
  public stringParams?: IEditCell;
  public loading: boolean = false;
  public tipoSeleccionado: boolean = false;
  public permissions: OperacionesDto[] = [];
  public searchTextMotivoAuditoriaChanged = new Subject<string>();
  public cbMotivoAuditoria: any[];
  public fieldsMotivoAuditoria: Object = { text: 'descripcion', value: 'idMotivoAuditoria' };
  private entidad = 'motivoAuditoriaTransaccion';
  public isLoadingSearchTipoArchivo = false;
  public cbTransaccion: any[];
  public fieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  public localWaterMark = 'Seleccione un item.';
  public tituloFormulario: string;

  constructor(
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private motivoAuditoriaService: MotivoAuditoriaService,
    private transaccionService: TransaccionService,
    private toastr: ToastrService,
    private router: Router,
    private validationService: FormValidationService) {
    this.initForm();
  }

  ngAfterViewInit(): void {

      this.MotivoAuditoriaCodigoTransaccion.focusIn();   
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

      this.initializeComponent();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  };

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.motivoAuditoriaTransaccion).pipe(catchError(error => of({ result: [] })))
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
      let idMotivoAuditoriaTransaccion = this.Form.get("idMotivoAuditoriaTransaccion")?.value;
      if (idMotivoAuditoriaTransaccion != undefined && idMotivoAuditoriaTransaccion != "") {
        this.router.navigate(['/' + this.entidad + '/modificar', idMotivoAuditoriaTransaccion]);
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
      this.Form.get('idMotivoAuditoriaTransaccion')?.enable();
      this.Form.get('idMotivoAuditoria')?.enable();
    
    } else if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
      this.estadoBotones.btnNuevo = false;
      this.estadoBotones.btnModificar = false;
      this.estadoBotones.btnAnular = false;
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnSalir = this.modalTransaccion && this.modalTransaccion[0] ? false : true;
      this.Form.enable();
      this.Form.get('idMotivoAuditoriaTransaccion')?.disable();
      if (this.StateEnum == TipoAccion.Create) {
        this.MotivoAuditoriaCodigoTransaccion.focusIn();
        this.Form.get('activo')?.disable();
      } else if (this.StateEnum == TipoAccion.Update) {
        this.MotivoAuditoriaId.focusIn();
        this.Form.get('activo')?.enable();
      } else {
        this.MotivoAuditoriaCodigoTransaccion.focusIn();
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
      if (query.length >= 3 && !this.isLoadingSearchTipoArchivo) { // Solo emitir si no hay una petición en curso
        this.searchTextMotivoAuditoriaChanged.next(query);
      }
    }
  }

  btnCancelar(): void {
    this.router.navigate(['/' + this.entidad + '/ver']);
  }

  guardarCambios(): void {
    if (this.loading) {
      return; // Si ya se está ejecutando, salir del método.
    }

    if (this.Form.valid) {
      this.loading = true;
      const updateData = {
        usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : this.Form.get('usuarioCreacion')?.value,
        fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : this.Form.get('fechaCreacion')?.value,
        usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
        fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      };
      this.Form.patchValue(updateData);
      const datosCabecera = { ...this.Form.getRawValue() };
      const dataAGuardar: MotivoAuditoriaTransaccion = { ...datosCabecera };
      this.onSubmit.emit(dataAGuardar);
    }
  }

  private handleError(error: any) {
    this.toastr.error(cadenaErrores(error));
    this.spinnerService.hideGlobalSpinner();
  }

  private async initForm() {
    this.Form = new FormGroup({
      idMotivoAuditoriaTransaccion: new FormControl({ value: 0, disabled: false }, [Validators.required]),
      idMotivoAuditoria: new FormControl({ value: null, disabled: false }, [Validators.required]),
      codigoTransaccion: new FormControl({ value: null, disabled: false }, [Validators.required, Validators.maxLength(15)]),
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
      await this.loadPrimaryInitialData();
      await this.patchFormValues();
      this.barraBotones();
      this.spinnerService.hideGlobalSpinner();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    // Establecer allowCustomValue a false después de la carga de datos
    this.allowCustomValue = false;
  }

  async loadPrimaryInitialData() {
    try {
      const results = await firstValueFrom(forkJoin({
        transaccionResponse: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
        motivoAuditoriaResponse: this.motivoAuditoriaService.listado().pipe(catchError(error => of({ result: [] })))
      }));

      if (results.transaccionResponse.isSuccess) {
        this.cbTransaccion = results.transaccionResponse.result;
      } else {
        this.toastr.error(results.transaccionResponse.message || 'Error al cargar las transacciones.');
      }
      if (results.motivoAuditoriaResponse.isSuccess) {
        this.cbMotivoAuditoria = results.motivoAuditoriaResponse.result;
      } else {
        this.toastr.error(results.motivoAuditoriaResponse.message || 'Error al cargar los motivos de auditoria.');
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private async patchFormValues() {

    if ((this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Read) && this.modelo) {
      this.Form.patchValue({
        idMotivoAuditoriaTransaccion: this.modelo.idMotivoAuditoriaTransaccion,
        idMotivoAuditoria: this.modelo.idMotivoAuditoria,
        codigoTransaccion: this.modelo.codigoTransaccion,
        activo: this.modelo.activo,
        usuarioCreacion: this.modelo.usuarioCreacion,
        fechaCreacion: this.modelo.fechaCreacion,
        equipoCreacion: this.modelo.equipoCreacion,
      });
      this.tipoSeleccionado = true
    }
    this.Form.get('idMotivoAuditoriaTransaccion')?.disable();
    if (this.StateEnum === TipoAccion.Update) {
      this.Form.get('activo')?.enable();
    }
    if (this.StateEnum === TipoAccion.Read) {
      this.Form.get('idMotivoAuditoriaTransaccion')?.enable();
      this.Form.get('activo')?.enable();
    }
    if (this.StateEnum === TipoAccion.Create) {

      this.Form.patchValue({
        codigoTransaccion: this.modelo.codigoTransaccion
      });

      this.Form.get('activo')?.disable();
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
  onFilteringMotivoAuditoria: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbMotivoAuditoria, "descripcion");
  };
  onFilteringTransaccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTransaccion, "cnoTransaccion");
  };

  async onChange(event: any) {
    try {
      const form = this.Form;
      if (event.element.id == "idMotivoAuditoria" && event.value != null) {

      }

    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

 
  async onEnterKeyPressed() {
    const idMotivoAuditoria = this.Form.get("idMotivoAuditoriaTransaccion")?.value;
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

    if (celda == "codigoTransaccion") {
      if (this.Form.get("codigoTransaccion")?.value == null) {
        this.toastr.warning(`Ingrese un código.`);
      } else {
        this.MotivoAuditoriaId.focusIn();
      }
    }
    if (celda == "idMotivoAuditoria") {
      if (this.Form.get("idMotivoAuditoria")?.value == null) {
        this.toastr.warning(`Seleccione un tipo de Archivo.`);
      }
    }
  }

  onDescripcionChange(event: any) {
    if (this.StateEnum === TipoAccion.Read) {
      if (event.isInteracted) {
        const selectedValue = event.itemData;
        if (selectedValue) {
          const selectedId = selectedValue.idMotivoAuditoriaTransaccion;
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
      this.btnCancelar();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

}




