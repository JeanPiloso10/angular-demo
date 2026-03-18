import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatCellValue', standalone: true, pure: true })
export class FormatCellValuePipe implements PipeTransform {
  transform(value: any): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return value.toLocaleString('es-HN');
      }
      return value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(value);
  }
}
