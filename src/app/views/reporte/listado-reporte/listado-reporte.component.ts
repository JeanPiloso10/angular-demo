
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { catchError, firstValueFrom, forkJoin, of, throwError } from 'rxjs';
import { ReporteService } from '../reporte.service';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CommandModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import Swal from 'sweetalert2';
import { NuevoReporteComponent } from '../nuevo-reporte/nuevo-reporte.component';
import { ModificarReporteComponent } from '../modificar-reporte/modificar-reporte.component';
import { Operacion } from '@shared/enums/Operacion';
import { OperacionesDto } from '@core/models/operaciones-dto';
import {  Router } from '@angular/router';
import { ModalHelperService } from '@app/core/services/modal-helper.service';

@Component({
  selector: 'app-listado-reporte',
  templateUrl: './listado-reporte.component.html',
  styleUrl: './listado-reporte.component.scss',
  standalone:false
})
export class ListadoReporteComponent {

  form: FormGroup;
  errores: string;
  StateEnum: TipoAccion = TipoAccion.Read;
  modelo: any;  
  data: any;
  permissions:any[] = [];
  cbtransaccion: any[] = [];
  
  @ViewChild('transaccion', { static: false }) transaccion!: ComboBoxComponent;
  public entidad = 'reporte';
  public sortOptions?: object;
  public toolbar?: ToolbarItems[] | object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: true };
  public localFieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'idTransaccion' };
  public commands?: CommandModel[];

  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
  };


  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private modalHelperService: ModalHelperService,
    private spinnerService: SpinnerService,
    private reporteService: ReporteService,
    private transaccionService: TransaccionService,
    private permissionService: PermissionService,
    private router: Router
  ) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      transaccion: ['']
    });
  }
  
  private async initializeComponent() {

    this.spinnerService.showGlobalSpinner();
    try
    {
  await this.getPermissions(); // Espera a que se obtengan los permisos
  this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
      this.form.disable();
      await this.loadPrimaryInitialData();
      this.barraBotones();

    } catch (error) {
      this.handleError(error);
    }
    finally{
      this.spinnerService.hideGlobalSpinner();
    }

    
    
  }

  async loadPrimaryInitialData() {
    try {

      const results = await firstValueFrom(forkJoin({
        transaccionResponse: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
        permissionResponse: this.permissionService.getPermissionByTransaction(TransactionCode.reporte).pipe(catchError(error => of({ result: [] })))
      }));


      this.cbtransaccion = results.transaccionResponse.result;

      if (results.permissionResponse.isSuccess) {
        this.permissions = results.permissionResponse.result as OperacionesDto[];
      } else {
        this.permissions = [];
      }

    } catch (error) {
      this.handleError(error);
    }
  };

  
  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.reporte).pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  clickHandler(args: any): void {
    const grid: any = (this as any).grid;
    const gridId = grid?.element?.id;
    if (gridId && args.item?.id === `${gridId}_excelexport`) {
      grid?.excelExport();
      return;
    }
  }


  private handleError(error: any) {
    this.toastr.error(cadenaErrores(error));
    this.spinnerService.hideGlobalSpinner();
    return throwError(() => error);
  }


  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    try
    {
     
      if (this.permissions && this.permissions?.length > 0) {
        result = this.permissions.some(e => e.codigo.toLowerCase() === codigo.toLowerCase());
      }
    
    }
    catch(error)
    {
      this.handleError(error);
    }
    return result;
  }

  

  barraBotones() {
    try
    {
      this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.AgregarArchivo);

      const allCommands = [
        {
          permiso: Operacion.DescargarArchivo,
          buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-download' },
          title: 'Descargar'
        },
        {
          permiso: Operacion.ModificarArchivo,
          buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' },
          title: 'Modificar'
        },
        {
          permiso:  Operacion.EliminarArchivo,
          buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' },
          title: 'Eliminar'
        }
      ];
  
      // Filtrar los comandos basados en los permisos
      this.commands = allCommands.filter(command => !command.permiso || this.tienePermiso(command.permiso));
        
  
  this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
        this.form.get('transaccion')?.enable();
    }
    catch(error)
    {
      console.log('barraBotones error', error);
    }
    
  }

  ngAfterViewInit(): void {
  
    try
    {
      this.transaccion?.focusIn();
    }
   catch(error)
   {
     console.log('ngAfterViewInit error ', error);
   }

  }

  async onChange(args: any) {
    try
    {
      this.data = [];
      
      if (args) {
      
        const idTransaccionSeleccionada = args;
        
        // Buscar el objeto transacción correspondiente en la lista cbtransaccion
        const transaccionSeleccionada = this.cbtransaccion.find(transaccion => transaccion.idTransaccion === idTransaccionSeleccionada);

        if (transaccionSeleccionada?.codigo) {
          this.spinnerService.showGlobalSpinner();
          const response: any = await firstValueFrom(this.reporteService.ListadoReportesTransaccion(transaccionSeleccionada?.codigo));
          this.spinnerService.hideGlobalSpinner();
      
          if (response.isSuccess === true) {
                this.data = response.result;
          }

      } else {
          this.toastr.warning('Transacción no encontrada');
      }

      } else {
        this.data = [];
      }
    }
    catch (error) {

   this.toastr.error(cadenaErrores(error));
    }
  }

  public onFilteringTransaccion: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

    try
    {
      let query = new Query();
    
      query = (e.text != "") ? query.where("cnoTransaccion", "contains", e.text, true) : query;
      //pass the filter data source, filter query to updateData method.
       e.updateData(this.cbtransaccion, query);
    }
    catch (error) {
      console.log('onFilteringTransaccion error', error);
    }
 
};


  nuevoRegistro(): void {

    const modalRef = this.modalHelperService.abrirModal(NuevoReporteComponent,
    {}, 
    {
      scrollable: true,
      animation: true,
      backdrop: 'static',
    });


    modalRef.result.then(
      () => {
        if(this.form.get('transaccion')?.value)
        {
          this.onChange(this.form.get('transaccion')?.value);
        }
       
      },
    );

  }

  modificarRegistro(): void {
    this.StateEnum = TipoAccion.Update;
    this.barraBotones();
  }

  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }

  async deleteFile(id: number) {

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
        const respuesta: any = await firstValueFrom(this.reporteService.deleteFile(id));
        if (respuesta.isSuccess) {
          // Esperar a que cargarRegistros se complete antes de continuar
  
          await this.onChange(this.form.get('transaccion').value);
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

    const id = args.rowData.idReporte;
    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
    {
        // Abrir el modal de modificación
        const modalRef = this.modalHelperService.abrirModal(ModificarReporteComponent,
      { id: id }, 
      {
          scrollable: true,
          animation: true,
          backdrop: 'static',
      });

      modalRef.result.then(
          () => {
              this.onChange(this.form.get('transaccion')?.value);
          },
      );

    }
    else if (args.commandColumn.title && args.commandColumn.title=== 'Descargar')
    {
      this.reporteService.downloadFile(id).subscribe({
        next: (response) => {
          const blob = response.body!;
          const contentDisposition = response.headers.get('Content-Disposition');
          let downloadFileName = args.rowData.originalFileName;
  
          if (contentDisposition) {
            const matches = /filename="(.+)"/.exec(contentDisposition);
            if (matches != null && matches[1]) {
              downloadFileName = matches[1];
            }
          }
  
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFileName;
          document.body.appendChild(a);
          a.click();
  
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    
    }
    // Verificar si el evento fue disparado por un botón de la grilla
    else if (args.commandColumn.title && args.commandColumn.title=== 'Eliminar')
    {
      this.deleteFile(id);
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
      const respuesta: any = await firstValueFrom(this.reporteService.borrar(args.rowData.idReporte));
      if (respuesta.isSuccess) {
        // Esperar a que cargarRegistros se complete antes de continuar

        await this.onChange(this.form.get('transaccion')?.value);
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
