import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, forkJoin, of, Subject, switchMap } from 'rxjs';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import { FormValidationService } from '@core/services/form-validation.service';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChangeDetectorRef } from '@angular/core';
import { Query } from '@syncfusion/ej2-data';
import { EmitType } from '@syncfusion/ej2-base';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Operacion } from '@shared/enums/Operacion';
import { AreasService } from '../area.service';

@Component({
  selector: 'app-formulario-area',
  templateUrl: './formulario-area.component.html',
  styleUrl: './formulario-area.component.scss',
  standalone:false
})
export class FormularioAreaComponent {

  

  @Input() titulo?: string;
  @Input() errores: string[] = [];
  @Input() modelo: any;
  @Input() StateEnum!: TipoAccion;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() modificarEvent = new EventEmitter<string>();
  @ViewChild('AreaCodigo') AreaCodigo!: ElementRef;
  @ViewChild('AreaDescripcion') AreaDescripcion!: ComboBoxComponent;
  @ViewChild('AreaMontoTotal') AreaMontoTotal!: ElementRef;
  @ViewChild('AreaCodigoDepartamento') AreaCodigoDepartamento!: ComboBoxComponent;
  @ViewChild('AreaCodigoCentroCosto') AreaCodigoCentroCosto!: ComboBoxComponent;
  @ViewChild('AreaIdSucursal') AreaIdSucursal!: ComboBoxComponent;

  public Form: FormGroup;
  public estadoBotones = { btnNuevo: false, btnModificar: false, btnGrabar: false, btnAnular: false, btnSalir: false, btnBuscar: false };
  public fieldsDepartamentos: Object = { text: 'cnoDepartamento', value: 'codigo' };
  public cbDepartamentos: any[] = [];
  public fieldsCentroCosto: Object = { text: 'cnoCentroCosto', value: 'codigo' };
  public listadocentroCosto: any[] = [];
  public cbCentroCosto: any[] = [];
  public allowCustomValue: boolean = true;
  public allowFiltering: boolean = true;
  public multiselectWaterMark: string = '';
  public default: string = 'Default';
  public loading: boolean = false;
  public codigoSeleccionado: boolean = false;
  public descripcionSeleccionada: boolean = false;
  public codigoCentroCostoSeleccionado: boolean = false;
  public searchDepartamentoTextChanged = new Subject<string>();
  public searchCentroCostoTextChanged = new Subject<string>();
  public isLoading = false;
  public permissions: OperacionesDto[] = [];
  public entidad = 'area';
  public isLoadingSearchArea = false;
  public searchTextAreaChanged = new Subject<string>();
  public areaList: any[];
  public fieldsArea: Object = { text: 'descripcion', value: 'codigo' };
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  constructor(
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private permissionService: PermissionService,
    private validationService: FormValidationService,
    private areaService: AreasService,
    private router: Router,
    private cdr: ChangeDetectorRef) {
    this.initForm();
  }

  ngAfterViewInit(): void {
   setTimeout(() => { this.AreaCodigo.nativeElement.focus();}, 100);
  }

