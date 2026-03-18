import { Component, effect, Inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { environment } from '@environment/environment';
import { SecurityService } from './core/services/security.service';
import { ColorMode, ColorModeService } from '@coreui/angular';
import { DOCUMENT } from '@angular/common';

declare var Tawk_API: any;

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Wave ERP';
  private mql: MediaQueryList | null = null;

  // handler tipado y estable para add/remove
  private readonly mqlChangeHandler = () => {
    if (this.colorModeService.colorMode() === 'auto') {
      this.applyTheme('auto');
    }
  };

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private securityService: SecurityService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: Document,
    private colorModeService: ColorModeService
  ) {
    this.titleService.setTitle(this.getMainTitle());
    this.iconSetService.icons = { ...iconSubset };

    // aplicar tema inicial inmediatamente
    this.applyTheme(this.colorModeService.colorMode());

    // reaccionar a futuros cambios del signal
    effect(() => {
      const mode = this.colorModeService.colorMode();
      this.applyTheme(mode);
    });

    // re-evaluar si el sistema cambia (solo relevante cuando el modo es 'auto')
    this.mql = window.matchMedia('(prefers-color-scheme: dark)');

    // moderno
    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', this.mqlChangeHandler);
    } else {
      // fallback Safari legacy
      this.mql.addListener(this.mqlChangeHandler);
    }
  }

  ngOnInit(): void {
    // Refuerza atributos de idioma y desactiva traducción automática
    this.renderer.setAttribute(this.doc.documentElement, 'lang', 'es');
    this.renderer.setAttribute(this.doc.documentElement, 'translate', 'no');
    this.doc.documentElement.classList.add('notranslate');
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }

  ngOnDestroy(): void {
    if (!this.mql) return;

    if (this.mql.removeEventListener) {
      this.mql.removeEventListener('change', this.mqlChangeHandler);
    } else {
      this.mql.removeListener(this.mqlChangeHandler);
    }
  }

  private applyTheme(mode: ColorMode) {
    const resolved =
      mode === 'auto'
        ? (this.colorModeService.getPrefersColorScheme?.() ?? 'light')
        : (mode ?? 'light');

    this.renderer.setAttribute(this.doc.documentElement, 'data-coreui-theme', resolved);
  }

  private getMainTitle(): string {
    if (!environment.production) {
      return this.title += ' - [' + environment.name +']';
    }
    return this.title;
  }
}
