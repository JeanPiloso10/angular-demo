import { Component, ViewChild, inject, HostListener, ElementRef } from '@angular/core';
import { UsuariosService } from '../usuarios.service'
import { GridComponent, CommandModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SearchSettingsModel } from '@syncfusion/ej2-angular-grids';
import { firstValueFrom } from 'rxjs';
import { SetPasswordComponent } from '../set-password/set-password.component'
import Swal from 'sweetalert2';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { Operacion } from '@shared/enums/Operacion';
import { ModalHelperService } from '@app/core/services/modal-helper.service';

@Component({
  selector: 'app-listado-usuarios',
  templateUrl: './listado-usuarios.component.html',
  styleUrl: './listado-usuarios.component.scss',
  standalone:false
})
export class ListadoUsuariosComponent {




  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('grid') grid?: GridComponent;
  public data: any[] = [];
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public toolbar?: ToolbarItems[] | object;
  public commands?: CommandModel[];
  public pageSettings = { pageCount: 5 };
  public editparams = { params: { popupHeight: '300px' } };
  public tipoAccion = TipoAccion.Read;
  public rowData: any;
  public searchOptions?: SearchSettingsModel;
  public filterSettings: Object;
  permissions:any[] = [];

  estadoBotones = {
    btnVer: false,
    btnNuevo: false,
    btnModificar: false,
    btnSetPassword: false,
    btnEliminar: false,
  };

  constructor(private  userService: UsuariosService,
              private  permissionService : PermissionService,
              private  router : Router,
              private  toastr : ToastrService,
              private  spinnerService : SpinnerService,
              private  modalHelperService : ModalHelperService) { }

  ngOnInit(): void {
    try
    {
       
        this.initializeComponent();
    }
    catch(error)
    {
        this.toastr.error(cadenaErrores(error));
    }
  
  }

  private async initializeComponent() {
    this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
    this.filterSettings = { type: 'Excel' }
    await this.getPermissions(); // Espera a que se obtengan los permisos

    if (!this.permissions || this.permissions.length === 0) {
      return; // Detener el flujo si no hay permisos
    }
    
    await this.loadInitialData();
    this.barraBotones();
  }

  
  barraBotones() {
    this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);

    const allCommands = [
      {
        permiso: Operacion.Leer,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-eye' },
        title: 'Ver'
      },
      {
        permiso: Operacion.Modificar,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' },
        title: 'Modificar'
      },
      {
        permiso:  Operacion.SetPassword,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-lock' },
        title: 'Set Password'
      },
      {
        permiso:  Operacion.Eliminar,
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' },
        title: 'Eliminar'
      }
    ];

    // Filtrar los comandos basados en los permisos
    this.commands = allCommands.filter(command => !command.permiso || this.tienePermiso(command.permiso));
      
  }


  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some(e => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }


  async getPermissions() {
    try {
      this.permissions = await this.permissionService.getPermissions(TransactionCode.usuario);

      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
    }

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
    
  async loadInitialData() {
    try {
      this.spinnerService.showGlobalSpinner();
      const response: any = await firstValueFrom(this.userService.todos());
      this.data = response.isSuccess ? response.result : [];
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // async loadPrimaryInitialData() {

  //   const results = await firstValueFrom(forkJoin({
  //     permission: this.permissionService.getPermissionByTransaction(TransactionCode.usuario).pipe(catchError(error => of({ result: [] })))

  //   }));

 
  //     this.permissions = results.permission.result as OperacionesDto[];

  //     if (this.permissions.length === 0) {
  //       this.router.navigate(['/pages/403']);
    
    
  //   } else {
  //     this.permissions = [];
  //   }

  // }

  async disableA2F(id: string) {
    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Desea quitar la autenticación de doble factor para el usuario seleccionado?',
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
        const respuesta: any = await firstValueFrom(this.userService.disableA2F(id));
        if (respuesta.isSuccess) {
          const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
          this.data[index].twoFactorEnabled = false;     
          this.grid.refresh();        
        }

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

  public commandClick(args: any): void {

    if (args.commandColumn.title && args.commandColumn.title === 'Ver') {

      const userId = args.rowData.id;
      this.router.navigate(['/gestionaccesos/ver', userId]);

    }

    else if (args.commandColumn.title && args.commandColumn.title === 'Modificar') {
      const userId = args.rowData.id;
      this.router.navigate(['/gestionaccesos/modificar', userId]);
    }
    else if (args.commandColumn.title && args.commandColumn.title === 'Eliminar') {
      this.eliminar(args);
    }
    else if (args.commandColumn.title && args.commandColumn.title === 'Set Password') {

      const modalRef = this.modalHelperService.abrirModal(SetPasswordComponent, {
      id: args.rowData.id,
      username: args.rowData.userName
      }, {
        //backdrop: 'static', // Evita que el modal se cierre al hacer clic fuera de él
        //keyboard: false // Evita que el modal se cierre al presionar la tecla Escape
      });

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
        const respuesta: any = await firstValueFrom(this.userService.borrar(args.rowData.id));
        if (respuesta.isSuccess) {
          // Esperar a que cargarRegistros se complete antes de continuar
       
          const index = this.data.findIndex((item: any) => item.id === args.rowData.id);

          // Verificar si el elemento existe en el arreglo
          if (index !== -1) {
            this.data.splice(index, 1); // Eliminar el elemento
            this.grid.refresh();       // Refrescar la vista del grid
          } 

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

  transformToBadgeArray(roles: string): string[] {
    return roles.split(', ');
  }

  nuevoRegistro(): void {
    this.router.navigate(['/gestionaccesos/nuevo']);
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
