import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule, ButtonModule, ButtonGroupModule, ButtonCloseDirective, FormModule, SpinnerModule } from '@coreui/angular';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComboBoxComponent, ComboBoxModule, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '@app/views/usuarios/usuarios.service';
import { SecurityService } from '@core/services/security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import Swal from 'sweetalert2';
import { FirmaTransaccionService } from '@core/services/firma-transaccion.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, of, Subject, switchMap, take } from 'rxjs';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';

export interface SolicitudFirmaDetDto {
  idSolicitudFirmaDet?: number | null;
  idSolicitudFirmaCab?: number | null;
  idRolFirmanteDesignado?: string | null;
  usuarioFirmanteDesignado?: string | null;
  usuarioFirmanteReal?: string | null;
  codigoTipoAprobador?: string | null;
  ordenFirma?: number | null;
  firmado?: boolean | null;
  estado?: string | null;
  fechaFirma?: string | null;
  equipoFirma?: string | null;
  observacionFirma?: string | null;
  descripcionFirmante?: string | null;
  idsUsuariosRol?: string[] | null;
  userNamesRol?: string[] | null;
  solicitudFirmaCabDto?: any | null;
  esAdicional?: boolean | null;
  usuarioAgrega?: string | null;
  fechaAgrega?: string | null;
  observacionAgrega?: string | null;
  usuarioFirmanteOriginal?: string | null;
  idRolFirmanteOriginal?: string | null;
  descripcionFirmanteOriginal?: string | null;
  esSustitucion?: boolean | null;
  usuarioAsigna?: string | null;
  descripcionUsuarioAsigna?: string | null;
  fechaAsigna?: string | null;
  usuarioFirmanteAlterno?: string | null;
  idRolFirmanteAlterno?: string | null;
  descripcionFirmanteAlterno?: string | null;
  idsUsuariosRolAlterno?: string[] | null;
  userNamesRolAlterno?: string[] | null;
}

// Permite a cada transacción ejecutar acciones específicas sin duplicar lógica en los callers
export interface FirmantesHandler {
  // Persiste un firmante adicional y devuelve observable/promesa. El modal gestionará UI y cierre.
  onAddPersist?(detalle: SolicitudFirmaDetDto, cabecera: any, contexto?: any): any;
  // Señal posterior a eliminación exitosa
  onDelete?(detalle: any, cabecera: any, contexto?: any): void | Promise<any>;
  // Ejecuta la delegación (persistir + notificar). Si no está definido, el modal usa el servicio genérico como fallback.
  onSubstitute?(detalleActualizado: any, cabecera: any, contexto?: any): any;
  // Ejecuta la reversión de delegación (persistir + notificar). Si no está definido, el modal usa el servicio genérico como fallback.
  onRevertSubstitute?(detalleActualizado: any, cabecera: any, contexto?: any): any;
}

@Component({
  selector: 'app-firmantes-modal',
  standalone: true,
  templateUrl: './firmantes-modal.component.html',
  styleUrls: ['./firmantes-modal.component.scss'],
  imports: [CommonModule, CardModule, ButtonModule, ButtonGroupModule, ButtonCloseDirective, DatePipe, ReactiveFormsModule, ComboBoxModule, FormModule, SpinnerModule, IconModule],
  providers: [{
          provide: IconSetService,
          useFactory: () => {
            const iconSet = new IconSetService();
            iconSet.icons = {
              ...iconSubset
            };
            return iconSet;
          }
        }]
})
export class FirmantesModalComponent {
  @Input() titulo: string = 'Firmantes';
  @Input() subtitulo?: string;
  // Espera un objeto con la forma de SolicitudFirmaCabDto o al menos un array solicitudFirmaDetDto
  @Input() solicitudFirmaCab: any;
  // Modo selección habilita un ComboBox para elegir un usuario firmante y devolver un detalle.
  @Input() modoSeleccion: boolean = false;
  // Contexto adicional de la transacción (p.ej., idOrdenCompra)
  @Input() contexto?: any;
  // Handler opcional para disparar acciones por transacción sin acoplar el componente
  @Input() handler?: FirmantesHandler | null;
  @ViewChild('firmanteAdicional') firmanteAdicional!: ComboBoxComponent;

