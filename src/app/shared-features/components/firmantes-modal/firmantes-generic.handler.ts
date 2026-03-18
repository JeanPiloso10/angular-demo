import { Injectable } from '@angular/core';
import { FirmantesHandler, SolicitudFirmaDetDto } from './firmantes-modal.component';
import { FirmaTransaccionService } from '@core/services/firma-transaccion.service';
import { SecurityService } from '@core/services/security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';

export interface FirmantesGenericContext {
  codigoTransaccion: string;
  idDocumento: number;
  idSucursal: number;
  nnuDocumento: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class FirmantesGenericHandler implements FirmantesHandler {
  constructor(private firmaService: FirmaTransaccionService, private security: SecurityService) {}

  onAddPersist(detalle: SolicitudFirmaDetDto, _cabecera: any, contexto?: FirmantesGenericContext) {
    if (!contexto?.idDocumento) return Promise.reject('Falta idDocumento en el contexto');
    const payload = {
      codigoTransaccion: contexto.codigoTransaccion,
      idDocumento: contexto.idDocumento,
      idSucursal: contexto.idSucursal,
      nnuDocumento: contexto.nnuDocumento,
      estado: contexto.estado,
      usuarioAuditoria: this.security.getUserName(),
      fechaAuditoria: obtenerFechaEnHusoHorarioMinus5(),
      observacionAuditoria: 'SOLICITAR FIRMANTE ADICIONAL',
      firmanteAdicional: detalle
    };
    return this.firmaService.agregarFirmanteAdicional(payload);
  }

  onDelete(_detalle: any, _cabecera: any, contexto?: FirmantesGenericContext): void {
    if (!contexto?.idDocumento) return;
    this.firmaService.notificarCambioFirmantesEnHub(contexto.codigoTransaccion, contexto.idDocumento).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  onSubstitute(detalleActualizado: any, _cabecera: any, contexto?: FirmantesGenericContext) {
    if (!contexto?.idDocumento) return Promise.reject('Falta idDocumento en el contexto');
    const payload = {
      codigoTransaccion: contexto.codigoTransaccion,
      idDocumento: contexto.idDocumento,
      idSucursal: contexto.idSucursal,
      nnuDocumento: contexto.nnuDocumento,
      estado: contexto.estado,
      usuarioAuditoria: this.security.getUserName(),
      fechaAuditoria: obtenerFechaEnHusoHorarioMinus5(),
      observacionAuditoria: 'DELEGAR FIRMANTE',
      firmanteAdicional: detalleActualizado
    };
    return this.firmaService.delegarFirmante(payload);
  }

  onRevertSubstitute(detalleActualizado: any, _cabecera: any, contexto?: FirmantesGenericContext) {
    if (!contexto?.idDocumento) return Promise.reject('Falta idDocumento en el contexto');
    const payload = {
      codigoTransaccion: contexto.codigoTransaccion,
      idDocumento: contexto.idDocumento,
      idSucursal: contexto.idSucursal,
      nnuDocumento: contexto.nnuDocumento,
      estado: contexto.estado,
      usuarioAuditoria: this.security.getUserName(),
      fechaAuditoria: obtenerFechaEnHusoHorarioMinus5(),
      observacionAuditoria: 'REVERTIR DELEGACIÓN FIRMANTE',
      firmanteAdicional: detalleActualizado
    };
    return this.firmaService.revertirDelegacionFirmante(payload);
  }
}
