import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { PermisoRolService } from '../permiso-rol.service';
import { SecurityService } from '@core/services/security.service';
import { RolesService } from '../../roles/roles.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { Router } from '@angular/router';
import { EmitType } from '@syncfusion/ej2-base';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Query } from '@syncfusion/ej2-data';

@Component({
  selector: 'app-formulario-permiso-rol',
  templateUrl: './formulario-permiso-rol.component.html',
  styleUrl: './formulario-permiso-rol.component.scss',
  standalone:false
})
export class FormularioPermisoRolComponent  implements AfterViewInit {

  errores: string;
  StateEnum: TipoAccion = TipoAccion.Read;
  modelo: any;  

  @ViewChild('treegrid') public treegrid: TreeGridComponent | undefined;
  @ViewChild('roleId') roleId!: ComboBoxComponent;

  // tipoAccion: TipoAccion;
  fieldsRoles: Object = { text: 'name', value: 'id' };
  listaRoles: any;
  data: any;
  waterMark: string = 'Seleccione un Rol';
  entidad = 'permisorol';
  public checked_record?: any;
  pageSettings = { pageCount: 5 };
  checkedItems:number[] = [];
  globalIndex = 0;
  public searchSettings: Object;
 
  form: FormGroup;
  permisosRol :any[] = [];
  permissions:any[] = [];
  public toolbar: string[];
  public filterSettings: Object;
  public shouldCollapse = true;

