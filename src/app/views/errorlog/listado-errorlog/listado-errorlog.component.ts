import { Component, OnInit, ViewChild } from '@angular/core';
import { ErrorlogService } from '../errorlog.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { obtenerFechaEnHusoHorarioMinus5 } from '@app/shared-features/utilities/formatearFecha';
import { DatePipe } from '@angular/common';
import { ToolbarItems, GridComponent } from '@syncfusion/ej2-angular-grids';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { FormValidationService } from '@app/core/services/form-validation.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@app/core/services/spinner.service';
import { cadenaErrores } from '@app/shared-features/utilities/parsearErrores';

@Component({
  selector: 'app-listado-errorlog',
  templateUrl: './listado-errorlog.component.html',
  styleUrl: './listado-errorlog.component.scss',
  standalone:false
})
export class ListadoErrorlogComponent implements OnInit {

  @ViewChild('grid') grid?: GridComponent;
  Form: FormGroup;
  data: any[] = [];
  public editSettings: Object = { allowEditing: false, allowAdding: true, allowDeleting: false, showDeleteConfirmDialog: true };
  public pageOption: Object;
  public toolbar?: ToolbarItems[] | object;
  public visibleCollapse = true;
  activeTabPaneIdx: number = 0;
  constructor(private errorLogService: ErrorlogService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private validationService: FormValidationService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService) {
    this.Form = this.initForm();
  }
  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {
    this.pageOption = { pageCount: 5, pageSize: 15 };
    this.toolbar = ['Search','ColumnChooser','ExcelExport'];
    this.consultar();
  }
  obtenerError(campoNombre: string): string {
    const campo = this.Form.get(campoNombre);
    return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }
  private initForm(): FormGroup {
    return this.formBuilder.group({
      fdesde: [this.datePipe.transform(new Date(obtenerFechaEnHusoHorarioMinus5()), 'yyyy-MM-dd'), [Validators.required]],
      fhasta: [this.datePipe.transform(new Date(obtenerFechaEnHusoHorarioMinus5()), 'yyyy-MM-dd'), [Validators.required]],
    });
  }
  async consultar() {
    try {
      if (this.Form.valid) {
        this.data = [];
        const dto = {
          fdesde: this.Form.get('fdesde')?.value,
          fhasta: this.Form.get('fhasta')?.value
        }
        this.spinnerService.showGlobalSpinner();
        const response: any = await firstValueFrom(this.errorLogService.BusquedaExceptionErrorLog(dto));
        if (response.isSuccess) {
          this.spinnerService.hideGlobalSpinner();
          if (response.result.length > 0) {
            this.data = response.result;
          } else {
            this.toastr.info('No se encontraron datos para la consulta especificada.');
          }
        } else {
          this.spinnerService.hideGlobalSpinner();
          this.toastr.error(response.message || 'Error al cargar datos.');
        }

      } else {
        // this.getInvalidControls();
        this.toastr.warning('Debe llenar todos los campos requerido para la consulta');
      }
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));

    }
  }

  // Manejo toolbar para exportar a Excel
  toolbarClick(args: ClickEventArgs): void {
    const gridId = (this.grid as any)?.element?.id;
    const excelBtnId = gridId ? `${gridId}_excelexport` : undefined;
    if (excelBtnId && (args as any)?.item?.id === excelBtnId) {
      if (this.data && this.data.length > 0) {
        this.grid?.excelExport();
      } else {
        this.toastr.warning('No hay datos para exportar.');
      }
    }
  }

  toggleCollapse(): void {
    if (!this.visibleCollapse) {
      this.visibleCollapse = true;
      this.activeTabPaneIdx = 0;
    } else {
      this.visibleCollapse = false;
      this.activeTabPaneIdx = null;
    }
  }
}


