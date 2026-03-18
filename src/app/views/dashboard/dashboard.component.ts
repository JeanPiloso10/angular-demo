import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule]
})
export class DashboardComponent implements OnInit {

  

  ngOnInit(): void {

  }

}