import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaisesService } from '../paises.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';

@Component({
  selector: 'app-ver-pais',
  templateUrl: './ver-pais.component.html',
  styleUrl: './ver-pais.component.scss',
  standalone:false
})
export class VerPaisComponent {



  modelo: any;
  StateEnum = TipoAccion.Read;
  errores: string;
  padre_id: null;
  entidad = 'pais'; 

  constructor(private router: Router,
              private paisService: PaisesService,
              private toastr: ToastrService,
              private activatedRoute: ActivatedRoute) {
  }
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        const id = params['id'];
        if (id) {
          this.cargarEntidad(id);
        } else {
          this.modelo = {}; // Inicializa con un objeto vacío o la lógica que necesites cuando no hay ID.
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }

  private cargarEntidad(id: string): void {
    this.paisService.consultaId(id)
      .subscribe({
        next: (respuesta) => {
          if (respuesta.isSuccess) {
            this.modelo = respuesta.result;
          } else {
            this.router.navigate(['/' + this.entidad]);
          }
        },
        error: (error) => {
          this.toastr.error(cadenaErrores(error));
          this.router.navigate(['/' + this.entidad]);
        }
      });
  }
}
