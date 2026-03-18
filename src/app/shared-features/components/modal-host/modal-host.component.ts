// import {
//   Component,
//   ViewChild,
//   ViewContainerRef,
//   ComponentRef,
//   Input,
//   EventEmitter
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ModalComponent 
// } from '@coreui/angular';
// import { Subject } from 'rxjs';
// import { BaseModalComponent } from './base-modal.component';
// import { ModalRef } from './modal-ref';

// @Component({
//   selector: 'app-modal-host',
//   imports: [
//     ModalComponent,
//     CommonModule
//   ],
//   templateUrl: './modal-host.component.html',
//   styleUrl: './modal-host.component.scss'
// })
// export class ModalHostComponent {

//   closed = new EventEmitter<void>();
//   dismissed = new EventEmitter<void>();

//   @ViewChild('container', { read: ViewContainerRef, static: true }) 
//   container!: ViewContainerRef;


//   @Input() size: any;
//   @Input() backdrop: boolean | 'static' = true;
//   @Input() keyboard: boolean = true;
//   @Input() transition: boolean = true;
//   @Input() scrollable: boolean = true;
  

//   visible = true;
//   public componentRef?: ComponentRef<any>;

//   private pendingComponent: any = null;
//   private pendingInputs: any = null;

//   ngAfterViewInit(): void {
//     if (this.pendingComponent) {
//       this._render(this.pendingComponent, this.pendingInputs);
//       this.pendingComponent = null;
//       this.pendingInputs = null;
//     }
//   }


//  open(component: any, inputs: any = {}): ComponentRef<any> | null {
//     if (!this.container) {
//       this.pendingComponent = component;
//       this.pendingInputs = inputs;
//       return null;
//     }

//     return this._render(component, inputs);
//   }


//   private _render(component: any, inputs: any): ComponentRef<any> {
//     this.container.clear();
//     this.componentRef = this.container.createComponent(component);
//     Object.assign(this.componentRef.instance, inputs);
//     return this.componentRef;
//   }

//   /** Cierra con éxito */
//   close(): void {
//     this.closed.emit();    //correcto para EventEmitter
//     this.destroy();
//   }

//   /** Cancela o descarta el modal */
//   dismiss(): void {
//     this.dismissed.emit(); //correcto para EventEmitter
//     this.destroy();
//   }

//   cerrar(): void {
//     this.close(); // llama a close() para un solo punto de control
//   }

//   cancelar(): void {
//     this.dismiss(); // llama a dismiss() para un solo punto de control
//   }

//   private destroy(): void {
//     this.componentRef?.destroy();
//   }

// }
