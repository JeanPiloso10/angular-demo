import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandClickEventArgs, CommandModel, EditSettingsModel, GridComponent, PageSettingsModel, SearchSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';

import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import Swal from 'sweetalert2';
import { SpinnerService } from '@core/services/spinner.service';
import { CategoriaCompraService } from '../categoria-compra.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { Operacion } from '@shared/enums/Operacion';
import { PermissionService } from '@core/services/permission.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NuevaCategoriaCompraComponent } from '../nueva-categoria-compra/nueva-categoria-compra.component';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { ModificarCategoriaCompraComponent } from '../modificar-categoria-compra/modificar-categoria-compra.component';
import { ModalHelperService } from '@app/core/services/modal-helper.service';

@Component({
  selector: 'app-listado-categoria-compra',
  templateUrl: './listado-categoria-compra.component.html',
  styleUrl: './listado-categoria-compra.component.scss',
  standalone:false
})
export class ListadoCategoriaCompraComponent {
  

  @ViewChild('grid') public grid?: GridComponent;

  public data?: Object[];
  public editSettings?: EditSettingsModel;
  public toolbarOptions?: ToolbarItems[] | any;
  public searchSettings: SearchSettingsModel = { fields: ['codigo', 'descripcion', 'activo'] };
  public errores: string = '';
  public commands?: CommandModel;
  public entidad = 'categoriaCompra';
  public queryDto: any = null;
  public filterSettings: Object;


  public initialGridLoad: boolean = true;
  public currentPage: number = 0;
  public initialPage?: PageSettingsModel;
  public Form?: FormGroup | any;
  public permissions: any[] = [];
  public estadoBotones = {btnNuevo: false};

  constructor(private permissionService: PermissionService,
    private router: Router,
    private modalService: NgbModal, 
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private categoriaCompraService: CategoriaCompraService,
    private modalHelperService: ModalHelperService) {
    this.categoriaCompraService.dataActualizada$.subscribe({
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
    this.filterSettings = { type: 'Excel' }
    this.initializeComponent();
    this.commands = [
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit', }, title: 'Modificar' },
      { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete', }, title: 'Eliminar' },
    ] as CommandModel;
  }

  async loadData() {
    try {
      this.spinnerService.showGlobalSpinner();
      const response: any = await firstValueFrom(this.categoriaCompraService.todos());
      this.spinnerService.hideGlobalSpinner();
      this.data = response.isSuccess ? response.result : [];
    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }
  transformToBadgeArray(dato: string): string[] {
    return dato.split(', ');
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

  barraBotones() {
    this.estadoBotones.btnNuevo = this.permissions.some(permission => permission.codigo === Operacion.Crear);
  }

  btnNuevoRegistro() {
      let modalRef: any;
      modalRef = this.modalHelperService.abrirModal(NuevaCategoriaCompraComponent, 
        {titulo: 'Nueva Categoría Compra'},
        { scrollable: true, size: 'md', windowClass: 'custom-modal-class', animation: true, centered: true, backdrop: 'static' });

    }

  tienePermiso(permiso: string, arreglo: any): boolean {
    let result: boolean = false;
    if (arreglo && arreglo.length > 0) {
      result = arreglo.some((e: any) => e.codigo === permiso);
    }
    return result;
  }

  public onUpdate = (rowData: any) => {
    let modalRef: any;

    if (this.tienePermiso(Operacion.Modificar, this.permissions)) {
      modalRef = this.modalHelperService.abrirModal(ModificarCategoriaCompraComponent, 
        {
          titulo: 'Actualizar Categoría Compra',
          StateEnum: TipoAccion.Update,
          modelo: rowData
        },
        { scrollable: true, size: 'md', windowClass: 'custom-modal-class', animation: true, centered: true, backdrop: 'static' });
    
    } else {
      this.toastr.warning('No tiene permiso para realizar la acción');
    }

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
        this.onUpdate(rowData);
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
          respuesta = await firstValueFrom(this.categoriaCompraService.borrar(datos.codigo));
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

    toolbarClick(args: ClickEventArgs): void {
      // Trigger Excel export when the ExcelExport toolbar button is clicked
      const gridId = (this.grid as any)?.element?.id;
      const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
      const clickedId = (args as any)?.item?.id;

      if (excelBtnId && clickedId === excelBtnId) {
        this.grid?.excelExport();
      }
    }
}



