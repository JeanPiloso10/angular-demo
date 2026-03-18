import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonGroupModule, ButtonModule, CardModule, FormModule, GridModule as GridCoreUI, ListGroupDirective, ListGroupItemDirective, SpinnerModule } from '@coreui/angular';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ComboBoxModule, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { SpinnerService } from '@app/core/services/spinner.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { UsuariosService } from '@app/views/usuarios/usuarios.service';
import { TourService } from '@app/core/services/tour.service';
import { DriveStep } from 'driver.js';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';

export interface FirmanteItem {
  id: string;
  nombre: string;
  esAdicional: boolean;
  detalleOriginal?: any;
  usuarioFirmanteAlterno?: string | null;
  idRolFirmanteAlterno?: string | null;
  descripcionFirmanteAlterno?: string | null;
  idsUsuariosRolAlterno?: string[] | null;
  userNamesRolAlterno?: string[] | null;
  sustituido?: boolean;
  nombreOriginal?: string | null;
}

@Component({
  selector: 'app-solicitud-firma',
  standalone: true,
  imports: [ButtonModule,
    CardModule,
    FormModule,
    GridCoreUI,
    CommonModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SpinnerModule,
    ComboBoxModule,
    IconModule,
    ListGroupDirective,
    ListGroupItemDirective
  ],
  providers: [{
            provide: IconSetService,
            useFactory: () => {
              const iconSet = new IconSetService();
              iconSet.icons = {
                ...iconSubset
              };
              return iconSet;
            }
          }],
  templateUrl: './solicitud-firma.component.html',
  styleUrl: './solicitud-firma.component.scss'
})
export class SolicitudFirmaComponent implements OnInit {

  @Input() modelo: any;  // Contendrá `SolicitudFirmaCabDto`
  @Input() titulo: string;
  @Input() permiteEditarVerificador: boolean = false;
  @Input() permiteEditarAprobador: boolean = false;
  @Output() submitEvent = new EventEmitter<any>();



  @ViewChild('observacion') observacion!: ElementRef;

  form: FormGroup;
  loading = false;

  listaVerificadores: FirmanteItem[] = [];
  listaAprobadores: FirmanteItem[] = [];
  public cbUsuarios: any[] = [];
  fieldsUsuario = { text: 'userName', value: 'id' };
  isLoading = false;
  searchUsuarioTextChanged = new Subject<string>();
  private usuariosIndex = new Map<string, any>();

