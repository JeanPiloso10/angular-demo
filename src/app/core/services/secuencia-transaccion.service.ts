import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SecuenciaDto } from '../models/secuencia-dto'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class SecuenciaTransaccionService {

  
  private readonly apiURL = environment.apiURL + 'secuencia';

  constructor(private httpClient: HttpClient) { }

  
  public crearSecuencia(secuenciaDto: SecuenciaDto): Observable<SecuenciaDto> {
    const url = `${this.apiURL}/crearSecuencia`;
    return this.httpClient.post<SecuenciaDto>(url, secuenciaDto);
  }

  public actualizaSecuencia(secuenciaDto: SecuenciaDto): Observable<SecuenciaDto> {
    const url = `${this.apiURL}/actualizaSecuencia`;
    return this.httpClient.post<SecuenciaDto>(url, secuenciaDto);
  }

  public obtenerSecuencia(secuenciaDto: SecuenciaDto): Observable<SecuenciaDto> {
    const url = `${this.apiURL}/obtenerSecuencia`;
    return this.httpClient.post<SecuenciaDto>(url, secuenciaDto);
  }


}

