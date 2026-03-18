import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { MotivoAuditoriaService } from '../motivo-auditoria.service';
import { finalize, Subscription } from 'rxjs';
import { TipoAccion } from '@shared/enums/TipoAccion';

@Component({
  selector: 'app-ver-motivo-auditoria',
  templateUrl: './ver-motivo-auditoria.component.html',
  styleUrl: './ver-motivo-auditoria.component.scss',
  standalone:false
})
export class VerMotivoAuditoriaComponent {

  @Input() modalSTransaccion: string[] = [];
  @Input() modalIdImportacion: number;
  @Output() reenviarEventoModificar = new EventEmitter<string>();

  private routeSub: Subscription;
  public StateEnum = TipoAccion.Read;
  public errores: string[] = [];
  public modelo: any;
  private entidad = 'motivoAuditoria';
  public modalTransaccion: string[] = [];

  constructor(private spinnerService :SpinnerService,
              private activatedRoute: ActivatedRoute,
              private toastr: ToastrService,
              private motivoAuditoriaService: MotivoAuditoriaService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.spinnerService.showGlobalSpinner();
    try {
        this.routeSub = this.activatedRoute.params.subscribe(params => {
          const id = params['id'];
          if (id) {
            this.cargarDatos(id);
          } else {
            this.modelo = {};
          }
        });
      // }
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error('Error al cargar la página', 'Error');
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }
  
  private cargarDatos(id: string): void {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaService.consultaId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }
        else {
          this.modelo = {};
          this.toastr.warning(`No existe motivo con el código ingresado.`, 'Información del Sistema');
          this.router.navigate(['/' + this.entidad + '/ver'])
        }
      },
      error: () => {
        this.router.navigate(['/' + this.entidad + '/ver'])
      }
    });
  }

  recibirEventoModificar(event: string) {
    this.reenviarEventoModificar.emit(event);
  }
}

