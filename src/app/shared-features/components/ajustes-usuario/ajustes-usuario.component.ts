import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuariosService } from '../../../views/usuarios/usuarios.service'
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import {  ButtonModule,
          CardModule,
          FormModule,
          GridModule,
          ButtonGroupModule,
          BadgeModule,
          SpinnerModule} from '@coreui/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { SucursalService } from '../../../views/sucursal/sucursal.service';
import { ComboBoxComponent, ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { FormValidationService } from '@core/services/form-validation.service';
import { CommonModule } from '@angular/common';
import { Configuracion } from '../../enums/Configuracion';
import { SecurityService } from '@core/services/security.service';
import { ConfiguracionesService } from '@core/services/configuraciones.service';
import { SpinnerService } from '@core/services/spinner.service';
import { CacheKeys } from '../../enums/CacheKeys';

@Component({
  selector: 'app-ajustes-usuario',
  standalone: true,
  imports: [ButtonModule,
            CardModule,
            FormModule,
            GridModule,
            ButtonGroupModule,
            BadgeModule,
            SpinnerModule,
            ReactiveFormsModule,
            ComboBoxModule,
            CommonModule
          ],
  templateUrl: './ajustes-usuario.component.html',
  styleUrl: './ajustes-usuario.component.scss'
})
export class AjustesUsuarioComponent {

  
  @ViewChild('lblEstadoNotificaCorreo') lblEstadoNotificaCorreo!: ElementRef<HTMLLabelElement>;
  @ViewChild('lblSolicitaConfirmacion') lblSolicitaConfirmacion!: ElementRef<HTMLLabelElement>;

  



  @ViewChild('sucursal', { static: false }) sucursal!: ComboBoxComponent;

  allowCustom: boolean = true;
  Form: FormGroup;
  public loading = false;
  public imageModel: any;
  public selectedFile: any = null;

  public localFieldsSucursal: Object = { text: 'cnoSucursalNotificacion', value: 'idSucursal' };
  cbsucursal: any[] = [];

  @Input() errores: string[] = [];
  

  constructor(private  activeModal : NgbActiveModal,
              private  userService : UsuariosService,
              private  toastr : ToastrService,
              private  formBuilder : FormBuilder,
              private  sucursalService :SucursalService,
              private  validationService : FormValidationService,
              private  securityService : SecurityService,
              private  configuracionesService : ConfiguracionesService,
              private  spinnerService : SpinnerService) {
    this.Form = this.initForm();
  }

  async ngOnInit() {

    this.Form.get('notificaCorreo')?.valueChanges.subscribe({
      next: (value) => {
        this.updateLabelNotificaCorreo(value);
      },
      error: (error) => {
        this.handleError(error);
      }
    });

    this.Form.get('solicitaConfirmacion')?.valueChanges.subscribe({
      next: (value) => {
        this.updateLabelSolicitaConfirmacion(value);
      },
      error: (error) => {
        this.handleError(error);
      }
    });


    this.initializeComponent();
  }

  private handleError(error: any) {
    this.spinnerService.hideGlobalSpinner();
    this.toastr.error(cadenaErrores(error));
  }

  updateLabelNotificaCorreo(value: boolean) {
    if (this.lblEstadoNotificaCorreo && this.lblEstadoNotificaCorreo.nativeElement) {
      this.lblEstadoNotificaCorreo.nativeElement.textContent = value ? 'Sí' : 'No';
    }

  
  }

  updateLabelSolicitaConfirmacion(value: boolean) {
    if (this.lblSolicitaConfirmacion && this.lblSolicitaConfirmacion.nativeElement) {
      this.lblSolicitaConfirmacion.nativeElement.textContent = value ? 'Sí' : 'No';
    }
  }
  
private initForm(): FormGroup {
  return this.formBuilder.group({
    idConfiguracionSucursal: [0],
    sucursal: [''],
    idConfiguracionNotificaCorreo: [0],
    notificaCorreo: [],

    idConfiguracionSolicitaConfirmacion: [0],
    solicitaConfirmacion: [],
  });
}

async loadPrimaryInitialData() {
  try {

    const results = await firstValueFrom(forkJoin({
      sucursalUsuarioResponse: this.sucursalService.sucursalesUsuario().pipe(catchError(error => of({ result: [] }))),
      sucursalDefectoResponse: this.sucursalService.sucursalPorDefecto().pipe(catchError(error => of({ result: [] }))),
      notificarCorreoResponse: this.configuracionesService.getNotificarCorreo().pipe(catchError(error => of({ result: [] }))),
      solicitaConfirmacionResponse: this.configuracionesService.confirmacionPreviaAprobar().pipe(catchError(error => of({ result: [] }))),
    }));

    this.cbsucursal = results.sucursalUsuarioResponse.result;

    if (results.sucursalDefectoResponse.isSuccess && results.sucursalDefectoResponse.result.idSucursal) {
      const sucursalExistente = this.cbsucursal.find(prod => prod.idSucursal === results.sucursalDefectoResponse.result.idSucursal);
        if (sucursalExistente) {
          this.Form.get("idConfiguracionSucursal")?.patchValue(results.sucursalDefectoResponse.result.idConfiguracionPersonalizada);
          this.Form.get("sucursal")?.patchValue(sucursalExistente.idSucursal);
        }
    };



    if (results.notificarCorreoResponse.isSuccess && results.notificarCorreoResponse.result.valor) {
      const notificaCorreo: boolean = results.notificarCorreoResponse.result.valor === "true"? true:false;
      this.Form.get("notificaCorreo")?.patchValue(notificaCorreo);
    }

    if (results.solicitaConfirmacionResponse.isSuccess && results.solicitaConfirmacionResponse.result.valor) {
      const solicitaConfirmacion: boolean = results.solicitaConfirmacionResponse.result.valor === "true"? true:false;
      this.Form.get("solicitaConfirmacion")?.patchValue(solicitaConfirmacion);
    }

    
  } catch (error) {
    this.toastr.error(cadenaErrores(error));
  }
};



  private async initializeComponent() {
    try {

      this.spinnerService.showGlobalSpinner();
      await this.loadPrimaryInitialData();
      this.sucursal.focusIn();
      this.allowCustom = false;

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
    finally
    {
      this.spinnerService.hideGlobalSpinner();
    }

  }

  async getSucursalesUsuario() {
    try {
      const response: any = await firstValueFrom(this.sucursalService.sucursalesUsuario());
      this.cbsucursal = response.result;
    }
    catch (error) {
      this.toastr.error('Error al obtener sucursales: ', cadenaErrores(error));
    }
  }

  public onFilteringSucursal: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoSucursal", "contains", e.text, true) : query;
    e.updateData(this.cbsucursal, query);
  };

  grabar() {
    if (this.Form.valid) {
   
      this.guardarConfiguracion();
    } 
  }

  async guardarConfiguracion() {
    this.loading = true;
  
    try {
      // Obtener idSucursal e idConfiguracionPersonalizada
      const idSucursal = this.Form.get("sucursal")?.value;
      const idConfiguracionPersonalizadaSucursal = await this.obtenerIdConfiguracionSucursal();
  
      // Crear configuración de sucursal por defecto
      const configuracionSucursalDefecto = this.configuracionesService.crearConfiguracion({
        idConfiguracionPersonalizada: idConfiguracionPersonalizadaSucursal,
        codigoConfiguracion: Configuracion.SUCURSAL,
        idSucursal: idSucursal
      });
  
      // Guardar configuración de sucursal por defecto
      await this.configuracionesService.guardarYLimpiarCache(
        configuracionSucursalDefecto,
        () => this.sucursalService.clearCacheSucursalPorDefecto(),
        'Error al actualizar la sucursal por defecto.'
      );
  
      // Obtener y crear configuración de notificación de correo
      const idConfiguracionNotificaCorreo = await this.obtenerIdConfiguracionCorreo();
      const notificaCorreo = this.Form.get("notificaCorreo")?.value == true? true:false;

      const configuracionNotificaCorreo = this.configuracionesService.crearConfiguracion({
        idConfiguracionPersonalizada: idConfiguracionNotificaCorreo,
        codigoConfiguracion: Configuracion.NOTIFICAR_CORREO,
        valor: notificaCorreo.toString(),
        idSucursal: null
      });

    
      // Guardar configuración de notificación de correo
      await this.configuracionesService.guardarYLimpiarCache(
        configuracionNotificaCorreo,
        () => this.configuracionesService.clearCacheConfiguracion(CacheKeys.notificarCorreo),
        'Error al actualizar la notificación de correo.'
      );

      // Obtener y crear configuración de solicitar confirmacion
      const idConfiguracionSolicitaConfirmacion = await this.obtenerIdSolicitaConfirmacion();
      const solicitaConfirmacion = this.Form.get("solicitaConfirmacion")?.value == true? true:false;

      const configuracioSolicitaConfirmacion = this.configuracionesService.crearConfiguracion({
        idConfiguracionPersonalizada: idConfiguracionSolicitaConfirmacion,
        codigoConfiguracion: Configuracion.CONFIR_PREVIA,
        valor: solicitaConfirmacion.toString(),
        idSucursal: null
      });


        // Guardar configuración de notificación de correo
        await this.configuracionesService.guardarYLimpiarCache(
          configuracioSolicitaConfirmacion,
          () => this.configuracionesService.clearCacheConfiguracion(CacheKeys.confirmacionPrevia),
          'Error al actualizar la notificación de correo.'
        );
  
      this.activeModal.close();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.loading = false;
    }
  }
  
  // Función auxiliar para obtener idConfiguracionPersonalizada de sucursal
  private async obtenerIdConfiguracionSucursal(): Promise<number> {
    const response = await firstValueFrom(this.sucursalService.sucursalPorDefecto());
    return response.isSuccess && response.result.idConfiguracionPersonalizada
      ? response.result.idConfiguracionPersonalizada
      : null;
  }
  
  // Función auxiliar para obtener idConfiguracionPersonalizada de correo
  private async obtenerIdConfiguracionCorreo(): Promise<number> {
    const response = await firstValueFrom(this.configuracionesService.getNotificarCorreo());
    return response.isSuccess && response.result.idConfiguracionPersonalizada
      ? response.result.idConfiguracionPersonalizada
      : 0;
  }
  
  private async obtenerIdSolicitaConfirmacion(): Promise<number> {
    const response = await firstValueFrom(this.configuracionesService.confirmacionPreviaAprobar());
    return response.isSuccess && response.result.idConfiguracionPersonalizada
      ? response.result.idConfiguracionPersonalizada
      : 0;
  }
  





  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }
  
cerrar()
{
  this.activeModal.close(); // O usar .close() según corresponda
}


}
