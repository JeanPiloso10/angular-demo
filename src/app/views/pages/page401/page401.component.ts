import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, 
  InputGroupComponent, ButtonDirective, SpinnerModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-page401',
  templateUrl: './page401.component.html',
  styleUrl: './page401.component.scss',
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, InputGroupComponent, ButtonDirective, SpinnerModule, CommonModule]
})
export class Page401Component {

  loading:boolean = false;
  constructor(private router: Router) { }

  navigate() {
    this.router.navigateByUrl("/login");
  }

}
