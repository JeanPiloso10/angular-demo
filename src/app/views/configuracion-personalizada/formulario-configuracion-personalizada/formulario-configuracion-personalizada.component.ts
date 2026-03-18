import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SecurityService } from '@core/services/security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { SucursalService } from '../../sucursal/sucursal.service';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { ConfiguracionService } from '../../configuracion/configuracion.service';

@Component({
  selector: 'app-formulario-configuracion-personalizada',
  templateUrl: './formulario-configuracion-personalizada.component.html',
  styleUrl: './formulario-configuracion-personalizada.component.scss',
  standalone:false
})
export class FormularioConfiguracionPersonalizadaComponent {

  
  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  @ViewChild('codigoConfiguracion', { static: false }) codigoConfiguracion!: ComboBoxComponent;
  customStylesValidated = false;
  localWaterMark = 'Seleccione un item.';

  private isComponentActive = true;
  allowCustom = true;
  form: FormGroup;
  entidad = 'configuraciones';
  sucursales: any[];
  transacciones: any[];
  usuarios: any[];
  configuraciones: any[];

  fieldsUsuarios: Object = { text: 'userName', value: 'userName' };
  fieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  fieldsSucursal: Object = { text: 'cnoSucursal', value: 'idSucursal' };
  fieldsConfiguracion: Object = { text: 'cnoConfiguracion', value: 'codigo' };
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UsuariosService,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private sucursalService: SucursalService,
    private transaccionService: TransaccionService,
    private configuracionService: ConfiguracionService,
    private securityService: SecurityService
  ) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('activo')?.valueChanges.subscribe({

      next: (value) => {
        
        this.updateLabel(value);
      },
      error: (err) => {
        console.error(err);
      }
      
    });
  
    // Inicializar el componente
    this.initializeComponent();
  }
  
  private async initializeComponent() {
    try {

     
      await this.loadInitialData();
      await this.patchFormValues();
      this.barraBotones();

      if (this.isComponentActive == false)
      {
        return;
      }

      if (this.codigoConfiguracion) {
        this.codigoConfiguracion.focusIn();
      }

  
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngOnDestroy(): void {
    this.isComponentActive = false; // Cambiar el flag cuando se destruye el componente
  }
  
  private async loadInitialData() {


    try {


      const results = await firstValueFrom(forkJoin(
        {
          configuracionResponse: this.configuracionService.todos().pipe(catchError(error => of({ result: [] }))),
          userResponse: this.userService.todos().pipe(catchError(error => of({ result: [] }))),
          sucursalResponse: this.sucursalService.todos().pipe(catchError(error => of({ result: [] }))),
          transaccionResponse: this.transaccionService.todos().pipe(catchError(error => of({ result: [] }))),
        }
      ))

      if (results.configuracionResponse.isSuccess) {
    
        this.configuraciones = results.configuracionResponse.result;        
      } else {
        this.toastr.error(results.configuracionResponse.message || 'Error al cargar configuraciones.');
      }

      if (results.userResponse.isSuccess) {
        this.usuarios = results.userResponse.result;        
      } else {
        this.toastr.error(results.userResponse.message || 'Error al cargar usuarios.');
      }
      if (results.sucursalResponse.isSuccess) {
        this.sucursales = results.sucursalResponse.result;        
      } else {
        this.toastr.error(results.sucursalResponse.message || 'Error al cargar sucursales.');
      }

      this.spinnerService.hideGlobalSpinner();
      if (results.transaccionResponse.isSuccess) {
        this.transacciones = results.transaccionResponse.result;       
     
      } else {
        this.toastr.error(results.transaccionResponse.message || 'Error al cargar transacciones.');
      }
      this.form.get('activo').patchValue(true);
    
      

    } catch (error) {

      this.toastr.error(cadenaErrores(error));
    }
  }

  
  barraBotones() {


    try {
      
      this.allowCustom = false;

      if (this.StateEnum === TipoAccion.Update) {
        this.form.get('codigoConfiguracion').disable();
     }

    } catch (error) {

      this.toastr.error(cadenaErrores(error));
    }
  }


  
ngAfterViewInit(): void {

  // this.codigoConfiguracion.focusIn();
}

private initForm(): FormGroup {
  return this.formBuilder.group({
    idConfiguracionPersonalizada:  [0],  
    codigoConfiguracion:  [null,[Validators.required]],  
    userName: [null, [Validators.maxLength(50)]], 
    codigoTransaccion: [null, [Validators.maxLength(15)]], 
    idSucursal: [null, []], 
    referencia1: ['', []],
    referencia2: ['', []],
    referencia3: ['', []],
    valor: [null, [Validators.maxLength(256)]], 
    descripcion: [null, [Validators.maxLength(100)]], 
    activo: [true],
    usuarioCreacion: [null],
    fechaCreacion: [null],
    equipoCreacion: [null],
    usuarioModificacion: [null],
    fechaModificacion: [null],
    equipoModificacion: [null],
  });
}

async patchFormValues() {
  if (this.modelo) {

    this.form.patchValue(
      {
        idConfiguracionPersonalizada: this.modelo.idConfiguracionPersonalizada, 
        codigoConfiguracion: this.modelo.codigoConfiguracion, 
        userName:this.modelo.userName, 
        codigoTransaccion: this.modelo.codigoTransaccion, 
        idSucursal: this.modelo.idSucursal, 
        referencia1: this.modelo.referencia1, 
        referencia2: this.modelo.referencia2, 
         referencia3: this.modelo.referencia3, 
        valor:this.modelo.valor, 
        descripcion:this.modelo.descripcion, 
        activo: this.modelo.activo, 
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


guardarCambios(): void {


  if (this.form.valid) {

    const updateData = {
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5(): undefined,
    };

    this.form.patchValue(updateData);
    this.onSubmit.emit(this.form.getRawValue());
  }
}


cancelar():void {
  this.router.navigate(['/'+this.entidad+'/listado']);
}

public onFilteringConfiguracion: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

  let query = new Query();
  
  query = (e.text != "") ? query.where("cnoConfiguracion", "contains", e.text, true) : query;
  //pass the filter data source, filter query to updateData method.
   e.updateData(this.configuraciones, query);

};

public onFilteringUserName: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

  let query = new Query();
  
  query = (e.text != "") ? query.where("userName", "contains", e.text, true) : query;
  //pass the filter data source, filter query to updateData method.
   e.updateData(this.usuarios, query);

};

public onFilteringTransaccion: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

  let query = new Query();
  
  query = (e.text != "") ? query.where("cnoTransaccion", "contains", e.text, true) : query;
  //pass the filter data source, filter query to updateData method.
   e.updateData(this.transacciones, query);

};

public onFilteringSucursal: EmitType<FilteringEventArgs>  =  (e: FilteringEventArgs) => {

let query = new Query();

query = (e.text != "") ? query.where("cnoSucursal", "contains", e.text, true) : query;
//pass the filter data source, filter query to updateData method.
 e.updateData(this.sucursales, query);

};


@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Combinación para 'Alt+G' - Grabar
  if (event.altKey && event.key === 'g') {
    this.guardarCambios();
    event.preventDefault(); // Previene la acción por defecto (opcional)
  }
  // Combinación para 'Alt+C' - Cancelar
  else if (event.altKey && event.key === 'c') {
    this.cancelar();
    event.preventDefault(); // Previene la acción por defecto (opcional)
  }
}

obtenerError(campoNombre: string): string {
  const campo = this.form.get(campoNombre);
  return campo ? this.validationService.obtenerMensajeError(campo) : '';
}

updateLabel(value: boolean) {
  if (this.lblEstado && this.lblEstado.nativeElement) {
    this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
  }
}


}
