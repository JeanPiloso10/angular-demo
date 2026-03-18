import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[soloNumeros]',
})
export class SoloNumerosDirective {

  constructor() { }
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const ctrlKeys = ['a', 'c', 'v', 'x'];
    
    if (allowedKeys.indexOf(event.key) !== -1 ||
        (ctrlKeys.indexOf(event.key.toLowerCase()) !== -1 && (event.ctrlKey || event.metaKey))) {
      return;
    }
    
    if ((event.key >= '0' && event.key <= '9')) {
      return;
    }

    event.preventDefault();
  }

}
