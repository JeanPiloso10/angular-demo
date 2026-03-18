import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-page500',
    templateUrl: './page500.component.html',
    styleUrls: ['./page500.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, InputGroupComponent, ButtonDirective]
})
export class Page500Component {

  constructor(private router: Router) { }

  navigate() {
    this.router.navigateByUrl("/");
 }

}
