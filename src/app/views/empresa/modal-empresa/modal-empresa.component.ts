import { Component, inject, Input } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonGroupModule, ButtonModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormularioEmpresaComponent } from '../formulario-empresa/formulario-empresa.component';

@Component({
  selector: 'app-modal-empresa',
  standalone: true,
  imports: [CommonModule, ButtonModule, ButtonGroupModule, FormularioEmpresaComponent],
  templateUrl: './modal-empresa.component.html',
  styleUrl: './modal-empresa.component.scss'
})
export class ModalEmpresaComponent {

  
  @Input() StateEnum: TipoAccion;
  @Input() modelo: any;
  
  titulo:String ="Empresa";

  constructor(private activeModal: NgbActiveModal) {}

  cerrar() {
    this.activeModal.close(); 
  }

}
