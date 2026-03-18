import { Injectable } from '@angular/core';
import { UsuariosService } from '@app/views/usuarios/usuarios.service';
import { INavData } from '@coreui/angular';
import { BehaviorSubject } from 'rxjs';
import { SecurityService } from './security.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MenuManagerService {

  private navMenuSource = new BehaviorSubject<INavData[]>([]);
  navMenu$ = this.navMenuSource.asObservable();

  private filteredNavMenuSource = new BehaviorSubject<INavData[]>([]);
  filteredNavMenu$ = this.filteredNavMenuSource.asObservable();

  private busquedaSource = new BehaviorSubject<string>('');
  busqueda$ = this.busquedaSource.asObservable();

  constructor(private userService: UsuariosService,
              private securityService: SecurityService,
              private router: Router
  ) {}

  async loadMenuUsuario() {

    if(!this.securityService.isLoggedIn()){
      this.router.navigate(['/401']);
      return;
    }

    this.userService.getMenuUsuario().subscribe({
      next: (respuesta) => {
        const navMenu = this.mapToNavData(respuesta.body);
        this.navMenuSource.next(navMenu);
        this.filteredNavMenuSource.next([...navMenu]);
      },
      error: (errores) => {
        console.error('Error loading menu:', errores);
      },
    });
  }

  filtrarMenu(query: string): void {
    const navMenu = this.navMenuSource.getValue();
    if (!query) {
      this.filteredNavMenuSource.next([...navMenu]);
      return;
    }

    query = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredMenu = navMenu
      .map(item => this.filtrarItem(item, query))
      .filter(item => item !== null) as INavData[];

    this.filteredNavMenuSource.next(filteredMenu);
  }

  limpiarBusqueda(): void {
    const navMenu = this.navMenuSource.getValue();
    this.busquedaSource.next('');
    this.filteredNavMenuSource.next([...navMenu]);
  }

  private filtrarItem(item: INavData, query: string): INavData | null {
    const itemName = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasMatchingName = itemName.includes(query);

    const filteredChildren = item.children
      ? item.children.map(child => this.filtrarItem(child, query)).filter(child => child !== null)
      : [];

    if(filteredChildren)
    {
      if (hasMatchingName || filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        };
      }
    }
  

    return null;
  }

  private mapToNavData(menuItems: any[]): INavData[] {
    return menuItems.map((item, index) => {
      const mappedItem: INavData = {
        name: item.name,
        url: item.url && item.url !== '#' ? item.url : '/',
        iconComponent: item.iconComponent ? { name: item.iconComponent.name } : undefined,
        icon: item.icon,
      };

        if (item.children && item.children.length > 0) {
          mappedItem.iconComponent = item.iconComponent
            ? { name: item.iconComponent.name }
            : { name: item.icon };
        } else {
          if (item.iconComponent) {
            mappedItem.iconComponent = { name: item.iconComponent.name };
          } else if (item.icon) {
            mappedItem.icon = item.icon;
          }
        }

        const children = item.children && item.children.length > 0 ? this.mapToNavData(item.children) : null;
        if (children) {
          mappedItem.children = children;
        }

        return mappedItem.url || (mappedItem.children && mappedItem.children.length > 0) ? mappedItem : null;
      })
      .filter(item => item !== null) as INavData[];
  }

  getLeafNodes(): any[] {
    const leafNodes: any[] = [];
    const menu = this.filteredNavMenuSource.getValue();

    function traverse(node: INavData, parentName: string) {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, parentName));
      } else {
        leafNodes.push({
          parentName,
          name: node.name,
          url: node.url,
        });
      }
    }

    menu.forEach(item => traverse(item, item.name));

    return leafNodes;
  }
}
