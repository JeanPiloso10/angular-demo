import { Inject, Injectable, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ColorModeService } from '@coreui/angular';

@Injectable({
  providedIn: 'root'
})
export class ThemeSyncService {

  constructor(
    private colorModeService: ColorModeService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.syncWithThemeCss();
  }

  private syncWithThemeCss() {
    effect(() => {
      const mode = this.colorModeService.colorMode();

      const themeLinkId = 'syncfusion-theme';
      const head = this.document.head;
      const existingLink = this.document.getElementById(themeLinkId) as HTMLLinkElement;

      const newHref = mode === 'dark'
        ? 'assets/themes/ej2/bootstrap5-dark.css'
        : 'assets/themes/ej2/bootstrap5.css';

      if (existingLink) {
        existingLink.href = newHref;
      } else {
        const link = this.document.createElement('link');
        link.id = themeLinkId;
        link.rel = 'stylesheet';
        link.href = newHref;
        head.appendChild(link);
      }
    });
  }
}
