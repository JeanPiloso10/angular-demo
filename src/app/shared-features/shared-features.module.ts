import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MostrarErroresComponent } from './components/mostrar-errores/mostrar-errores.component';
import { SoloCaracteresPermitidosDirective } from './directives/solo-caracteres-permitidos/solo-caracteres-permitidos.directive';
import { DragScrollDirective } from './directives/drag-scroll/drag-scroll.directive';
import { ResizableTableColumnsDirective } from './directives/resizable-table-columns/resizable-table-columns.directive';


@NgModule({
  declarations: [MostrarErroresComponent, SoloCaracteresPermitidosDirective, DragScrollDirective],
  imports: [
    CommonModule,
    ResizableTableColumnsDirective
  ],
  exports: [
    MostrarErroresComponent,
    SoloCaracteresPermitidosDirective,
    DragScrollDirective,
    ResizableTableColumnsDirective
  ]
})
export class SharedFeaturesModule { }
