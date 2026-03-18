import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';


export const routes: Routes = [
 {
    path: '',
    data: { title: 'AI Assistants' },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'analytics',
        loadComponent:()=> import('./analytics-assistant/analytics-assistant.component').then(m=>m.AnalyticsAssistantComponent),
        data: { title: 'Analytics Assistant' }
      }
    ]
  }
];