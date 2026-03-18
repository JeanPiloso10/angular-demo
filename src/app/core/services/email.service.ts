import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  apiURL = environment.apiURL + 'email';

  constructor(private httpClient: HttpClient) { }


  enviarCorreo(emailRequest: FormData): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/send`, emailRequest);
}

}
