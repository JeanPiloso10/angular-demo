import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SecurityService } from './security.service';

// Objeto que simula NgbModalRef cuando no hay sesión válida
// Evita errores de null reference en código que usa modalRef.result
const EMPTY_MODAL_REF = {
  result: new Promise(() => {}), // Promise que nunca se resuelve (el usuario será redirigido)
  close: () => {},
  dismiss: () => {},
  componentInstance: {},
  closed: { subscribe: () => ({ unsubscribe: () => {} }) },
  dismissed: { subscribe: () => ({ unsubscribe: () => {} }) }
} as unknown as NgbModalRef;

@Injectable({ providedIn: 'root' })
export class ModalHelperService 
{

  private modalCount: number = 0;
  private _isModalOpen = false;

  constructor(
    private modalService: NgbModal,
    private securityService: SecurityService,
    private router: Router) {}

  abrirModal(
    componente: any,
    inputs: { [key: string]: any } = {},
    opcionesExtra: NgbModalOptions = {}
  ): NgbModalRef {
    // Validar sesión antes de abrir el modal
    if (!this.securityService.isLoggedIn()) {
      const currentUrl = this.router.url;
      // Mostrar página 401 y luego redirigir a login
      this.router.navigate(['/401']).then(() => {
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { redirectURL: currentUrl } });
        }, 3000);
      });
      // Retornar un objeto que simula NgbModalRef para evitar errores de null
      return EMPTY_MODAL_REF;
    }

    const defaultOptions: NgbModalOptions = {
      scrollable: true,
      animation: true,
      ...opcionesExtra,
    };

    const modalRef = this.modalService.open(componente, defaultOptions);
    Object.assign(modalRef.componentInstance, inputs);

    this.setModalOpen(true);

    const cerrarModal = () => this.setModalOpen(false);
    modalRef.closed.subscribe(cerrarModal);
    modalRef.dismissed.subscribe(cerrarModal);

    return modalRef;
  }

  get isModalOpen(): boolean {
    
    if(this.modalCount > 0) {
      this._isModalOpen = true;
    }
    else {
      this._isModalOpen = false;
    }
    return this._isModalOpen;
  }

  setModalOpen(state: boolean): void {
    // console.log('Contador de modales:', this.modalCount, 'Estado del modal:', state);
    this.modalCount += state ? 1 : -1;
  }

  closeModals() {
    // console.log('Contador de modales:', this.modalCount);
    this.modalService.dismissAll();
  }
}