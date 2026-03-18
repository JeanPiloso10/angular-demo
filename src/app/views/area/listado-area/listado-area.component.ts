import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandClickEventArgs, CommandModel, EditSettingsModel, GridComponent, PageSettingsModel, SearchSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { FormGroup } from '@angular/forms';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { Operacion } from '@shared/enums/Operacion';
import Swal from 'sweetalert2';
import { AreasService } from '../area.service';

@Component({
  selector: 'app-listado-area',
  templateUrl: './listado-area.component.html',
  styleUrl: './listado-area.component.scss',
  standalone:false
})
export class ListadoAreaComponent {



  @ViewChild('grid') public grid?: GridComponent;

  public data?: Object[];
  public editSettings?: EditSettingsModel;
  public toolbarOptions?: ToolbarItems[] | any;
  public searchSettings: SearchSettingsModel = { fields: ['codigo', 'descripcion', 'activo','departamento.cnoDepartamento','centroCosto.cnoCentroCosto'] };
  public errores: string = '';
  public commands?: CommandModel;
  public entidad = 'area';
  public queryDto: any = null;

 
  public initialGridLoad: boolean = true;
  public currentPage: number = 0;
  public initialPage?: PageSettingsModel;
  public Form?: FormGroup | any;
  public permissions: any[] = [];
  public estadoBotones = {btnNuevo: false};

  constructor(private permissionService: PermissionService,
 private router :Router,
 private readonly toastr: ToastrService,
 private readonly spinnerService: SpinnerService,
 private readonly areaService :AreasService  ) {
    this.areaService.dataActualizada$.subscribe({
      next: () => {
        this.loadData()
      },
      error: (err) => {
        console.error(err);
      }
       });
  }

  public ngOnInit(): void {
    this.toolbarOptions = ["Search", "ColumnChooser", "ExcelExport"];
    this.editSettings = { allowEditing: false, allowAdding: false, allowDeleting: false };
    this.initializeComponent();
    this.commands = [
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit', }, title: 'Modificar' },
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete', }, title: 'Eliminar' },
    ] as CommandModel;
  }

  async loadData() {
    try {
      this.spinnerService.showGlobalSpinner();
      const response: any = await firstValueFrom(this.areaService.todos());
      this.spinnerService.hideGlobalSpinner();
      this.data = response.isSuccess ? response.result : [];
    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  private async initializeComponent() {
    try {
      await this.getPermissions();
      await this.loadData();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      this.barraBotones();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.area).pipe(catchError(error => of({ result: [] })))
      }));
      this.permissions = results.permission.result as OperacionesDto[];
      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
      };
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
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
      this.toastr.warning('No se pudo obtener los datos de la fila para eliminar');
    }
  }

  onCommandClick(args: CommandClickEventArgs): void {
    const rowData: any = args.rowData;
    if (args.commandColumn?.title === 'Modificar') {
      if (this.tienePermiso(Operacion.Modificar, this.permissions) == false) {
        this.toastr.warning('No tiene permiso para realizar la acción');
      } else {
        this.router.navigate(['/' + this.entidad + '/modificar', rowData.codigo]);
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
          respuesta = await firstValueFrom(this.areaService.borrar(datos.codigo));
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

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
    // Combinación para 'Alt+N' - Nuevo
    if (event.altKey && event.key.toLowerCase() === 'n') {
      if (this.estadoBotones.btnNuevo) {
        this.btnNuevoRegistro();
      }
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

  // Manejar clicks en la barra para exportar a Excel
  toolbarClick(args: ClickEventArgs): void {
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.grid?.excelExport();
    }
  }
}



