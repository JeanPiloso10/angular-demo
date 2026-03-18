import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';

import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { SpinnerService } from '@core/services/spinner.service';
import { GestionAccesosService } from '../gestion-accesos.service';

@Component({
  selector: 'app-ver-gestion',
  templateUrl: './ver-gestion.component.html',
  styleUrl: './ver-gestion.component.scss',
  standalone: false
})
export class VerGestionComponent implements OnInit {

  public modelo: any;
  public StateEnum = TipoAccion.Read;
  private routeSub: Subscription;
  entidad = 'gestionaccesos';

  constructor(
    private toastr: ToastrService,
    private gestionService: GestionAccesosService,
    private spinnerService: SpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarDatos(id);
      } else {
        this.modelo = [];
      }
    });
  }

  private cargarDatos(id: string): void {
    this.spinnerService.showGlobalSpinner();
    this.gestionService.obtenerUsuarioPorId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }
      },
      error: () => this.router.navigate(['/' + this.entidad + '/ver'])
    });
  }
}
