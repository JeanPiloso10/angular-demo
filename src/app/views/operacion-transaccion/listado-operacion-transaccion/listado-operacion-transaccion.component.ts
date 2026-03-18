import { Component, HostListener, ViewChild, inject } from '@angular/core';

import { OperacionTransaccionService	 } from '../operacion-transaccion.service'
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { CommandModel, GridComponent, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import Swal from 'sweetalert2';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'app-listado-operacion-transaccion',
  templateUrl: './listado-operacion-transaccion.component.html',
  styleUrl: './listado-operacion-transaccion.component.scss',
  standalone:false
})
export class ListadoOperacionTransaccionComponent {



  @ViewChild('grid') grid?: GridComponent;
  public data: any[] = [];
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public toolbar?: ToolbarItems[] | object;
  public commands?: CommandModel[];
  public sortOptions?: object;
  public pageSettings = { pageCount: 5 };
  public editparams = { params: { popupHeight: '300px' }};
  public tipoAccion = TipoAccion.Read;
  public entidad: string = 'operaciontransaccion';
  public filterSettings: Object;
  permissions:any[] = [];
  
  constructor(  
  private  operacionTransaccionService :OperacionTransaccionService,
  private  toastr :ToastrService,
  private  router :Router,
  private  spinnerService :SpinnerService,
  private  permissionService :PermissionService)
  {

  }

  async ngOnInit() {
   
    await this.initializeComponent();
  }

  private async initializeComponent() {
    try
    {
  this.filterSettings = { type: 'Excel' }
  this.toolbar = ['Search','ColumnChooser','ExcelExport'];
      this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                       { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                      ];

      await this.getPermissions();

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      
      this.cargarRegistros();
    }
    catch(error)
    {
      this.toastr.error(cadenaErrores(error));
    }
  }

  
  cargarRegistros(): void {
    // Mostrar spinner
    this.spinnerService.showGlobalSpinner();

    // Llamar al servicio de paises
    this.operacionTransaccionService.todos().subscribe({
      next: (respuesta:any  ) => {
        // Ocultar spinner
        this.spinnerService.hideGlobalSpinner();
        // Si la respuesta es exitosa, asignar los datos a la variable 'data'
        this.data = respuesta.isSuccess ? respuesta.result : []
      },
      error: (errores) => {
        // Ocultar spinner y mostrar mensaje de error
        this.spinnerService.hideGlobalSpinner();
        // Mostrar mensaje de error
        this.toastr.error(cadenaErrores(errores))}
    });
  }

  
  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.operacionTransaccion).pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  // Método para manejar los eventos de los botones de la grilla
  public commandClick(args: any): void {

    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
    {
      const id = args.rowData.idOperacionTransaccion;
      this.router.navigate(['/'+this.entidad+'/modificar', id]);
    }
    // Verificar si el evento fue disparado por un botón de la grilla
    else if (args.commandColumn.title && args.commandColumn.title=== 'Eliminar')
    {
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
      const respuesta: any = await firstValueFrom(this.operacionTransaccionService.borrar(args.rowData.idOperacionTransaccion));
      if (respuesta.isSuccess) {
        // Esperar a que cargarRegistros se complete antes de continuar
        this.cargarRegistros();
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

// Método para manejar los eventos de los botones de la barra de herramientas
  clickHandler(args: ClickEventArgs): void {
    const gridEl = (this.grid as any)?.element as HTMLElement | undefined;
    const gridId = gridEl?.id;
    const itemId = (args?.item?.id || '').toString();

    if (args.item.id === 'Nuevo') {
      this.nuevoRegistro();
      return;
    }

    if (gridId && itemId === `${gridId}_excelexport`) {
      this.grid?.excelExport();
    }
  }

  nuevoRegistro(): void {
    this.router.navigate(['/'+this.entidad+'/nuevo']);
  }


  // Método para manejar los eventos de teclado
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+N' - Nuevo
    if (event.altKey && event.key === 'n') {
      this.nuevoRegistro();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }


}
