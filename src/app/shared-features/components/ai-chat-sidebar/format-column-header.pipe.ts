import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatColumnHeader', standalone: true, pure: true })
export class FormatColumnHeaderPipe implements PipeTransform {
  transform(col: string): string {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
