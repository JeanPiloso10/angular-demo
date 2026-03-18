import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommandModel, GridComponent, PageSettingsModel, 
  ToolbarItems , PageEventArgs} from '@syncfusion/ej2-angular-grids';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { PuertosService } from '../puertos.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import Swal from 'sweetalert2';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ButtonComponent } from '@syncfusion/ej2-angular-buttons';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'app-listado-puertos',
  templateUrl: './listado-puertos.component.html',
  styleUrl: './listado-puertos.component.scss',
  standalone:false
})
export class ListadoPuertosComponent {



  @ViewChild('grid') grid?: GridComponent;
  data: any[] = [];
  editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  toolbar?: ToolbarItems[] | object;
  commands?: CommandModel[];
  sortOptions?: object;
  pageSettings = { pageCount: 5 };
  editparams = { params: { popupHeight: '300px' }};
  tipoAccion = TipoAccion.Read;
  entidad = 'puerto';
  permissions:any[] = [];

  constructor(private puertosService: PuertosService,
              private toastr: ToastrService,
              private router: Router,
              private spinnerService: SpinnerService,
              private permissionService: PermissionService) {
  }

  ngOnInit(): void {
   this.initializeComponent();
  }

  private async initializeComponent() {
    try
    {
  this.toolbar = ['Search','ColumnChooser','ExcelExport'];
      this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                       { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                      ];

      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      
      this.cargarRegistros();
      this.sortOptions = { columns: [{ field: 'ciudad.descripcion', direction: 'Ascending' }] };
    }
    catch(error)
    {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.puerto).
        pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  cargarRegistros(): void {
    // Mostrar spinner
    this.spinnerService.showGlobalSpinner();

    // Llamar al servicio de paises
    this.puertosService.todos().subscribe({
      next: (respuesta) => {
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

  // Método para manejar los eventos de los botones de la grilla
  public commandClick(args: any): void {

    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
    {
      const id = args.rowData.codigo;
      this.router.navigate(['/'+ this.entidad +'/modificar', id]);
    }
    // Verificar si el evento fue disparado por un botón de la grilla
    else if (args.commandColumn.title && args.commandColumn.title=== 'Eliminar')
    {
      this.eliminar(args);
    }
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
        const respuesta: any = await firstValueFrom(this.puertosService.borrar(args.rowData.codigo));
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

  clickHandler(args: ClickEventArgs): void {
    // Exportar a Excel cuando se hace clic en el botón de la toolbar del Grid
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      this.grid?.excelExport();
      return;
    }

    if (args.item.id === 'Nuevo') {
     this.nuevoRegistro();
    }
  }

  nuevoRegistro(): void
  {
    this.router.navigate(['/'+ this.entidad +'/nuevo']);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+N' - Nuevo
    if (event.altKey && event.key === 'n') {
      this.nuevoRegistro();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }


}
