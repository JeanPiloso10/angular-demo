import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class OperacionTransaccionService extends BaseCrudService {

 
  constructor(httpClient: HttpClient) {
    super(httpClient, 'operaciontransaccion');
  }
}
