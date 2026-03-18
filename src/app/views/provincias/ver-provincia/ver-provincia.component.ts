import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProvinciasService } from '../provincias.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';

@Component({
  selector: 'app-ver-provincia',
  standalone:false,
  templateUrl: './ver-provincia.component.html',
  styleUrl: './ver-provincia.component.scss'
})
export class VerProvinciaComponent {



  modelo: any;
  StateEnum = TipoAccion.Read;
  errores: string;
  padre_id: null;
  entidad = 'provincia'; 

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private provinciasService: ProvinciasService,
              private toastr: ToastrService) {

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
    this.provinciasService.consultaId(id)
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
