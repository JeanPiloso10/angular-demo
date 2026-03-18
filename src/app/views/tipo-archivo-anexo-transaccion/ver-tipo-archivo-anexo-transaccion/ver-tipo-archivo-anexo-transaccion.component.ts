import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { Subscription, finalize } from 'rxjs';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { TipoArchivoAnexoTransaccionService } from '../tipo-archivo-anexo-transaccion.service';

@Component({
  selector: 'app-ver-tipo-archivo-anexo-transaccion',
  standalone: false,
  templateUrl: './ver-tipo-archivo-anexo-transaccion.component.html',
  styleUrl: './ver-tipo-archivo-anexo-transaccion.component.scss'
})
export class VerTipoArchivoAnexoTransaccionComponent {
  @Input() modalSTransaccion: string[] = [];
  @Input() modalIdImportacion: number;
  @Output() reenviarEventoModificar = new EventEmitter<string>();

  private routeSub: Subscription;
  public StateEnum = TipoAccion.Read;
  public errores: string[] = [];
  public modelo: any;
  private entidad = 'tipoArchivoAnexoTransaccion';
  public modalTransaccion: string[] = [];

  constructor(private tipoArchivoAnexoTransaccion: TipoArchivoAnexoTransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarDatos(id);
      } else {
        this.modelo = {};
      }
    });
  }
  private cargarDatos(id: string): void {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoAnexoTransaccion.consultaId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }
        else {
          this.modelo = {};
          this.toastr.warning(`No existe Auxiliar con el código ingresado.`, 'Información del Sistema');
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


