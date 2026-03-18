import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ReporteDto } from '@core/models/reporte-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService extends BaseCrudService {

  constructor(httpClient: HttpClient) {
    super(httpClient, 'reporte');
  }
  
  UploadReportFile(formData: FormData): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/UploadReportFile`, formData);
  }
  
  ListadoReportesTransaccion(codigoTransaccion: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/ListadoReportesTransaccion`, { params: { codigoTransaccion } });
  }

  

  // RenderReport(reporteDto :ReporteDto): Observable<any> {

  //   const url = `${this.apiURL}/RenderReport`;
  //   return this.httpClient.post(url, reporteDto, {
  //     responseType: 'arraybuffer' // Indica que esperas un archivo en la respuesta
  //   });
  // }

  RenderReportById(reporteDto :ReporteDto): Observable<any> {

    const url = `${this.apiURL}/RenderReportById`;
    return this.httpClient.post(url, reporteDto, {
      responseType: 'arraybuffer' // Indica que esperas un archivo en la respuesta
    });
  }

  deleteFile(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiURL}/delete/${id}`);
  }

  downloadFile(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(`${this.apiURL}/download/${id}`, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
}
