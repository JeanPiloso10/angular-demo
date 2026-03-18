import { format } from 'date-fns';

/**
 * Formatea una fecha a la cadena de texto 'yyyy-MM-dd HH:mm:ss' en el huso horario especificado.
 * @param fecha La fecha a formatear.
 * @param timeZoneOffset El desplazamiento del huso horario en horas.
 * @returns La fecha formateada como una cadena de texto.
 */
export function formatearFecha(fecha: string | Date): string {
  const fechaLocal = parseFechaComoLocal(fecha);
  return format(fechaLocal, 'yyyy-MM-dd HH:mm:ss');
}

export function formatearFechaEstandard(fecha: Date): string {
  return format(fecha, 'dd/MM/yyyy HH:mm');
}

export function formatearSoloFechaEstandard(fecha: Date): string {
  return format(fecha, 'dd/MM/yyyy');
}

export function parseFechaComoLocal(fecha: string | Date): Date {
  // Si ya es Date, usar directamente
  if (fecha instanceof Date) return fecha;

  let fechaStr = typeof fecha === 'string' ? fecha : '';
  // Remove 'Z' if present
  if (fechaStr.endsWith('Z')) {
    fechaStr = fechaStr.slice(0, -1);
  }
  // Remove milliseconds if present
  if (fechaStr.includes('.')) {
    fechaStr = fechaStr.split('.')[0];
  }
  // Replace 'T' with space if present
  fechaStr = fechaStr.replace('T', ' ');
  // Try to split into date and time
  const parts = fechaStr.split(' ');
  if (parts.length !== 2) {
    // Fallback: try to parse with Date constructor
    const fallbackDate = new Date(fechaStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    // If still invalid, return current date as last resort
    return new Date();
  }
  const [datePart, timePart] = parts;
  const dateSplit = datePart.split('-');
  const timeSplit = timePart.split(':');
  if (dateSplit.length !== 3 || timeSplit.length < 2) {
    // Fallback: try to parse with Date constructor
    const fallbackDate = new Date(fechaStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    return new Date();
  }
  const [year, month, day] = dateSplit.map(Number);
  const [hour, minute, second] = [Number(timeSplit[0]), Number(timeSplit[1]), Number(timeSplit[2] || 0)];
  return new Date(year, month - 1, day, hour, minute, second);
}

export function parseaFecha(fecha: any): Date | null {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return fecha;
  }

  if (typeof fecha === 'string') {
    // Intentar parsear como "yyyy-MM-dd HH:mm:ss"
    const formato1 = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (formato1.test(fecha)) {
      const [datePart, timePart] = fecha.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    }

    // Intentar parsear como "dd/MM/yyyy HH:mm"
    const formato2 = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
    if (formato2.test(fecha)) {
      const [datePart, timePart] = fecha.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute);
    }

    // Si no coincide con los formatos esperados
    return null;
  }

  // Si no es ni Date ni string
  return null;
}

/**
 * Obtiene la fecha y hora actual ajustada a la zona horaria -5.
 * @returns La fecha ajustada como una cadena de texto.
 */
export function obtenerFechaEnHusoHorarioMinus5(dias: number = 0): string {
  const currentOffset = new Date().getTimezoneOffset() / -60;
  const targetOffset = -5;

  const date = new Date();
  const adjustedDate = new Date(date.getTime() + (targetOffset - currentOffset) * 60 * 60 * 1000);

  // Sumar o restar días si se especifica
  adjustedDate.setDate(adjustedDate.getDate() + dias);

  return formatearFecha(adjustedDate);
}


// Extraer el año actual de la fecha ajustada
export function obtenerAnioEnHusoHorarioMinus5(): number {
  const currentOffset = new Date().getTimezoneOffset() / -60;
  const targetOffset = -5;

  const date = new Date();
  const adjustedDate = new Date(date.getTime() + (targetOffset - currentOffset) * 60 * 60 * 1000);

  return adjustedDate.getFullYear();
}

/**
 * Obtiene la fecha y hora actual como objeto Date ajustado a la zona horaria -5.
 * Útil cuando se necesita un Date (no string) en -5 para timestamps, auditoría, etc.
 */
export function obtenerDateEnHusoHorarioMinus5(): Date {
  const currentOffset = new Date().getTimezoneOffset() / -60;
  const targetOffset = -5;
  const date = new Date();
  return new Date(date.getTime() + (targetOffset - currentOffset) * 60 * 60 * 1000);
}