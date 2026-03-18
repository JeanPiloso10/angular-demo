import { HttpErrorResponse } from '@angular/common/http';

export function parsearErrores(response: any): string[] {

  const resultado: string[] = [];

  if (response.status && response.status == 0){ //or whatever condition you like to put
    resultado.push('No hay comunicación con el servidor');
    return resultado;
  }
  

  if (response instanceof ErrorEvent) {
    // Cliente o error de red
    resultado.push(`Error: ${response.error.message}`);
  } else if (response instanceof HttpErrorResponse) {
    // Error de backend
    if (response.error instanceof ErrorEvent) {
      resultado.push(`Error: ${response.error.message}`);
    } else if (typeof response.error === 'string') {
      resultado.push(response.error);
    } else if (response.error && typeof response.error === 'object') {
      if (response.error.message) {
        resultado.push(response.error.message);
      } else if (response.error.errors) {
        // Suponiendo que response.error.errors puede ser un objeto con claves que contienen arrays de strings
        Object.values(response.error.errors).forEach((val) => {
          if (Array.isArray(val)) {
            val.forEach((error) => resultado.push(error));
          }
        });
      }
    } else if (typeof response.message === 'string') {
      resultado.push(response.message);
    }
  } else if (typeof response === 'string') {
    // Directamente un mensaje de error
    resultado.push(response);
  } 
   // Verifica si la respuesta es un Error y tiene un mensaje formateado como esperas
   else if (response instanceof Error) {
    resultado.push(response.message);
    return resultado;
  }
  
  else {
    // Formato desconocido o un tipo de error no manejado
    resultado.push('Ocurrió un error desconocido.');
  }

  return resultado;
}

  export function cadenaErrores(response: any): string {
    const resultado: string[] = parsearErrores(response);
     // Unimos todos los mensajes de error en un único string, separados por un caracter específico, p.ej., una coma y un espacio.
    return resultado.join(', ');
  };