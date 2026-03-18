import { Injectable } from '@angular/core';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';


@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private modalSpinnerId  = 'modal-spinner-container';
  private globalSpinnerId  = 'erp-spinner-container';

  constructor() {
  }

  
  private createSpinnerInModal(): void {
    const modalElement = document.querySelector('div.modal-content');

    if (!(modalElement instanceof HTMLElement)) return;
    if (modalElement.tagName.toLowerCase() !== 'div') return;

    let spinnerContainer = modalElement.querySelector(`#${this.modalSpinnerId}`);

    if (!spinnerContainer) {
      spinnerContainer = document.createElement('div');
      spinnerContainer.id = this.modalSpinnerId;
      modalElement.appendChild(spinnerContainer);
    }

    if (spinnerContainer instanceof HTMLElement && !spinnerContainer.querySelector('.e-spinner-pane')) {
      createSpinner({ target: spinnerContainer });
    }
  }

  public  createGlobalSpinner(): void {
    const target = document.querySelector(`#${this.globalSpinnerId}`);
    if (target instanceof HTMLElement && !target.querySelector('.e-spinner-pane')) {
      createSpinner({ target });
    }
  }

  showGlobalSpinner() {
  const target = document.querySelector(`#${this.globalSpinnerId}`) as HTMLElement | null;

  if (!target) return;

  // Si no tiene un spinner dentro, crearlo nuevamente
  if (!target.querySelector('.e-spinner-pane')) {
    createSpinner({ target });
  }

  showSpinner(target);
}

  hideGlobalSpinner() {
    hideSpinner(document.querySelector(`#${this.modalSpinnerId}`)!);
    hideSpinner(document.querySelector(`#${this.globalSpinnerId}`)!);
  }
}
