import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './containers/default-layout';
import { LoginComponent } from './views/pages/login/login.component';
import { VerifyTwoFactorAuthComponent } from './views/pages/verify-two-factor-auth/verify-two-factor-auth.component';
import { VerifyAlternativeAuthComponent } from './views/pages/verify-alternative-auth/verify-alternative-auth.component';
import { ForgotPasswordComponent } from './views/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './views/pages/reset-password/reset-password.component';
import { ConfirmEmailComponent } from './views/pages/confirm-email/confirm-email.component';
import { MicrosoftAuthComponent } from './views/pages/microsoft-auth/microsoft-auth.component'
import { AprobarEmailComponent } from './views/pages/aprobar-email/aprobar-email.component';
import { Page401Component } from './views/pages/page401/page401.component';
import { Page403Component } from './views/pages/page403/page403.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { AuthGuard } from '../app/core/guards/auth.guard';
import { MenuUsuarioComponent } from './views/pages/menu-usuario/menu-usuario.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Home'
    },
    children: [
      
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/pages.module').then((m) => m.PagesModule)
      },  
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'usuario',
        loadChildren: () => import('./views/usuarios/usuarios.module').then((m) => m.UsuariosModule)
      },
      {
        path: 'rol',
        loadChildren: () => import('./views/roles/roles.module').then((m) => m.RolesModule)
      },
      {
        path: 'menu',
        loadChildren: () => import('./views/menu/menu.module').then((m) => m.MenuModule)
      },
      {
        path: 'geolocalizacion',
        loadChildren: () => import('./views/geolocalizacion/routes').then((m) => m.routes)
      },
      {
        path: 'pais',
        loadChildren: () => import('./views/paises/paises.module').then((m) => m.PaisesModule)
      },
      {
        path: 'provincia',
        loadChildren: () => import('./views/provincias/provincias.module').then((m) => m.ProvinciasModule)
      },
      {
        path: 'ciudad',
        loadChildren: () => import('./views/ciudades/ciudades.module').then((m) => m.CiudadesModule)
      },
      {
        path: 'puerto',
        loadChildren: () => import('./views/puertos/puertos.module').then((m) => m.PuertosModule)
      },
      {
        path: 'operacion',
        loadChildren: () => import('./views/operacion/operacion.module').then((m) => m.OperacionModule)
      },
      {
        path: 'transaccion',
        loadChildren: () => import('./views/transaccion/transaccion.module').then((m) => m.TransaccionModule)
      },
      {
        path: 'operaciontransaccion',
        loadChildren: () => import('./views/operacion-transaccion/operacion-transaccion.module').then((m) => m.OperacionTransaccionModule)
      },
      {
        path: 'permisorol',
        loadChildren: () => import('./views/permiso-rol/permiso-rol.module').then((m) => m.PermisoRolModule)
      }
      ,
      {
        path: 'gestionaccesos',
        loadChildren: () => import('./views/gestion-accesos/gestion-accesos.module').then((m) => m.GestionAccesosModule)
      }, 
      {
        path: 'configuraciones',
        loadChildren: () => import('./views/configuracion/configuracion.module').then((m) => m.ConfiguracionModule)
      },
      {
        path: 'configuracionpersonalizada',
        loadChildren: () => import('./views/configuracion-personalizada/configuracion-personalizada.module').then((m) => m.ConfiguracionPersonalizadaModule)
      }
      ,
      {
        path: 'configuracionfirma',
        loadChildren: () => import('./views/configuracion-firma/configuracion-firma.module').then((m) => m.ConfiguracionFirmaModule)
      }
      ,
      {
        path: 'reporte',
        loadChildren: () => import('./views/reporte/reporte.module').then((m) => m.ReporteModule)
      }
      ,
      {
        path: 'notificaciones',
        loadChildren: () => import('./views/notificaciones-push/notificaciones-push.module').then((m) => m.NotificacionesPushModule)
      },
      {
        path: 'tipoArchivoAnexo',
        loadChildren: () => import('./views/tipo-archivo-anexo/tipo-archivo-anexo.module' ).then((m) => m.TipoArchivoAnexoModule)
      },
      {
        path: 'tipoArchivoAnexoTransaccion',
        loadChildren: () => import('./views/tipo-archivo-anexo-transaccion/tipo-archivo-anexo-transaccion.module' ).then((m) => m.TipoArchivoAnexoTransaccionModule)
      },
      {
        path: 'motivoAuditoria',
        loadChildren: () => import('./views/motivo-auditoria/motivo-auditoria.module' ).then((m) => m.MotivoAuditoriaModule)
      },
      {
        path: 'motivoAuditoriaTransaccion',
        loadChildren: () => import('./views/motivo-auditoria-transaccion/motivo-auditoria-transaccion.module' ).then((m) => m.MotivoAuditoriaTransaccionModule)
      },
      {
        path: 'area',
        loadChildren: () => import('./views/area/area.module' ).then((m) => m.AreaModule)
      },
      {
        path: 'categoriaCompra',
        loadChildren: () => import('./views/categoria-compra/categoria-compra.module' ).then((m) => m.CategoriaCompraModule)
      },
      {
        path: 'errorlog',
        loadChildren: () => import('./views/errorlog/errorlog.module' ).then((m) => m.ErrorlogModule)
      },
      {
        path: 'notificacionOperacionTransaccion',
        loadChildren: () => import('./views/notificacion-operacion-transaccion/notificacion-operacion-transaccion.module').then((m) => m.NotificacionOperacionTransaccionModule)
      },
      {
        path: 'ai-assistants',
        loadChildren: () => import('./views/ai-assistants/routes').then((m) => m.routes)
      },
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    //canActivate: [LoggedInGuard], // Utiliza el nuevo guard aquí
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'verify-2fa',
    component: VerifyTwoFactorAuthComponent,
    data: {
      title: 'Verificar Autenticación 2F'
    }
  },
  {
    path: 'menu-usuario',
    canActivate: [AuthGuard],
    component: MenuUsuarioComponent,
    //canActivate: [LoggedInGuard], // Utiliza el nuevo guard aquí
    data: {
      title: 'Menú de Usuario'
    }
  },
  {
    path: 'verify-alternative-auth',
    component: VerifyAlternativeAuthComponent,
    data: {
      title: 'Verificar Código Alternativo 2F'
    }
  },
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent,
    data: {
      title: 'Confirmación de Correo Electrónico'
    }
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: {
      title: 'Olvidé mi contraseña'
    }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: {
      title: 'Resetear Contraseña'
    }
  },
  {
    path: 'microsoft-auth',
    component: MicrosoftAuthComponent,
    data: {
      title: 'Microsoft Authentication'
    }
  },
  {
    path: '401',
    component: Page401Component,
    data: {
      title: 'Error 401'
    }
  },
  {
    path: '403',
    component: Page403Component,
    data: {
      title: 'Error 403'
    }
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Error 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Error 500'
    }
  },
  {
    path: 'aprobar-email',
    component: AprobarEmailComponent,
    data: { title: 'Aprobar Email' }
  },
  { path: '**', redirectTo: 'dashboard' , pathMatch: 'full'}
];