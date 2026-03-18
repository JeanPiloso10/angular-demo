

import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ConfiguracionFirmaService } from '../configuracion-firma.service';
import { Router } from '@angular/router';
import { FormValidationService } from '@core/services/form-validation.service';
import { SecurityService } from '@core/services/security.service';
import { SucursalService } from '../../sucursal/sucursal.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { ComboBoxComponent, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ListaTipoSecuencia, TipoSecuencia } from '@shared/enums/TipoSecuencia';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { RolesService } from '../../roles/roles.service';
import {TipoAprobadorService} from '../../tipo-aprobador/tipo-aprobador.service';
import { TipoAprobador} from '@shared/enums/TipoAprobador'
import { AreasService } from '../../area/area.service';
import { CategoriaCompraService } from '../../categoria-compra/categoria-compra.service';

@Component({
  selector: 'app-formulario-configuracion-firma',
  templateUrl: './formulario-configuracion-firma.component.html',
  styleUrl: './formulario-configuracion-firma.component.scss',
  standalone:false
})
export class FormularioConfiguracionFirmaComponent {

  
  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('codigoTransaccion', { static: false }) codigoTransaccion!: ComboBoxComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  form: FormGroup;
  tituloFormulario: string;
  entidad = 'configuracionfirma';
  usuarios: any[] = [];
  roles: any[] = [];
  tipoAprobadores: any[] = [];
  sucursales: any[] = [];
  transacciones: any[] = [];
  cbTipoSecuencia: any[] = [];

  fieldsTipoSecuencia = { text: 'descripcion', value: 'codigo' };
  fieldsTransaccion = { text: 'cnoTransaccion', value: 'codigo' };
  fieldsSucursal = { text: 'cnoSucursal', value: 'idSucursal' };
  fieldsUsuario = { text: 'userName', value: 'userName' };
  fieldsRoles = { text: 'name', value: 'id' };
  fieldsTipoAprobadores = { text: 'cnoTipoAprobador', value: 'codigo' };

