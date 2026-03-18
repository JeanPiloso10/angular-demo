import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SecurityService } from '@core/services/security.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import { UsuariosService } from '@app/views/usuarios/usuarios.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { SucursalService } from '@app/views/sucursal/sucursal.service';
import { AreasService } from '@app/views/area/area.service';
import { Operacion } from '@shared/enums/Operacion';
import { CategoriaCompraService } from '@app/views/categoria-compra/categoria-compra.service';

@Component({
  selector: 'app-formulario-notificacion-operacion-transaccion',
  standalone: false,
  templateUrl: './formulario-notificacion-operacion-transaccion.component.html',
  styleUrl: './formulario-notificacion-operacion-transaccion.component.scss'
})
export class FormularioNotificacionOperacionTransaccionComponent {

  @Input() errores: string;
  @Input() modelo: any;
  @Input() StateEnum: TipoAccion;
  @Input() titulo?: string;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();


  localWaterMark = 'Seleccione un item.';

  cbTransacciones: any[] = [];
  cbOperaciones: Array<{ codigo: string; descripcion: string; etiqueta: string }> = [];
  cbAcciones: Array<{ codigo: string; descripcion: string }> = [];
  cbTipoCompra: Array<{ codigo: string; descripcion: string }> = [];
  cbUsuarios: any[] = [];
  cbCategoriaCompra: any[] = [];
  cbBodegas: any[] = [];
  cbOpcionesImportacion: Array<{ codigo: boolean; descripcion: string }> = [
    { codigo: true, descripcion: 'Sí' },
    { codigo: false, descripcion: 'No' }
  ];
  permissions: any[] = [];

  fieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  fieldsOperacion: Object = { text: 'etiqueta', value: 'codigo' };
  fieldsAccion: Object = { text: 'descripcion', value: 'codigo' };
  fieldsTipoCompra: Object = { text: 'descripcion', value: 'codigo' };
  fieldsUsarios: Object = { text: 'fullName', value: 'userName' };
  fieldsSucursal: Object = { text: 'cnoSucursal', value: 'idSucursal' };
  fieldsCategoriaCompra: Object = { text: 'cnoCategoriaCompra', value: 'codigo' };
  fieldsBodega: Object = { text: 'cnoBodega', value: 'codigoBodega' };
  fieldsBooleanas: Object = { text: 'descripcion', value: 'codigo' };

