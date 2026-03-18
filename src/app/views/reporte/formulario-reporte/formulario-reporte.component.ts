
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReporteService } from '../reporte.service';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { FormValidationService } from '@core/services/form-validation.service';
import { SecurityService } from '@core/services/security.service';
import { SucursalService } from '../../sucursal/sucursal.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-formulario-reporte',
  templateUrl: './formulario-reporte.component.html',
  styleUrl: './formulario-reporte.component.scss',
  standalone:false
})
export class FormularioReporteComponent {


  
  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('codigoTransaccion', { static: false }) codigoTransaccion!: ComboBoxComponent;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  customStylesValidated = false;
  localWaterMark = 'Seleccione un item.';

  sucursales: any[];
  transacciones: any[];
  cbTipoSecuencia: any[] = [];

  fieldsTipoSecuencia: Object = { text: 'descripcion', value: 'codigo' };
  fieldsTransaccion: Object = { text: 'cnoTransaccion', value: 'codigo' };
  fieldsSucursal: Object = { text: 'cnoSucursal', value: 'idSucursal' };
  selectedFile: any = null;
  
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  form: FormGroup;
  tituloFormulario: string;
  entidad = 'secuencias';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private reporteService: ReporteService,
    private transaccionService: TransaccionService,
    private sucursalService: SucursalService,
    private securityService: SecurityService
  ) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.barraBotones();
  }

  
  barraBotones() {

    this.form.get('originalFileName')?.disable();

    if (this.StateEnum === TipoAccion.Update) {
        this.form.get('codigoTransaccion')?.disable();
        this.form.get('idSucursal')?.disable();
    }
  }

  
  private async loadInitialData() {


    this.spinnerService.showGlobalSpinner();
    try {

      
      const results = await firstValueFrom(forkJoin({
        responseSucursal: this.sucursalService.todos().pipe(catchError(error => of({ result: [] }))),
        responseTransaccion: this.transaccionService.todos().pipe(catchError(error => of({ result: [] })))
      }));
      this.spinnerService.hideGlobalSpinner();

      if (results.responseSucursal.isSuccess) {
        this.sucursales = results.responseSucursal.result;        
      } else {
        this.toastr.error(results.responseSucursal.message || 'Error al cargar sucursales.');
      }

      if (results.responseTransaccion.isSuccess) {
        this.transacciones = results.responseTransaccion.result;        
      } else {
        this.toastr.error(results.responseTransaccion.message || 'Error al cargar sucursales.');
      }

      this.patchFormValues();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngAfterViewInit(): void {
  
    this.codigoTransaccion.focusIn();

  }

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

private initForm(): FormGroup {
  return this.formBuilder.group({
    idReporte:  [0],  
    codigoTransaccion: ['', [Validators.required]], 
    idSucursal: [null], 
    referencia1: ['', [Validators.maxLength(25)]], 
    referencia2: ['', [Validators.maxLength(25)]], 
    referencia3: ['', [Validators.maxLength(25)]], 

    xmlName: ['', [Validators.maxLength(25)]], 
    xmlPathSchema: ['', [Validators.maxLength(25)]], 

    originalFileName: [''], 
    fileName: [''], 
    blobUri: [''], 
    uploadDate: [null],  

    usuarioCreacion: [null],
    fechaCreacion: [null],
    equipoCreacion: [null],
    usuarioModificacion: [null],
    fechaModificacion: [null],
    equipoModificacion: [null],
  });
}

onFileChange(event: any): void {
  const fileInput = event.target;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const mimeType = file.type;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
  }
}

handleChange(args: any): void {
}

private patchFormValues() {
  if (this.modelo) {

   

    this.form.patchValue(
      {
        idReporte: this.modelo.idReporte,
        codigoTransaccion: this.modelo.codigoTransaccion,     
        idSucursal: this.modelo.idSucursal, 
        referencia1: this.modelo.referencia1, 
        referencia2: this.modelo.referencia2, 
        referencia3: this.modelo.referencia3, 

        xmlName: this.modelo.xmlName, 
        xmlPathSchema: this.modelo.xmlPathSchema, 

        originalFileName: this.modelo.originalFileName, 
        fileName: this.modelo.fileName, 
        blobUri: this.modelo.blobUri, 
        uploadDate: this.modelo.uploadDate, 
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

  if(this.StateEnum == TipoAccion.Create)
  {
    if (!this.selectedFile) {
      this.toastr.error('Por favor, seleccione un archivo para cargar.');
      return;
    }
  
  }
 
 
  if (this.form.valid) {
    const updateData = {
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5()  : undefined,
    };      
    this.form.patchValue(updateData);

  
    const formData: FormData = new FormData();
    
    Object.keys(this.form.getRawValue()).forEach(key => {

      formData.append(key, this.form.get(key)?.value || '');
    });

    formData.append('tipoAccion', this.StateEnum);
    formData.append('file', this.selectedFile);
    
    this.spinnerService.showGlobalSpinner();
    this.reporteService.UploadReportFile(formData).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (response) => {
  
        this.toastr.success('Acción exitosa');
        this.fileInput.nativeElement.value = '';

        // Restablecer el campo del archivo
        this.selectedFile = null;
        this.activeModal.close(); 
      },
      error: (error) => {
        this.toastr.error('Error al cargar el archivo');
        console.error('Error al cargar el archivo', error);
      }
    });
  }
}



cancelar():void {
  this.router.navigate(['/'+this.entidad+'/listado']);
}



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



}
