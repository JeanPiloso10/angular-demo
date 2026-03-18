import { Injectable } from '@angular/core';
import { TarifaIvaService } from '@app/views/tarifa-iva/tarifa-iva.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XmlComprobanteElectronicoService {

  constructor(private tarifaIvaService: TarifaIvaService,
    private toastr: ToastrService
  ) { }


  obtenerCodDocModificado(xmlContent: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent ?? '', 'text/xml');

    const codDocNode = xmlDoc.getElementsByTagName('codDocModificado')[0];
    return codDocNode?.textContent ?? '';
  }
  obtenerSerieModificado(xmlContent: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent ?? '', 'text/xml');

    const numDocNode = xmlDoc.getElementsByTagName('numDocModificado')[0];
    const numDocModificado = numDocNode?.textContent?.replace(/-/g, '') ?? '';

    return numDocModificado.substring(0, 6); // Ej: 002021
  }

  obtenerSecuencialModificado(xmlContent: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent ?? '', 'text/xml');

    const numDocNode = xmlDoc.getElementsByTagName('numDocModificado')[0];
    const numDocModificado = numDocNode?.textContent?.replace(/-/g, '') ?? '';

    return numDocModificado.slice(-9); // Ej: 000008630
  }

  async obtenerTotalesImpuestos(xmlContent: string): Promise<any> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      const totalImpuestosCabecera = Array.from(xmlDoc.getElementsByTagName("totalImpuesto"));
      const impuestosConBaseImponible = totalImpuestosCabecera.filter((imp: any) => {
        const baseImponible = imp.querySelector("baseImponible")?.textContent ?? "0";
        return parseFloat(baseImponible) > 0;
      });
      const responseTarifaIva: any = await firstValueFrom(this.tarifaIvaService.tarifaIvaPorDefecto());
      if (responseTarifaIva.result == null) {
        throw new Error("No existe una tarifa configurada en el sistema.");
      }

      const detalles = xmlDoc.getElementsByTagName('detalle');

      if (detalles.length === 0) {
        return {
          baseDefault: 0, ivaDefault: 0, porceDefault: 0, codigoPorceDefault: 0,
          base0: 0,
          base5: 0, iva5: 0, porce5: 0, codigoPorce5: 0
        };
      }


      let baseDefault = 0;
      let ivaDefault = 0;
      let porceDefault = 0;
      let codigoPorceDefault = 0;

      let base5 = 0;
      let iva5 = 0;
      let porce5 = 0;
      let codigoPorce5 = 0;

      let base0 = 0;

      let tarifaIvaDefault = parseFloat(responseTarifaIva.result);

      if (impuestosConBaseImponible.length === 1) {
        const impuesto = impuestosConBaseImponible[0];
        const codPorce = parseFloat(impuesto.querySelector("codigoPorcentaje")?.textContent ?? "0");
        const baseImp = parseFloat(impuesto.querySelector("baseImponible")?.textContent ?? "0");
        const valor = parseFloat(impuesto.querySelector("valor")?.textContent ?? "0");
        const detallesArray = Array.from(detalles);
        const tarifa = detallesArray.flatMap(det => Array.from(det.querySelectorAll("impuestos > impuesto")))
          .filter(imp => parseFloat(imp.querySelector("codigoPorcentaje")?.textContent ?? "0") === codPorce)
          .map(imp => parseFloat(imp.querySelector("tarifa")?.textContent ?? "0"))[0] ?? 0;
        if (codPorce === tarifaIvaDefault) {
          baseDefault = baseImp;
          ivaDefault = valor;
          porceDefault = tarifa;
          codigoPorceDefault = codPorce;
        } else if (codPorce === 0) {
          base0 = baseImp;
        } else if (codPorce === 5) {
          base5 = baseImp;
          iva5 = valor;
          porce5 = tarifa;
          codigoPorce5 = codPorce;
        }


      } else if (impuestosConBaseImponible.length >= 1) {
        for (let i = 0; i < detalles.length; i++) {
          const impuestos = detalles[i].getElementsByTagName('impuesto');

          for (let j = 0; j < impuestos.length; j++) {
            const codigoPorcentaje = impuestos[j].getElementsByTagName('codigoPorcentaje')[0]?.textContent;
            const tarifa = impuestos[j].getElementsByTagName('tarifa')[0]?.textContent;
            const baseImponible = impuestos[j].getElementsByTagName('baseImponible')[0]?.textContent;
            const valor = impuestos[j].getElementsByTagName('valor')[0]?.textContent;

            const base = parseFloat(baseImponible ?? '0');
            const iva = parseFloat(valor ?? '0');
            const codPorce = parseFloat(codigoPorcentaje ?? '0');

            if (codPorce === tarifaIvaDefault) {
              baseDefault += base;
              ivaDefault += iva;
              porceDefault = parseFloat(tarifa ?? '0');
              codigoPorceDefault = codPorce;
            } else if (codPorce === 0) {
              base0 += base;
            }
            else if (codPorce == 5) {
              base5 += base;
              iva5 += iva;
              porce5 = parseFloat(tarifa ?? '0');
              codigoPorce5 = codPorce;
            }
          }
        }
      }
      return { baseDefault, ivaDefault, porceDefault, codigoPorceDefault, base0, base5, iva5, porce5, codigoPorce5 };

    } catch (error) {
      throw error;
    }
  }
}

