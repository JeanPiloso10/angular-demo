import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { Operacion } from '@shared/enums/Operacion';
import { CommandClickEventArgs, CommandModel, GridComponent, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import Swal from 'sweetalert2';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { NuevaNotificacionOperacionTransaccionComponent } from '../nueva-notificacion-operacion-transaccion/nueva-notificacion-operacion-transaccion.component';
import { ModificarOperacionTransaccionComponent } from '../modificar-operacion-transaccion/modificar-operacion-transaccion.component';
import { NotificacionOperacionTransaccionService } from '../notificacion-operacion-transaccion.service';
import { NotificacionOperacionTransaccion } from '@app/core/models/notificacion-operacion-transaccion-dto';
import { OperacionesDto } from '@app/core/models/operaciones-dto';
import { Router } from '@angular/router';
import { ModalHelperService } from '@app/core/services/modal-helper.service';


@Component({
  selector: 'app-listado-notificacion-operacion-transaccion',
  standalone: false,
  templateUrl: './listado-notificacion-operacion-transaccion.component.html',
  styleUrl: './listado-notificacion-operacion-transaccion.component.scss'
})
export class ListadoNotificacionOperacionTransaccionComponent {

  

  public localFieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  public localFieldsUsuario: Object = { text: 'userName', value: 'userName' };
  public StateEnum: TipoAccion = TipoAccion.Read;
  public permissions: any[] = [];
  public form: FormGroup;
  public cbTransaccion: any[] = [];
  public data: any;
  public commands?: CommandModel[];
  public pageOption: Object;
  public toolbar?: ToolbarItems[] | object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public filterSettings: Object;
  @ViewChild('grid') grid?: GridComponent;
  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
  };
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private transaccionService: TransaccionService,
    private modalHelperService: ModalHelperService,
    private router: Router,
    private notificacionOperacionTransaccion: NotificacionOperacionTransaccionService,
  ) {
    this.form = this.initForm();
  }
  private initForm(): FormGroup {
    return this.formBuilder.group({
      codigoTransaccion: ['']
    });
  }

  ngOnInit(): void {
    this.filterSettings = { type: 'Excel' }
    this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
    this.commands = [
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' }, title: 'Modificar' },
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' }, title: 'Eliminar' }
    ];

    this.initializeComponent();
  }


  private async initializeComponent() {

    try {

      this.form.disable();
      await this.getPermissions();

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }


      this.spinnerService.showGlobalSpinner();
      this.barraBotones();
      this.spinnerService.hideGlobalSpinner();

      await this.loadInitialData();
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }


  }


  async loadInitialData() {

    try {
      const results = await firstValueFrom(forkJoin({
        responseTransacciones: this.transaccionService.todos().pipe(catchError(error => of({ result: [] })))
      }));

      this.cbTransaccion = results.responseTransacciones.result;

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }


  }

  async getPermissions(): Promise<void> {
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

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some(e => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }


  barraBotones() {

    this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);

    this.form.get('codigoTransaccion').enable();
  }


  public commandClick(args: CommandClickEventArgs): void {


    if (!args.commandColumn?.title) {
      return;
    }

    if (args.commandColumn.title === 'Modificar') {
      this.modificarRegistro(args.rowData);
    } else if (args.commandColumn.title === 'Eliminar') {
      this.eliminar(args);
    }

  }

  private modificarRegistro(rowData: any): void {
    if (!this.tienePermiso(Operacion.Modificar)) {
      this.toastr.warning('No tiene permiso para realizar la acción');
      return;
    }

    const modalRef = this.modalHelperService.abrirModal(ModificarOperacionTransaccionComponent,
      {
        titulo: 'Modificar',
        idNotificacionOperacionTransaccion: rowData.idNotificacionOperacionTransaccion
      },
      {
        size: 'lg',
        scrollable: true,
        windowClass: 'modal-dialog-centered',
        animation: true,
        backdrop: 'static'
      });

    modalRef.componentInstance.submitEvent.subscribe({
      next: () => {
        this.onChangeTransaccion();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

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
        const respuesta: any = await firstValueFrom(this.notificacionOperacionTransaccion.borrar(args.rowData.idNotificacionOperacionTransaccion));
        if (respuesta.isSuccess) {
          // Esperar a que cargarRegistros se complete antes de continuar
          await this.onChangeTransaccion();
          this.toastr.success('Acción exitosa');

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

  onChangeTransaccion(valorSeleccionado?: string): void {
    try {
      if (valorSeleccionado !== undefined) {
        this.form.get('codigoTransaccion')?.patchValue(valorSeleccionado);
      }

      const codigoTransaccion = this.form.get('codigoTransaccion')?.value;
      this.data = [];

      if (!codigoTransaccion) {
        return;
      }

      this.spinnerService.showGlobalSpinner();

      const dto: NotificacionOperacionTransaccion = {
        codigoTransaccion,
        codigoAccion: ''
      };

      this.notificacionOperacionTransaccion.ObtenerListadoNotificacionOperacionTransaccion(dto).subscribe({
        next: (response) => {
          this.spinnerService.hideGlobalSpinner();

          if (response.isSuccess) {
            this.data = response.result;
          }
        },
        error: (error: any) => {
          this.spinnerService.hideGlobalSpinner();
          this.toastr.error(cadenaErrores(error));
        }
      });
    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }

  }


  nuevoRegistro(): void {

    const modelo = {
      codigoTransaccion: this.form.get('codigoTransaccion')?.value ?? null,
      estado: true,
    };

    const modalRef = this.modalHelperService.abrirModal(NuevaNotificacionOperacionTransaccionComponent,
    {titulo: 'Nuevo', modelo: modelo},
    {
      size: 'lg',
      scrollable: true,
      windowClass: 'modal-dialog-centered',
      animation: true,
      backdrop: 'static',
    });
   

    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        if (data) {
          this.form.get("codigoTransaccion").patchValue(data.codigoTransaccion);
          this.onChangeTransaccion();
          this.grid.refresh();
        }
      },
      error: (err: any) => {
        console.error(err);
      }

    });

  }


  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }

  toolbarClick(args: ClickEventArgs): void {
    switch (args.item.id) {
      case 'DefaultExport_pdfexport':
        this.grid.pdfExport();
        break;
      case 'DefaultExport_excelexport':
        if (this.data && this.data.length > 0) {
          this.grid.excelExport();
        } else {
          this.toastr.warning('No hay datos para exportar.');
        }

        break;
      case 'DefaultExport_csvexport':
        this.grid.csvExport();
        break;
    }
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], property: string) => {
    let query = new Query();
    query = (e.text != "") ? query.where(property, "contains", e.text, true) : query;
    e.updateData(list, query);
  };


  public onFilteringTransaccion: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbTransaccion, 'cnoTransaccion');
  };

}

