import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonGroupModule, ButtonModule, CardModule, FormModule, GridModule as GridCoreUI, SpinnerModule } from '@coreui/angular';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { MotivoAuditoriaService } from '../../../views/motivo-auditoria/motivo-auditoria.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { MultiSelectComponent, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { TourService } from '@app/core/services/tour.service';
import { DriveStep } from 'driver.js';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';

@Component({
  selector: 'app-auditoria-transaccion',
  standalone: true,
  imports: [ButtonModule,
    CardModule,
    FormModule,
    GridCoreUI,
    CommonModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SpinnerModule,
    MultiSelectModule,
    IconModule
  ],
  providers: [
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = {
          ...iconSubset
        };
        return iconSet;
      }
    }
  ],
  templateUrl: './auditoria-transaccion.component.html',
  styleUrl: './auditoria-transaccion.component.scss'
})
export class AuditoriaTransaccionComponent implements OnInit {
 
  @Input() modelo: any;
  @Input() titulo?: string;
  @Input() subtitulo?: string;

  @Output() submitEvent = new EventEmitter<any>();

  @ViewChild('motivoAuditoria', { static: false }) motivoAuditoria: MultiSelectComponent;
  @ViewChild('observacion') observacion!: ElementRef;

  Form: FormGroup;
  loading = false;
  listadoMotivo: any[] = [];
  public localFieldsMotivo: Object = { text: 'descripcionMotivo', value: 'idMotivoAuditoria' };
  public box: string = 'Box';

  
  constructor(private formBuilder: FormBuilder, 
    private validationService: FormValidationService,
    private motivoAuditoriaService: MotivoAuditoriaService,
    private activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private tourService: TourService)
  {
    this.Form = this.initForm();
  }
  ngOnInit(): void {
    this.loadPrimaryInitialData();
  }

  async loadPrimaryInitialData() {
    try {
      const results = await firstValueFrom(forkJoin({
        AuditoriaResponse: this.motivoAuditoriaService.getMotivoAuditoria(this.modelo.codigoTransaccion).pipe(catchError(error => of({ result: [] }))),
      }));
      this.listadoMotivo = results.AuditoriaResponse.result;

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  };

  ngAfterViewInit() {
      setTimeout(() => {
        this.motivoAuditoria.focusIn();
      }, 100);
  }


  private initForm(): FormGroup {
    return this.formBuilder.group({
      observacion: ['', [Validators.required, Validators.maxLength(200)]],
      idMotivoAuditoria: ['']
    });
  }

  guardarCambios() {
    if (this.modelo) {
      const idMotivoAuditoriaArray = this.Form.get("idMotivoAuditoria")?.value;
      let idMotivoAuditoriaString;
      if (idMotivoAuditoriaArray != undefined && idMotivoAuditoriaArray != "") {
        idMotivoAuditoriaString = idMotivoAuditoriaArray.join(',');
      }
      const motivoAuditoria = idMotivoAuditoriaString ? idMotivoAuditoriaString : undefined;    
      this.modelo.observacion = this.Form.get('observacion')?.value;
      this.modelo.motivoAuditoria= motivoAuditoria
      this.submitEvent.emit(this.modelo);
      this.loading = false;
      this.activeModal.close();
    }

  }
  cerrar() {
    // Detenemos cualquier tour activo antes de cerrar el modal
    this.tourService.destroy();
    this.activeModal.close(); // O usar .close() según corresponda
  }
  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  // Inicia el tour guiado del componente Auditoría Transacción
  startTour(): void {
    // Preferimos la referencia del ViewChild para evitar capturar
    // un elemento con el mismo id en el fondo; si aún no estuviera
    // disponible por timing, usamos un selector como respaldo.
    const obsElement: HTMLElement | string = this.observacion?.nativeElement ?? '#observacion';

    const steps: DriveStep[] = [
      {
        element: '.modal-title',
        popover: {
          title: 'Auditoría de transacción',
          description: 'En este formulario puede registrar el motivo y la observación de auditoría para la transacción.',
          side: 'bottom'
        }
      },
      {
        element: '#idMotivoAuditoria',
        popover: {
          title: 'Motivo',
          description: 'Seleccione uno o varios motivos de auditoría. Puede escribir para filtrar la lista.',
          side: 'bottom'
        }
      },
      {
        // Referencia directa (o fallback por selector) al campo Observación dentro del modal
        element: obsElement,
        popover: {
          title: 'Observación',
          description: 'Describa la observación o detalle de la auditoría. Este campo es obligatorio.',
          side: 'top'
        }
      },
      {
        element: '.btn-guardar',
        popover: {
          title: 'Guardar',
          description: 'Guarde los cambios para enviar la información de auditoría.',
          side: 'top'
        }
      },
      {
        element: '.btn-cerrar',
        popover: {
          title: 'Cerrar',
          description: 'Cierre el formulario sin guardar cambios.',
          side: 'top'
        }
      }
    ];

    this.tourService.startTour(steps, {
      showProgress: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      onDestroyStarted: () => this.tourService.destroy()
    });
  }
}