  async ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes['modelo'] && !changes['modelo'].isFirstChange()) {

        this.spinnerService.showGlobalSpinner();
        await this.patchFormValues();
        if (this.StateEnum == TipoAccion.Read) {
          this.barraBotones();
        }
      }
    }
    catch (error) {
      this.handleError(error);
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }


  async ngOnInit() {
    try {

      this.Form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });
      
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return;
      }

      await this.initializeComponent();

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
    
  };

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }


  async getPermissions() {
    try {
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.area).pipe(catchError(error => of({ result: [] })))
      }));
      this.permissions = results.permission.result as OperacionesDto[];
      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
      };

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  private async initializeComponent() {
    try {
      this.Form.get('activo').patchValue(true);
      this.spinnerService.showGlobalSpinner();
      await this.patchFormValues();
      this.barraBotones();
      this.debounceAreas();
      this.spinnerService.hideGlobalSpinner();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    this.allowCustomValue = false;
  }

  private handleError(error: any) {
    this.spinnerService.hideGlobalSpinner();
    this.toastr.error(cadenaErrores(error));
  }

  async onChangeDepartamento(event: any) {
    this.cbCentroCosto = [];
    let codigoDepartamento = event.value;
    this.Form.get("codigoCentroCosto").patchValue("");
    this.cbCentroCosto = this.listadocentroCosto.filter(c => c.codigoDepartamento == codigoDepartamento);
  }

  barraBotones() {
    if (this.StateEnum == TipoAccion.Read) {

      this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);
      this.estadoBotones.btnModificar = this.tienePermiso(Operacion.Modificar);
      this.estadoBotones.btnGrabar = false;
      this.Form.get('codigoDepartamento')?.disable();
      this.Form.get('codigoCentroCosto')?.disable();
      this.Form.get('AreaPredeterminada')?.disable();
      this.Form.get('activo')?.disable();
      this.AreaCodigo.nativeElement.focus();
    }
    else if (this.StateEnum == TipoAccion.Create) {
      this.estadoBotones.btnGrabar = true;
      this.Form.enable();
      this.Form.get('activo')?.disable();
      this.AreaCodigo.nativeElement.focus();
    }
    else if (this.StateEnum == TipoAccion.Update) {
      this.estadoBotones.btnGrabar = true;
      this.Form.enable();
      this.Form.get('codigo')?.disable();
      this.AreaDescripcion.focusIn();
    }
    else {
      this.estadoBotones.btnGrabar = false;
      this.Form.disable();
      this.Form.get('codigo')?.enable();
      this.Form.get('descripcion')?.enable();
      this.AreaCodigo.nativeElement.focus();
    }


    this.Form.get('usuarioCreacion')?.disable();
    this.Form.get('equipoCreacion')?.disable();
    this.Form.get('fechaCreacion')?.disable();
    this.Form.get('usuarioModificacion')?.disable();
    this.Form.get('fechaModificacion')?.disable();
    this.Form.get('equipoModificacion')?.disable();
  }

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some((e: any) => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }

  debouncedGetArea(event: FilteringEventArgs) {
    if (this.StateEnum === TipoAccion.Read) {
      const query: string = event.text;
      if (query.length >= 3 && !this.isLoadingSearchArea) { // Solo emitir si no hay una petición en curso
        this.searchTextAreaChanged.next(query);
      }
    }
  }

  debounceAreas() {
    if (this.StateEnum === TipoAccion.Read) {
      this.searchTextAreaChanged.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(query => {
          this.isLoadingSearchArea = true; // Indica que una petición está en curso
          return this.areaService.getAreaFilter(query).pipe(
            catchError(error => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoadingSearchArea = false)
          );
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            if (response.isSuccess) {
              this.areaList = response.result;
            } else {
              this.toastr.error(response.message || 'Error al cargar áreas.');
            }
          }
        },
        error: (error) => {
          this.toastr.error(cadenaErrores(error));
        }
      });
    }
  }

  onDescripcionChange(event: any) {
    if (this.StateEnum === TipoAccion.Read) {
      if (event.isInteracted) {
        const selectedValue = event.itemData;
        if (selectedValue) {
          const codigo = selectedValue.codigo;
          this.router.navigate(['/' + this.entidad + '/ver', codigo]);
        }
      }
    }
  }




  private async patchFormValues() {

    

    if ((this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Read) 
      && this.modelo 
      && Object.keys(this.modelo).length > 0 && this.modelo.descripcion != undefined) {

      this.Form.patchValue({
        codigo: this.modelo.codigo,
        descripcion: this.modelo.descripcion,
        codigoDepartamento: this.modelo.codigoDepartamento,
        codigoCentroCosto: this.modelo.codigoCentroCosto,
        activo: this.modelo.activo, 
        usuarioCreacion: this.modelo.usuarioCreacion,
        fechaCreacion: this.modelo.fechaCreacion,
        equipoCreacion: this.modelo.equipoCreacion,
        usuarioModificacion: this.modelo.usuarioModificacion,
        fechaModificacion: this.modelo.fechaModificacion,
        equipoModificacion: this.modelo.equipoModificacion,
      });
      this.cbCentroCosto = this.listadocentroCosto.filter(c => c.codigoDepartamento == this.modelo.codigoDepartamento);
    }
  }

  onBuscarArea(): void {
    try {
      if (this.StateEnum == TipoAccion.Read) {
        this.spinnerService.showGlobalSpinner();
        const codigo = this.Form.get("codigo")?.value;
        if (codigo != undefined && codigo != "") {

          this.areaService.consultaId(codigo).subscribe({
            next: (respuesta) => {
              this.spinnerService.hideGlobalSpinner();
              if (respuesta.isSuccess  && respuesta.result != null) {
                this.modelo = respuesta.result;
                const codigo = respuesta.result.codigo;
                this.router.navigate(['/' + this.entidad + '/ver', codigo]);
              }
              else {
                this.modelo = {};
                this.toastr.warning('No existe área con el código ingresado.');
                this.Form.reset();
                this.Form.get("codigo")?.patchValue(codigo);
                this.AreaCodigo.nativeElement.focus();
              }
            },
            error: () => {
              this.spinnerService.hideGlobalSpinner();
              this.router.navigate(['/' + this.entidad + '/ver'])
            }
          });
        } else {
          this.toastr.warning('Ingrese un código del tipo de archivo.');
          this.spinnerService.hideGlobalSpinner();
        }
      }
    }
    catch (error) {
      this.errores = parsearErrores(error);
      const mensajeError = this.errores.join(', ');
      this.toastr.error(mensajeError);
      this.spinnerService.hideGlobalSpinner();
    }
  }



  private initForm() {
    this.Form = new FormGroup({
      codigo: new FormControl({ value: null, disabled: false }, [Validators.required, Validators.maxLength(5)]),
      descripcion: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      codigoDepartamento: new FormControl(null),
      codigoCentroCosto: new FormControl(null),
      activo: new FormControl(true),
      usuarioCreacion: new FormControl(null),
      fechaCreacion: new FormControl(null),
      equipoCreacion: new FormControl(null),
      usuarioModificacion: new FormControl(null),
      fechaModificacion: new FormControl(null),
      equipoModificacion: new FormControl(null),
    });

  }

  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  async cancelar() {
    // this.router.navigate(['/usuario']);
    if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
      const result = await Swal.fire({
        title: 'Confirmación',
        text: '¿Desea cancelar la operación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar!',
        cancelButtonText: 'Cancelar'
      });
      if (result.isConfirmed) {
        try {
          this.cancelarFormulario();

        } catch (errores) {
          this.toastr.error(cadenaErrores(errores));
        } finally {
          this.spinnerService.hideGlobalSpinner();
        }
      }

    }
    else {
      this.cancelarFormulario();
    }
  }

  async guardarCambios() {
    if (this.loading) {
      return; // Si ya se está ejecutando, salir del método.
    }

    if (this.Form.valid) {
      this.loading = true; // Establece el estado de carga en true para evitar clics adicionales.
      const codigo = this.Form.get('codigo')?.value?.toUpperCase();
      const descripcion = this.Form.get('descripcion')?.value?.toUpperCase();
      const updateData = {
        codigo: codigo,
        descripcion: descripcion,
        usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
        fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
        usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
        fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
        accion: this.StateEnum
      };
      this.Form.patchValue(updateData);
      this.onSubmit.emit(this.Form.getRawValue());
    }
  }

  async onFocusInput(celda: string) {

    if (celda == "idSucursal") {
      if (this.Form.get("idSucursal").value == null) {
        this.toastr.warning(`Seleccione una sucursal.`, 'Información del Sistema');
      } else {
        this.AreaCodigo.nativeElement.focus();
      }
    }
    if (celda == "codigo") {
      if (this.Form.get("codigo").value == null) {
        this.toastr.warning(`Ingrese un código.`, 'Información del Sistema');
      } else {
        this.AreaDescripcion.focusIn();
      }
    }
    if (celda == "descripcion") {
      if (this.Form.get("descripcion").value == null) {
        this.toastr.warning(`Ingrese una descripción.`, 'Información del Sistema');
      } else {
        this.AreaCodigoDepartamento.focusIn();
      }
    }
    if (celda == "codigoDepartamento") {
      if (this.Form.get("codigoDepartamento").value == null) {
        this.toastr.warning(`Selecccione un departamento.`, 'Información del Sistema');
      } else {
        this.AreaCodigoCentroCosto.focusIn();
      }
    }

  }

  // Método para resetear el estado de carga (puede llamarse desde el padre cuando se complete la acción)
  resetLoading() {
    this.loading = false;
  }

  async onChangeCentroCosto(event: any) {
    try {
      if (event.element.id == "codigoCentroCosto") {
        const codigoCentroCosto = event.value;
        if (!codigoCentroCosto) {
          return
        }
        this.Form.get("codigoCentroCosto").patchValue(codigoCentroCosto);
      }
    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs, list: any[], property: string) => {
    let query = new Query();
    query = (e.text != "") ? query.where(property, "contains", e.text, true) : query;
    e.updateData(list, query);
  };


  public onFilteringDepartamento: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbDepartamentos, "cnoDepartamento");
  };
  public onFilteringCentroCosto: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFiltering(e, this.cbCentroCosto, "cnoCentroCosto");
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+G' - Grabar
    if (event.altKey && event.key.toLowerCase() === 'g') {
      this.guardarCambios();
      event.preventDefault(); // Previene la acción por defecto (opcional)
    }
  }

  nuevoRegistro(): void {
    this.router.navigate(['/' + this.entidad + '/nuevo']);
  }

  modificarRegistro(): void {

    try {
      const codigo = this.Form.get('codigo')?.value;
      if (codigo != undefined && codigo != "") {
        this.router.navigate(['/' + this.entidad + '/modificar', codigo]);
      } else {
        this.toastr.warning('No se encontraron datos para modificar');
      }
    } catch (error) {
      this.errores = parsearErrores(error);
      const mensajeError = this.errores.join(', ');
      this.toastr.error(mensajeError);
    }

  }

  cancelarFormulario() {
    try {

      this.spinnerService.showGlobalSpinner();
      if (this.StateEnum == TipoAccion.Update) {

        const codigo = this.modelo.codigo;
        this.router.navigate(['/' + this.entidad + '/ver', codigo]);
      }
      else {

        this.router.navigate(['' + this.entidad + '/ver']);
      }

    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

}



