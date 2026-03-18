import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[soloCaracteresPermitidos]',
  standalone:false
})
export class SoloCaracteresPermitidosDirective {
  
  // Definimos el input que controla el tipo de caracteres permitidos
  @Input() tipoPermitido: 'numeros' | 'letras' | 'ambos' = 'numeros';

  constructor() {}

  // Escuchamos el evento 'keydown' para controlar la entrada de caracteres
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Teclas de control permitidas sin restricciones
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'
    ];

    // Teclas de control como Ctrl + a, c, v, x
    const ctrlKeys = ['a', 'c', 'v', 'x'];

    // Si la tecla presionada es una tecla de control o una combinación con Ctrl, no hacemos nada
    if (allowedKeys.includes(event.key) || 
        (ctrlKeys.includes(event.key.toLowerCase()) && (event.ctrlKey || event.metaKey))) {
      return;
    }

    // Si el tipo permitido es 'numeros', solo permitimos dígitos
    if (this.tipoPermitido === 'numeros') {
      if (event.key >= '0' && event.key <= '9') {
        return; // Permitimos números
      }
    } 
    // Si el tipo permitido es 'letras', solo permitimos letras
    else if (this.tipoPermitido === 'letras') {
      if (event.key.match(/^[a-zA-Z]$/)) {
        return; // Permitimos letras
      }
    } 
    // Si el tipo permitido es 'ambos', permitimos tanto números como letras
    else if (this.tipoPermitido === 'ambos') {
      if (event.key.match(/^[a-zA-Z0-9]$/)) {
        return; // Permitimos números y letras
      }
    }

    // Si no es ninguna de las teclas permitidas, prevenimos la entrada
    event.preventDefault();
  }
}
