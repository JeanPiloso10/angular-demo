import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


function esFechaValida(anio: number, mes: number, dia: number, fecha: Date): boolean {
  return fecha.getFullYear() === anio && fecha.getMonth() === mes && fecha.getDate() === dia;
}

export function validarFechaMenor(fecha: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let fechaActual = fecha;
    const today = new Date(fechaActual).setHours(0, 0, 0, 0); // Fecha actual sin hora
    const inputDate = control.value == null ? null : new Date(control.value).setHours(0, 0, 0, 0);
    if (inputDate == null) {
      return null
    } else {
      return inputDate < today ? { invalidDate: true } : null;
    }

  };
}

/**
 * Convierte un valor a Date SIN HORA (00:00:00), soportando:
 * - Date
 * - 'yyyy-MM-dd'
 * - 'dd/MM/yyyy' (como tu UX)
 *
 * Retorna null si el valor está vacío o no se puede convertir.
 */
export function convertirAFechaSinHora(valor: any): Date | null {
  if (!valor) return null;

  if (valor instanceof Date) {
    return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }

  const textoFecha = valor.toString().trim();
  if (!textoFecha) return null;

  // yyyy-MM-dd
  const formatoIso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const matchIso = textoFecha.match(formatoIso);
  if (matchIso) {
    const anio = +matchIso[1];
    const mes = +matchIso[2] - 1;
    const dia = +matchIso[3];
    const fecha = new Date(anio, mes, dia);
    if (!esFechaValida(anio, mes, dia, fecha)) return null;
    return fecha;
  }

  // dd/MM/yyyy
  const formatoLatam = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const matchLatam = textoFecha.match(formatoLatam);
  if (matchLatam) {
    const dia = +matchLatam[1];
    const mes = +matchLatam[2] - 1;
    const anio = +matchLatam[3];
    const fecha = new Date(anio, mes, dia);
    if (!esFechaValida(anio, mes, dia, fecha)) return null; // ← AQUÍ
    return fecha;
  }

  // último intento (si viene parseable)
  const fecha = new Date(textoFecha);
  if (isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/**
 * Compara dos fechas (sin hora) y retorna:
 *  -1 si fechaA < fechaB
 *   0 si fechaA === fechaB
 *   1 si fechaA > fechaB
 * Útil para validaciones de rango sin repetir getTime().
 */
export function compararFechas(fechaA: Date, fechaB: Date): number {
  const milisegundosFechaA = fechaA.getTime();
  const milisegundosFechaB = fechaB.getTime();

  if (milisegundosFechaA === milisegundosFechaB) return 0;
  return milisegundosFechaA < milisegundosFechaB ? -1 : 1;
}

/**
 * ✅ Valida que la FECHA del control NO sea menor a la fecha mínima.
 * Útil para: fechaDetalle >= fechaMin (ej: PeriodoDesdeCab).
 * Error: { fechaMinima: true }
 */
export function validarFechaNoMenorQue(fechaMinima: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fechaMin = convertirAFechaSinHora(fechaMinima);
    const fechaIngresada = convertirAFechaSinHora(control.value);
    if (!fechaMin || !fechaIngresada) return null;

    return compararFechas(fechaIngresada, fechaMin) < 0 ? { fechaMinima: true } : null;
  };
}

/**
 * ✅ Valida que la FECHA del control NO sea mayor a la fecha máxima.
 * Útil para: fechaDetalle <= fechaMax (ej: PeriodoHastaCab).
 * Error: { fechaMaxima: true }
 */
export function validarFechaNoMayorQue(fechaMaxima: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fechaMax = convertirAFechaSinHora(fechaMaxima);
    const fechaIngresada = convertirAFechaSinHora(control.value);
    if (!fechaMax || !fechaIngresada) return null;

    return compararFechas(fechaIngresada, fechaMax) > 0 ? { fechaMaxima: true } : null;
  };
}

/**
 * ✅ Valida que la FECHA del control esté dentro del rango [fechaMin, fechaMax].
 * Útil para: FechaDesdeDet y FechaHastaDet dentro del período de cabecera.
 *
 * Error:
 *  - { fechaFueraDeRango: 'min' } si es menor al mínimo
 *  - { fechaFueraDeRango: 'max' } si es mayor al máximo
 */
export function validarFechaEnRango(fechaMinima: any, fechaMaxima: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fechaMin = convertirAFechaSinHora(fechaMinima);
    const fechaMax = convertirAFechaSinHora(fechaMaxima);
    const fechaIngresada = convertirAFechaSinHora(control.value);
    if (!fechaMin || !fechaMax || !fechaIngresada) return null;

    if (compararFechas(fechaIngresada, fechaMin) < 0) return { fechaFueraDeRango: 'min' };
    if (compararFechas(fechaIngresada, fechaMax) > 0) return { fechaFueraDeRango: 'max' };
    return null;
  };
}

/**
 * ✅ Validador cruzado (FormGroup):
 * Valida que día, mes y año formen una fecha válida.
 * Si los tres campos están vacíos, no marca error.
 * Error: { fechaInvalida: true } — se asigna al campo 'dia' para mostrarlo en el template.
 */
export function validarFechaDiaMesAnio(
  campoDia: string,
  campoMes: string,
  campoAnio: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const controlDia = group.get?.(campoDia);
    const controlMes = group.get?.(campoMes);
    const controlAnio = group.get?.(campoAnio);

    const dia = controlDia?.value;
    const mes = controlMes?.value;
    const anio = controlAnio?.value;

    // Si los tres están vacíos, no validar
    if (dia == null && mes == null && anio == null) {
      controlDia?.setErrors(null);
      return null;
    }

    // Si alguno está vacío y otro no, fecha incompleta = inválida
    if (dia == null || mes == null || anio == null) {
      controlDia?.setErrors({ fechaInvalida: true });
      return { fechaInvalida: true };
    }

    const fecha = new Date(anio, mes - 1, dia);
    if (!esFechaValida(anio, mes - 1, dia, fecha)) {
      controlDia?.setErrors({ fechaInvalida: true });
      return { fechaInvalida: true };
    }

    // Limpiar error si antes existía
    if (controlDia?.hasError('fechaInvalida')) {
      controlDia.setErrors(null);
    }
    return null;
  };
}

/**
 * ✅ Validador cruzado (FormGroup):
 * Valida que la FECHA "Hasta" NO sea menor que la FECHA "Desde".
 * (Es decir: rango válido => Hasta >= Desde)
 *
 * Error: { fechaRangoInvalido: true }
 */
export function validarRangoFechasDesdeHasta(
  campoDesde: string,
  campoHasta: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const controlDesde = group.get?.(campoDesde);
    const controlHasta = group.get?.(campoHasta);

    const fechaDesde = convertirAFechaSinHora(controlDesde?.value);
    const fechaHasta = convertirAFechaSinHora(controlHasta?.value);

    // Si falta alguna fecha, no bloqueo aquí (lo maneja required en cada control)
    if (!fechaDesde || !fechaHasta) return null;

    return compararFechas(fechaHasta, fechaDesde) < 0
      ? { fechaRangoInvalido: true }
      : null;
  };
}




