import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { AreasService } from '../area.service';


@Component({
  selector: 'app-ver-area',
  templateUrl: './ver-area.component.html',
  styleUrl: './ver-area.component.scss',
  standalone:false
})
export class VerAreaComponent {

  
  @Output() reenviarEventoModificar = new EventEmitter<string>();

  public modelo: any;
  public StateEnum = TipoAccion.Read;
  public errores: string[] = [];
  private routeSub: Subscription;
  entidad = 'area'; 


  constructor(private areaService :AreasService,
  private router :Router,
  private activatedRoute :ActivatedRoute)
  {

  }

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe({

      next: (params) => {
        const id = params['id'];
        if (id) {
          this.cargarDatos(id);
        } 
        else{
          this.modelo = [];
        }
      },
      error: (err) => {
        console.error(err);
      }
      
    });
  }

  
  private cargarDatos(id: string): void {
    this.areaService.consultaId(id).subscribe({
      next: (respuesta) => {              
        if(respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }              
      },
      error: () => this.router.navigate(['/'+this.entidad+'/ver'])
    });
  } 

  recibirEventoModificar(event: string) {
    this.reenviarEventoModificar.emit(event);
  }

}
