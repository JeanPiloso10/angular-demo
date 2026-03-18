import { Component, ViewChild, inject } from '@angular/core';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { MenuService } from '../menu.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { EditSettingsModel, ToolbarItems,TreeGridComponent, ToolbarService, ExcelExportService, ColumnChooserService } from '@syncfusion/ej2-angular-treegrid';
import { IEditCell , CommandModel} from '@syncfusion/ej2-angular-grids';
import { SpinnerService } from '@core/services/spinner.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import { closest } from '@syncfusion/ej2-base';
import Swal from 'sweetalert2';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'app-listado-menu',
  templateUrl: './listado-menu.component.html',
  styleUrl: './listado-menu.component.scss',
  standalone:false,
  providers: [ToolbarService, ExcelExportService, ColumnChooserService]
})
export class ListadoMenuComponent {

    @ViewChild('treegrid') public treeGridObj?: TreeGridComponent;

    public data?: Object[];
    public editSettings?: EditSettingsModel;
    public toolbarOptions?: ToolbarItems[] | any;
    public errores: string = '';
    public numericParams: IEditCell;
    public commands?: CommandModel;
    permissions:any[] = [];



    constructor(private toastr: ToastrService,
                private spinnerService: SpinnerService,
                private menuService: MenuService,
                private router: Router,
                private permissionService: PermissionService) {}

    public ngOnInit(): void {
        
       this.initializeComponent();
    }

    private async initializeComponent() {
      try
      {

        

        this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit', click: this.onUpdate.bind(this) }, title:'Modificar' },
          { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete', click: this.onDelete.bind(this) }, title:'Eliminar' },
          ]as CommandModel;

          this.toolbarOptions = [ 'Search', 'ColumnChooser', 'ExcelExport' ];

          this.numericParams = { params: {
          validateDecimalOnType: true,
          decimals: 0,
          format: 'N' }};

          this.editSettings = { allowEditing: false, allowAdding: false, allowDeleting: false, mode: 'Row' };
        
      
        await this.getPermissions();
        if (!this.permissions || this.permissions.length === 0) {
          return; // Detener el flujo si no hay permisos
        }
        await this.cargarRegistros();
        

        

        
      }catch(error)
      {
        this.toastr.error(cadenaErrores(error));
      }
    }


    async cargarRegistros(){

      this.spinnerService.showGlobalSpinner();
     this.menuService.arbol().pipe(
        finalize(() => this.spinnerService.hideGlobalSpinner())
      ).subscribe({
        next: (respuesta) => {
          if (respuesta.isSuccess)
          {
            this.data = respuesta.result;
          }
        },
        error: (errores) => {
          this.toastr.error(cadenaErrores(errores));
        }
      });

    }
    

    public onUpdate = (args: Event) => {
      let id: number = this.getId(args);
      this.router.navigate(['/menu/modificar', id]);
  }

    public onDelete = (args: Event) => {
      let id: number = this.getId(args);
      this.eliminar(id);      
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.menu).pipe(catchError(error => of({ result: [] })))
  
      }));

        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  getId(args: Event):number
  {
    let id: number = 0;
    let rowIndex: number = (<HTMLTableRowElement>closest(args.target as Element, '.e-row')).rowIndex;    
    let data: any[] = (this.treeGridObj as TreeGridComponent).getCurrentViewRecords();
    if (data[rowIndex]){ id = data[rowIndex].id; }
    return id;
  }

    public commandClick(args: any): void {


      if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
      {
        const userId = args.rowData.id;
        this.router.navigate(['/menu/modificar', userId]);
      }
      else if (args.commandColumn.title && args.commandColumn.title=== 'Eliminar')
      {
        const userId = args.rowData.id;
        this.eliminar(userId);
      }
    
  }

  clickHandler(args: ClickEventArgs): void {
    // Manejo robusto del click en toolbar del TreeGrid (similar a ListadoLineaProducto)
    const itemId = (args?.item?.id || '').toString().toLowerCase();
    if (!itemId) return;

    // Exportar a Excel cuando el id del item contenga 'excelexport'
    if (itemId.includes('excelexport')) {
      // prevenir manejo duplicado por defecto
      (args as any).cancel = true;

      const hasData = Array.isArray(this.data) && this.data.length > 0;
      if (!hasData) {
        this.toastr.warning('No hay datos para exportar');
        return;
      }
      this.treeGridObj?.excelExport({ fileName: 'menus.xlsx' } as any);
      return;
    }

    // Botón "Nuevo" pertenece a la toolbar superior (no del TreeGrid),
    // se mantiene por compatibilidad si en algún momento se une al toolbar del grid
    if (itemId === 'nuevo') {
      this.nuevoRegistro();
    }
  }

  nuevoRegistro(): void{
    this.router.navigate(['/menu/nuevo']);
  }

  
async eliminar(id: number) {
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
      const respuesta: any = await firstValueFrom(this.menuService.borrar(id));
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

}