  @ViewChild('codigoTransaccion') codigoTransaccion!: DropDownListComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  form: FormGroup;
  entidad = 'notificacionOpercionTransaccion';
  sucursales: any[] = [];
  allowCustom = true;
  public fieldsArea: Object = { text: 'cnoArea', value: 'codigo' };
  public listadoAreas: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private sucursalService: SucursalService,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private transaccionService: TransaccionService,
    private userService: UsuariosService,
    private  activeModal : NgbActiveModal,
    private securityService: SecurityService,
    private areaService: AreasService,
    private permissionService: PermissionService,
    private categoriaCompraService: CategoriaCompraService) {
    this.form = this.initForm();
    this.cbOperaciones = this.buildEnumOptions(Operacion);
    this.cbAcciones = this.buildEnumOptions(TipoAccion);
    this.cbTipoCompra = this.buildTipoCompraOptions();
  }

  ngOnInit(): void {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('activo')?.valueChanges.subscribe((value) => {
      this.updateLabel(value);
    });

    // Inicializar el componente
    this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      await this.getPermissions();

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }


      await this.loadInitialData();
      await this.patchFormValues();
      this.barraBotones();
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
      this.form.get('activo').patchValue(true);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  private async loadInitialData() {
    this.spinnerService.showGlobalSpinner();
    try {

      const results = await firstValueFrom(forkJoin({
        responseTransacciones: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
        sucursalResponse: this.sucursalService.todos().pipe(catchError(error => of({ result: [] }))),
        responseUsuarios: this.userService.todos().pipe(catchError(error => of({ result: [] }))),
        areasResponse: this.areaService.listado().pipe(catchError(error => of({ result: [] }))),
        categoriaCompraResponse: this.categoriaCompraService.ListadoCategoriaCompra().pipe(catchError(error => of({ result: [] }))),
      }));

      this.spinnerService.hideGlobalSpinner();
      if (results.responseTransacciones.isSuccess) {
        this.cbTransacciones = results.responseTransacciones.result;
      }
      else {
        this.toastr.error(results.responseTransacciones.message || 'Error al cargar las transacciones.');
      }

      if (results.sucursalResponse.isSuccess) {
        this.sucursales = results.sucursalResponse.result;        
      } else {
        this.toastr.error(results.sucursalResponse.message || 'Error al cargar sucursales.');
      }

      if (results.responseUsuarios.isSuccess) {
        this.cbUsuarios = (results.responseUsuarios.result || []).filter((u: any) => u.status === true);
      } else {
        this.toastr.error(results.responseUsuarios.message || 'Error al cargar los usuarios.');
      }

    if (results.areasResponse.isSuccess) {
        this.listadoAreas = results.areasResponse.result;
      }
      else {
        this.toastr.error(results.areasResponse.message || 'Error al cargar el listado de áreas.');
      }

      const categorias = this.getResultArray(results.categoriaCompraResponse);
      if (categorias.length === 0 && results.categoriaCompraResponse?.isSuccess === false) {
        this.toastr.error(results.categoriaCompraResponse.message || 'Error al cargar categorías de compra.');
      }
      this.cbCategoriaCompra = categorias;


      this.cbBodegas = [];


      this.patchFormValues();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.notificacionOperacionTransaccion).pipe(catchError(error => of({ result: [] })))

      }));

      this.permissions = results.permission.result as OperacionesDto[];

      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);

      };


    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngAfterViewInit(): void {
    this.codigoTransaccion.focusIn();
    if (this.StateEnum === TipoAccion.Create) {
      this.form.get('activo')?.disable();
    }
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      idNotificacionOperacionTransaccion: [0],
      codigoTransaccion: [null, [Validators.required]],
      codigoOperacion: [null],
      codigoAccion: [null],
      userName: [null, [Validators.required]],

      idSucursal: [null],
      codigoArea: [null],
      codigoCategoriaCompra: [null],
      codigoBodega: [null],
      codigoTipoCompra: [null],
      esImportacion: [null],
      usuarioCreacionDocumentoOrigen: [null],
      usuarioCreacionDocumentoOrigen2: [null],
      usuarioAprobacionDocumentoOrigen: [null],

      referencia1: [null],
      referencia2: [null],
      referencia3: [null],

      activo: [true],
      usuarioCreacion: [null],
      fechaCreacion: [null],
      equipoCreacion: [null],
      usuarioModificacion: [null],
      fechaModificacion: [null],
      equipoModificacion: [null],
    });
  }

  private patchFormValues() {
    if (this.modelo) {

      this.form.patchValue(
        {
          idNotificacionOperacionTransaccion: this.modelo.idNotificacionOperacionTransaccion,
          codigoTransaccion: this.modelo.codigoTransaccion ?? null,
          codigoOperacion: this.modelo.codigoOperacion ?? null,
          codigoAccion: this.modelo.codigoAccion ?? null,
          userName: this.modelo.userName,
          idSucursal: this.modelo.idSucursal,
          codigoArea: this.modelo.codigoArea,
          codigoCategoriaCompra: this.modelo.codigoCategoriaCompra,
          codigoBodega: this.modelo.codigoBodega,
          codigoTipoCompra: this.modelo.codigoTipoCompra,
          esImportacion: this.modelo.esImportacion ?? null,
          usuarioCreacionDocumentoOrigen: this.modelo.usuarioCreacionDocumentoOrigen,
          usuarioCreacionDocumentoOrigen2: this.modelo.usuarioCreacionDocumentoOrigen2,
          usuarioAprobacionDocumentoOrigen: this.modelo.usuarioAprobacionDocumentoOrigen,
          activo: this.modelo.activo,
          usuarioCreacion: this.modelo.usuarioCreacion,
          fechaCreacion: this.modelo.fechaCreacion,
          equipoCreacion: this.modelo.equipoCreacion,
          usuarioModificacion: this.modelo.usuarioModificacion,
          fechaModificacion: this.modelo.fechaModificacion,
          equipoModificacion: this.modelo.equipoModificacion
        }
      );

    }
  }


  guardarCambios(): void {
    this.spinnerService.showGlobalSpinner();
    if (this.form.valid) {
      const updateData = {
        usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
        fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
        usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
        fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      };
      this.form.patchValue(updateData);
      this.onSubmit.emit(this.form.getRawValue());
    } else {
      this.getInvalidControls();
      this.spinnerService.hideGlobalSpinner();
    }
  }

  getInvalidControls() {
    Object.values(this.form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsTouched();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/' + this.entidad + '/listado']);
  }



  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+G' - Grabar
    if (event.altKey && event.key === 'g') {
      this.guardarCambios();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
    // Combinación para 'Alt+C' - Cancelar
    else if (event.altKey && event.key === 'c') {
      this.cancelar();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  cerrar() {
    this.activeModal.close();
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], property: string) => {
    let query = new Query();
    query = (e.text != "") ? query.where(property, "contains", e.text, true) : query;
    e.updateData(list, query);
  };


  public onFilteringTransaccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTransacciones, 'cnoTransaccion');
  };

  public onFilteringOperacion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {

    // this.onFiltering(e, this.cbOperacion, ['descripcion', 'codigo']);
    this.onFiltering(e, this.cbOperaciones, 'descripcion');
  };

  public onFilteringAccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbAcciones, 'descripcion');
  };

  public onFilteringUsuarios: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {

    // this.onFiltering(e, this.cbOperacion, ['descripcion', 'codigo']);
    this.onFiltering(e, this.cbUsuarios, 'fullName');
  };

  public onFilteringSucursal: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

  let query = new Query();

  query = (e.text != "") ? query.where("cnoSucursal", "contains", e.text, true) : query;
  //pass the filter data source, filter query to updateData method.
  e.updateData(this.sucursales, query);

  };

  public onFilteringArea: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoArea", "contains", e.text, true) : query;
    e.updateData(this.listadoAreas, query);
  };

  public onFilteringCategoriaCompra: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbCategoriaCompra, 'cnoCategoriaCompra');
  };

  public onFilteringBodega: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbBodegas, 'cnoBodega');
  };

  public onFilteringTipoCompra: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTipoCompra, 'descripcion');
  };

   
  barraBotones() {


    try {
      
      this.allowCustom = false;

    } catch (error) {

      this.toastr.error(cadenaErrores(error));
    }
  }


  private buildEnumOptions(enumObj: Record<string, string>): Array<{ codigo: string; descripcion: string; etiqueta: string }> {
    return Object.entries(enumObj || {}).map(([descripcion, codigo]) => ({
      descripcion,
      codigo,
      etiqueta: `${codigo} - ${descripcion}`
    }));
  }

  private buildTipoCompraOptions(): Array<{ codigo: string; descripcion: string }> {
    return [
      { codigo: 'S', descripcion: 'Servicio' },
      { codigo: 'P', descripcion: 'Producto' }
    ];
  }

  private getResultArray(response: any): any[] {
    if (!response) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response.result)) {
      return response.result;
    }
    return [];
  }

}

