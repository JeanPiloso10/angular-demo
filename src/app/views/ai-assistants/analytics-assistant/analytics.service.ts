import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';
import { ResponseDto } from '@core/models/ResponseDto';

export interface ConfirmationDto {
  field: string;
  value: string;
}



export interface AnalyticsAskRequest {
  pregunta: string;
  domain: string;
  userName: string;
  confirmations?: ConfirmationDto[];
  sessionId?: string;
}



@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly apiURL = environment.apiURL + 'analytics/ask';
  
    constructor(private httpClient: HttpClient) {}
  
    askQuestion(
      pregunta: string,
      domain: string,
      userName: string,
      sessionId?: string,
      confirmations?: ConfirmationDto[]
    ): Observable<ResponseDto> {
      const body: AnalyticsAskRequest = { pregunta, domain, userName, sessionId, confirmations };
      return this.httpClient.post<ResponseDto>(this.apiURL, body);
    }
}
