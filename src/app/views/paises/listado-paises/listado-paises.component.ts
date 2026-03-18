import { Component, ViewChild ,inject, HostListener } from '@angular/core';
import { PaisesService } from '../paises.service'
import { GridComponent, CommandModel , ToolbarItems} from '@syncfusion/ej2-angular-grids';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { Router } from '@angular/router';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { SpinnerService } from '@core/services/spinner.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { NuevoPaisComponent } from '../nuevo-pais/nuevo-pais.component';
import { ModificarPaisComponent } from '../modificar-pais/modificar-pais.component';

@Component({
  selector: 'app-listado-paises',
  templateUrl: './listado-paises.component.html',
  styleUrl: './listado-paises.component.scss',
  standalone:false
})
export class ListadoPaisesComponent {

 
  permissions:any[] = [];

  @ViewChild('grid') grid?: GridComponent;
  data: any[] = [];
  editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  toolbar?: ToolbarItems[] | object;
  commands?: CommandModel[];
  sortOptions?: object;
  filterSettings: Object;
  pageSettings = { pageCount: 5 };
  editparams = { params: { popupHeight: '300px' }};
  tipoAccion = TipoAccion.Read;
  entidad = 'pais';

  constructor(private permissionService: PermissionService,
              private paisesService: PaisesService,
              private toastr: ToastrService,
              private router: Router,
              private spinnerService: SpinnerService,
              private modalHelperService: ModalHelperService) {

  }

  ngOnInit(): void {
   this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      this.toolbar = ['Search','ColumnChooser','ExcelExport'];
      this.filterSettings = { type: 'Excel' };
      this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                       { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                      ];
                      
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      
      this.cargarRegistros();
      // this.sortOptions = { columns: [{ field: 'region.descripcion', direction: 'Ascending' }] };
  
    }catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.pais).
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


// Método para manejar la creación de un registro
  private handleCreatePais = (pais: any) => {
     this.data.push(pais);
     this.grid.refresh();
  }
  
  // Método para manejar la actualización de un registro
  private handleUpdatePais = (pais: any) => {
    const index = this.data.findIndex(c => c.idPais === pais.idPais);
    if (index !== -1) {
      this.data[index] = pais;
      this.grid.refresh();
    }
  }
  
  // Método para manejar la eliminación de un registro
  private handleDeletePais = (pais: any) => {
    const index = this.data.findIndex(c => c.idPais === pais.idPais);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.grid.refresh();
    }
  }

  ngOnDestroy(): void {
    // Detener la conexión de SignalR al salir del componente
    // this.signalrNotificationService.stopConnection();
  };
  
  cargarRegistros(): void {
    // Mostrar spinner
    this.spinnerService.showGlobalSpinner();

    // Llamar al servicio de paises
    this.paisesService.todos().subscribe({
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
      const codigo = args.rowData.codigo;

      const modalRef = this.modalHelperService.abrirModal(ModificarPaisComponent, 
      {
        codigo: codigo
      },
      {
        scrollable: true,
        animation: true,
        backdrop: 'static',
        keyboard: false  
      });

      modalRef.componentInstance.submitEvent.subscribe({
        next: (data: any) => {
          modalRef.close();
          if (data) {
            const index = this.data.findIndex((item: any) => item.codigo === data.codigo);
            if (index !== -1) {
              this.data[index] = data;
            }
            this.grid.refresh();
          }
        },
        error: (err: any) => {
          console.error(err);
        }
      });
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
      const respuesta: any = await firstValueFrom(this.paisesService.borrar(args.rowData.codigo));
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
    // Excel export when Grid toolbar Excel button is clicked
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

  nuevoRegistro(): void {

    const modalRef = this.modalHelperService.abrirModal(NuevoPaisComponent, 
    {},
    {
      scrollable: true,
      animation: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.submitEvent.subscribe({
      next: (data: any) => {
        modalRef.close();
        if (data) {
          this.data.push(data);
          this.grid.refresh();
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
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
