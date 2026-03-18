
import { Component, inject, ViewChild } from '@angular/core';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { EditSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-treegrid';
import { CommandClickEventArgs, CommandModel, GridComponent, SearchSettingsModel } from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { Operacion } from '@shared/enums/Operacion';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TipoArchivoAnexoService } from '../tipo-archivo-anexo.service';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Component({
  selector: 'app-listado-tipo-archivo-anexo',
  templateUrl: './listado-tipo-archivo-anexo.component.html',
  styleUrl: './listado-tipo-archivo-anexo.component.scss',
  standalone:false
})
export class ListadoTipoArchivoAnexoComponent {

  

  @ViewChild('grid') public grid?: GridComponent;

  public data?: Object[];
  public editSettings?: EditSettingsModel;
  public toolbarOptions?: ToolbarItems[] | any;
  public searchSettings: SearchSettingsModel = { fields: ['idTipoArchivoAnexo', 'descripcion', 'activo'] };
  public errores: string = '';
  public commands?: CommandModel;
  public entidad = 'tipoArchivoAnexo';
  public queryDto: any = null;


  public Form?: FormGroup | any;

  permissions: any[] = [];
  estadoBotones = {
    btnNuevo: false,
  };

  constructor(private formBuilder: FormBuilder,
    private permissionService: PermissionService,
    private tipoArchivoAnexoService: TipoArchivoAnexoService,
    private toastr: ToastrService,
    private router: Router,
    private spinnerService: SpinnerService) {
    this.Form = this.initForm();
    this.tipoArchivoAnexoService.dataActualizada$.subscribe(() => this.loadData());
  }
  private initForm(): FormGroup {
    return this.formBuilder.group({
      pageNumberTextBox: [1],
      page: [1],
      pageSize: [50],
    });
  }

  public ngOnInit(): void {
    this.toolbarOptions = ["Search", "ColumnChooser", "ExcelExport"];
    this.editSettings = { allowEditing: false, allowAdding: false, allowDeleting: false, mode: 'Row' };
    this.initializeComponent();
    this.commands = [
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit', }, title: 'Modificar' },
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete', }, title: 'Eliminar' },
    ] as CommandModel;
    //this.cargarRegistros();
  }

  async loadData() {
    try {
      this.spinnerService.showGlobalSpinner();
      const response: any = await firstValueFrom(this.tipoArchivoAnexoService.todos());

      if (response.isSuccess && response.result && response.result?.length > 0) {
        this.data = response.result; // Actualiza los datos solo si hay resultado válido
      } else {
        this.data = [];
        this.toastr.info('No se encontraron datos.');
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  private async initializeComponent() {
    try {
      this.spinnerService.showGlobalSpinner();
      await this.getPermissions();

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }

      this.barraBotones();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.tipoArchivoAnexos).pipe(catchError(error => of({ result: [] }))),
      }));
      if (results.permission.isSuccess) {
        this.permissions = results.permission.result as OperacionesDto[];
        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
        }

      } else {
        this.permissions = [];
      }
      this.loadData();
    } catch (error) {
      this.handleError(error);
    }
  };

  private handleError(error: any) {
    this.spinnerService.hideGlobalSpinner();
    this.toastr.error(cadenaErrores(error));
  }

  barraBotones() {
    this.estadoBotones.btnNuevo = this.permissions.some(permission => permission.codigo === Operacion.Crear);
  }

  btnNuevoRegistro() {
    this.router.navigate(['/' + this.entidad + '/nuevo']);
  }

  tienePermiso(permiso: string, arreglo: any): boolean {
    let result: boolean = false;
    if (arreglo && arreglo.length > 0) {
      result = arreglo.some((e: any) => e.codigo === permiso);
    }
    return result;
  }

  public onDelete = (rowData: any) => {
    if (rowData) {
      this.eliminar(rowData);
    } else {
      this.toastr.warning("No se pudo obtener los datos de la fila para eliminar.");
    }
  }

  onCommandClick(args: CommandClickEventArgs): void {
    const rowData: any = args.rowData;
    if (args.commandColumn?.title === 'Modificar') {
      if (this.tienePermiso(Operacion.Modificar, this.permissions) == false) {
        this.toastr.warning('No tiene permiso para realizar la acción');
      } else {
        this.router.navigate(['/' + this.entidad + '/modificar', rowData.idTipoArchivoAnexo]);
      }
    } else if (args.commandColumn?.title === 'Eliminar') {
      this.onDelete(rowData);
    }
  }

  async eliminar(datos: any) {
    if (this.tienePermiso(Operacion.Eliminar, this.permissions) == false) {
      this.toastr.warning('No tiene permiso para realizar la acción');
    } else {
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
          let respuesta: any = null
          respuesta = await firstValueFrom(this.tipoArchivoAnexoService.borrar(datos.idTipoArchivoAnexo));
          if (respuesta.isSuccess) {
            this.loadData();
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
  }

  // Exportar a Excel desde el botón de la barra del grid
  toolbarClick(args: ClickEventArgs): void {
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.grid?.excelExport();
    }
  }


}


