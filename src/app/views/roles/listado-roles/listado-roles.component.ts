import { Component, ViewChild ,inject, HostListener } from '@angular/core';
import { RolesService } from '../roles.service'
import { RolDTO } from '../roles'
import { GridComponent, CommandModel , ToolbarItems} from '@syncfusion/ej2-angular-grids';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { Router } from '@angular/router';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { SpinnerService } from '@core/services/spinner.service';
import { catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Component({
  selector: 'app-listado-roles',
  templateUrl: './listado-roles.component.html',
  styleUrl: './listado-roles.component.scss',
  standalone:false
})
export class ListadoRolesComponent {



  @ViewChild('grid') grid?: GridComponent;
  public data: RolDTO[] = [];
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public toolbar?: ToolbarItems[] | object;
  public commands?: CommandModel[];
  public rolenamerules = { required: true };
  public pageSettings = { pageCount: 5 };
  public editparams = { params: { popupHeight: '300px' } };
  public tipoAccion = TipoAccion.Read;
  permissions:any[] = [];

  constructor(private rolesService: RolesService,
              private toastr: ToastrService,
              private router: Router,
              private spinnerService: SpinnerService,
              private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {
    try
    {
      await this.getPermissions();
      this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
      this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                       { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                      ];
      this.cargarRegistros();
    }
    catch(error)
    {

      this.toastr.error(cadenaErrores(error));
    }
    
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.rolUsuario).pipe(catchError(error => of({ result: [] })))
  
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
    this.rolesService.todos().pipe(
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
      const userId = args.rowData.id;
      this.router.navigate(['/rol/modificar', userId]);
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
      const respuesta: any = await firstValueFrom(this.rolesService.borrar(args.rowData.id));
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

nuevoRegistro():void 
{
  this.router.navigate(['/rol/nuevo']);
}

  clickHandler(args: ClickEventArgs): void {
    const gridId = (this.grid as any)?.element?.id;
    if (gridId && args.item.id === `${gridId}_excelexport`) {
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
