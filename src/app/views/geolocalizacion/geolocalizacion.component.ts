import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridComponent, CommandModel, ToolbarItems, GridModule,
  EditService, ToolbarService, PageService, SortService,
  CommandColumnService, ColumnChooserService, ExcelExportService, FilterService
} from '@syncfusion/ej2-angular-grids';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import {
  ButtonModule, CardModule, FormModule, ButtonGroupModule,
  GridModule as GridCoreUI
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of, finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { PaisesService } from '../paises/paises.service';
import { ProvinciasService } from '../provincias/provincias.service';
import { CiudadesService } from '../ciudades/ciudades.service';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { ModalHelperService } from '@core/services/modal-helper.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { Operacion } from '@shared/enums/Operacion';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

import { NuevoPaisComponent } from '../paises/nuevo-pais/nuevo-pais.component';
import { ModificarPaisComponent } from '../paises/modificar-pais/modificar-pais.component';
import { NuevaProvinciaComponent } from '../provincias/nueva-provincia/nueva-provincia.component';
import { ModificarProvinciaComponent } from '../provincias/modificar-provincia/modificar-provincia.component';
import { NuevaCiudadComponent } from '../ciudades/nueva-ciudad/nueva-ciudad.component';
import { ModificarCiudadComponent } from '../ciudades/modificar-ciudad/modificar-ciudad.component';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.component.html',
  styleUrl: './geolocalizacion.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    ButtonModule,
    CardModule,
    FormModule,
    ButtonGroupModule,
    GridCoreUI,
    ToolbarModule,
    SharedFeaturesModule
  ],
  providers: [
    EditService,
    ToolbarService,
    PageService,
    SortService,
    CommandColumnService,
    ColumnChooserService,
    ExcelExportService,
    FilterService
  ]
})
export class GeolocalizacionComponent implements OnInit {

  // ── Data ──
  paises: any[] = [];
  provincias: any[] = [];
  ciudades: any[] = [];

  // ── Selected items ──
  paisSeleccionado: any = null;
  provinciaSeleccionada: any = null;

  // ── Grid references ──
  @ViewChild('gridPaises') gridPaises?: GridComponent;
  @ViewChild('gridProvincias') gridProvincias?: GridComponent;
  @ViewChild('gridCiudades') gridCiudades?: GridComponent;

  // ── Grid settings ──
  commandsPais: CommandModel[];
  commandsProvincia: CommandModel[];
  commandsCiudad: CommandModel[];
  toolbarGrid: ToolbarItems[] | object = ['Search', 'ExcelExport'];
  pageSettings = { pageSize: 10, pageCount: 3 };
  filterSettings = { type: 'Excel' };
  editSettings = { allowEditing: false, allowAdding: false, allowDeleting: false };

  // ── Permissions ──
  permissionsPais: any[] = [];
  permissionsProvincia: any[] = [];
  permissionsCiudad: any[] = [];

  private readonly modalOptions = {
    scrollable: true,
    animation: true,
    backdrop: 'static' as const,
    keyboard: false
  };

  constructor(
    private paisesService: PaisesService,
    private provinciasService: ProvinciasService,
    private ciudadesService: CiudadesService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private permissionService: PermissionService,
    private modalHelperService: ModalHelperService
  ) {}

