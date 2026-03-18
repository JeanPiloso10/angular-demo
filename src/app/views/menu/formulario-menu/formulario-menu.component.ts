import { Component, EventEmitter, Input, OnInit, 
  HostListener , Output, ViewChild, ViewChildren, 
  ElementRef, inject, 
  AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup , Validators } from '@angular/forms';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { MenuService } from '../../menu/menu.service'
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { DropDownTree } from '@syncfusion/ej2-angular-dropdowns';
import { obtenerFechaEnHusoHorarioMinus5} from '@shared/utilities/formatearFecha';
import { SecurityService } from '@core/services/security.service';
import { OperacionTransaccionService } from '../../operacion-transaccion/operacion-transaccion.service';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Component({
  selector: 'app-formulario-menu',
  templateUrl: './formulario-menu.component.html',
  styleUrl: './formulario-menu.component.scss',
  standalone:false
})

export class FormularioMenuComponent  implements OnInit, AfterViewInit  {




  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  @ViewChild('nombre') nombre!: ElementRef;

  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  placeholder = 'Seleccione un item.';
  tipoAccion = TipoAccion;
  listadoOperacionTransaccion: any;
  listadoMenu: { [key: string]: any }[] = [];
  selectedMenu: string[]=[''];
  permissions:any[] = [];
  form: FormGroup;
  treeObj!: DropDownTree;
  fields: any = { dataSource: [], value: 'id', text: 'name', child: 'subChild', expanded: 'expanded' };
  
  fieldsOperacionTransaccion: Object = { text: 'descripcion', value: 'idOperacionTransaccion' };


   constructor(private formBuilder :FormBuilder,
  private menuService :MenuService,
  private validationService :FormValidationService,
  private toastr :ToastrService,
  private router :Router,
  private spinnerService :SpinnerService,
  private securityService :SecurityService,
  private operacionTransaccionService :OperacionTransaccionService,
  private permissionService :PermissionService )
   {
    this.form = this.initForm();
   }

   ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {
    try
    {
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      this.form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });
    
      this.loadInitialData();
    }catch(error)
    {
      this.toastr.error(cadenaErrores(error));
    }
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }
  


private async loadInitialData() {
  // this.spinnerService.showGlobalSpinner();
  try {    
    const response: any = await firstValueFrom(this.menuService.arbol());
    // this.spinnerService.hideGlobalSpinner();
    if (response.isSuccess) {
      this.fields.dataSource = this.transformToTreeFormat(response.result);
      this.treeObj = new DropDownTree({
        fields: this.fields,
        allowFiltering: true,
        showClearButton: true,
        placeholder: 'Seleccione el menú padre',
        changeOnBlur: false,
        value: this.modelo?.padre_id ? [this.modelo.padre_id.toString()] : []
      });
      this.treeObj.appendTo('#default');


      const responseOperacionTransaccion: any = await firstValueFrom(this.operacionTransaccionService.todos());
      this.listadoOperacionTransaccion = responseOperacionTransaccion.result.filter((item: any) => item.activo === true);
      this.form.get('activo').patchValue(true);
      this.patchFormValues();

      
    } else {
      this.toastr.error(response.message || 'Error al cargar los menús.');
    }
  } catch (error) {
    // this.spinnerService.hideGlobalSpinner();
    this.toastr.error(cadenaErrores(error));
  }
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

private patchFormValues() {

 
  if (this.StateEnum !== TipoAccion.Create && this.modelo) {

    this.form.patchValue(
      {
        id: this.modelo.id,     
        nombre: this.modelo.nombre,   
        menu_id: this.modelo.menu_id,    
        orden: this.modelo.orden,
        padre_id: this.modelo.padre_id,
        icono: this.modelo.icono,
        url: this.modelo.url,
        idOperacionTransaccion: this.modelo.idOperacionTransaccion,
        activo: this.modelo.activo  ,
        usuarioCreacion: this.modelo.usuarioCreacion,   
        fechaCreacion: this.modelo.fechaCreacion,   
        equipoCreacion: this.modelo.equipoCreacion,   
        usuarioModificacion: this.modelo.usuarioModificacion,   
        fechaModificacion: this.modelo.fechaModificacion,   
        equipoModificacion: this.modelo.equipoModificacion
      }
    );             
  }
}

  async ngAfterViewInit() {    
    this.nombre.nativeElement.focus();
  }

  async fillCombos() {
    try {
      const response: any = await firstValueFrom(this.menuService.arbol());
      if (response.isSuccess) {
           
        this.listadoMenu = this.transformToTreeFormat(response.result) as { [key: string]: any }[];

      } else {
        this.toastr.error(response.message || 'Error al cargar el combo de menu.');
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private transformToTreeFormat(items: any[]): any[] {
    return items.map(item => ({
      id: item.id.toString(),
      name: item.nombre,
      subChild: item.menus ? this.transformToTreeFormat(item.menus) : []
    }));
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      id:  [0],  
      nombre: ['', [Validators.required,  this.validationService.primeraLetraMayuscula()]], 
      orden: [0, [Validators.required]], 
      menu_id: [this.menuService.menu, [Validators.required]], 
      padre_id: [], 
      url:  [''],
      icono:  [''],
      idOperacionTransaccion: [null],
      activo:  [true],
      usuarioCreacion: [null],
      fechaCreacion: [null],
      equipoCreacion: [null],
      usuarioModificacion: [null],
      fechaModificacion: [null],
      equipoModificacion: [null],
    });
  }


  guardarCambios(): void {
    if (this.form.valid) {
      this.form.get('padre_id').setValue(this.getPadreValue());


      if (this.formularioValidado())
        {
          this.nombre.nativeElement.focus();

          const updateData = {
            usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
            fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
            usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
            fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5(): undefined,
          };


          this.form.patchValue(updateData);
          this.onSubmit.emit(this.form.value);
        }      
    }
    else{
      this.toastr.error('Por favor, complete los campos requeridos.');
    }
  }

  formularioValidado(): boolean {
    const padre_id = this.form.get('padre_id').value;
    if (padre_id === this.form.get('id').value) {
      this.toastr.error("El menú padre no puede ser el mismo que el menú actual.");
      return false;
    }
    return true;
  }

  getPadreValue(): number | null {
    const value = this.treeObj.value;
    return Array.isArray(value) && value.length ? parseInt(value[0], 10) : null;
  }


  cancelar():void {
    this.router.navigate(['/menu']);
  }
  
  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    return ((campo.dirty || campo.touched) && campo.invalid) ? this.validationService.obtenerMensajeError(campo) : '';
  }

@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Combinación para 'Alt+G' - Grabar
  if (event.altKey && event.key === 'g') {
    this.guardarCambios();
    event.preventDefault();
  }
  // Combinación para 'Alt+C' - Cancelar
  else if (event.altKey && event.key === 'c') {
    this.cancelar();
    event.preventDefault();
  }
}

}
