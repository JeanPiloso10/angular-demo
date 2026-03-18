import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CommandModel, GridComponent, SearchSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import Swal from 'sweetalert2';
import { Operacion } from '@shared/enums/Operacion';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { Router } from '@angular/router';
import { TipoArchivoAnexoTransaccionService } from '../tipo-archivo-anexo-transaccion.service';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { NuevoTipoArchivoAnexoTransaccionComponent } from '../nuevo-tipo-archivo-anexo-transaccion/nuevo-tipo-archivo-anexo-transaccion.component';
import { ModificarTipoArchivoAnexoTransaccionComponent } from '../modificar-tipo-archivo-anexo-transaccion/modificar-tipo-archivo-anexo-transaccion.component';
import { ModalHelperService } from '@app/core/services/modal-helper.service';

@Component({
  selector: 'app-listado-tipo-archivo-anexo-transaccion',
  standalone: false,
  templateUrl: './listado-tipo-archivo-anexo-transaccion.component.html',
  styleUrl: './listado-tipo-archivo-anexo-transaccion.component.scss'
})
export class ListadoTipoArchivoAnexoTransaccionComponent {
  form: FormGroup;
  errores: string;
  StateEnum: TipoAccion = TipoAccion.Read;
  modelo: any;
  data: any;
  permissions: any[] = [];

  @ViewChild('transaccion', { static: false }) transaccion!: ComboBoxComponent;
  @ViewChild('grid') grid?: GridComponent;
  
  public entidad = 'tipoArchivoAnexoTransaccion';
  public sortOptions?: object;
  public toolbar?: ToolbarItems[] | object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: true };
  public commands?: CommandModel[];
  public cbTipoArchivoAnexo: any[];
  public cbTransaccion: any[];
  public localFieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  public estadoBotones = { btnNuevo: false, btnModificar: false, btnGrabar: false };
  public searchSettings: SearchSettingsModel = { fields: ['tipoArchivoAnexo.descripcion', 'activo'] };
  public filterSettings: Object;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private modalHelperService: ModalHelperService,
    private spinnerService: SpinnerService,
    private tipoArchivoAnexoTransaccionService: TipoArchivoAnexoTransaccionService,
    private transaccionService: TransaccionService,
    private permissionService: PermissionService) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      this.form.disable();
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      await this.loadInitialData();
      this.barraBotones();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async loadInitialData() {
    const results = await firstValueFrom(forkJoin({
      transaccionResponse: this.transaccionService.todos().pipe(catchError(error => of({ result: [] })))
    }));

    if (results.transaccionResponse.isSuccess) {
      this.cbTransaccion = results.transaccionResponse.result;
    } else {
      this.toastr.error(results.transaccionResponse.message || 'Error al cargar las transacciones.');
    }
  }

  ngAfterViewInit(): void {
    this.transaccion.focusIn();
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      transaccion: [''],
      idTipoArchivoAnexo: [''],
    });
  }

  async onChange(args: any) {
    try {
      this.data = [];
      if (args) {
        const codigoTransaccion = args;
        this.spinnerService.showGlobalSpinner();
        if (codigoTransaccion) {
          const response: any = await firstValueFrom(this.tipoArchivoAnexoTransaccionService.tipoArchivoAnexoTransaccion(codigoTransaccion));
          if (response.isSuccess === true) {
            this.data = response.result;
          }
        } else {
          this.toastr.warning('La transacción seleccionada no tiene tipo de archivos asociados.');
        }
      } else {
        this.data = [];
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], property: string) => {
    let query = new Query();
    query = (e.text != "") ? query.where(property, "contains", e.text, true) : query;
    e.updateData(list, query);
  };

  onFilteringTipoArchivoAnexo: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTipoArchivoAnexo, "descripcion");
  };

  onFilteringTransaccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTransaccion, "cnoTransaccion");
  };

  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.tipoArchivoAnexosTransaccion).pipe(catchError(error => of({ result: [] })))
      }));
      this.permissions = results.permission.result as OperacionesDto[];
      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
      };
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some(e => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }

  barraBotones() {
    this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);
    const allCommands = [
      {
        permiso: Operacion.Modificar,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' },
        title: 'Modificar'
      },
      {
        permiso: Operacion.Eliminar,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' },
        title: 'Eliminar'
      }
    ];
    // Filtrar los comandos basados en los permisos
    this.commands = allCommands.filter(command => !command.permiso || this.tienePermiso(command.permiso));
    this.toolbar = ["Search", "ColumnChooser", "ExcelExport"];
    this.filterSettings = { type: 'Excel' };
    this.form.get('transaccion').enable();
  }

  nuevoRegistro(): void {
    const modalRef = this.modalHelperService.abrirModal(NuevoTipoArchivoAnexoTransaccionComponent,
    {
      codigoTransaccion: this.form.get("transaccion").value != null ? this.form.get("transaccion").value : null
    },
    {
      scrollable: true,
      animation: true,
      backdrop: 'static',
      keyboard: false
    });


    modalRef.result.then(
      () => {

        this.onChange(this.form.get('transaccion').value);
      },
    );

  }

  modificarRegistro(): void {
    this.StateEnum = TipoAccion.Update;
    this.barraBotones();
  }

  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }

  public commandClick(args: any): void {
    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title === 'Modificar') {
      const id = args.rowData.idTipoArchivoAnexoTransaccion;
      // Abrir el modal de modificación
      const modalRef = this.modalHelperService.abrirModal(ModificarTipoArchivoAnexoTransaccionComponent, 
      {
        id: id
      },
      {
        scrollable: true,
        animation: true,
        backdrop: 'static',
        keyboard: false
      });

      modalRef.result.then(
        () => {
          this.onChange(this.form.get("transaccion")?.value);
        },
      );
    }
    // Verificar si el evento fue disparado por un botón de la grilla
    else if (args.commandColumn.title && args.commandColumn.title === 'Eliminar') {
      this.eliminar(args);
    }
  }

  // Método para eliminar un registro
  async eliminar(args: any) {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro que desea borrar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.spinnerService.showGlobalSpinner();
      try {
        const idTransaccion = args.rowData.transaccion?.idTransaccion;
        const respuesta: any = await firstValueFrom(this.tipoArchivoAnexoTransaccionService.borrar(args.rowData.idTipoArchivoAnexoTransaccion));
        if (respuesta.isSuccess ===true) {
          this.toastr.success('Acción exitosa');
          this.onChange(idTransaccion);
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }
      } catch (errores) {
        this.toastr.error(cadenaErrores(errores));
      } finally {
        this.spinnerService.hideGlobalSpinner();
      }
    }
  }

  // Manejar clic en toolbar (exportar a Excel)
  toolbarClick(args: ClickEventArgs): void {
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.grid?.excelExport();
    }
  }
}