  form: FormGroup<{ firmante: FormControl<string | null> }>;
  cbUsuarios: any[] = [];
  fieldsUsuario = { text: 'userName', value: 'id' };
  isLoading = false;
  private usuariosIndex = new Map<string, any>();
  private searchUsuarioTextChanged = new Subject<string>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private toastr: ToastrService,
    private securityService: SecurityService,
    private firmaTransaccionService: FirmaTransaccionService
  ) {
    this.form = this.fb.nonNullable.group({
      firmante: new FormControl<string | null>(null, [])
    });
   
    this.debounceUsuario();
  }


  get detalles(): any[] {
    return this.solicitudFirmaCab?.solicitudFirmaDetDto ?? [];
  }

  // Ordena por ordenFirma y normaliza el flag firmado (puede venir nullable)
  get detallesOrdenados(): any[] {
    const list = Array.isArray(this.detalles) ? [...this.detalles] : [];
    return list
      .sort((a, b) => (a?.ordenFirma ?? 0) - (b?.ordenFirma ?? 0))
      .map(d => ({
        ...d,
        firmado: d?.firmado === true
      }));
  }

  cerrar() {
    this.activeModal.close();
  }

   ngAfterViewInit(): void {
      setTimeout(() => {
        
        if(this.modoSeleccion === true) {
             this.firmanteAdicional?.focusIn();
        }
          }, 100);
  }


  private debounceUsuario() {
    this.searchUsuarioTextChanged.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      switchMap((query: any) => {
        if (query && query.length >= 3) {
          this.isLoading = true;
          return this.usuarioService.GetUserFilter(query).pipe(
            catchError((error: any) => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoading = false)
          );
        }
        return of(null);
      }),
      takeUntilDestroyed()
    ).subscribe((response: any) => {
      if (response?.isSuccess) {
        this.cbUsuarios = response.result;
        try {
          (response.result || []).forEach((u: any) => {
            if (u && u.id) this.usuariosIndex.set(u.id, u);
          });
        } catch (error) {
          this.toastr.error(cadenaErrores(error));
        }
      } else if (response && !response.isSuccess) {
        this.toastr.error(response.message || 'Error al cargar los usuarios.');
      }
    });
  }

  debouncedGetUsuario(event: FilteringEventArgs) {
    const query: string = event.text;
    if (query && query.length >= 3 && !this.isLoading) {
      this.searchUsuarioTextChanged.next(query);
    }
  }

  seleccionar() {
    if (!this.modoSeleccion) {
      this.activeModal.close();
      return;
    }
    // Asegura validación requerida si el modo selección está activo
    this.form.get('firmante')?.setValidators([Validators.required]);
    this.form.get('firmante')?.updateValueAndValidity({ emitEvent: false });
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
      return;
    }
    const raw = this.form.get('firmante')?.value;
    const idSeleccionado: string | null = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
    if (!idSeleccionado) return;

    const u = this.usuariosIndex.get(idSeleccionado) || (this.cbUsuarios ?? []).find((x: any) => x.id === idSeleccionado);
    const userName = u?.userName ?? idSeleccionado;

    // VALIDACIÓN DUPLICADOS (similar a guardarCambios de solicitud-firma)
    const idsExistentes: Set<string> = new Set<string>();
    const userNamesExistentes: Set<string> = new Set<string>();
    try {
      (this.solicitudFirmaCab?.solicitudFirmaDetDto || []).forEach((det: any) => {
        if (Array.isArray(det?.idsUsuariosRol)) det.idsUsuariosRol.forEach((usr: string) => idsExistentes.add(usr));
        const uf = det?.usuarioFirmanteDesignado;
        if (typeof uf === 'string') {
          // Si parece GUID, también contarlo como ID. En todo caso, guarda userName en set aparte.
          const ufStr = uf.trim();
          if (ufStr.includes('-') && ufStr.length >= 20) idsExistentes.add(ufStr);
          userNamesExistentes.add(ufStr.toLowerCase());
        }
        const ur = det?.usuarioFirmanteReal;
        if (typeof ur === 'string') {
          const urStr = ur.trim();
          if (urStr.includes('-') && urStr.length >= 20) idsExistentes.add(urStr);
          userNamesExistentes.add(urStr.toLowerCase());
        }
      });
    } catch {}
    if (idsExistentes.has(idSeleccionado) || userNamesExistentes.has((userName || '').trim().toLowerCase())) {
      this.toastr.warning('El firmante seleccionado ya participa (directo o vía rol).');
      return;
    }
    const detalle: SolicitudFirmaDetDto = {
      idSolicitudFirmaDet: null,
      idSolicitudFirmaCab: this.solicitudFirmaCab?.idSolicitudFirmaCab ?? null,
      idRolFirmanteDesignado: null,
      usuarioFirmanteDesignado: userName,
      usuarioFirmanteReal: null,
      codigoTipoAprobador: 'V',
      ordenFirma: 0,
      firmado: false,
      estado: 'S',
      fechaFirma: null,
      equipoFirma: null,
      observacionFirma: null,

      descripcionFirmante: u?.descripcionFirmante ?? u?.userName ?? idSeleccionado,
      idsUsuariosRol: null,
      esAdicional: true,
      usuarioAgrega: this.securityService.getUserName(),
      fechaAgrega: obtenerFechaEnHusoHorarioMinus5(),
      observacionAgrega: ''
    };
    // Si existe handler de persistencia, delegar y cerrar con lista actualizada
    if (this.handler?.onAddPersist) {
      this.isLoading = true;
      try {
        const maybe$ = this.handler.onAddPersist(detalle, this.solicitudFirmaCab, this.contexto);
        const asPromise: Promise<any> = typeof maybe$?.subscribe === 'function'
          ? firstValueFrom(maybe$.pipe(take(1)))
          : Promise.resolve(maybe$);
        asPromise.then((resp: any) => {
          this.isLoading = false;
          // Actualiza lista local para reflejar en UI
          const nuevo = resp?.result ?? resp ?? detalle;
          const actual = Array.isArray(this.solicitudFirmaCab?.solicitudFirmaDetDto) ? this.solicitudFirmaCab.solicitudFirmaDetDto : [];
          this.solicitudFirmaCab.solicitudFirmaDetDto = [nuevo, ...actual];
          this.toastr.success('Firmante solicitado correctamente.');
          this.activeModal.close(this.solicitudFirmaCab.solicitudFirmaDetDto);
        }).catch((error: any) => {
          this.isLoading = false;
          this.toastr.error(cadenaErrores(error) || 'No se pudo solicitar el firmante.');
        });
      } catch (error) {
        this.isLoading = false;
        this.toastr.error(cadenaErrores(error) || 'No se pudo solicitar el firmante.');
      }
      return;
    }
    // Fallback: cerrar devolviendo sólo el detalle (para compatibilidad)
    this.activeModal.close(detalle);
  }

  puedeEliminar(det: any): boolean {
    try {
      const currentUser = this.securityService.getUserName()?.toLowerCase();
      return det?.esAdicional === true && !det?.firmado && (det?.usuarioAgrega?.toLowerCase() === currentUser);
    } catch { return false; }
  }

  eliminar(det: any) {
    if (!this.puedeEliminar(det)) return;
    Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro que desea eliminar la solicitud de firma?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      // Si no tiene id persistido, solo actualizar lista local
      if (!det?.idSolicitudFirmaDet) {
        this.solicitudFirmaCab.solicitudFirmaDetDto = (this.detalles || []).filter((d: any) => d !== det);
        this.toastr.success('Solicitud de firma eliminada.');
        this.activeModal.close(this.solicitudFirmaCab.solicitudFirmaDetDto);
        return;
      }
      const id = det.idSolicitudFirmaDet;
      this.firmaTransaccionService.eliminarSolicitudFirmaDet(id).subscribe({
        next: (resp: any) => {
          if (resp?.isSuccess) {
            this.solicitudFirmaCab.solicitudFirmaDetDto = (this.detalles || []).filter((d: any) => d.idSolicitudFirmaDet !== id);
            // Dispara acción opcional del handler (ej. notificar en Hub por transacción)
            try { this.handler?.onDelete?.(det, this.solicitudFirmaCab, this.contexto); } catch {}
            this.toastr.success('Solicitud de firma eliminada.');
            this.activeModal.close(this.solicitudFirmaCab.solicitudFirmaDetDto);
          } else {
            this.toastr.error(resp?.message || 'No se pudo eliminar la solicitud de firma.');
          }
        },
        error: (error: any) => {
          this.toastr.error(cadenaErrores(error));
        }
      });
    });
  }

  sustituirFirmante(det: any) {
    if (!det?.idSolicitudFirmaDet || (!det?.usuarioFirmanteAlterno && !det?.idRolFirmanteAlterno)) return;
    Swal.fire({
      title: 'Confirmar delegación',
      text: `¿Desea delegar la firma de "${det.descripcionFirmante}" a "${det.descripcionFirmanteAlterno}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, delegar',
      cancelButtonText: 'Cancelar'
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      this.isLoading = true;

      const updateLocal = (updated: any) => {
        const idx = (this.solicitudFirmaCab?.solicitudFirmaDetDto ?? []).findIndex((d: any) => d.idSolicitudFirmaDet === det.idSolicitudFirmaDet);
        if (idx >= 0) {
          this.solicitudFirmaCab.solicitudFirmaDetDto[idx] = { ...this.solicitudFirmaCab.solicitudFirmaDetDto[idx], ...updated };
        }
      };

      if (this.handler?.onSubstitute) {
        try {
          const maybe$ = this.handler.onSubstitute(det, this.solicitudFirmaCab, this.contexto);
          const asPromise: Promise<any> = typeof maybe$?.subscribe === 'function'
            ? firstValueFrom(maybe$.pipe(take(1)))
            : Promise.resolve(maybe$);
          asPromise.then((resp: any) => {
            this.isLoading = false;
            if (resp?.isSuccess) {
              updateLocal(resp.result);
              this.toastr.success('Firmante delegado correctamente.');
            } else {
              this.toastr.error(resp?.message || 'No se pudo delegar el firmante.');
            }
          }).catch((error: any) => {
            this.isLoading = false;
            this.toastr.error(cadenaErrores(error) || 'No se pudo delegar el firmante.');
          });
        } catch (error) {
          this.isLoading = false;
          this.toastr.error(cadenaErrores(error) || 'No se pudo delegar el firmante.');
        }
      } else {
        // Fallback: llamar directamente al servicio genérico (sin notificación contextual)
        this.firmaTransaccionService.sustituirFirmante(det.idSolicitudFirmaDet, det.usuarioFirmanteAlterno, det.idRolFirmanteAlterno, this.securityService.getUserName()).subscribe({
          next: (resp: any) => {
            this.isLoading = false;
            if (resp?.isSuccess) {
              updateLocal(resp.result);
              this.toastr.success('Firmante delegado correctamente.');
            } else {
              this.toastr.error(resp?.message || 'No se pudo delegar el firmante.');
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            this.toastr.error(cadenaErrores(error));
          }
        });
      }
    });
  }

  revertirSustitucion(det: any) {
    if (!det?.idSolicitudFirmaDet || det?.esSustitucion !== true) return;
    Swal.fire({
      title: 'Confirmar reversión',
      text: `¿Desea revertir la delegación y restaurar al firmante original?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, revertir',
      cancelButtonText: 'Cancelar'
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      this.isLoading = true;

      const updateLocal = (updated: any) => {
        const idx = (this.solicitudFirmaCab?.solicitudFirmaDetDto ?? []).findIndex((d: any) => d.idSolicitudFirmaDet === det.idSolicitudFirmaDet);
        if (idx >= 0) {
          this.solicitudFirmaCab.solicitudFirmaDetDto[idx] = { ...this.solicitudFirmaCab.solicitudFirmaDetDto[idx], ...updated };
        }
      };

      if (this.handler?.onRevertSubstitute) {
        try {
          const maybe$ = this.handler.onRevertSubstitute(det, this.solicitudFirmaCab, this.contexto);
          const asPromise: Promise<any> = typeof maybe$?.subscribe === 'function'
            ? firstValueFrom(maybe$.pipe(take(1)))
            : Promise.resolve(maybe$);
          asPromise.then((resp: any) => {
            this.isLoading = false;
            if (resp?.isSuccess) {
              updateLocal(resp.result);
              this.toastr.success('Delegación revertida correctamente.');
            } else {
              this.toastr.error(resp?.message || 'No se pudo revertir la delegación.');
            }
          }).catch((error: any) => {
            this.isLoading = false;
            this.toastr.error(cadenaErrores(error) || 'No se pudo revertir la delegación.');
          });
        } catch (error) {
          this.isLoading = false;
          this.toastr.error(cadenaErrores(error) || 'No se pudo revertir la delegación.');
        }
      } else {
        // Fallback: llamar directamente al servicio genérico (sin notificación contextual)
        this.firmaTransaccionService.revertirSustitucion(det.idSolicitudFirmaDet).subscribe({
          next: (resp: any) => {
            this.isLoading = false;
            if (resp?.isSuccess) {
              updateLocal(resp.result);
              this.toastr.success('Delegación revertida correctamente.');
            } else {
              this.toastr.error(resp?.message || 'No se pudo revertir la delegación.');
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            this.toastr.error(cadenaErrores(error));
          }
        });
      }
    });
  }

  // trackBy para lista de detalles
  trackByDet = (_: number, det: any) => `${det?.descripcionFirmante ?? ''}-${det?.ordenFirma ?? ''}`;
}
