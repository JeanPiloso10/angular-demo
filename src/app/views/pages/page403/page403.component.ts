import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';

@Component({
  selector: 'app-page403',
  // standalone: true,
  templateUrl: './page403.component.html',
  styleUrl: './page403.component.scss',
  standalone:false
  // imports: [ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective]
})
export class Page403Component {

  constructor(private router: Router) { }
  
  navigate() {
    this.router.navigateByUrl("/");
 }

}
