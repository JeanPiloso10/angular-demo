import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { TipoArchivoAnexo } from '../interfaces';
import { TipoArchivoAnexoService } from '../tipo-archivo-anexo.service';


@Component({
  selector: 'app-ver-tipo-archivo-anexo',
  templateUrl: './ver-tipo-archivo-anexo.component.html',
  styleUrl: './ver-tipo-archivo-anexo.component.scss',
  standalone:false
})
export class VerTipoArchivoAnexoComponent {

  @Input() modalSTransaccion: string[] = [];
  @Input() modalIdImportacion: number;
  @Output() reenviarEventoModificar = new EventEmitter<string>();

  private routeSub: Subscription;
  public StateEnum = TipoAccion.Read;
  public errores: string[] = [];
  public modelo: any;
  private entidad = 'tipoArchivoAnexo';
  public modalTransaccion: string[] = [];

  constructor(private activatedRoute: ActivatedRoute,
              private toastr: ToastrService,
              private spinnerService: SpinnerService,
              private router: Router,
              private tipoArchivoAnexo: TipoArchivoAnexoService) {
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
    this.tipoArchivoAnexo.consultaId(id).pipe(
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
