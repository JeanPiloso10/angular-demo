import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ConfiguracionPersonalizadaService } from '../configuracion-personalizada.service';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CommandModel, ToolbarItems, GridComponent } from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NuevaConfiguracionPersonalizadaComponent } from '../nueva-configuracion-personalizada/nueva-configuracion-personalizada.component';
import { ModificarConfiguracionPersonalizadaComponent } from '../modificar-configuracion-personalizada/modificar-configuracion-personalizada.component';
import { ConfiguracionService } from '../../configuracion/configuracion.service';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { ModalHelperService } from '@app/core/services/modal-helper.service';



@Component({
  selector: 'app-listado-configuracion-personalizada',
  templateUrl: './listado-configuracion-personalizada.component.html',
  styleUrl: './listado-configuracion-personalizada.component.scss',
  standalone:false
})
export class ListadoConfiguracionPersonalizadaComponent {

 
  errores: string;
  StateEnum: TipoAccion = TipoAccion.Read;
  modelo: any;  
  data: any;
  permissions:any[] = [];
  cbConfiguracion: any[] = [];
  form: FormGroup;

  public entidad = 'configuracionpersonalizada';
  public secuenciaRules: Object;
  public sortOptions?: object;
  public toolbar?: ToolbarItems[] | object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: true };
  public localFieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'idTransaccion' };
  public commands?: CommandModel[];
  public localFieldsConfiguracion: Object = { text: 'cnoConfiguracion', value: 'codigo' };

  @ViewChild('configuracion', { static: false }) configuracion!: ComboBoxComponent;
  @ViewChild('grid') grid?: GridComponent;

  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
  };

  
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private configuracionService: ConfiguracionService,
    private spinnerService: SpinnerService,
    private configuracionPersonalizadaService: ConfiguracionPersonalizadaService,
    private permissionService: PermissionService,
    private modalHelperService: ModalHelperService
  ) {
   this.form = this.initForm();
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      configuracion: ['']
    });
  }

  ngAfterViewInit(): void {
  
   

  }

  ngOnInit(): void {
    this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
    this.initializeComponent();
  }

  
  
  private async initializeComponent() {

    try
    {

      await this.getPermissions(); // Espera a que se obtengan los permisos

      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      
      this.form.disable();
      await this.loadInitialData();
      this.barraBotones();
      this.configuracion.focusIn();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
    
  }


  async loadInitialData() {
   

    try {

      const responseConfiguracion: any = await firstValueFrom( this.configuracionService.todos());
      this.cbConfiguracion = responseConfiguracion.result;

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }

  }

 
 
  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.configuracionPersonalizada).pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some(e => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }

  
  barraBotones() {
    this.estadoBotones.btnNuevo = this.tienePermiso('N');

    const allCommands = [
      {
        permiso: "M",
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit' },
        title: 'Modificar'
      },
      {
        permiso: "E",
        buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete' },
        title: 'Eliminar'
      }
    ];

    // Filtrar los comandos basados en los permisos
    this.commands = allCommands.filter(command => !command.permiso || this.tienePermiso(command.permiso));
      

  this.toolbar = ['Search', 'ColumnChooser', 'ExcelExport'];
      this.form.get('configuracion').enable();

  }
  
  nuevoRegistro(): void {

    const modalRef = this.modalHelperService.abrirModal(NuevaConfiguracionPersonalizadaComponent, 
    {},
    {
      scrollable: true,
      windowClass: 'modal-dialog-centered',
      animation: true,
      backdrop: 'static',
      keyboard: false  
    });

    modalRef.result.then(
      () => {
        this.onChange(this.form.get('configuracion').value);
      },
    );

  }

  public onFilteringConfiguracion: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

    let query = new Query();
    
    query = (e.text != "") ? query.where("cnoConfiguracion", "contains", e.text, true) : query;
    //pass the filter data source, filter query to updateData method.
     e.updateData(this.cbConfiguracion, query);
 
};
  
  async onChange(args: any) {
    try
    {
      this.data = [];
      
      if (args) {
      
        const codigoConfiguracion = args;
        
        // Buscar el objeto transacción correspondiente en la lista cbtransaccion
        const configuracionSeleccionada = this.cbConfiguracion.find(x => x.codigo === codigoConfiguracion);

      
        if (configuracionSeleccionada?.codigo) {

          const responseConfiguraciones: any = await firstValueFrom(this.configuracionPersonalizadaService.listadoConfiguracion(codigoConfiguracion));

        
          if (responseConfiguraciones.isSuccess === true) {
                this.data = responseConfiguraciones.result;
          }

      } else {
          this.toastr.warning('Configuracion no encontrada');
      }

      } else {
        this.data = [];
      }
    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }

  // Método para manejar los eventos de los botones de la barra de herramientas
  clickHandler(args: ClickEventArgs): void {
    const gridId = this.grid?.element?.id;
    if (gridId && args.item.id === `${gridId}_excelexport`) {
      this.grid?.excelExport();
      return;
    }
    // if (args.item.id === 'Nuevo') {
    //   this.nuevoRegistro();
    // }
  }

  
  // Método para manejar los eventos de los botones de la grilla
  public commandClick(args: any): void {

    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
    {
      const id = args.rowData.idConfiguracionPersonalizada;
      
        // Abrir el modal de modificación
        const modalRef = this.modalHelperService.abrirModal(ModificarConfiguracionPersonalizadaComponent, 
      {id: id},
      {
          scrollable: true,
          animation: true,
          backdrop: 'static',
      });

      modalRef.result.then(
          () => {

            this.onChange(this.form.get('configuracion').value);

          },
      );

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
        const respuesta: any = await firstValueFrom(this.configuracionPersonalizadaService.borrar(args.rowData.idConfiguracionPersonalizada));
        if (respuesta.isSuccess) {
          // Esperar a que cargarRegistros se complete antes de continuar
  
          await this.onChange(this.form.get('configuracion').value);
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
  

async cargarRegistros() {
  // Mostrar spinner
  this.spinnerService.showGlobalSpinner();

  // Llamar al servicio de paises
  this.configuracionPersonalizadaService.todos().subscribe({
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



}
