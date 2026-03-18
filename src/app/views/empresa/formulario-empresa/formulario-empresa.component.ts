import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidationService } from '@core/services/form-validation.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { ComboBoxModule, MultiSelectModule, DropDownListModule, FilteringEventArgs, ComboBoxComponent, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  GridModule as GridModuleSyncFusion,
  ToolbarItems,
  CommandModel,
  GridComponent
} from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule as GridCoreUI,
  ButtonGroupModule,
  BadgeModule,
  SpinnerModule,
  TabsModule,
  NavModule,
} from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { validarFechaDiaMesAnio } from '@shared/utilities/tratamientoFechas';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { EmpresaService } from '../empresa.service';
import { SucursalEmpresaComponent } from '../sucursal-empresa/sucursal-empresa.component';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { PermissionService } from '@core/services/permission.service';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, forkJoin, of, Subject, switchMap, throwError } from 'rxjs';
import { SocioService } from '../../socios-negocios/socio.service';
import { SocioNegocioSharedComponent } from '@views/socios-negocios/socio-negocio-shared/socio-negocio-shared.component';
import { iconSubset } from '@app/icons/icon-subset';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanCuentaService } from '@app/views/plan-cuenta/plan-cuenta.service';
import { Predicate, Query } from '@syncfusion/ej2-data';
import { EmitType } from '@syncfusion/ej2-base';
import { TipoIdentificacionService } from '@app/views/tipo-identificacion/tipo-identificacion.service';
import { listadoTipoAmbienteDocumentos, listadoTipoEmisionDocumentos } from '@app/shared-features/datasources/TipoEmisionDocumento';
import { listadoTipoAnexos } from '@app/shared-features/datasources/TipoAnexos';
import { TipoAnexo as EnumTipoAnexo } from '@app/shared-features/enums/TipoAnexo';
import { CuentaContableService } from '@app/views/cuenta-contable/cuenta-contable.service';
import { TipoDatoService } from '@app/views/tipo-dato/tipo-dato.service';
import { TipoIdentificacion as EnumTipoIdentificacion } from '@app/shared-features/enums/TipoIdentificacion';
import { TipoIdentificacion } from '@app/views/tipo-identificacion/interfaces';
import { AuditoriaConsultaComponent } from '@app/shared-features/components/auditoria-consulta/auditoria-consulta.component';
import { Operacion } from '@app/shared-features/enums/Operacion';
import { GrupoEmpresaService } from '@app/views/grupo-empresa/grupo-empresa.service';

