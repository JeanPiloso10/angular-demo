import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService extends BaseCrudService {

  constructor(httpClient: HttpClient) {
    super(httpClient, 'configuracion');
  }
  
}
