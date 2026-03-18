import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightJsDirective } from 'ngx-highlight-js';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonGroupModule, ButtonModule } from '@coreui/angular';


@Component({
  selector: 'app-visor-datos',
  standalone: true,
  imports: [CommonModule, HighlightJsDirective, ButtonGroupModule, ButtonModule],
  templateUrl: './visor-datos.component.html',
  styleUrl: './visor-datos.component.scss'
})
export class VisorDatosComponent {
  @Input() contenido: string; // puede ser JSON o XML
  @Input() tipo: 'json' | 'xml' = 'json'; // por defecto asume json
  contenidoFormateado: string;
  lang: 'json' | 'xml' = 'json';

  

  constructor(private activeModal :NgbActiveModal) {}

  ngOnInit() {
    this.lang = this.tipo;
    this.contenidoFormateado = this.tipo === 'json' ? this.formatJSON(this.contenido) : this.formatXML(this.contenido);
  }

  formatJSON(json: string): string {
    try {
      const obj = JSON.parse(json);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      return 'JSON inválido';
    }
  }

  formatXML(xml: string): string {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'application/xml');
      if (xmlDoc.getElementsByTagName('parsererror').length) {
        return 'Error al parsear el XML';
      }

      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      return formatted.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    } catch (e) {
      console.error('Error al parsear XML:', e);
      return 'XML inválido';
    }
  }

  cerrar() {
    this.activeModal.close();
  }
}
