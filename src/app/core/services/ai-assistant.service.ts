import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';
import { ResponseDto } from '@core/models/ResponseDto';

export interface AskRequest {
  pregunta: string;
  userName: string;
  sessionId?: string;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private readonly apiURL = environment.apiURL + 'help/ask';

  constructor(private httpClient: HttpClient) {}

  askQuestion(pregunta: string, userName: string, sessionId?: string): Observable<ResponseDto> {
    const body: AskRequest = { pregunta, userName, sessionId };
    return this.httpClient.post<ResponseDto>(this.apiURL, body);
  }
}
