import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { AuditoriaService } from '@core/services/auditoria.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ToastrService } from 'ngx-toastr';
import { EditService, GridComponent, GridModule, 
  PageService, SortService, TextWrapSettingsModel, ResizeService, ToolbarItems, FilterSettingsModel, ToolbarService, ExcelExportService, FilterService } from '@syncfusion/ej2-angular-grids';
import { ButtonGroupModule, ButtonModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { VisorDatosComponent } from '../visor-datos/visor-datos.component';
import { TourService } from '@app/core/services/tour.service';
import { DriveStep } from 'driver.js';
import { SharedFeaturesModule } from '@app/shared-features/shared-features.module';

@Component({
  selector: 'app-auditoria-consulta',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule, ButtonGroupModule, IconModule, SharedFeaturesModule],
  providers: [EditService, PageService, SortService, ResizeService, ToolbarService, ExcelExportService, FilterService,
     {
          provide: IconSetService,
          useFactory: () => {
            const iconSet = new IconSetService();
            iconSet.icons = {
              ...iconSubset
            };
            return iconSet;
          }
        }
  ],
  templateUrl: './auditoria-consulta.component.html',
  styleUrl: './auditoria-consulta.component.scss'
})
export class AuditoriaConsultaComponent {

  @Input() codigoTransaccion: string;
  @Input() identificacionPrincipal: string;
  @Input() referencia1?: string;
  @Input() titulo?: string= '';
  listadoAuditoria: any[] = [];
  mostrarJsonBackup: boolean = true;

  @ViewChild('grid') grid: GridComponent;
  public toolbarOptions?: ToolbarItems[] | any = ['ExcelExport'];
  public filterSettings: FilterSettingsModel = { type: 'Excel' };


constructor(  private auditoriaService: AuditoriaService,
              private modalHelperService: ModalHelperService,
              private toastr: ToastrService,
              private activeModal : NgbActiveModal,
              private tourService: TourService){

  }

  async ngOnInit() {
    this.loadPrimaryInitialData();
  }


  async loadPrimaryInitialData() {
    try {

      
      const results = await firstValueFrom(
        forkJoin({
          AuditoriaResponse: this.auditoriaService
            .obtenerAuditoria(this.codigoTransaccion, this.identificacionPrincipal,this.referencia1)
            .pipe(catchError((error) => of({ result: [] }))),
        })
      );
      this.listadoAuditoria = results.AuditoriaResponse.result.map((item: any) => {
        if (item.observacion) {
          // Resaltar el número dinámico en la observación
          item.observacion = this.resaltarNumeroEnObservacion(item.observacion);
        }
        return item;
      });
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }
  
  // Método auxiliar para resaltar el número dinámico
  resaltarNumeroEnObservacion(observacion: string): string {
    // Expresión regular para números de al menos 10 dígitos
    const regex = /(\d{1,})/g;
    return observacion.replace(regex, '<strong>$1</strong>');
  }
  

  transformMotivoToBadgeArray(motivo: string): string[] {
    return motivo.split(', ');
  }

  verJsonBackup(jsonBackup: string)
  {
     const modalRef = this.modalHelperService.abrirModal(VisorDatosComponent, 
        {
          contenido: jsonBackup,
          tipo: 'json'
        },
        {
          size: 'xl',
          windowClass: 'modal-dialog-centered',
          animation: true,
          backdrop: 'static',
        });
    
  }
    
  cerrar() {
    // Asegúrese de finalizar cualquier tour activo al cerrar el modal
    this.tourService.destroy();
    this.activeModal.close();
  }

  toolbarClick(args: any): void {
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    const clickedId = (args as any)?.item?.id;
    if (excelBtnId && clickedId === excelBtnId) {
      this.grid?.excelExport();
    }
  }

  // Inicia el tour guiado del componente Auditoría Consulta
  startTour(): void {
    // Utilidad centralizada en TourService: stepIfExists

    const steps: DriveStep[] = [
      {
        element: '.modal-title',
        popover: {
          title: 'Consulta de Auditoría',
          description: 'Aquí podrá revisar el detalle de auditoría relacionado con su documento o proceso.',
          side: 'bottom'
        }
      },
      // Subtítulo (solo si existe texto)
      ...(((this.titulo ?? '').toString().trim().length > 0)
        ? this.tourService.stepIfExists(
            '.modal-header small.text-muted',
            'Contexto',
            'Este es el subtítulo del detalle; proporciona contexto adicional de lo que está revisando.',
            'bottom'
          )
        : []),
      {
        element: '#auditoria-grid',
        popover: {
          title: 'Detalle de Cambios',
          description: 'Este grid muestra cada evento auditado: tipo de acción, motivos, observación, usuario, fecha y equipo.',
          side: 'top'
        }
      },
      // Columnas del grid (encabezados). Se usan índices de columnas visibles.
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(2)',
        'Tipo',
        'Tipo de acción auditada (por ejemplo, Crear, Actualizar, Eliminar).',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(3)',
        'Motivos',
        'Motivos asociados a la acción; se visualizan como badges dentro del grid.',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(4)',
        'Observación',
        'Detalle textual de la acción; los números se resaltan automáticamente para facilitar su lectura.',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(5)',
        'Usuario',
        'Usuario que ejecutó la acción auditada.',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(6)',
        'Fecha',
        'Fecha y hora en que se registró la acción.',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(7)',
        'Equipo',
        'Equipo o nombre del host desde el cual se realizó la acción.',
        'bottom'
      ),
      ...this.tourService.stepIfExists(
        '#auditoria-grid .e-headercell:nth-child(8)',
        'Versión Anterior',
        'Si está disponible, haga clic en “Ver” para abrir la versión anterior del registro y compararla.',
        'bottom'
      )
    ];

    this.tourService.startTour(steps, {
      showProgress: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      onDestroyStarted: () => this.tourService.destroy()
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const Grid = document.querySelector('.e-grid') !== null;
      if (Grid) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
  
}
