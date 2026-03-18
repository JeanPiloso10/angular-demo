import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {

  apiURL = environment.apiURL + 'BlobStorageRecord';

  constructor(private httpClient: HttpClient) { }

  uploadFile(formData: FormData): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/upload`, formData);
  }


  downloadFile(id: number): Observable<HttpResponse<any>> {
    return this.httpClient.get(`${this.apiURL}/download/${id}`, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteFile(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiURL}/delete/${id}`);
  }

  listFiles(id: string,codigoTransaccion: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiURL}/list/${id}/${codigoTransaccion}`); 
  }

  listFilesByIdAndSucursal(id: string,idSucursal:number,  codigoTransaccion: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiURL}/listFilesByIdAndSucursal/${id}/${idSucursal}/${codigoTransaccion}`); 
  }

  public GetFilesByList(lista: any[]): Observable<any> {
    const url = `${this.apiURL}/GetFilesByList`;
    return this.httpClient.post<any>(url, lista);
  };

  getSasUri(fileName: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/sas`, { params: { fileName } });
  }

  downloadByFileName(fileName: string): Observable<HttpResponse<Blob>> {
    const blobStorageUrl = environment.apiURL + 'BlobStorage';
    return this.httpClient.get(`${blobStorageUrl}/download/${encodeURIComponent(fileName)}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  public listadoTipoArchivoAnexoTransaccion(codigoTransaccion: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/tipoArchivoAnexoTransaccion/${codigoTransaccion}`);
  }
}
