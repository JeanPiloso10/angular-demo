import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class InternetQualityService {
  private testUrl = 'https://www.google.com/favicon.ico'; // URL pequeña para probar la latencia
  async measureLatency(): Promise<number> {
    const startTime = performance.now();
    try {
      await fetch(this.testUrl, { cache: 'no-store' });
      const endTime = performance.now();
      return endTime - startTime;
    } catch {
      return 1000; // Devuelve un RTT alto si no hay respuesta
    }
  }
}
