import { Component, Input,OnInit } from '@angular/core';

@Component({
  selector: 'app-mostrar-errores',
  templateUrl: './mostrar-errores.component.html',
  styleUrl: './mostrar-errores.component.scss',
  standalone:false
})
export class MostrarErroresComponent implements OnInit {

  @Input()
  errores: string[] = [];

  constructor() {
  }
  ngOnInit(): void {}

  trackError(index: any, error: any) {
    return error ? error.id : undefined;
  }


}