  customStylesValidated = false;
  localWaterMark = 'Seleccione un item.';
  public listadoAreas: any[] = [];
  public fieldsArea: Object = { text: 'cnoArea', value: 'codigo' };
  public listadoCategoriasCompra: any[] = [];
  public fieldsCategoriaCompra: Object = { text: 'cnoCategoriaCompra', value: 'codigo' };
  public filterSettings: Object;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private transaccionService: TransaccionService,
    private sucursalService: SucursalService,
    private securityService: SecurityService,
    private userService: UsuariosService,
    private roleService: RolesService,
    private tipoAprobadorService: TipoAprobadorService,
    private areaService: AreasService,
    private categoriaCompraService: CategoriaCompraService
  ) {
    this.form = this.initForm();
  }


  
  ngOnInit(): void {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('activo')?.valueChanges.subscribe({

      next: (value) => {
        this.updateLabel(value);
      },
      error: (err) => {
        console.error(err);
      }
      
    });
  
    // Inicializar el componente
    this.initializeComponent();
  }
  
  private async initializeComponent() {
    try {
      await this.patchFormValues();
      await this.loadInitialData();
      this.barraBotones();
      this.setupValueChanges();
  
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  private setupValueChanges(): void {
    const rolControl = this.form.get('idRolFirmante');
    const usuarioControl = this.form.get('usuarioFirmante');

    const rolSuperiorControl = this.form.get('idRolFirmanteSuperior');
    const usuarioSuperiorControl = this.form.get('usuarioFirmanteSuperior');
  
  
    rolControl?.valueChanges.subscribe({

      next: (value) => {
        
        if (value) {
          if (!usuarioControl?.disabled) {
            usuarioControl?.disable({ emitEvent: false });
          }
        } else {
          if (usuarioControl?.disabled) {
            usuarioControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
      
    });
  
    usuarioControl?.valueChanges.subscribe({
      next: (value) => {
       
      if (value) {
        if (!rolControl?.disabled) {
          rolControl?.disable({ emitEvent: false });
        }
      } else {
        if (rolControl?.disabled) {
          rolControl?.enable({ emitEvent: false });
        }
      }
      },
      error: (err) => {
        console.error(err);
      }
      
    });


    rolSuperiorControl?.valueChanges.subscribe({

      next: (value) => {
        
        if (value) {
          if (!usuarioSuperiorControl?.disabled) {
            usuarioSuperiorControl?.disable({ emitEvent: false });
          }
        } else {
          if (usuarioSuperiorControl?.disabled) {
            usuarioSuperiorControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
      
    });
  
    usuarioSuperiorControl?.valueChanges.subscribe({

      next: (value) => {
       
        if (value) {
          if (!rolSuperiorControl?.disabled) {
            rolSuperiorControl?.disable({ emitEvent: false });
          }
        } else {
          if (rolSuperiorControl?.disabled) {
            rolSuperiorControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
      
    });

    // Exclusión mutua para firmante alterno
    const rolAlternoControl = this.form.get('idRolFirmanteAlterno');
    const usuarioAlternoControl = this.form.get('usuarioFirmanteAlterno');

    rolAlternoControl?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          if (!usuarioAlternoControl?.disabled) {
            usuarioAlternoControl?.setValue(null, { emitEvent: false });
            usuarioAlternoControl?.disable({ emitEvent: false });
          }
        } else {
          if (usuarioAlternoControl?.disabled) {
            usuarioAlternoControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

    usuarioAlternoControl?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          if (!rolAlternoControl?.disabled) {
            rolAlternoControl?.setValue(null, { emitEvent: false });
            rolAlternoControl?.disable({ emitEvent: false });
          }
        } else {
          if (rolAlternoControl?.disabled) {
            rolAlternoControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

    // Exclusión mutua para firmante superior alterno
    const rolSuperiorAlternoControl = this.form.get('idRolFirmanteSuperiorAlterno');
    const usuarioSuperiorAlternoControl = this.form.get('usuarioFirmanteSuperiorAlterno');

    rolSuperiorAlternoControl?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          if (!usuarioSuperiorAlternoControl?.disabled) {
            usuarioSuperiorAlternoControl?.setValue(null, { emitEvent: false });
            usuarioSuperiorAlternoControl?.disable({ emitEvent: false });
          }
        } else {
          if (usuarioSuperiorAlternoControl?.disabled) {
            usuarioSuperiorAlternoControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

    usuarioSuperiorAlternoControl?.valueChanges.subscribe({
      next: (value) => {
        if (value) {
          if (!rolSuperiorAlternoControl?.disabled) {
            rolSuperiorAlternoControl?.setValue(null, { emitEvent: false });
            rolSuperiorAlternoControl?.disable({ emitEvent: false });
          }
        } else {
          if (rolSuperiorAlternoControl?.disabled) {
            rolSuperiorAlternoControl?.enable({ emitEvent: false });
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

    const referencia1Control = this.form.get('referencia1');
    const referencia2Control = this.form.get('referencia2');
    const referencia3Control = this.form.get('referencia3');

// Observa los cambios en referencia1
referencia1Control?.valueChanges.subscribe({

  next: (value) => {
   
    if (value) {
      referencia2Control?.disable({ emitEvent: false });
      referencia3Control?.disable({ emitEvent: false });
    } else {
      referencia2Control?.enable({ emitEvent: false });
      referencia3Control?.enable({ emitEvent: false });
    }
  },
  error: (err) => {
    console.error(err);
  }
  
});

// Observa los cambios en referencia2
referencia2Control?.valueChanges.subscribe({

  next: (value) => {
    if (value) {
      referencia1Control?.disable({ emitEvent: false });
      referencia3Control?.disable({ emitEvent: false });
    } else {
      referencia1Control?.enable({ emitEvent: false });
      referencia3Control?.enable({ emitEvent: false });
    }
  },
  error: (err) => {
    console.error(err);
  }
  
});

// Observa los cambios en referencia3
referencia3Control?.valueChanges.subscribe({

  next: (value) => {
   
      if (value) {
        referencia1Control?.disable({ emitEvent: false });
        referencia2Control?.disable({ emitEvent: false });
      } else {
        referencia1Control?.enable({ emitEvent: false });
        referencia2Control?.enable({ emitEvent: false });
      }
  },
  error: (err) => {
    console.error(err);
  }
  
});

  }

  private barraBotones() {
    if (this.StateEnum === TipoAccion.Create) {
      
    }
    else if (this.StateEnum === TipoAccion.Update) {
       this.form.get('codigoTransaccion').disable();
       this.form.get('idSucursal').disable();
    }
  }

  private async loadInitialData() {


    this.cbTipoSecuencia = ListaTipoSecuencia;

    this.spinnerService.showGlobalSpinner();
    try {
      const results = await firstValueFrom(forkJoin({
        responseSucursal: this.sucursalService.todos().pipe(catchError(error => of({ result: [] }))),
        responseTransaccion: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
        responseUsuarios: this.userService.todos().pipe(catchError(error => of({ result: [] }))),
        responseRoles: this.roleService.todos().pipe(catchError(error => of({ result: [] }))),
        responseTipoAprobadores: this.tipoAprobadorService.todos().pipe(catchError(error => of({ result: [] }))),
        areasResponse: this.areaService.listado().pipe(catchError(error => of({ result: [] }))),
        categoriasCompraResponse: this.categoriaCompraService.ListadoCategoriaCompra().pipe(catchError(error => of({ result: [] }))),
      }));
      this.spinnerService.hideGlobalSpinner();

      this.usuarios = results.responseUsuarios.result;
      this.roles = results.responseRoles.result;
      this.tipoAprobadores = results.responseTipoAprobadores.result;
      this.sucursales = results.responseSucursal.isSuccess ? results.responseSucursal.result : [];
      this.transacciones = results.responseTransaccion.isSuccess ? results.responseTransaccion.result : [];
      this.listadoAreas = results.areasResponse.result;
      this.listadoCategoriasCompra = results.categoriasCompraResponse.result;
      
      if (!results.responseSucursal.isSuccess) {
        this.toastr.error(results.responseSucursal.message || 'Error al cargar sucursales.');
      }

      if (!results.responseTransaccion.isSuccess) {
        this.toastr.error(results.responseTransaccion.message || 'Error al cargar transacciones.');
      }

      this.form.get('activo').patchValue(true);

      this.patchFormValues();
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngAfterViewInit(): void {
    this.codigoTransaccion.focusIn();
  }

  public onFilteringTransaccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('cnoTransaccion', 'contains', e.text, true) : new Query();
    e.updateData(this.transacciones, query);
  };

  public onFilteringSucursal: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('cnoSucursal', 'contains', e.text, true) : new Query();
    e.updateData(this.sucursales, query);
  };

  public onFilteringUsuario: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    try {
      const query = e.text ? new Query().where('userName', 'contains', e.text, true) : new Query();
      e.updateData(this.usuarios, query);
    } catch (error) {
      this.toastr.error('onFilteringUsuario', cadenaErrores(error));
    }
  };

  public onFilteringRol: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    try {
      const query = e.text ? new Query().where('name', 'contains', e.text, true) : new Query();
      e.updateData(this.roles, query);
    } catch (error) {
      this.toastr.error('onFilteringRol', cadenaErrores(error));
    }
  };

  public onFilteringTipoAprobador: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    try {
      const query = e.text ? new Query().where('cnoTipoAprobador', 'contains', e.text, true) : new Query();
      e.updateData(this.tipoAprobadores, query);
    } catch (error) {
      this.toastr.error('onFilteringTipoAprobador', cadenaErrores(error));
    }
  };

  private initForm(): FormGroup {
    return this.formBuilder.group({
      idConfiguracionFirma: [0],
      codigoTransaccion: ['', [Validators.required]],
      idSucursal: [null],
      referencia1: [null],
      referencia2: [null],
      referencia3: [null],
      tipoDocumento: [null],
      usuarioFirmante: [null],
      idRolFirmante: [null],
      codigoTipoAprobador: [null, [Validators.required]],
      montoMaximo: [0.00],

      usuarioFirmanteSuperior: [null],
      idRolFirmanteSuperior: [null],
      codigoTipoAprobadorSuperior: [null],
      montoMaximoSuperior: [0.00],

      usuarioFirmanteAlterno: [null],
      idRolFirmanteAlterno: [null],
      usuarioFirmanteSuperiorAlterno: [null],
      idRolFirmanteSuperiorAlterno: [null],

      ordenFirma: [0],
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


      this.form.patchValue({
        idConfiguracionFirma: this.modelo.idConfiguracionFirma,
        codigoTransaccion: this.modelo.codigoTransaccion,
        idSucursal: this.modelo.idSucursal,
        referencia1: this.modelo.referencia1,
        referencia2: this.modelo.referencia2,
        referencia3: this.modelo.referencia3,
        tipoDocumento: this.modelo.tipoDocumento,
        usuarioFirmante: this.modelo.usuarioFirmante,
        idRolFirmante: this.modelo.idRolFirmante,
        codigoTipoAprobador: this.modelo.codigoTipoAprobador,
        montoMaximo: this.modelo.montoMaximo,

        usuarioFirmanteSuperior: this.modelo.usuarioFirmanteSuperior,
        idRolFirmanteSuperior: this.modelo.idRolFirmanteSuperior,
        codigoTipoAprobadorSuperior: this.modelo.codigoTipoAprobadorSuperior,
        montoMaximoSuperior: this.modelo.montoMaximoSuperior,

        usuarioFirmanteAlterno: this.modelo.usuarioFirmanteAlterno,
        idRolFirmanteAlterno: this.modelo.idRolFirmanteAlterno,
        usuarioFirmanteSuperiorAlterno: this.modelo.usuarioFirmanteSuperiorAlterno,
        idRolFirmanteSuperiorAlterno: this.modelo.idRolFirmanteSuperiorAlterno,

        ordenFirma: this.modelo.ordenFirma,
        activo: this.modelo.activo,
        usuarioCreacion: this.modelo.usuarioCreacion,
        fechaCreacion: this.modelo.fechaCreacion,
        equipoCreacion: this.modelo.equipoCreacion,
        usuarioModificacion: this.modelo.usuarioModificacion,
        fechaModificacion: this.modelo.fechaModificacion,
        equipoModificacion: this.modelo.equipoModificacion
      });

       // Verificar y aplicar el estado de habilitación inicial para los controles de referencia
    const referencia1Control = this.form.get('referencia1');
    const referencia2Control = this.form.get('referencia2');
    const referencia3Control = this.form.get('referencia3');

    if (referencia1Control?.value) {
      referencia2Control?.disable({ emitEvent: false });
      referencia3Control?.disable({ emitEvent: false });
    } else if (referencia2Control?.value) {
      referencia1Control?.disable({ emitEvent: false });
      referencia3Control?.disable({ emitEvent: false });
    } else if (referencia3Control?.value) {
      referencia1Control?.disable({ emitEvent: false });
      referencia2Control?.disable({ emitEvent: false });
    }

    // Sincronizar estado inicial de exclusión mutua para firmante/rol
    const rolVal = this.form.get('idRolFirmante')?.value;
    const usuarioVal = this.form.get('usuarioFirmante')?.value;
    if (rolVal) {
      this.form.get('usuarioFirmante')?.setValue(null, { emitEvent: false });
      this.form.get('usuarioFirmante')?.disable({ emitEvent: false });
    } else if (usuarioVal) {
      this.form.get('idRolFirmante')?.setValue(null, { emitEvent: false });
      this.form.get('idRolFirmante')?.disable({ emitEvent: false });
    }

    const rolSupVal = this.form.get('idRolFirmanteSuperior')?.value;
    const usuarioSupVal = this.form.get('usuarioFirmanteSuperior')?.value;
    if (rolSupVal) {
      this.form.get('usuarioFirmanteSuperior')?.setValue(null, { emitEvent: false });
      this.form.get('usuarioFirmanteSuperior')?.disable({ emitEvent: false });
    } else if (usuarioSupVal) {
      this.form.get('idRolFirmanteSuperior')?.setValue(null, { emitEvent: false });
      this.form.get('idRolFirmanteSuperior')?.disable({ emitEvent: false });
    }

    const rolAltVal = this.form.get('idRolFirmanteAlterno')?.value;
    const usuarioAltVal = this.form.get('usuarioFirmanteAlterno')?.value;
    if (rolAltVal) {
      this.form.get('usuarioFirmanteAlterno')?.setValue(null, { emitEvent: false });
      this.form.get('usuarioFirmanteAlterno')?.disable({ emitEvent: false });
    } else if (usuarioAltVal) {
      this.form.get('idRolFirmanteAlterno')?.setValue(null, { emitEvent: false });
      this.form.get('idRolFirmanteAlterno')?.disable({ emitEvent: false });
    }

    const rolSupAltVal = this.form.get('idRolFirmanteSuperiorAlterno')?.value;
    const usuarioSupAltVal = this.form.get('usuarioFirmanteSuperiorAlterno')?.value;
    if (rolSupAltVal) {
      this.form.get('usuarioFirmanteSuperiorAlterno')?.setValue(null, { emitEvent: false });
      this.form.get('usuarioFirmanteSuperiorAlterno')?.disable({ emitEvent: false });
    } else if (usuarioSupAltVal) {
      this.form.get('idRolFirmanteSuperiorAlterno')?.setValue(null, { emitEvent: false });
      this.form.get('idRolFirmanteSuperiorAlterno')?.disable({ emitEvent: false });
    }
    }
  }

  guardarCambios(): void {
    try
    {
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
      }
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    
  }

  cancelar(): void {
    this.router.navigate(['/' + this.entidad + '/listado']);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'g') {
      this.guardarCambios();
      event.preventDefault();
    } else if (event.altKey && event.key === 'c') {
      this.cancelar();
      event.preventDefault();
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

  public onTipoAprobadorChange(event: any): void {

      const isMontoMaximoDisabled = event;

      if (isMontoMaximoDisabled !== TipoAprobador.Aprobador) {
        this.form.get('montoMaximo')?.disable();   

      } else {
        this.form.get('montoMaximo')?.enable();
        
      }
    
  
  }

  public onTipoAprobadorSuperiorChange(event: any): void {

      const isMontoMaximoDisabled = event;

      if (isMontoMaximoDisabled !== TipoAprobador.Aprobador) {
        this.form.get('montoMaximoSuperior')?.disable();   

      } else {
        this.form.get('montoMaximoSuperior')?.enable();
      }

  }

  
  public onFilteringArea: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoArea", "contains", e.text, true) : query;
    e.updateData(this.listadoAreas, query);
  };

  public onFilteringCategoriaCompra: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoCategoriaCompra", "contains", e.text, true) : query;
    e.updateData(this.listadoCategoriasCompra, query);
  };

}