  constructor(
    private formBuilder: FormBuilder,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private activeModal: NgbActiveModal,
    private usuarioService: UsuariosService,
    private toastr: ToastrService,
    private tourService: TourService
  ) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  debounceUsuario() {
      this.searchUsuarioTextChanged.pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((query: any) => {
          if (query.length >= 3) {
            this.isLoading = true; // Indica que una petición está en curso
            return this.usuarioService.GetUserFilter(query).pipe(
              catchError((error: any) => {
                this.toastr.error(cadenaErrores(error));
                return of(null);
              }),
              finalize(() => this.isLoading = false)
            );
          } 
          return of(null);
        })
      ).subscribe((response: any) => {
        if (response) {
          if (response.isSuccess) {
            this.cbUsuarios = response.result;
            try {
              (response.result || []).forEach((u: any) => {
                if (u && u.id) this.usuariosIndex.set(u.id, u);
              });
            } catch (error) {
              this.handleError(error);
            }
          } else {
            this.toastr.error(response.message || 'Error al cargar los usuarios.');
          }
        }
      });
  }

  debouncedGetUsuario(event: FilteringEventArgs) {
    const query: string = event.text;
    if (query.length >= 3 && !this.isLoading) { // Solo emitir si no hay una petición en curso
      this.searchUsuarioTextChanged.next(query);
    }
  }

  private async initializeComponent() {
    try {
      this.debounceUsuario();
      await this.loadPrimaryInitialData();

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.observacion.nativeElement.focus();
    }, 100);

  }

  async loadPrimaryInitialData() {
    try {
      if (this.modelo && this.modelo.solicitudFirmaDetDto) {
        this.spinnerService.showGlobalSpinner();

        this.listaVerificadores = [];
        this.listaAprobadores = [];
        const verificadoresSet = new Set<string>();
        const aprobadoresSet = new Set<string>();

        this.modelo.solicitudFirmaDetDto.forEach((detalle: any) => {
          const identificador = detalle.usuarioFirmanteDesignado ?? detalle.idRolFirmanteDesignado;
          const nombre = detalle.descripcionFirmante ?? identificador;

          if (detalle.codigoTipoAprobador === 'V') {
            if (!verificadoresSet.has(identificador)) {
              verificadoresSet.add(identificador);
              this.listaVerificadores.push({
                id: identificador, nombre, esAdicional: !!detalle.esAdicional, detalleOriginal: detalle,
                usuarioFirmanteAlterno: detalle.usuarioFirmanteAlterno,
                idRolFirmanteAlterno: detalle.idRolFirmanteAlterno,
                descripcionFirmanteAlterno: detalle.descripcionFirmanteAlterno,
                idsUsuariosRolAlterno: detalle.idsUsuariosRolAlterno,
                userNamesRolAlterno: detalle.userNamesRolAlterno,
              });
            }
          } else {
            // Si el mismo rol/usuario ya está como verificador, no agregarlo como aprobador
            if (!aprobadoresSet.has(identificador) && !verificadoresSet.has(identificador)) {
              aprobadoresSet.add(identificador);
              this.listaAprobadores.push({
                id: identificador, nombre, esAdicional: !!detalle.esAdicional, detalleOriginal: detalle,
                usuarioFirmanteAlterno: detalle.usuarioFirmanteAlterno,
                idRolFirmanteAlterno: detalle.idRolFirmanteAlterno,
                descripcionFirmanteAlterno: detalle.descripcionFirmanteAlterno,
                idsUsuariosRolAlterno: detalle.idsUsuariosRolAlterno,
                userNamesRolAlterno: detalle.userNamesRolAlterno,
              });
            }
          }
        });

        this.spinnerService.hideGlobalSpinner();
      }
    } catch (error) {
      this.handleError(error);
    }
  }


  agregarVerificador() {
    const rawVal = this.form.get('buscarVerificador')?.value;
    const userId: string | null = Array.isArray(rawVal) ? (rawVal[0] ?? null) : (rawVal ?? null);

    if (!userId) {
      this.toastr.warning('Seleccione un usuario para agregar como verificador.');
      return;
    }

    const u = this.usuariosIndex.get(userId) || (this.cbUsuarios ?? []).find((x: any) => x.id === userId);
    const userName = u?.userName ?? userId;

    if (this.listaVerificadores.some(v => v.id === userName || v.id === userId)) {
      this.toastr.warning('Este usuario ya está como verificador.');
      return;
    }
    if (this.listaAprobadores.some(a => a.id === userName || a.id === userId)) {
      this.toastr.warning('Este usuario ya está como aprobador. No puede ser verificador y aprobador a la vez.');
      return;
    }

    const allUsers = this.getAllExpandedUserIds();
    if (allUsers.has(userId) || allUsers.has(userName)) {
      this.toastr.warning('Este usuario ya participa como firmante (directo o vía rol).');
      return;
    }

    this.listaVerificadores.push({ id: userName, nombre: userName, esAdicional: true });
    this.form.get('buscarVerificador')?.reset();
  }

  agregarAprobador() {
    const rawVal = this.form.get('buscarAprobador')?.value;
    const userId: string | null = Array.isArray(rawVal) ? (rawVal[0] ?? null) : (rawVal ?? null);

    if (!userId) {
      this.toastr.warning('Seleccione un usuario para agregar como aprobador.');
      return;
    }

    const u = this.usuariosIndex.get(userId) || (this.cbUsuarios ?? []).find((x: any) => x.id === userId);
    const userName = u?.userName ?? userId;

    if (this.listaAprobadores.some(a => a.id === userName || a.id === userId)) {
      this.toastr.warning('Este usuario ya está como aprobador.');
      return;
    }
    if (this.listaVerificadores.some(v => v.id === userName || v.id === userId)) {
      this.toastr.warning('Este usuario ya está como verificador. No puede ser verificador y aprobador a la vez.');
      return;
    }

    const allUsers = this.getAllExpandedUserIds();
    if (allUsers.has(userId) || allUsers.has(userName)) {
      this.toastr.warning('Este usuario ya participa como firmante (directo o vía rol).');
      return;
    }

    this.listaAprobadores.push({ id: userName, nombre: userName, esAdicional: true });
    this.form.get('buscarAprobador')?.reset();
  }

  eliminarVerificador(item: FirmanteItem) {
    this.listaVerificadores = this.listaVerificadores.filter(v => v !== item);
  }

  eliminarAprobador(item: FirmanteItem) {
    this.listaAprobadores = this.listaAprobadores.filter(a => a !== item);
  }

  delegarFirmante(item: FirmanteItem) {
    if (!item.descripcionFirmanteAlterno) return;
    if (!item.usuarioFirmanteAlterno && !item.idRolFirmanteAlterno) return;
    if (item.sustituido) {
      // Revertir
      item.id = item.detalleOriginal?.usuarioFirmanteDesignado ?? item.detalleOriginal?.idRolFirmanteDesignado ?? item.id;
      item.nombre = item.nombreOriginal ?? item.nombre;
      item.sustituido = false;
      item.nombreOriginal = null;
    } else {
      // Delegar
      item.nombreOriginal = item.nombre;
      item.nombre = item.descripcionFirmanteAlterno;
      item.id = item.usuarioFirmanteAlterno ?? item.idRolFirmanteAlterno!;
      item.sustituido = true;
    }
  }

  puedeEliminarVerificador(item: FirmanteItem): boolean {
    return item.esAdicional || this.permiteEditarVerificador;
  }

  puedeEliminarAprobador(item: FirmanteItem): boolean {
    return item.esAdicional || this.permiteEditarAprobador;
  }

  private getAllExpandedUserIds(): Set<string> {
    const users = new Set<string>();
    [...this.listaVerificadores, ...this.listaAprobadores].forEach(item => {
      // No incluir IDs de firmantes delegados en la validación de duplicados,
      // permitiendo que un mismo alterno supla múltiples firmas
      if (!item.sustituido) {
        users.add(item.id);
      }
      if (item.detalleOriginal) {
        if (item.detalleOriginal.usuarioFirmanteDesignado) {
          users.add(item.detalleOriginal.usuarioFirmanteDesignado);
        }
        if (Array.isArray(item.detalleOriginal.idsUsuariosRol)) {
          item.detalleOriginal.idsUsuariosRol.forEach((u: string) => users.add(u));
        }
        if (Array.isArray(item.detalleOriginal.userNamesRol)) {
          item.detalleOriginal.userNamesRol.forEach((u: string) => users.add(u));
        }
      }
    });
    return users;
  }

  guardarCambios() {
    try {
      if (this.listaAprobadores.length === 0) {
        this.toastr.warning('La solicitud debe tener al menos un aprobador.');
        return;
      }

      // Validar que no haya usuarios cruzados entre verificadores y aprobadores
      // (excepto delegaciones: un mismo alterno puede suplir ambos niveles)
      const verifUsers = new Set<string>();
      const aprobUsers = new Set<string>();

      this.listaVerificadores.forEach(item => {
        if (!item.sustituido) {
          verifUsers.add(item.id);
          if (item.detalleOriginal?.usuarioFirmanteDesignado) verifUsers.add(item.detalleOriginal.usuarioFirmanteDesignado);
          if (Array.isArray(item.detalleOriginal?.idsUsuariosRol)) item.detalleOriginal.idsUsuariosRol.forEach((u: string) => verifUsers.add(u));
          if (Array.isArray(item.detalleOriginal?.userNamesRol)) item.detalleOriginal.userNamesRol.forEach((u: string) => verifUsers.add(u));
        }
      });

      this.listaAprobadores.forEach(item => {
        if (!item.sustituido) {
          aprobUsers.add(item.id);
          if (item.detalleOriginal?.usuarioFirmanteDesignado) aprobUsers.add(item.detalleOriginal.usuarioFirmanteDesignado);
          if (Array.isArray(item.detalleOriginal?.idsUsuariosRol)) item.detalleOriginal.idsUsuariosRol.forEach((u: string) => aprobUsers.add(u));
          if (Array.isArray(item.detalleOriginal?.userNamesRol)) item.detalleOriginal.userNamesRol.forEach((u: string) => aprobUsers.add(u));
        }
      });

      const interUsersVA = [...verifUsers].filter(u => aprobUsers.has(u));
      if (interUsersVA.length > 0) {
        this.toastr.warning('Un usuario no puede ser Verificador y Aprobador a la vez.');
        return;
      }

      // Construir payload
      const firmantesOriginales: any[] = [];
      const firmantesAdicionales: any[] = [];

      this.listaVerificadores.forEach(item => {
        if (item.esAdicional) {
          firmantesAdicionales.push({
            codigoTipoAprobador: 'V',
            estado: 'S',
            firmado: false,
            usuarioFirmanteDesignado: item.id,
            ordenFirma: 0
          });
        } else if (item.detalleOriginal) {
          const detalle = { ...item.detalleOriginal };
          if (item.sustituido) {
            detalle.usuarioFirmanteOriginal = detalle.usuarioFirmanteDesignado ?? detalle.idRolFirmanteDesignado;
            detalle.esSustitucion = true;
            if (item.usuarioFirmanteAlterno) {
              detalle.usuarioFirmanteDesignado = item.usuarioFirmanteAlterno;
              detalle.idRolFirmanteDesignado = null;
            } else if (item.idRolFirmanteAlterno) {
              detalle.idRolFirmanteDesignado = item.idRolFirmanteAlterno;
              detalle.usuarioFirmanteDesignado = null;
            }
          }
          firmantesOriginales.push(detalle);
        }
      });

      this.listaAprobadores.forEach(item => {
        if (item.esAdicional) {
          firmantesAdicionales.push({
            codigoTipoAprobador: 'A',
            estado: 'S',
            firmado: false,
            usuarioFirmanteDesignado: item.id,
            ordenFirma: 0
          });
        } else if (item.detalleOriginal) {
          const detalle = { ...item.detalleOriginal };
          if (item.sustituido) {
            detalle.usuarioFirmanteOriginal = detalle.usuarioFirmanteDesignado ?? detalle.idRolFirmanteDesignado;
            detalle.esSustitucion = true;
            if (item.usuarioFirmanteAlterno) {
              detalle.usuarioFirmanteDesignado = item.usuarioFirmanteAlterno;
              detalle.idRolFirmanteDesignado = null;
            } else if (item.idRolFirmanteAlterno) {
              detalle.idRolFirmanteDesignado = item.idRolFirmanteAlterno;
              detalle.usuarioFirmanteDesignado = null;
            }
          }
          firmantesOriginales.push(detalle);
        }
      });

      const solicitudFirma: any = {
        ...this.modelo,
        observacionSolicitud: this.form.get('observacion').value,
        solicitudFirmaDetDto: [...firmantesAdicionales, ...firmantesOriginales]
      };

      this.submitEvent.emit(solicitudFirma);
      this.loading = false;
      this.activeModal.close();
    } catch (error) {
      this.handleError(error);
    }
  }
  

  cerrar() {
    // Finaliza cualquier tour activo al cerrar
    this.tourService.destroy();
    this.activeModal.close();
  }

  getInvalidControls() {
    Object.values(this.form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      observacion: ['', []],
      buscarVerificador: [null],
      buscarAprobador: [null]
    });
  }

  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }

  private handleError(error: any) {
    this.toastr.error(cadenaErrores(error));
    this.spinnerService.hideGlobalSpinner();
  }

  // Inicia el tour guiado del componente Solicitud de Firma
  startTour(): void {
    const verifBase = this.permiteEditarVerificador
      ? 'Seleccione los verificadores que deberán revisar el documento. Puede elegir múltiples elementos, filtrar y seleccionar todo.'
      : 'Estos son los verificadores de la transacción en base a la configuración de firmas. No es editable en este contexto.';

    const aprobBase = this.permiteEditarAprobador
      ? 'Seleccione los aprobadores responsables de aprobar el documento. Debe haber al menos un aprobador.'
      : 'Estos son los aprobadores de la transacción en base a la configuración de firmas. No es editable en este contexto.';

    const noteVerif = 'Nota: Los verificadores firman primero. Solo después de que todos ellos hayan firmado, se habilita la firma de los aprobadores.';
    const noteAprob = 'Nota: Los aprobadores firman después de que todos los verificadores hayan firmado.';

    const verifDesc = `${verifBase} ${noteVerif}`;
    const aprobDesc = `${aprobBase} ${noteAprob}`;

    const steps: DriveStep[] = [
      {
        element: '.modal-title',
        popover: {
          title: 'Solicitar Aprobación',
          description: 'Complete los campos para definir verificadores, aprobadores y una observación opcional.',
          side: 'bottom'
        }
      },
      // Subtítulo (solo si existe texto)
      ...(((this.titulo ?? '').toString().trim().length > 0)
        ? this.tourService.stepIfExists(
            '.modal-header small.text-muted',
            'Contexto',
            'Este subtítulo proporciona contexto adicional sobre la solicitud que está creando.',
            'bottom'
          )
        : []),
      {
        element: '#seccionVerificadores',
        popover: {
          title: 'Verificadores',
          description: verifDesc,
          side: 'top'
        }
      },
      {
        element: '#agregarVerificador',
        popover: {
          title: 'Agregar verificador',
          description: 'Busque un usuario por nombre y presione "Agregar" para incluirlo como verificador. Puede agregar múltiples verificadores. No se permiten duplicados.',
          side: 'top'
        }
      },
      {
        element: '#seccionAprobadores',
        popover: {
          title: 'Aprobadores',
          description: aprobDesc,
          side: 'top'
        }
      },
      {
        element: '#agregarAprobador',
        popover: {
          title: 'Agregar aprobador',
          description: 'Busque un usuario por nombre y presione "Agregar" para incluirlo como aprobador. Puede agregar múltiples aprobadores. No se permiten duplicados.',
          side: 'top'
        }
      },
      {
        element: '#observacion',
        popover: {
          title: 'Observación',
          description: 'Ingrese una observación o comentario que acompañe a la solicitud (opcional).',
          side: 'top'
        }
      },
      ...this.tourService.stepIfExists(
        '.modal-footer .btn.btn-primary',
        'Enviar Solicitud',
        'Presione “Solicitar Aprobación” para enviar la solicitud con los firmantes seleccionados.',
        'top'
      ),
      ...this.tourService.stepIfExists(
        '.modal-footer .btn.btn-secondary',
        'Cancelar',
        'Cancele y cierre la ventana sin guardar cambios.',
        'top'
      )
    ];

    this.tourService.startTour(steps, {
      showProgress: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      onDestroyStarted: () => this.tourService.destroy()
    });
  }

}