@Component({
  selector: 'app-formulario-empresa',
  standalone: true,
  imports: [ButtonModule,
    CardModule,
    FormModule,
    GridCoreUI,
    CommonModule,
    ButtonGroupModule,
    BadgeModule,
    SpinnerModule,
    GridModuleSyncFusion,
    ComboBoxModule,
    DropDownListModule,
    MultiSelectModule,
    ToolbarModule,
    ReactiveFormsModule,
    TabsModule,
    NavModule,
    IconModule,
    SocioNegocioSharedComponent
  ],
  providers: [
    DatePipe,
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = {
          ...iconSubset
        };
        return iconSet;
      }
    }
  ],
  templateUrl: './formulario-empresa.component.html',
  styleUrl: './formulario-empresa.component.scss'
})
export class FormularioEmpresaComponent {
  form: FormGroup;
  @Input() StateEnumPadre!: TipoAccion;
  @Input() StateEnum: TipoAccion = TipoAccion.Read;
  @Input() isModal: boolean = false;
  @Input() modelo: any;

  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('descripcion') descripcion!: ElementRef;
  @ViewChild('ruc') ruc!: ElementRef;
  @ViewChild('grupoEmpresa') grupoEmpresa!: ComboBoxComponent;
  @ViewChild('nombreComercial') nombreComercial: ElementRef;
  @ViewChild('razonSocial') razonSocial: ElementRef;
  @ViewChild('planCuenta') planCuenta: ComboBoxComponent;
  @ViewChild('codigoTipoDato') codigoTipoDato: ComboBoxComponent;
  @ViewChild('anio') anio!: ElementRef;
  @ViewChild('mes') mes!: ElementRef;
  @ViewChild('dia') dia!: ElementRef;
  @ViewChild('cuentaContableCierre') cuentaContableCierre!: ComboBoxComponent;
  @ViewChild('fax') fax!: ElementRef;
  @ViewChild('emails') emails!: MultiSelectComponent;
  @ViewChild('telefonos') telefonos!: MultiSelectComponent;
  @ViewChild('descripcionRepresentanteLegal') descripcionRepresentanteLegal!: ElementRef;
  @ViewChild('idTipoIdentificacionRepresentanteLegal') idTipoIdentificacionRepresentanteLegal!: ComboBoxComponent;
  @ViewChild('numeroRepresentanteLegal') numeroRepresentanteLegal!: ElementRef;
  @ViewChild('descripcionContador') descripcionContador!: ElementRef;
  @ViewChild('rucContador') rucContador!: ElementRef;
  @ViewChild('registroProfesionalContador') registroProfesionalContador!: ElementRef;
  @ViewChild('esContribuyenteEspecial') esContribuyenteEspecial!: ElementRef<HTMLInputElement>;
  @ViewChild('recibeDevolucionIva') recibeDevolucionIva!: ElementRef<HTMLInputElement>;
  @ViewChild('numeroResolucionContribuyenteEspecial') numeroResolucionContribuyenteEspecial!: ElementRef;
  @ViewChild('fechaResolucionContribuyenteEspecial') fechaResolucionContribuyenteEspecial!: ElementRef;
  @ViewChild('declaraSri') declaraSri!: ComboBoxComponent;
  @ViewChild('tipoAmbienteEmisionDctoElectronico') tipoAmbienteEmisionDctoElectronico!: ComboBoxComponent;
  @ViewChild('emisionDocFactura') emisionDocFactura!: ComboBoxComponent;
  @ViewChild('emisionDocGuiaRemision') emisionDocGuiaRemision!: ComboBoxComponent;
  @ViewChild('emisionDocNotaCreditoDebito') emisionDocNotaCreditoDebito!: ComboBoxComponent;
  @ViewChild('emisionDocLiquidacionCompra') emisionDocLiquidacionCompra!: ComboBoxComponent;
  @ViewChild('emisionDocRetencion') emisionDocRetencion!: ComboBoxComponent;
  @ViewChild('activo') activo!: ElementRef<HTMLInputElement>;
  @ViewChild('agregarSucursal') agregarSucursal!: ElementRef<HTMLButtonElement>;
  @ViewChild('gridSucursal') public gridSucursal: GridComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  listadoSucursal: any = [];
  filteredListadoSucursal: any[] = [];
  mostrarAuditoria: boolean = false;

  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnBuscar: false,
    btnGrabar: false,
    btnAnular: false,
    btnImprimir: false,
    btnCancelar: true,
    btnAgregarSucursal: false,
    btnAuditoria: false
  };
  public pageOption: Object;
  public toolbar?: ToolbarItems[] | object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public commands?: CommandModel[];
  // Exponer el enum al contexto del template
  TipoAccion = TipoAccion;
  permissions: OperacionesDto[] = [];
  public localFieldsPlanCuenta: Object = { text: 'cnoPlanCuenta', value: 'codigo' };
  public cbPlanCuenta: any[] = [];
  public localFieldsGrupoEmpresa: Object = { text: 'cnoGrupoEmpresa', value: 'codigo' };
  public cbGrupoEmpresa: any[] = [];
  public box: string = 'Box';
  public fieldsTipoIdentificacion: Object = { text: 'descripcion', value: 'idTipoIdentificacion' };
  public cbTiposIdentificacion: TipoIdentificacion[];
  public waterMark: string = 'Seleccione un item...';
  public visibleCollapse = true;
  activeTabPaneIdx: number = 0;
  public nameIcono: string = "cilCaretTop";
  public localFieldsTipoEmisionDocumento: Object = { text: 'cnoDescripcion', value: 'codigo' };
  public cbTiposEmisionDocumentos: any[];
  public localFieldsTipoAmbienteDocumentos: Object = { text: 'cnoDescripcion', value: 'codigo' };
  public cbTiposAmbienteDocumentos: any[];
  public localFieldsTipoAnexos: Object = { text: 'cnoDescripcion', value: 'codigo' };
  public cbTiposAnexos: any[];
  public localFieldsCuentaContable: Object = { text: 'cnoCuentaContable', value: 'cuentaContable' };
  public listadoCuentasContablesByPlanCuenta: any[] = [];
  public cbCuentasContablesByPlanCuenta: any[] = [];
  public searchCuentaContableTextChanged = new Subject<string>();
  public isLoadingCuentaContable = false;
  public localFieldsTipoDato: Object = { text: 'cnoTipoDato', value: 'codigo' };
  public cbTipoDatos: any[] = [];
  constructor(private validationService: FormValidationService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private grupoEmpresaService: GrupoEmpresaService,
    private empresaService: EmpresaService,
    private permissionService: PermissionService,
    private socioNegocioService: SocioService,
    private modalHelperService: ModalHelperService,
    private activeModal: NgbActiveModal,
    private planCuentaService: PlanCuentaService,
    private tipoIdentificacionService: TipoIdentificacionService,
    private tipoDatoService: TipoDatoService,
    private datePipe: DatePipe,
    private cuentaContableService: CuentaContableService) { this.form = this.initForm(); }

  ngOnInit(): void {
    this.pageOption = { pageCount: 5, pageSize: 15 };
    this.toolbar = [];

    this.commands = [
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' }, title: 'Modificar' },
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-trash' }, title: 'Eliminar' },];
    this.initializeComponent();

  }
  private async initializeComponent() {
    try {
      this.form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });


      this.cbTiposEmisionDocumentos = listadoTipoEmisionDocumentos;
      this.cbTiposAmbienteDocumentos = listadoTipoAmbienteDocumentos;
      this.cbTiposAnexos = listadoTipoAnexos;
      this.form.get('activo').setValue(true);
      await this.loadPrimaryInitialData();
      await this.patchFormValues();
      this.debounceCuentasContables();
      this.form.disable();
      this.barraBotones();


      if (this.StateEnum == TipoAccion.Create) {
        this.nuevoRegistro();
      }

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelo'] && !changes['modelo'].isFirstChange()) {
      this.cancelar();
      this.patchFormValues();
    }
  }
  async loadPrimaryInitialData() {
    try {
      await this.getPermissions();
      const results = await firstValueFrom(forkJoin({
        responsePlanCuenta: this.planCuentaService.todos(),
        responseTipoIdentificacion: this.tipoIdentificacionService.listadoTipoIdentificacion().pipe(catchError(error => of({ result: [] }))),
        responseTipoDato: this.tipoDatoService.listado(),
        responseGrupoEmpresa: this.grupoEmpresaService.todos()
      })
      );
      this.cbTiposIdentificacion = results.responseTipoIdentificacion.result;
      this.cbPlanCuenta = results.responsePlanCuenta?.result ?? [];
      this.cbTipoDatos = results.responseTipoDato?.result ?? [];
      this.cbGrupoEmpresa = results.responseGrupoEmpresa?.result ?? [];

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  };

  async getPermissions() {
    try {
      this.permissions = await this.permissionService.getPermissions(TransactionCode.empresa);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some((e: any) => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }
  private async patchFormValues() {
    try {
      if (!this.modelo) {
        this.limpiarFormulario();
      }

      if ((this.StateEnum === TipoAccion.Update || this.StateEnum === TipoAccion.Read) && this.modelo) {
        this.form.patchValue({
          codigo: this.modelo.codigo,
          descripcion: this.modelo.descripcion,
          razonSocial: this.modelo.razonSocial,
          nombreComercial: this.modelo.nombreComercial,
          anio: this.modelo.anio,
          mes: this.modelo.mes,
          dia: this.modelo.dia,
          direccion: this.modelo.direccion,
          ruc: this.modelo.ruc,
          telefonos: this.modelo.telefonos,
          idSocioNegocio: this.modelo.idSocioNegocio,
          grupoEmpresa: this.modelo.grupoEmpresa ?? undefined,
          planCuenta: this.modelo.planCuenta ?? undefined,
          codigoTipoDato: this.modelo.codigoTipoDato ?? undefined,
          cuentaContableCierre: this.modelo.cuentaContableCierre ?? undefined,
          fax: this.modelo.fax,
          emails: this.modelo.emails,
          descripcionRepresentanteLegal: this.modelo.descripcionRepresentanteLegal,
          idTipoIdentificacionRepresentanteLegal: this.modelo.idTipoIdentificacionRepresentanteLegal ?? this.cbTiposIdentificacion.length > 0 ? this.cbTiposIdentificacion.find(x => x.codigo === EnumTipoIdentificacion.NoAplica).idTipoIdentificacion : null,
          numeroRepresentanteLegal: this.modelo.numeroRepresentanteLegal,
          descripcionContador: this.modelo.descripcionContador,
          rucContador: this.modelo.rucContador,
          registroProfesionalContador: this.modelo.registroProfesionalContador,
          esContribuyenteEspecial: this.modelo.esContribuyenteEspecial,
          numeroResolucionContribuyenteEspecial: this.modelo.numeroResolucionContribuyenteEspecial,
          recibeDevolucionIva: this.modelo.recibeDevolucionIva,
          fechaResolucionContribuyenteEspecial: this.modelo.fechaResolucionContribuyenteEspecial ? this.datePipe.transform(new Date(this.modelo.fechaResolucionContribuyenteEspecial), 'yyyy-MM-dd') : null,
          declaraSri: this.modelo.declaraSri,
          tipoAmbienteEmisionDctoElectronico: this.modelo.tipoAmbienteEmisionDctoElectronico,
          emisionDocFactura: this.modelo.emisionDocFactura,
          emisionDocGuiaRemision: this.modelo.emisionDocGuiaRemision,
          emisionDocNotaCreditoDebito: this.modelo.emisionDocNotaCreditoDebito,
          emisionDocLiquidacionCompra: this.modelo.emisionDocLiquidacionCompra,
          emisionDocRetencion: this.modelo.emisionDocRetencion,
          activo: this.modelo.activo,
          usuarioCreacion: this.modelo.usuarioCreacion,
          fechaCreacion: this.modelo.fechaCreacion,
          equipoCreacion: this.modelo.equipoCreacion,
          usuarioModificacion: this.modelo.usuarioModificacion,
          fechaModificacion: this.modelo.fechaModificacion,
          equipoModificacion: this.modelo.equipoModificacion
        });

        this.listadoSucursal = this.modelo.sucursal;
        if (this.listadoSucursal != undefined && this.listadoSucursal.length > 0) {
          this.listadoSucursal = this.listadoSucursal.map((fp: any) => ({
            ...fp,
            estado: TipoAccion.Read  // Asigna el valor 'read' a la columna estado
          }));
        }
        this.filteredListadoSucursal = this.listadoSucursal;
        this.cbCuentasContablesByPlanCuenta = [];
        this.cbCuentasContablesByPlanCuenta = [...this.cbCuentasContablesByPlanCuenta, this.modelo?.cuentaContable];
        const tipo = this.modelo?.tipoIdentificacion;
        if (tipo) {
          const list = this.cbTiposIdentificacion ?? [];
          const exists = list.some(x => x?.idTipoIdentificacion === tipo.idTipoIdentificacion);
          this.cbTiposIdentificacion = exists ? list : [...list, tipo];
        }
      }
      else if (this.StateEnum === TipoAccion.Create) {
        this.form.patchValue({
          idSocioNegocio: this.modelo.idSocioNegocio ?? null,
          idTipoIdentificacionRepresentanteLegal: this.cbTiposIdentificacion.find(x => x.codigo === EnumTipoIdentificacion.NoAplica)?.idTipoIdentificacion ?? null,
        });

      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
  async generaNombre(): Promise<void> {
    try {
      const idSocioNegocio = this.form.get('idSocioNegocio')?.value;
      if (idSocioNegocio) {
        const response: any = await firstValueFrom(this.socioNegocioService.consultaId(idSocioNegocio));
        this.form.patchValue({
          razonSocial: response.result.descripcion,
          ruc: response.result.identificacion,
          direccion: response.result.direccion,
          telefonos: response.result.telefonos,
        });
        this.form.get('ruc')?.disable();
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
  nuevoRegistro(): void {
    this.limpiarFormulario();
    this.StateEnum = TipoAccion.Create;
    this.barraBotones();
    this.generaNombre();
  };

  limpiarFormulario() {
    if (this.modelo) {
      this.modelo = {};
    }

    const updateData = {
      codigo: '' as string,
      descripcion: '' as string,
      activo: true,
      grupoEmpresa: null as string | null,
      planCuenta: null as string | null,
      fax: null as string | null,
      emails: null as string | null,
      codigoTipoDato: null as string | null,
      cuentaContableCierre: null as string | null,
      anio: null as number | null,
      mes: null as number | null,
      dia: null as number | null,
      descripcionRepresentanteLegal: null as string | null,
      idTipoIdentificacionRepresentanteLegal: this.cbTiposIdentificacion.length > 0 ? this.cbTiposIdentificacion.find(x => x.codigo === EnumTipoIdentificacion.NoAplica).idTipoIdentificacion : null,
      numeroRepresentanteLegal: null as string | null,
      descripcionContador: null as string | null,
      rucContador: null as string | null,
      registroProfesionalContador: null as string | null,
      esContribuyenteEspecial: false,
      numeroResolucionContribuyenteEspecial: null as string | null,
      fechaResolucionContribuyenteEspecial: null as Date | null,
      declaraSri: null as string | null,
      recibeDevolucionIva: false,
      tipoAmbienteEmisionDctoElectronico: null as string | null,
      emisionDocFactura: null as string | null,
      emisionDocGuiaRemision: null as string | null,
      emisionDocNotaCreditoDebito: null as string | null,
      emisionDocLiquidacionCompra: null as string | null,
      emisionDocRetencion: null as string | null,
      usuarioCreacion: null as string | null,
      fechaCreacion: null as string | null,
      equipoCreacion: null as string | null,
      usuarioModificacion: null as string | null,
      fechaModificacion: null as string | null,
      equipoModificacion: null as string | null
    };

    this.form.patchValue(updateData);
    this.filteredListadoSucursal = [];
    this.listadoSucursal = [];
    this.mostrarAuditoria = false;
  }
  modificarRegistro(): void {
    const codigo = this.form.get('codigo')?.value;
    if (codigo && codigo !== '') {
      this.StateEnum = TipoAccion.Update;
      this.barraBotones();
    } else {
      this.toastr.error('Por favor, seleccione un registro para modificar.');
    }
  }
  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }
  private initForm(): FormGroup {
    return this.formBuilder.group({
      codigo: ['', [Validators.required, Validators.maxLength(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      idSocioNegocio: [0],
      razonSocial: [null, [Validators.required, Validators.maxLength(100)]],
      nombreComercial: [null, [Validators.required, Validators.maxLength(100)]],
      ruc: [null, [Validators.required]],
      anio: [null,],
      mes: [null,],
      dia: [null,],
      direccion: [null],
      fax: [null, [Validators.maxLength(14)]],
      emails: [[], [Validators.maxLength(300)]],
      telefonos: [[], [Validators.maxLength(100)]],
      grupoEmpresa: [null, [Validators.required, Validators.maxLength(2)]],
      planCuenta: [null, [Validators.required, Validators.maxLength(2)]],
      codigoTipoDato: [null, [Validators.required, Validators.maxLength(2)]],
      cuentaContableCierre: [null, [Validators.required, Validators.maxLength(15)]],
      periodoInicio: [this.datePipe.transform(new Date(obtenerFechaEnHusoHorarioMinus5()), 'yyyy-MM-dd')],
      descripcionRepresentanteLegal: [null, [Validators.maxLength(50)]],
      idTipoIdentificacionRepresentanteLegal: [null, [Validators.required]],
      numeroRepresentanteLegal: [null, [Validators.maxLength(50)]],
      descripcionContador: [null, [Validators.maxLength(60)]],
      rucContador: [null, [Validators.minLength(13), Validators.maxLength(25)]],
      registroProfesionalContador: [null, [Validators.maxLength(5)]],
      esContribuyenteEspecial: false,
      numeroResolucionContribuyenteEspecial: [null, [Validators.maxLength(10)]],
      fechaResolucionContribuyenteEspecial: [this.datePipe.transform(new Date(obtenerFechaEnHusoHorarioMinus5()), 'yyyy-MM-dd')],
      declaraSri: [null,],
      recibeDevolucionIva: false,
      tipoAmbienteEmisionDctoElectronico: [null],
      emisionDocFactura: [null],
      emisionDocGuiaRemision: [null],
      emisionDocNotaCreditoDebito: [null],
      emisionDocLiquidacionCompra: [null],
      emisionDocRetencion: [null], 
      activo: [{ value: true, disabled: true }],
      usuarioCreacion: [null],
      fechaCreacion: [null],
      equipoCreacion: [null],
      usuarioModificacion: [null],
      fechaModificacion: [null],
      equipoModificacion: [null]
    }, {
      validators: [validarFechaDiaMesAnio('dia', 'mes', 'anio')]
    });

  }

  barraBotones(): void {
    if (this.StateEnum === TipoAccion.Read) {
      this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);
      this.estadoBotones.btnAuditoria = this.tienePermiso(Operacion.Auditoria);
      this.estadoBotones.btnModificar = (this.modelo && this.modelo.codigo) && this.tienePermiso(Operacion.Modificar) ? true : false;
      this.estadoBotones.btnGrabar = false;
      this.estadoBotones.btnCancelar = true;
      this.estadoBotones.btnAgregarSucursal = false;
      this.form.disable();
    } else if (this.StateEnum === TipoAccion.Create || this.StateEnum === TipoAccion.Update) {
      this.form.enable();
      this.estadoBotones.btnNuevo = false;
      this.estadoBotones.btnModificar = false;
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnAgregarSucursal = true;
      this.form.get('planCuenta')?.disable();
      this.form.get('usuarioCreacion')?.disable();
      this.form.get('fechaCreacion')?.disable();
      this.form.get('equipoCreacion')?.disable();
      this.form.get('usuarioModificacion')?.disable();
      this.form.get('fechaModificacion')?.disable();
      this.form.get('equipoModificacion')?.disable();
      if (this.StateEnum === TipoAccion.Create) {
        this.codigo.nativeElement.focus();
        this.form.get('activo')?.disable();

      } else {
        this.descripcion.nativeElement.focus();
        this.form.get('codigo')?.disable();
      }
    }
    if (this.modelo) {
      if (this.modelo.usuarioCreacion) {
        this.mostrarAuditoria = true;
      }
    }
    this.habilitaGrid();
  }

  public habilitaGrid(): void {

    const gridSucursalElement = this.gridSucursal ? this.gridSucursal.element : null;
    if (!gridSucursalElement) {
      return;
    }
    if (this.StateEnum === TipoAccion.Read) {
      this.gridSucursal.element.classList.add('disablegrid');
      // (document.getElementById("TreeGridParent") as HTMLElement).classList.add('wrapper');
    }
    else {
      this.gridSucursal.element.classList.remove('disablegrid');
      // (document.getElementById("TreeGridParent") as HTMLElement).classList.remove('wrapper');
    }
  }

  private marcarControlesComoTocados(): void {
    Object.keys(this.form.controls).forEach(campo => {
      const control = this.form.get(campo);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  guardarCambios(): void {
    if (!this.form.valid) {
      this.marcarControlesComoTocados();
      this.toastr.error('Por favor, complete el formulario correctamente.');
      return;
    }
    const formValues = this.form.getRawValue();
    formValues.codigo = formValues.codigo.toUpperCase();
    formValues.descripcion = formValues.descripcion.toUpperCase();
    if (formValues.grupoEmpresa) formValues.grupoEmpresa = formValues.grupoEmpresa.toUpperCase();
    if (formValues.planCuenta) formValues.planCuenta = formValues.planCuenta.toUpperCase();
    // Actualizar el campo 'codigoEmpresa' en cada sucursal
    if (this.listadoSucursal && Array.isArray(this.listadoSucursal)) {
      this.listadoSucursal.forEach((sucursal) => {
        sucursal.codigoEmpresa = formValues.codigo; // Asignar el código de empresa
      });
    }

    const updateData = {
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      Sucursal: this.listadoSucursal || [],
    };

    const tipoIdentificacion = this.cbTiposIdentificacion.find(x => x.idTipoIdentificacion === this.form.get('idTipoIdentificacionRepresentanteLegal')?.value);
    Object.assign(formValues, updateData);
    const dataAGuardar: any = {
      ...formValues,
      ...updateData,
      telefono: this.modelo.telefono,
      TipoIdentificacion: tipoIdentificacion,
    };
    this.spinnerService.showGlobalSpinner();
    if (this.StateEnum === TipoAccion.Create) {
      this.empresaService.crear(dataAGuardar).subscribe({
        next: (respuesta: any) => {
          this.spinnerService.hideGlobalSpinner();
          if (respuesta.isSuccess) {
            this.toastr.success('Acción exitosa');
            this.empresaService.notifyEmpresaUpdated(dataAGuardar);
            this.cancelar();

            if (this.isModal == true) {
              this.activeModal.close();
            }

          } else {
            this.toastr.error(cadenaErrores(respuesta.message));
          }
        },
        error: (error) => {
          this.spinnerService.hideGlobalSpinner();
          this.toastr.error(cadenaErrores(error));
        }
      });
    } else if (this.StateEnum === TipoAccion.Update) {
      this.empresaService.editar(formValues.codigo, dataAGuardar).subscribe({
        next: (respuesta: any) => {
          this.spinnerService.hideGlobalSpinner();
          if (respuesta.isSuccess) {
            this.toastr.success('Acción exitosa');
            this.empresaService.notifyEmpresaUpdated(dataAGuardar);
            this.cancelar();

            if (this.isModal == true) {
              this.activeModal.close();
            }

          } else {
            this.toastr.error(cadenaErrores(respuesta.message));
          }
        },
        error: (error) => {
          this.spinnerService.hideGlobalSpinner();
          this.toastr.error(cadenaErrores(error));
        }
      });
    }
  }

  public commandClick(args: any): void {

    if (args.commandColumn.title && args.commandColumn.title === 'Modificar') {


      this.modalSucursal(TipoAccion.Update, args.rowData);


    } else if (args.commandColumn.title && args.commandColumn.title === 'Eliminar') {
      args.rowData.estado = TipoAccion.Delete;
      this.filteredListadoSucursal = this.listadoSucursal.filter((pp: any) => pp.estado !== TipoAccion.Delete);

    }
  }
  onActivoChange(event: any, data: any): void {
    const index = this.listadoSucursal.findIndex((item: any) => item.codigoEmpresa === data.codigoEmpresa &&
      item.codigoDivision === data.codigoDivision &&
      item.codigoSucursal === data.codigoSucursal);
    if (index !== -1) {
      this.listadoSucursal[index].activo = event.target.checked;
      this.listadoSucursal[index].estado = this.listadoSucursal[index].estado == TipoAccion.Create ? TipoAccion.Create : TipoAccion.Update;
      if (this.listadoSucursal[index].estado != TipoAccion.Create) {
        this.listadoSucursal[index].usuarioModificacion = this.securityService.getUserName();
        this.listadoSucursal[index].fechaModificacion = obtenerFechaEnHusoHorarioMinus5();
      }
      this.filteredListadoSucursal = this.listadoSucursal.filter((pp: any) => pp.estado !== TipoAccion.Delete);
    }
  }
  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    if (campo && (campo.dirty || campo.touched) && campo.invalid) {
      return this.validationService.obtenerMensajeError(campo);
    }
    return '';
  }
  isInvalid(campoNombre: string): boolean {
    const campo = this.form.get(campoNombre);
    return campo && campo.invalid && (campo.dirty || campo.touched);
  }

  modalSucursal(accion: TipoAccion, modeloSucursal?: any) {

    const modalRef = this.modalHelperService.abrirModal(SucursalEmpresaComponent,
      {
        StateEnum: accion,
        modelo: modeloSucursal
      },
      {
        size: 'md',
        windowClass: 'modal-dialog-centered',
        animation: true,
        backdrop: 'static',
      });


    modalRef.componentInstance.submitEvent.subscribe((data: any) => {

      modalRef.close();
      if (data) {


        const sucursal = {
          codigoEmpresa: this.form.get("codigo")?.value,
          codigoSucursal: data.codigoSucursal,
          codigoDivision: data.codigoDivision,
          descripcion: data.descripcion,
          activo: data.activo,
          estado: data.estado,
          usuarioCreacion: this.securityService.getUserName(),
          fechaCreacion: obtenerFechaEnHusoHorarioMinus5()
        }

        const Existente = this.listadoSucursal.find((prod: any) =>
          prod.codigoEmpresa === sucursal.codigoEmpresa &&
          prod.codigoDivision === sucursal.codigoDivision &&
          prod.codigoSucursal === sucursal.codigoSucursal &&
          prod.estado != TipoAccion.Delete);

        if (!Existente) {
          this.listadoSucursal.push(sucursal);
          this.filteredListadoSucursal = this.listadoSucursal.filter((pp: any) => pp.estado !== TipoAccion.Delete);
          this.gridSucursal.refresh();
        } else {

          this.listadoSucursal.forEach((item: any) => {
            if (item.codigoEmpresa === this.form.get("codigo")?.value &&
              item.codigoDivision === sucursal.codigoDivision &&
              item.codigoSucursal === sucursal.codigoSucursal) {
              // Actualiza las propiedades según sea necesario
              item.descripcion = sucursal.descripcion; // Ejemplo de actualización
              item.activo = sucursal.activo; // Cambiar otro campo como ejemplo
              item.usuarioModificacion = this.securityService.getUserName(),
                item.fechaModificacion = obtenerFechaEnHusoHorarioMinus5()
              item.estado = sucursal.estado == TipoAccion.Create == true ? TipoAccion.Create : TipoAccion.Update;
            }
          });

          this.gridSucursal.refresh();
        }

      }
    });
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], ...properties: string[]) => {
    const text = (e.text ?? '').trim();
    let query = new Query();

    if (text && properties.length > 0) {
      let predicate = new Predicate(properties[0], 'contains', text, true);
      for (let i = 1; i < properties.length; i++) {
        predicate = predicate.or(properties[i], 'contains', text, true);
      }
      query = query.where(predicate);
    }
    e.updateData(list, query);
  };

  public onFilteringGrupoEmpresa: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoEmpresa", "contains", e.text, true) : query;
    e.updateData(this.cbGrupoEmpresa, query);
  };

  public onFilteringPlanCuenta: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoPlanCuenta", "contains", e.text, true) : query;
    e.updateData(this.cbPlanCuenta, query);
  };

  public onFilteringTiposAnexos: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoDescripcion", "contains", e.text, true) : query;
    e.updateData(this.cbTiposAnexos, query);
  };


  public onFilteringTiposAmbientesDocumentos: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoDescripcion", "contains", e.text, true) : query;
    e.updateData(this.cbTiposAmbienteDocumentos, query);
  };

  public onFilteringTipoEmisionDocumentos: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoDescripcion", "contains", e.text, true) : query;
    e.updateData(this.cbTiposEmisionDocumentos, query);
  };

  public onFilteringTipoDato: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTipoDatos, 'cnoTipoDato');
  };

  changeTipoIdentificacion(event: any) {
    const identificacionControl = this.form.get('numeroRepresentanteLegal');
    const tipo = event?.itemData?.codigo;

    if (!identificacionControl) return;

    // Siempre resetea estado/validaciones antes de aplicar reglas nuevas
    identificacionControl.enable({ emitEvent: false });
    identificacionControl.clearValidators();
    identificacionControl.setValue(identificacionControl.value ?? null, { emitEvent: false });

    // NO APLICA => bloquea y sin validaciones
    if (!event?.itemData || tipo === EnumTipoIdentificacion.NoAplica) {
      identificacionControl.setValue(null, { emitEvent: false });
      identificacionControl.disable({ emitEvent: false });
      identificacionControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    // Reglas según tipo
    if (tipo === EnumTipoIdentificacion.Ruc) {
      identificacionControl.setValidators([
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(13),
        Validators.maxLength(13),
      ]);
    } else if (tipo === EnumTipoIdentificacion.Cedula) {
      identificacionControl.setValidators([
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]);
    } else {
      // Otros => regla base del form
      identificacionControl.setValidators([
        Validators.maxLength(50),
      ]);
    }

    identificacionControl.updateValueAndValidity({ emitEvent: false });
  }

  toggleCollapse(): void {
    if (!this.visibleCollapse) {
      this.activeTabPaneIdx = 0;
      setTimeout(() => {
        this.visibleCollapse = true;
        this.nameIcono = "cilCaretBottom";
      });
    } else {
      this.activeTabPaneIdx = null;
      this.visibleCollapse = false;
      this.nameIcono = "cilCaretTop";
    }
  }


  onChangeGrupoEmpresa(event: any) {
    try {
      const itemData = event.itemData;
      if (!itemData) {
        this.form.get('planCuenta')?.patchValue(null);
        this.cbCuentasContablesByPlanCuenta = [];
        return;
      }
      this.form.get('planCuenta')?.patchValue(itemData.codigoPlanCuenta ?? null);
      this.cbCuentasContablesByPlanCuenta = [];
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  onChangePlanCuenta(event: any) {
    try {
      const codigo = event.itemData?.codigo;
      if (!codigo) {
        this.cbCuentasContablesByPlanCuenta = [];
        return;
      }
      this.form.get("planCuenta").patchValue(codigo);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  debounceCuentasContables() {
    this.searchCuentaContableTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((query: any) => {
        var codigoPlanCuenta = this.form.get("planCuenta")?.value;
        if (query.length >= 3 && codigoPlanCuenta) {
          this.isLoadingCuentaContable = true;
          return this.cuentaContableService.GetCuentasContablesFilter(codigoPlanCuenta, query).pipe(
            catchError((error: any) => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoadingCuentaContable = false)
          );
        } else if (query.length < 3) {
          this.cbCuentasContablesByPlanCuenta = [];
          return of(null);
        } else {
          return of(null);
        }
      })
    ).subscribe({
      next: (response: any) => {
        if (response) {
          if (response.isSuccess) {
            this.cbCuentasContablesByPlanCuenta = response.result;
          } else {
            this.toastr.error(response.message || 'Error al cargar las cuentas contables.');
          }
        }
      },
      error: (err) => {
        this.toastr.error(cadenaErrores(err));
      }
    });
  }

  debouncedGetCuentasContables(event: FilteringEventArgs) {
    const query = (event.text ?? '').trim();
    if (query.length >= 3) {
      this.searchCuentaContableTextChanged.next(query);
    }
  }

  onChangeContribuyenteEspecial(event: any) {
    const isChecked = event?.target?.checked ?? false;
    this.form.patchValue({
      declaraSri: isChecked ? EnumTipoAnexo.ATS : EnumTipoAnexo.REOC
    })
  }

  async enfocarSiguienteCampo(celda: string) {
    const map: Record<string, () => void> = {
      codigo: () => {
        if (this.form.get("codigo").value == null) {
          this.toastr.warning(`Ingrese un código.`, 'Información del Sistema');
        } else {
          this.descripcion.nativeElement.focus();
        }
        // }
      },
      descripcion: () => {
        if (this.form.get("descripcion").value == null) {
          this.toastr.warning(`Ingrese una descripción.`, 'Información del Sistema');
        } else {
          if(this.StateEnum === TipoAccion.Create) {
            this.activeTabPaneIdx = 0;
            setTimeout(() => this.grupoEmpresa.focusIn(), 0);
          }else {
            this.activo.nativeElement.focus();
          }
        }
      },
      activo: () => {
        this.activeTabPaneIdx = 0;
        setTimeout(() => this.grupoEmpresa.focusIn(), 0);
      },
      grupoEmpresa: () => {
        if (this.form.get("grupoEmpresa").value == null) {
          this.toastr.warning(`Seleccione un grupo de empresa.`, 'Información del Sistema');
        } else {
          this.razonSocial.nativeElement.focus();
        }
      },
      razonSocial: () => {
        if (this.form.get("razonSocial").value == null) {
          this.toastr.warning(`Ingrese la razón social.`, 'Información del Sistema');
        } else {
          this.nombreComercial.nativeElement.focus();
        }
      },
      nombreComercial: () => {
        if (this.form.get("nombreComercial").value == null) {
          this.toastr.warning(`Ingrese el nombre comercial.`, 'Información del Sistema');
        } else {
          this.codigoTipoDato.focusIn();
        }
      },
      codigoTipoDato: () => {
        if (this.form.get("codigoTipoDato").value == null) {
          this.toastr.warning(`Seleccione un tipo de dato.`, 'Información del Sistema');
        } else {
          this.dia.nativeElement.focus();
        }
      },
      dia: () => {
        this.mes.nativeElement.focus();
      },
      mes: () => {
        this.anio.nativeElement.focus();
      },
      anio: () => {
        this.cuentaContableCierre.focusIn();
      },

      cuentaContableCierre: () => {
        if (this.form.get("cuentaContableCierre").value == null) {
          this.toastr.warning(`Ingrese una cuenta de cierre.`, 'Información del Sistema');
        } else {
          this.fax.nativeElement.focus();
        }
      },
      fax: () => {
        this.telefonos.focusIn();
      },

      descripcionRepresentanteLegal: () => {
        this.idTipoIdentificacionRepresentanteLegal.focusIn();
      },
      idTipoIdentificacionRepresentanteLegal: () => {
        var idTipoIdentificacionRepresentanteLegal = this.form.get('idTipoIdentificacionRepresentanteLegal').value
        if (idTipoIdentificacionRepresentanteLegal == null || this.cbTiposIdentificacion.length === 0) {
          this.numeroRepresentanteLegal.nativeElement.focus();
        } else {
          var codigoIdentificacion = this.cbTiposIdentificacion.find(x => x.idTipoIdentificacion === idTipoIdentificacionRepresentanteLegal).codigo;
          if (codigoIdentificacion === EnumTipoIdentificacion.NoAplica) {
            this.activeTabPaneIdx = 2;
            setTimeout(() => this.descripcionContador.nativeElement.focus(), 0);
            this.descripcionContador.nativeElement.focus();
            this.form.get('numeroRepresentanteLegal')?.disable();
          } else {
            this.form.get('numeroRepresentanteLegal')?.enable();
            this.numeroRepresentanteLegal.nativeElement.focus();
          }
        }


      },
      numeroRepresentanteLegal: () => {
        const ctrl = this.form.get('numeroRepresentanteLegal');
        ctrl?.markAsTouched();
        ctrl?.markAsDirty();
        ctrl?.updateValueAndValidity({ emitEvent: false });

        // Si hay error, NO avanza y mantiene foco
        if (ctrl?.invalid) {
          setTimeout(() => this.numeroRepresentanteLegal.nativeElement.focus(), 0);
          return;
        }

        this.activeTabPaneIdx = 2;
        setTimeout(() => this.descripcionContador.nativeElement.focus(), 0);
      },
      descripcionContador: () => {
        this.rucContador.nativeElement.focus();
      },

      rucContador: () => {
        this.registroProfesionalContador.nativeElement.focus();
      },

      registroProfesionalContador: () => {
        this.activeTabPaneIdx = 3;
        setTimeout(() => this.esContribuyenteEspecial.nativeElement.focus(), 0);
      },

      esContribuyenteEspecial: () => {
        this.recibeDevolucionIva.nativeElement.focus();
      },
      recibeDevolucionIva: () => {
        this.numeroResolucionContribuyenteEspecial.nativeElement.focus();
      },
      numeroResolucionContribuyenteEspecial: () => {
        this.fechaResolucionContribuyenteEspecial.nativeElement.focus();
      },

      fechaResolucionContribuyenteEspecial: () => {
        this.declaraSri.focusIn();
      },

      declaraSri: () => {
        this.tipoAmbienteEmisionDctoElectronico.focusIn();
      },

      tipoAmbienteEmisionDctoElectronico: () => {
        this.emisionDocFactura.focusIn();
      },

      emisionDocFactura: () => {
        this.emisionDocGuiaRemision.focusIn();
      },

      emisionDocGuiaRemision: () => {
        this.emisionDocNotaCreditoDebito.focusIn();
      },

      emisionDocNotaCreditoDebito: () => {
        this.emisionDocLiquidacionCompra.focusIn();
      },

      emisionDocLiquidacionCompra: () => {
        this.emisionDocRetencion.focusIn();
      },

      emisionDocRetencion: () => {
        this.agregarSucursal.nativeElement.focus();
      }
    };
    try {
      map[celda]?.();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getAuditoria() {
    try {

      const titulo: string = `[empresa #${this.form.get("codigo")?.value}]`

      this.modalHelperService.abrirModal(AuditoriaConsultaComponent, {
        codigoTransaccion: TransactionCode.empresa,
        identificacionPrincipal: this.form.get("codigo")?.value,
        titulo: titulo
      }, {
        size: 'xl'
      });

    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.toastr.error(cadenaErrores(error));
    this.spinnerService.hideGlobalSpinner();
    return throwError(() => error);
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }
}
