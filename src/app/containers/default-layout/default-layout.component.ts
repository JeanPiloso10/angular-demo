import { AfterViewInit, Component, DestroyRef, inject, OnDestroy, ViewChild , ElementRef, OnInit, ViewContainerRef} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { SpinnerService } from '@core/services/spinner.service'
import { IconDirective, IconSetService, IconModule } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ContainerComponent,
  INavData,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
  AlertModule,
  ButtonGroupModule,
  ButtonModule,
  FormModule as ForModuleCoreUI, 
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import { UsuariosService } from '../../views/usuarios/usuarios.service'
import { cilZoomIn, cilTrash, cilLibrary } from '@coreui/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuManagerService } from '@core/services/menu-manager.service';
import { iconSubset } from '@app/icons/icon-subset';
import { SwUpdate } from '@angular/service-worker';
import { AiChatSidebarComponent } from '@app/shared-features/components/ai-chat-sidebar/ai-chat-sidebar.component';
import { AiChatSidebarService } from '@app/core/services/ai-chat-sidebar.service';

declare var Tawk_API: {
  setAttributes?: (attrs: { name?: string; email?: string }, callback: (error: any) => void) => void;
  hideWidget?: () => void;
  showWidget?: () => void;
};


function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    RouterOutlet,
    ButtonGroupModule,
    ForModuleCoreUI,
    ButtonModule,
    DefaultFooterComponent,
    IconModule,
    AlertModule,
    AiChatSidebarComponent
  ],
  providers: [
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = {
          ...iconSubset
        };
        return iconSet;
      }
    }
  ]
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  
  updateAvailable = false;
  aiChatVisible = false;
  aiChatEnabled = false;
  private lastUpdateCheck = 0;
  private readonly UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutos mínimo entre verificaciones
  private visibilityHandler: (() => void) | null = null;
  private destroyRef = inject(DestroyRef);
  
  icons = { cilZoomIn, cilTrash, cilLibrary };
  navMenu! : any [];
  buscador = '';
  errores: string = '';
  filteredNavMenu: any [];
  busqueda: string = '';
  @ViewChild('overflow') sidebar!: any;
  @ViewChild('slideInContainer', { read: ViewContainerRef, static: true }) vcr!: ViewContainerRef;


  constructor(private updates: SwUpdate,
     private menuManagerService: MenuManagerService,
     private spinnerService: SpinnerService,
     private userService: UsuariosService,
     private aiChatSidebarService: AiChatSidebarService
  ) {

    this.spinnerService.createGlobalSpinner();

    // Suscribirse al estado del sidebar de IA
    this.aiChatSidebarService.visible$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
      this.aiChatVisible = v;
      // Ocultar/mostrar el widget de Tawk para que no interfiera con el chat de IA
      if (typeof Tawk_API !== 'undefined') {
        v ? Tawk_API.hideWidget?.() : Tawk_API.showWidget?.();
      }
    });

    // Suscribirse al permiso de acceso del sidebar de IA
    this.aiChatSidebarService.hasAccess$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
      this.aiChatEnabled = v;
    });
      
    // Suscribirse al observable para mantener actualizada la variable local
    this.menuManagerService.filteredNavMenu$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(navMenu => {
      this.filteredNavMenu = navMenu;
    });

    // Cargar el menú inicial
    this.menuManagerService.loadMenuUsuario();

    // Detectar cuando hay nueva versión de la app (nuevo deploy)
    if (this.updates.isEnabled) {
      this.updates.versionUpdates
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });

      // Verificar actualización cuando el usuario vuelve a la pestaña (throttled a 30 min)
      this.visibilityHandler = () => {
        const now = Date.now();
        if (document.visibilityState === 'visible' && 
            now - this.lastUpdateCheck > this.UPDATE_CHECK_INTERVAL) {
          this.lastUpdateCheck = now;
          this.updates.checkForUpdate();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

  }
  
  
  ngOnInit(): void {
    const interval = setInterval(() => {
      if (typeof Tawk_API !== 'undefined' && Tawk_API?.setAttributes) {
        var userName = this.userService.getUserName();
        Tawk_API.setAttributes(
          {
            name: userName
          },
          (error) => {
            if (error) {
              console.error('Error al asignar atributos:', error);
            }
          }
        );
  
        clearInterval(interval);
      }
    }, 1000);
  }


  reloadPage() {
    window.location.reload();
  }

  ngOnDestroy(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  onAiChatVisibleChange(visible: boolean): void {
    this.aiChatVisible = visible;
    this.aiChatSidebarService.setVisible(visible);
  }


  trackByMenuItem(index: number, item: any): string {
    return item.id || item.name; // Usa una propiedad única de cada elemento
  }

 filtrarMenu(query: string): void {
    // Llama al servicio para realizar el filtrado
    this.menuManagerService.filtrarMenu(query);
  }

  limpiarBusqueda(): void {
    this.menuManagerService.limpiarBusqueda();
  }


  async ngAfterViewInit() {    
  
  }


    onScrollbarUpdate($event: any) {
         if ($event.verticalUsed) {

    }
  }

}