  async ngOnInit() {
    try {
      await this.loadPermissions();
      this.initCommands();
      await this.loadInitialData();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  // ═══════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════

  private initCommands() {
    this.commandsPais = this.buildCommands(this.permissionsPais);
    this.commandsProvincia = this.buildCommands(this.permissionsProvincia);
    this.commandsCiudad = this.buildCommands(this.permissionsCiudad);
  }

  private buildCommands(permissions: any[]): CommandModel[] {
    const commands: CommandModel[] = [];
    if (this.tienePermiso(permissions, Operacion.Modificar)) {
      commands.push({ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' }, title: 'Modificar' });
    }
    if (this.tienePermiso(permissions, Operacion.Eliminar)) {
      commands.push({ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' }, title: 'Eliminar' });
    }
    return commands;
  }

  private async loadPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        pais: this.permissionService.getPermissionByTransaction(TransactionCode.pais)
          .pipe(catchError(() => of({ result: [] }))),
        provincia: this.permissionService.getPermissionByTransaction(TransactionCode.provincia)
          .pipe(catchError(() => of({ result: [] }))),
        ciudad: this.permissionService.getPermissionByTransaction(TransactionCode.ciudad)
          .pipe(catchError(() => of({ result: [] })))
      }));

      this.permissionsPais = results.pais.result as OperacionesDto[];
      this.permissionsProvincia = results.provincia.result as OperacionesDto[];
      this.permissionsCiudad = results.ciudad.result as OperacionesDto[];
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private async loadInitialData() {
    this.spinnerService.showGlobalSpinner();
    try {
      const results = await firstValueFrom(forkJoin({
        paises: this.paisesService.todos().pipe(catchError(() => of({ result: [] })))
      }));

      this.paises = results.paises.result || [];
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════
  // PAÍS
  // ═══════════════════════════════════════════

  nuevoPais() {
    const modalRef = this.modalHelperService.abrirModal(NuevoPaisComponent, 
      {}, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.recargarPaises();
      }
    });
  }

  editarPais(rowData: any) {
    const modalRef = this.modalHelperService.abrirModal(ModificarPaisComponent, 
      { codigo: rowData.codigo }, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.recargarPaises();
      }
    });
  }

  async eliminarPais(args: any) {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro que desea borrar el país?',
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
        const resp: any = await firstValueFrom(this.paisesService.borrar(args.rowData.codigo));
        if (resp.isSuccess) {
          this.toastr.success('País eliminado');
          this.paisSeleccionado = null;
          this.provincias = [];
          this.ciudades = [];
          this.recargarPaises();
        } else {
          this.toastr.error(cadenaErrores(resp.message));
        }
      } catch (err) {
        this.toastr.error(cadenaErrores(err));
      } finally {
        this.spinnerService.hideGlobalSpinner();
      }
    }
  }

  recargarPaises() {
    this.paisesService.todos().subscribe({
      next: (resp) => {
        this.paises = resp.isSuccess ? resp.result : [];
      },
      error: (err) => this.toastr.error(cadenaErrores(err))
    });
  }

  onPaisSelected(args: any) {
    this.paisSeleccionado = args.data;
    this.provinciaSeleccionada = null;
    this.ciudades = [];
    this.cargarProvinciasPorPais(args.data.codigo);
  }

  commandClickPais(args: any) {
    if (args.commandColumn.title === 'Modificar' && this.tienePermiso(this.permissionsPais, Operacion.Modificar)) {
      this.editarPais(args.rowData);
    } else if (args.commandColumn.title === 'Eliminar' && this.tienePermiso(this.permissionsPais, Operacion.Eliminar)) {
      this.eliminarPais(args);
    }
  }

  // ═══════════════════════════════════════════
  // PROVINCIA
  // ═══════════════════════════════════════════

  cargarProvinciasPorPais(codigoPais: string) {
    this.spinnerService.showGlobalSpinner();
    this.provinciasService.getByPais(codigoPais).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (resp) => {
        this.provincias = resp.result || [];
      },
      error: (err) => this.toastr.error(cadenaErrores(err))
    });
  }

  nuevaProvincia() {
    if (!this.paisSeleccionado) {
      this.toastr.warning('Seleccione un país primero');
      return;
    }
    const modalRef = this.modalHelperService.abrirModal(NuevaProvinciaComponent, 
      { codigoPais: this.paisSeleccionado.codigo }, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.cargarProvinciasPorPais(this.paisSeleccionado.codigo);
      }
    });
  }

  editarProvincia(rowData: any) {
    const modalRef = this.modalHelperService.abrirModal(ModificarProvinciaComponent, 
      { codigo: rowData.codigo }, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.cargarProvinciasPorPais(this.paisSeleccionado.codigo);
      }
    });
  }

  async eliminarProvincia(args: any) {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro que desea borrar la provincia?',
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
        const resp: any = await firstValueFrom(this.provinciasService.borrar(args.rowData.codigo));
        if (resp.isSuccess) {
          this.toastr.success('Provincia eliminada');
          this.provinciaSeleccionada = null;
          this.ciudades = [];
          this.cargarProvinciasPorPais(this.paisSeleccionado.codigo);
        } else {
          this.toastr.error(cadenaErrores(resp.message));
        }
      } catch (err) {
        this.toastr.error(cadenaErrores(err));
      } finally {
        this.spinnerService.hideGlobalSpinner();
      }
    }
  }

  onProvinciaSelected(args: any) {
    this.provinciaSeleccionada = args.data;
    this.cargarCiudadesPorProvincia(args.data.codigo);
  }

  commandClickProvincia(args: any) {
    if (args.commandColumn.title === 'Modificar' && this.tienePermiso(this.permissionsProvincia, Operacion.Modificar)) {
      this.editarProvincia(args.rowData);
    } else if (args.commandColumn.title === 'Eliminar' && this.tienePermiso(this.permissionsProvincia, Operacion.Eliminar)) {
      this.eliminarProvincia(args);
    }
  }

  // ═══════════════════════════════════════════
  // CIUDAD
  // ═══════════════════════════════════════════

  cargarCiudadesPorProvincia(codigoProvincia: string) {
    this.spinnerService.showGlobalSpinner();
    this.ciudadesService.getByProvincia(codigoProvincia).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (resp) => {
        this.ciudades = resp.result || [];
      },
      error: (err) => this.toastr.error(cadenaErrores(err))
    });
  }

  nuevaCiudad() {
    if (!this.provinciaSeleccionada) {
      this.toastr.warning('Seleccione una provincia primero');
      return;
    }
    const modalRef = this.modalHelperService.abrirModal(NuevaCiudadComponent, 
      { codigoProvincia: this.provinciaSeleccionada.codigo }, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.cargarCiudadesPorProvincia(this.provinciaSeleccionada.codigo);
      }
    });
  }

  editarCiudad(rowData: any) {
    const modalRef = this.modalHelperService.abrirModal(ModificarCiudadComponent, 
      { codigo: rowData.codigo }, 
      this.modalOptions
    );
    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        this.cargarCiudadesPorProvincia(this.provinciaSeleccionada.codigo);
      }
    });
  }

  async eliminarCiudad(args: any) {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro que desea borrar la ciudad?',
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
        const resp: any = await firstValueFrom(this.ciudadesService.borrar(args.rowData.codigo));
        if (resp.isSuccess) {
          this.toastr.success('Ciudad eliminada');
          this.cargarCiudadesPorProvincia(this.provinciaSeleccionada.codigo);
        } else {
          this.toastr.error(cadenaErrores(resp.message));
        }
      } catch (err) {
        this.toastr.error(cadenaErrores(err));
      } finally {
        this.spinnerService.hideGlobalSpinner();
      }
    }
  }

  commandClickCiudad(args: any) {
    if (args.commandColumn.title === 'Modificar' && this.tienePermiso(this.permissionsCiudad, Operacion.Modificar)) {
      this.editarCiudad(args.rowData);
    } else if (args.commandColumn.title === 'Eliminar' && this.tienePermiso(this.permissionsCiudad, Operacion.Eliminar)) {
      this.eliminarCiudad(args);
    }
  }

  // ═══════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════

  tienePermiso(permissions: any[], codigo: string): boolean {
    return permissions?.some((e: any) => e.codigo?.toLowerCase() === codigo.toLowerCase()) ?? false;
  }

  get Operacion() {
    return Operacion;
  }

  clickHandlerPaises(args: ClickEventArgs): void {
    const gridId = (this.gridPaises as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.gridPaises?.excelExport();
    }
  }

  clickHandlerProvincias(args: ClickEventArgs): void {
    const gridId = (this.gridProvincias as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.gridProvincias?.excelExport();
    }
  }

  clickHandlerCiudades(args: ClickEventArgs): void {
    const gridId = (this.gridCiudades as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.gridCiudades?.excelExport();
    }
  }
}
