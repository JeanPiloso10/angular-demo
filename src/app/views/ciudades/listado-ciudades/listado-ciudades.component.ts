import { Component, ViewChild ,inject, HostListener } from '@angular/core';
import { CiudadesService } from '../ciudades.service'
import { GridComponent, CommandModel , ToolbarItems} from '@syncfusion/ej2-angular-grids';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { Router } from '@angular/router';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { SpinnerService } from '@core/services/spinner.service';
import { catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { NuevaCiudadComponent } from '../nueva-ciudad/nueva-ciudad.component';
import { ModificarCiudadComponent } from '../modificar-ciudad/modificar-ciudad.component';


@Component({
  selector: 'app-listado-ciudades',
  templateUrl: './listado-ciudades.component.html',
  styleUrl: './listado-ciudades.component.scss',
  standalone:false
})
export class ListadoCiudadesComponent {



  @ViewChild('grid') grid?: GridComponent;
  public data: any[] = [];
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public toolbar?: ToolbarItems[] | object;
  public commands?: CommandModel[];
  public sortOptions?: object;
  public pageSettings = { pageCount: 5 };
  public editparams = { params: { popupHeight: '300px' }};
  public tipoAccion = TipoAccion.Read;
  permissions:any[] = [];

  constructor(private ciudadesService: CiudadesService,
              private toastr: ToastrService,
              private router: Router,
              private spinnerService: SpinnerService,
              private permissionService: PermissionService,
              private modalHelperService: ModalHelperService) {
  }
  
  ngOnInit(): void {
    this.initializeComponent();
    }

  private async initializeComponent() {

    try {

  this.toolbar = ['Search','ColumnChooser','ExcelExport'];
    this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                     { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                    ];
    
    await this.getPermissions();
    if (!this.permissions || this.permissions.length === 0) {
      return; // Detener el flujo si no hay permisos
    }
  
    this.cargarRegistros();
    this.sortOptions = { columns: [{ field: 'provincia.descripcion', direction: 'Ascending' }] };
  

    }catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  
  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.ciudad).
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
    this.spinnerService.showGlobalSpinner();
    this.ciudadesService.todos().pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        this.data = respuesta.isSuccess ? respuesta.result : []
      },
      error: (errores) => {
        this.toastr.error(cadenaErrores(errores))}
    });
  }

  public commandClick(args: any): void {

    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
    {
      const codigo = args.rowData.codigo;

      const modalRef = this.modalHelperService.abrirModal(ModificarCiudadComponent, 
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
        const respuesta: any = await firstValueFrom(this.ciudadesService.borrar(args.rowData.codigo));
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

  nuevoRegistro(): void{

    const modalRef = this.modalHelperService.abrirModal(NuevaCiudadComponent, 
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

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+N' - Nuevo
    if (event.altKey && event.key === 'n') {
      this.nuevoRegistro();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }
  


}
