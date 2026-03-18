import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {  ButtonModule,
        CardModule,
        FormModule,
        GridModule as GridCoreUI,
        ButtonGroupModule,
        BadgeModule,
        SpinnerModule} from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ComboBoxModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { 
  GridModule,
  EditService, 
  ToolbarService, 
  PageService, 
  SortService, 
  CommandColumnService,
  ColumnChooserService,  
  ToolbarItems,
  CommandModel,
  ResizeService} from '@syncfusion/ej2-angular-grids';
import { EntityService } from '@core/services/entity.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { SpinnerService } from '@core/services/spinner.service';
import { Router } from '@angular/router';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-buscar-entidad',
  templateUrl: './buscar-entidad.component.html',
  styleUrl: './buscar-entidad.component.scss',
  standalone: true,
  imports: [ButtonModule,
            CardModule,
            FormModule,
            GridCoreUI,
            ButtonGroupModule,
            BadgeModule,
            SpinnerModule,
            GridModule,
            ComboBoxModule,
            MultiSelectModule,
            ReactiveFormsModule],
            providers: [
              EditService,
              ToolbarService,
              PageService,
              SortService,
              CommandColumnService,
              ColumnChooserService,
              ResizeService
            ]
})
export class BuscarEntidadComponent {

  
  @Input() filterText?: string;
  @Input() entidad?: string;
  @Input() titulo?: string;
  @Output() seleccionEntidad = new EventEmitter<string>(); // <-- Añadido


  @ViewChild('filtro') filtro!: ElementRef;


  toolbar?: ToolbarItems[] | object;
  commands?: CommandModel[];
  data: any[] = [];
  box: string = 'Box';
  pageSettings = { pageCount: 5 };
  editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };


  constructor(private activeModal :NgbActiveModal,
              private entityService :EntityService,
              private toastr :ToastrService,
              private spinnerService :SpinnerService,
              private modalHelperService :ModalHelperService,
              private router :Router) {
  //  

  }

  ngOnInit() {
    this.toolbar = ['Search','ColumnChooser'];
    this.commands = [ { buttonOption: { content: '', cssClass: 'e-outline e-small e-icons e-eye'}, title:'Ver' },
                    ];

    this.entityService.setApiURL(this.entidad);
    this.cargarRegistros();
  }

  
 
  cargarRegistros(): void {
    // Mostrar spinner

    if (this.filterText == null || this.filterText == ''){

      // this.toastr.info('Escriba un texto para buscar registros.');
      return;
    }


      this.spinnerService.showGlobalSpinner();

      
      // Llamar al servicio de paises
      this.entityService.buscar(this.filterText).pipe(
        finalize(() => this.spinnerService.hideGlobalSpinner())
      ).subscribe({
        next: (respuesta) => {
          // Si la respuesta es exitosa, asignar los datos a la variable 'data'
          this.data = respuesta.isSuccess ? respuesta.result : [];  

          if (this.data.length == 0) {
            this.toastr.info('No se encontraron registros con el texto ingresado.');
          }
        },
        error: (errores) => {
          // Mostrar mensaje de error
          this.toastr.error(cadenaErrores(errores));
        }
      });

  }


  ngAfterViewInit(): void {

      this.filtro.nativeElement.focus();
      this.filtro.nativeElement.value = this.filterText;
  
  }
    

  // Método para manejar los eventos de los botones de la grilla
  public commandClick(args: any): void {
    // Verificar si el evento fue disparado por un botón de la grilla
    if (args.commandColumn.title && args.commandColumn.title === 'Ver') {
      const id = args.rowData.codigo;
      this.seleccionEntidad.emit(id); // Emitir el evento con el ID seleccionado
      this.activeModal.close(); // O usar .close() según corresponda
    }
  }

  
  cerrar()
  {
    this.activeModal.close(); // O usar .close() según corresponda
  }

  buscar()
  {
    this.filterText = this.filtro.nativeElement.value;
    this.cargarRegistros(); 
    this.filtro.nativeElement.focus();
  }

  limpiar()
  {
    this.filtro.nativeElement.value = '';
    this.filterText = '';
    this.data = [];
    this.filtro.nativeElement.focus();
  }
 
@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {

  if (event.key === 'Enter') { 
    this.buscar();
     event.preventDefault(); 
  }
}

}
