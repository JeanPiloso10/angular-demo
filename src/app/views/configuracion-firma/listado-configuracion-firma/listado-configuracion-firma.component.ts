import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { RolesService } from '../../roles/roles.service';
import { Operacion } from '@shared/enums/Operacion';
import { CommandModel, GridComponent, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ConfiguracionFirmaService} from '@app/views/configuracion-firma/configuracion-firma.service'
import { ConfiguracionFirmaDto } from '@core/models/proceso-solicitud-firma-dto';
import Swal from 'sweetalert2';
import { NuevaConfiguracionFirmaComponent } from '../nueva-configuracion-firma/nueva-configuracion-firma.component';
import { ModificarConfiguracionFirmaComponent } from '../modificar-configuracion-firma/modificar-configuracion-firma.component';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { ModalHelperService } from '@app/core/services/modal-helper.service';

@Component({
  selector: 'app-listado-configuracion-firma',
  templateUrl: './listado-configuracion-firma.component.html',
  styleUrl: './listado-configuracion-firma.component.scss',
  standalone:false
})
export class ListadoConfiguracionFirmaComponent {

  public localFieldsTipoVista: Object = { text: 'descripcion', value: 'codigo' };
  public localFieldsListaEntidad: Object = {  };
  public StateEnum: TipoAccion = TipoAccion.Read;
  public permissions:any[] = [];
  public form: FormGroup;
  public configuracionFirma: any[] = [];
  public cbTipoVista: any[] = [];
  public cbusuario: any[] = [];
  public cbroles: any[] = [];
  public cbtransaccion: any[] = [];
  public data: any;
  public commands?: CommandModel[];
  public localFieldsUsuario: Object = { text: 'userName', value: 'userName' };
  public localFieldsRoles: Object = { text: 'name', value: 'id' };
  public localFieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  public pageOption: Object;
  public toolbar?: ToolbarItems[] | object;
  public sortOptions?: object;
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public filterSettings: Object;
  @ViewChild('grid') grid?: GridComponent;
  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
  };

  
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private userService: UsuariosService,
    private roleService: RolesService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private transaccionService: TransaccionService,
    private modalHelperService: ModalHelperService,
    private configuracionFirmaService: ConfiguracionFirmaService,
  ) {
    this.form = this.initForm();
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      tipoVista: [''],
      listaEntidad: ['']
    });
  }

  ngOnInit(): void {
    this.filterSettings = { type: 'Excel' }
    this.toolbar = ['Search','ColumnChooser', 'ExcelExport'];
    this.commands = [{ buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-edit'}, title:'Modificar' },
                     { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-delete'}, title:'Eliminar' }
                    ];
    this.sortOptions = { columns: [{ field: 'ordenFirma', direction: 'Ascending' }] };

    this.initializeComponent();
  }

  
  private async initializeComponent() {

    try
    {
   
      this.form.disable();
      await this.getPermissions();

 
      await this.getPermissions();
 
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
 
      
      this.spinnerService.showGlobalSpinner();
      this.barraBotones();
      this.spinnerService.hideGlobalSpinner();

      await this.loadInitialData();
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    
    
  }

  
  async loadInitialData() {
   
     
      try {


        const results = await firstValueFrom(forkJoin({
          responseUsuarios: this.userService.todos().pipe(catchError(error => of({ result: [] }))),
          responseTransacciones: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
          responseRoles: this.roleService.todos().pipe(catchError(error => of({ result: [] }))),
        }));
  
        this.cbusuario = results.responseUsuarios.result;
        this.cbroles = results.responseRoles.result;
        this.cbtransaccion = results.responseTransacciones.result;
  
  
      } catch (error) {
        this.toastr.error(cadenaErrores(error));
      }


  }
  
  async getPermissions(): Promise<void> {
    try {
      this.permissions = await this.permissionService.getPermissions(TransactionCode.configuracionFirma);
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

    this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);

    this.form.get('tipoVista').enable();
    this.form.get('listaEntidad').enable();
  }



  public commandClick(args: any): void {

    if (args.commandColumn.title && args.commandColumn.title=== 'Modificar')
      {

        const id = args.rowData.idConfiguracionFirma;
      
        // Abrir el modal de modificación
        const modalRef = this.modalHelperService.abrirModal(ModificarConfiguracionFirmaComponent, 
          {id: id},
          {
          size: 'xl',
          scrollable: true,
          windowClass: 'modal-dialog-centered',
          animation: true,
          backdrop: 'static',
      });


      modalRef.result.then(
          () => {
   
          if(this.form.get('listaEntidad')?.value)
            {
              this.handleChangeEntidad(this.form.get('listaEntidad').value);
            }
            
          },
      );


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
        const respuesta: any = await firstValueFrom(this.configuracionFirmaService.borrar(args.rowData.idConfiguracionFirma));
        if (respuesta.isSuccess) {
          // Esperar a que cargarRegistros se complete antes de continuar
          await this.handleChangeEntidad(this.form.get('listaEntidad').value);
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

  handleChangeEntidad(args: any): void {

    try
    {

      this.spinnerService.showGlobalSpinner();
      const tipoVistaValue = this.form.get('tipoVista')?.value;
      const entidadValue = args;
      this.configuracionFirma = [];
      let configuracionFirma: ConfiguracionFirmaDto;

      if (entidadValue == null) {
        this.spinnerService.hideGlobalSpinner();
        return;}

      if (tipoVistaValue === TransactionCode.usuario) {
        configuracionFirma = { usuarioFirmante: entidadValue };
      } else if (tipoVistaValue === TransactionCode.rolUsuario) {
        configuracionFirma = { idRolFirmante: entidadValue };
      } else if (tipoVistaValue === TransactionCode.transacciones) {
        configuracionFirma = { codigoTransaccion: entidadValue };
      }

   
      if (configuracionFirma) {
        this.configuracionFirmaService.ObtenerListadoFirma(configuracionFirma).subscribe({
          next: (response) => {
          this.spinnerService.hideGlobalSpinner();

            if (response.isSuccess)
            {
              // Flatten nested/null-safe text fields used by filters
              this.configuracionFirma = (response.result || []).map((row: any) => ({
                ...row,
                // referencia1Texto: prefer area.cnoArea if present, else referencia1, else empty string
                referencia1Texto: row?.area?.cnoArea ?? row?.referencia1 ?? '',
                // referencia2Texto: prefer categoriaCompra.cnoCategoriaCompra if present, else referencia2, else empty string
                referencia2Texto: row?.categoriaCompra?.cnoCategoriaCompra ?? row?.referencia2 ?? ''
              }));
            }

           
          },
          error: (error: any) => {
            this.spinnerService.hideGlobalSpinner();
           this.toastr.error(cadenaErrores(error));
          }
        });
      }

    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  handleChangeTipoVista(args: any): void {

    try {

    
      this.localFieldsListaEntidad = {};
      this.data = [];
      this.configuracionFirma = [];

        if (args.value == TransactionCode.usuario) {

          this.localFieldsListaEntidad = this.localFieldsUsuario;
          this.data = this.cbusuario;

        }
        else if (args.value == TransactionCode.rolUsuario) {
        
          this.localFieldsListaEntidad = this.localFieldsRoles;
          this.data = this.cbroles;

        }
        else if (args.value == TransactionCode.transacciones) {
        
          this.localFieldsListaEntidad = this.localFieldsTransaccion;
          this.data = this.cbtransaccion;

        }

        this.form.patchValue({
          listaEntidad: ['']
        });
  
    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }

  }

  public onFiltering: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

    try
    {
      const tipoVistaValue = this.form.get('tipoVista')?.value;

      let query = new Query();
  
      //frame the query based on search string with filter type.
      if (tipoVistaValue===TransactionCode.usuario) {
        query = (e.text != "") ? query.where("userName", "contains", e.text, true) : query;
      }else if (tipoVistaValue===TransactionCode.rolUsuario) {
        query = (e.text != "") ? query.where("name", "contains", e.text, true) : query;
      }else if (tipoVistaValue===TransactionCode.transacciones) {
        query = (e.text != "") ? query.where("cnoTransaccion", "contains", e.text, true) : query;
      }
      
      
      //pass the filter data source, filter query to updateData method.
       e.updateData(this.data, query);
    }
    catch (error) {
      this.toastr.error('onFiltering',cadenaErrores(error));
    }

  }

nuevoRegistro(): void {
  const modalRef = this.modalHelperService.abrirModal(NuevaConfiguracionFirmaComponent, 
  {},
  {
    size: 'xl',
    scrollable: true,
    windowClass: 'modal-dialog-centered',
    animation: true,
    backdrop: 'static',
  });


  modalRef.result.then(
    () => {

      if(this.form.get('listaEntidad')?.value)
      {
        this.handleChangeEntidad(this.form.get('listaEntidad').value);
      }
      
    },
  );

}

  modificarRegistro(): void {

  }

  guardarCambios(): void {
   
    const tipoVistaValue = this.form.get('tipoVista')?.value;

    if (tipoVistaValue === TransactionCode.usuario) {

    } else if (tipoVistaValue === TransactionCode.sucursal) {
      // Implementar lógica para guardar por empresa
    } else if (tipoVistaValue === TransactionCode.bodega) {
      // Implementar lógica para guardar por bodega
    } else {
      this.toastr.error('Tipo de vista no válido');
    }

  }

  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }
   toolbarClick(args: ClickEventArgs): void {
      switch (args.item.id) {
        case 'DefaultExport_pdfexport':
          this.grid.pdfExport();
          break;
        case 'DefaultExport_excelexport':
          if(this.configuracionFirma && this.configuracionFirma.length > 0){
            this.grid.excelExport();
          }else{
            this.toastr.warning('No hay datos para exportar.');
          } 
          
          break;
        case 'DefaultExport_csvexport':
          this.grid.csvExport();
          break;
      }
    }
}