  estadoBotones = {
    btnModificar: false,
    btnGrabar: false,
  };


  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private rolService: RolesService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private securityService: SecurityService,
    private permisoRolService: PermisoRolService,
    private router: Router)
  {
    this.form = this.initForm();
  }

  
  ngOnInit(): void {
    this.initializeComponent();
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.permisorol).pipe(catchError(error => of({ result: [] })))
  
      }));

  
          this.permissions = results.permission.result as OperacionesDto[];
          if (this.permissions.length === 0) {
            this.router.navigate(['/pages/403']);
        }
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      idPermisoRol:  [0],
      roleId:  [''],
      idOperacionTransaccion:  [0]
    });
  }

  ngAfterViewInit() {
    this.habilitaGrid();

    setTimeout(() => { this.roleId.focusIn();}, 100);

  }

  collapseGrid() {
    if (this.treegrid) {
      this.treegrid.dataBound.subscribe(() => {
        this.treegrid.collapseAll();
        this.shouldCollapse = false; 
      });
    }
  }

  public filterRole: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('name', 'contains', e.text, true) : new Query();
    e.updateData(this.listaRoles, query);
  };
  
  private async initializeComponent() {
    try {

    await this.getPermissions(); // Espera a que se obtengan los permisos
    if (!this.permissions || this.permissions.length === 0) {
      return; // Detener el flujo si no hay permisos
    }
    
  this.filterSettings = { type: 'Menu', hierarchyMode: 'Both' } as any;
    this.toolbar = ['Search'];
    this.searchSettings = { hierarchyMode: 'Both' };
    this.form.disable();
   
    await this.loadInitialData();
    this.barraBotones();
  } catch (error) {
    this.toastr.error(cadenaErrores(error));
  }
    
  }

  private async loadInitialData() {
    try {
      const responseRol: any = await firstValueFrom(this.rolService.todos());
      this.listaRoles = responseRol.result;
      this.shouldCollapse = true; // Restablecer la bandera de colapso si es necesario
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

    

    if (this.StateEnum === TipoAccion.Read) {
      this.estadoBotones.btnModificar = this.tienePermiso('M');
      this.estadoBotones.btnGrabar = false;

      this.form.get('roleId').enable();
      this.habilitaGrid();
     
     
    } else {
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnModificar = false;

      this.form.get('roleId').disable();
      this.habilitaGrid();

    }
  }


  public habilitaGrid(): void {

    const treeGridElement = this.treegrid ? this.treegrid.element : null;
    // console.log(this.treegrid);
    // return;

  
    if (!treeGridElement) {
      //console.warn("TreeGrid element element is not available.");
      return;
    }


    if (this.StateEnum === TipoAccion.Read) {
      this.treegrid.element.classList.add('disabletreegrid');
      // (document.getElementById("TreeGridParent") as HTMLElement).classList.add('wrapper');
    }
    else
    {
      this.treegrid.element.classList.remove('disabletreegrid');
      // (document.getElementById("TreeGridParent") as HTMLElement).classList.remove('wrapper');
    }

  }
 
  onChange(args: any) {
    this.getPermisosRol(args);
  }

  async getPermisosRol(roleId: string) {
    try
    {
      this.data = [];
      this.checkedItems = [];
      this.permisosRol = [];
     
      
      if (roleId) {
      
        this.disableHeaderCheckBox();
        this.spinnerService.showGlobalSpinner();

    
  const responsePermisoRol: any = await firstValueFrom(this.permisoRolService.consultaId(roleId));
        this.spinnerService.hideGlobalSpinner();
        // Ensure grid starts collapsed after each load
        this.shouldCollapse = true;
        this.data = this.normalizeTree(responsePermisoRol.result);

       
      } else {
        this.data = [];
      }
    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
   
  }

  
  private normalizeTree(items: any[]): any[] {
    const mapNode = (n: any): any => {
      return {
        ...n,
        // Syncfusion expects arrays, not null
        children: Array.isArray(n.children) ? n.children.map(mapNode) : (n.children ? [n.children].map(mapNode) : []),
        // activo can be boolean or null; treat null as false for selection
        activo: n.activo === true,
        activoOriginal: n.activo === true
      };
    };
    return Array.isArray(items) ? items.map(mapNode) : [];
  }


  disableHeaderCheckBox(): void {
    try
    {

      if (this.treegrid!= undefined && this.treegrid) {

     
        
        const headerCells = this.treegrid.getHeaderContent().querySelectorAll('.e-headercell');

      
        headerCells.forEach((headerCell: Element) => {
          const index = (headerCell as HTMLElement).ariaColIndex;
          if (index === "2") {
            (headerCell as HTMLElement).querySelector('.e-checkbox-wrapper')?.setAttribute('style', 'pointer-events: none; opacity: 0.5;');
          }
        });
      }
    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  databound(): void {
    try
    {
      if(this.StateEnum === TipoAccion.Read)
      {
   
    
        this.globalIndex = 1; // reset global index after marking rows
        this.markActiveRows(this.treegrid.dataSource);
        this.treegrid.selectCheckboxes(this.checkedItems);

      }
      // Collapse once after new data binds (after selection so checked state persists)
      if (this.shouldCollapse && this.treegrid) {
        this.treegrid.collapseAll();
        this.shouldCollapse = false;
      }
     
    }
    catch (error) {
      
    }
  }

  
  private markActiveRows(data: any): void {
    if (!Array.isArray(data)) return;
    for (let i = 0; i < data.length; i++, this.globalIndex++) {
      if (data[i].activo === true) {
        this.checkedItems.push(this.globalIndex)
      }
      if (data[i].children && data[i].children.length) {
        this.markActiveRows(data[i].children);
      }
    }
  }

  checkboxChange(args: any) {
    try
    {
      const rowData: any = args.rowData;
      const state = args.checkboxState as 'check' | 'uncheck' | 'indeterminate';
      // Inferir boolean deseado: para padre colapsado, confiar en 'checked' si existe
      const checked = state === 'check' || args.checked === true;

      // Buscar el nodo real en this.data por 'indice' y actualizar 'children' completos
      const targetIndice = rowData?.indice;
      if (typeof targetIndice !== 'number') return;
      const targetNode = this.findNodeByIndice(this.data, targetIndice);
      if (!targetNode) return;

      // Siempre propagar si el nodo tiene hijos en los datos, aunque esté colapsado
      if (targetNode.children && targetNode.children.length) {
        this.setActivoRecursive(targetNode, checked);
      } else {
        targetNode.activo = checked;
      }
    }
    catch (error) {
      console.log(error);
    }
    
  }

  private findNodeByIndice(nodes: any[], indice: number | string): any | null {
    for (const n of nodes || []) {
      if (String(n.indice) === String(indice)) return n;
      const found = this.findNodeByIndice(n.children || [], indice);
      if (found) return found;
    }
    return null;
  }

  private setActivoRecursive(node: any, checked: boolean) {
    node.activo = checked;
    if (node.children && node.children.length) {
      for (const ch of node.children) this.setActivoRecursive(ch, checked);
    }
  }

  checkChildNodes(idPermisoRol: number, idOperacionTransaccion: number, activoOrigen: boolean, checkboxState: string) {
    const selectedValue = this.form.get('roleId')?.value;
    const index = this.permisosRol.findIndex(item => item.idOperacionTransaccion === idOperacionTransaccion);
    if (index > -1) {
      this.permisosRol.splice(index, 1);
    }

    if (checkboxState === "check") {
      if(idPermisoRol === 0) {
        this.permisosRol.push({
          idOperacionTransaccion, 
          roleId: selectedValue,
          activo: true,
          operacion: "Create",
          usuarioCreacion: this.securityService.getUserName(),
          fechaCreacion: obtenerFechaEnHusoHorarioMinus5() 
        });
      } else if (idPermisoRol > 0 && !activoOrigen) {
        this.permisosRol.push({
          idOperacionTransaccion, 
          roleId: selectedValue,
          activo: true,
          operacion: "Update",
          usuarioModificacion: this.securityService.getUserName(),
          fechaModificacion:obtenerFechaEnHusoHorarioMinus5()
        });
      }
    } else {
      if(idPermisoRol > 0 && activoOrigen) {
        this.permisosRol.push({
          idOperacionTransaccion, 
          roleId: selectedValue,
          activo: false,
          operacion: "Update",
          usuarioModificacion: this.securityService.getUserName(),
          fechaModificacion: obtenerFechaEnHusoHorarioMinus5()
        });
      }
    }
  }
  modificarRegistro(): void {
   
    const roleId = this.form.get('roleId')?.value;

    if(roleId === null || roleId === '')
      {
        this.toastr.error('Debe seleccionar un rol.');
        return;
      }

    this.StateEnum = TipoAccion.Update;
    this.barraBotones();
  }

  guardarCambios(): void {
    // Recalcular cambios basados en la selección actual vs estado original,
    // para que funcione aunque existan filtros activos.
    const cambios = this.construirCambiosDesdeSeleccion();

    if (cambios.length === 0) {
      this.toastr.info('No se han realizado cambios.');
      return;
    }

    this.spinnerService.showGlobalSpinner();

    this.permisoRolService.guardar(cambios).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: () => {
        this.toastr.success('Acción exitosa.');


       // Limpiar búsqueda y filtros para no dejar el grid bloqueado
       const tg = this.treegrid as TreeGridComponent;
       tg.searchSettings.key = '';
       try { tg.clearFiltering(); } catch (error) { console.error('Error clearing filters:', error); }


        this.getPermisosRol(this.form.get('roleId')?.value);
        this.StateEnum = TipoAccion.Read;
        this.barraBotones();

        
      },
      error: (error: any) => {
        this.toastr.error(cadenaErrores(error));
      }
    });


  }

  cancelar(): void {
    this.StateEnum = TipoAccion.Read;
    this.barraBotones();
  }

  private construirCambiosDesdeSeleccion(): any[] {
    const selectedRoleId = this.form.get('roleId')?.value;
    const cambios: any[] = [];
    const now = obtenerFechaEnHusoHorarioMinus5();
    const user = this.securityService.getUserName();

    const recorrer = (nodes: any[]) => {
      for (const n of nodes || []) {
        const isLeaf = !n.children || n.children.length === 0;
        if (isLeaf && n.idOperacionTransaccion && n.idOperacionTransaccion > 0) {
          const deseadoActivo = n.activo === true;
          const estabaActivo = n.activoOriginal === true;
          if (deseadoActivo && n.idPermisoRol === 0) {
            // Nuevo permiso activo
            cambios.push({
              idOperacionTransaccion: n.idOperacionTransaccion,
              roleId: selectedRoleId,
              activo: true,
              operacion: 'Create',
              usuarioCreacion: user,
              fechaCreacion: now
            });
          } else if (deseadoActivo && n.idPermisoRol > 0 && !estabaActivo) {
            // Reactivar existente
            cambios.push({
              idOperacionTransaccion: n.idOperacionTransaccion,
              roleId: selectedRoleId,
              activo: true,
              operacion: 'Update',
              usuarioModificacion: user,
              fechaModificacion: now
            });
          } else if (!deseadoActivo && n.idPermisoRol > 0 && estabaActivo) {
            // Desactivar existente
            cambios.push({
              idOperacionTransaccion: n.idOperacionTransaccion,
              roleId: selectedRoleId,
              activo: false,
              operacion: 'Update',
              usuarioModificacion: user,
              fechaModificacion: now
            });
          }
        }
        if (n.children && n.children.length) {
          recorrer(n.children);
        }
      }
    };

    recorrer(this.data || []);
    // Mantener sincronizado permisosRol por si otras partes lo usan
    this.permisosRol = cambios;
    return cambios;
  }

}
