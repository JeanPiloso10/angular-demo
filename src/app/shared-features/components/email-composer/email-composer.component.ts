import { Component, Input, ViewChild, inject } from '@angular/core';
import { UsuariosService } from '../../../views/usuarios/usuarios.service'
import { cadenaErrores, parsearErrores } from '@shared/utilities/parsearErrores';
import {  ButtonModule,
          CardModule,
          FormModule,
          GridModule,
          ButtonGroupModule,
          BadgeModule,
          SpinnerModule} from '@coreui/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {FormValidationService} from '@core/services/form-validation.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, of, Subject, switchMap } from 'rxjs';
import { TourService } from '@app/core/services/tour.service';
import { DriveStep } from 'driver.js';
import { FilteringEventArgs, MultiSelectComponent, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SpinnerService } from '@core/services/spinner.service';
import { EmailService } from '@core/services/email.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
// import { ToolbarService, LinkService, HtmlEditorService, QuickToolbarService, RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';

import { ToolbarService, LinkService, ImageService, QuickToolbarService, HtmlEditorService, RichTextEditorComponent, RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';

declare var $: any;


@Component({
  selector: 'app-email-composer',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    ButtonGroupModule,
    BadgeModule,
    SpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelectModule,
    IconModule,
    RichTextEditorAllModule],
  providers: [{
          provide: IconSetService,
          useFactory: () => {
            const iconSet = new IconSetService();
            iconSet.icons = {
              ...iconSubset
            };
            return iconSet;
          }
        },
        ToolbarService,
        LinkService,
        HtmlEditorService,
        QuickToolbarService,
        ImageService],
  templateUrl: './email-composer.component.html',
  styleUrl: './email-composer.component.scss'
})
export class EmailComposerComponent {

  form: FormGroup;
  @Input() adjunto: { 
    to: [];
    subject: string;
    nombreArchivo: string; 
    archivo: any ;
    bodyHtml: string | null;
  } | null = null;
  @Input() cbUsuarios: any[] = [];
  @Input() titulo: string = "Enviar correo con reporte adjunto";
  @Input() subtitulo: string = "";
  public previsualizacionUrl: string | null = null;
  public loading = false;
  public box: string = 'Box';
  destinatarios: any[] = [];
  
  // Determina si el flujo es "Solicitar Información" según el título provisto
  private get isSolicitarInfo(): boolean {
    return (this.titulo || '').trim().toLowerCase() === 'solicitar información';
  }
  
  searchUsuarioTextChanged = new Subject<string>();
  isLoading = false;
  fieldsDestinatarios = { text: 'cnoEmail', value: 'email' };
  // @ViewChild('to') to!: ElementRef;
  @ViewChild('to', { static: false }) to: MultiSelectComponent;
  @ViewChild('bodyEditor', { static: false }) bodyEditor?: RichTextEditorComponent;
  toolbarSettings = {
    items: [
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', '|',
      'CreateLink', '|', 'SourceCode', 'FullScreen', '|', 'Undo', 'Redo'
    ]
  };

  constructor(private toastr : ToastrService,
              private formBuilder : FormBuilder,
              private validationService : FormValidationService,
              private userService : UsuariosService,
              private spinnerService : SpinnerService,
              private activeModal: NgbActiveModal,
              private usuarioService: UsuariosService,
              private emailService : EmailService,
              private tourService: TourService) {
    this.form = this.initForm();
  }

  
private initForm(): FormGroup {
  return this.formBuilder.group({
    from: ['',[Validators.required]],
    to: [[], [Validators.required]], 
    cc: [[]], 
    subject: ['', [Validators.required]], 
    body: [''],
  });
}

  ngOnInit() {

    this.initializeComponent();
}

private async initializeComponent() {

  try
  {
    this.debounceUsuario();
    await this.loadInitialData();

    if(this.adjunto.subject)
    {
      this.form.get("subject").patchValue(this.adjunto.subject);
    }

    let todos = [''];
    if (this.cbUsuarios && this.cbUsuarios.length > 0) {
        const valueKey = this.fieldsDestinatarios?.value ?? 'email'; // p.ej. 'username'
        todos = this.cbUsuarios
        .map((u: any) => typeof u === 'string' ? u : u?.[valueKey] ?? u?.username ?? u?.userName ?? null)
        .filter((x: any): x is string => !!x);
    }

    this.destinatarios = this.adjunto.to;
    if(this.destinatarios && this.destinatarios.length >0)
    {
       this.cbUsuarios = [...this.cbUsuarios, ...this.destinatarios];
    }
    this.form.get("to").patchValue(todos);
   
  } catch (error) {
    this.toastr.error(cadenaErrores(error));
  }
  
}

debounceUsuario() {
    this.searchUsuarioTextChanged.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      switchMap((query: any) => {
        if (query.length >= 3) {
          this.isLoading = true; // Indica que una petición está en curso
          return this.usuarioService.GetUserFilter(query).pipe(
            catchError((error: any) => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoading = false)
          );
        } 
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response) {
        if (response.isSuccess) {
          this.cbUsuarios = response.result.filter((u: any) => u.email && u.email.trim() !== "");

          if (this.destinatarios && this.destinatarios.length >0)
          {
            this.cbUsuarios = [...this.cbUsuarios, ...this.destinatarios];
          }
          
        } else {
          this.toastr.error(response.message || 'Error al cargar los usuarios.');
        }
      }
    });
}


async loadInitialData() {
   

  try {

    this.spinnerService.showGlobalSpinner();
    const responseEmail: any = await firstValueFrom( this.userService.getUserEmail());
    this.spinnerService.hideGlobalSpinner();
    this.form.get("from").patchValue(responseEmail.result);
    this.form.get("from").disable();

  } catch (error) {
    this.handleError(error);
  }

}

debouncedGetUsuario(event: FilteringEventArgs) {
  const query: string = event.text;
  if (query.length >= 3 && !this.isLoading) { // Solo emitir si no hay una petición en curso
    this.searchUsuarioTextChanged.next(query);
  }
}

private handleError(error: any) {
  this.spinnerService.hideGlobalSpinner();
  this.toastr.error(cadenaErrores(error));
}

ngAfterViewInit(): void {



   setTimeout(() => {

       if(this.cbUsuarios.length >0)
       {
         this.bodyEditor?.focusIn();
       }else{
          this.to.focusIn();
       }

        }, 100);
  
}


abrirFancyBox() {
  try
  {
    const pdfUrl = URL.createObjectURL(this.adjunto.archivo);
      $('#fancyboxLink').attr('href', pdfUrl);
      $.fancybox.open({
        src: pdfUrl,
        type: 'iframe'
      });
  }
  catch(error)
  {
    this.toastr.error(cadenaErrores(error));
  }
 
}

  async enviar() {

    if (this.form.invalid) {
        this.toastr.error("Por favor, completa todos los campos obligatorios.");
        return;
    }

    if(this.form.get('from')?.value == '')
    {
      this.toastr.error("No tiene relacionado su usuario del sistema con su cuenta de correo electrónico.");
      return;
    }

    this.loading = true;
    this.spinnerService.showGlobalSpinner();

    try {
        const formData = new FormData();
        const toEmails = this.form.get('to').value.filter((email: string) => email); // Filtrar nulos
        const ccEmails = this.form.get('cc').value.filter((email: string) => email); // Filtrar nulos

        // Agrega los campos de texto al FormData
        formData.append('from', this.form.get('from').value);
        

        toEmails.forEach((email: string) => formData.append('to', email));
        ccEmails.forEach((email: string) => formData.append('cc', email));

        formData.append('subject', this.form.get('subject').value);
       
        
        const bodyText = '<b>'+(this.form.get('body')?.value ?? '').toString().trim()+'</b>';
        const bodyHtml = (this.adjunto?.bodyHtml ?? '').toString().trim();

        // Si quieres respetar saltos del textarea como HTML:
        const bodyTextAsHtml = bodyText.replace(/\n/g, '<br/>');

        const mergedBody =
        bodyTextAsHtml && bodyHtml
          ? `${bodyTextAsHtml}<br/><br/>${bodyHtml}`
          : (bodyTextAsHtml || bodyHtml);

        formData.set('body', mergedBody);


        // Agrega el archivo adjunto al FormData
        if (this.adjunto?.archivo) {
            formData.append('attachments', this.adjunto.archivo, this.adjunto.nombreArchivo);
        }

        // Enviar la solicitud de correo usando el servicio de Email
        await firstValueFrom(this.emailService.enviarCorreo(formData));
        this.toastr.success('Correo enviado exitosamente');
        this.cerrar();
    } catch (error) {
        this.toastr.error('Error al enviar el correo');
        console.log(cadenaErrores(error));
    } finally {
        this.spinnerService.hideGlobalSpinner();
        this.loading = false;
    }
}

  cerrar() {
  if (this.previsualizacionUrl) {
    URL.revokeObjectURL(this.previsualizacionUrl); // Libera la URL al cerrar el modal
  }
  // Ensure any active tour is stopped when the modal closes
  this.tourService.destroy();
  this.activeModal.close();
}


  obtenerError(campoNombre: string): string {
		const campo = this.form.get(campoNombre);
		return campo ? this.validationService.obtenerMensajeError(campo) : '';
	}

  /**
   * Inicia el tour guiado del componente Email Composer
   */
  startTour(): void {
    const steps: DriveStep[] = [
      {
  element: '#emailComposerModal #emailComposerTitle',
        popover: {
          title: this.isSolicitarInfo ? 'Solicitar información por correo' : 'Enviar correo con adjunto',
          description: this.isSolicitarInfo
            ? 'Use este formulario para redactar y enviar una solicitud de información al destinatario.'
            : 'Aquí puede redactar y enviar correos, además de previsualizar el archivo adjunto antes de enviarlo.',
          side: 'bottom'
        }
      },
      {
  element: '#emailComposerModal #emailComposerModalBody #from',
        popover: {
          title: 'Remitente',
          description: 'Esta es su dirección configurada en el sistema. No es editable.',
          side: 'bottom'
        }
      },
      {
  element: '#emailComposerModal #emailComposerModalBody #to',
        popover: {
          title: 'Destinatarios',
          description: 'Escriba o busque direcciones. Puede seleccionar varios destinatarios y agregar direcciones personalizadas.',
          side: 'bottom'
        }
      },
      {
  element: '#emailComposerModal #emailComposerModalBody #subject',
        popover: {
          title: 'Asunto',
          description: 'Ingrese un asunto claro para el correo.',
          side: 'bottom'
        }
      },
      {
  element: '#emailComposerModal #emailComposerModalBody #body',
        popover: {
          title: 'Mensaje',
          description: this.isSolicitarInfo
            ? 'Redacte su solicitud de información de forma clara y concisa.'
            : 'Redacte el contenido del correo. Si corresponde, se añadirá el contenido del adjunto.',
          side: 'top'
        }
      },
      {
  element: '#emailComposerModal #emailComposerModalBody .btn-adjunto',
        popover: {
          title: 'Adjunto',
          description: 'Haga clic para previsualizar el archivo adjunto.',
          side: 'top'
        }
      },
      {
  element: '#emailComposerModal .modal-footer .btn-enviar',
        popover: {
          title: 'Enviar',
          description: 'Cuando todo esté listo, haga clic aquí para enviar el correo.',
          side: 'top'
        }
      },
      {
  element: '#emailComposerModal .modal-footer .btn-cerrar',
        popover: {
          title: 'Cerrar',
          description: 'Cierre el compositor cuando haya terminado.',
          side: 'top'
        }
      }
    ];

    // Si no hay adjunto o estamos en modo solicitud, omitimos el paso del adjunto
    const filteredSteps = (this.adjunto && this.adjunto.nombreArchivo && !this.isSolicitarInfo)
      ? steps
      : steps.filter(s => {
          const el: any = s.element as any;
          return !(typeof el === 'string' && el.includes('btn-adjunto'));
        });

    this.tourService.startTour(filteredSteps, {
      showProgress: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      onDestroyStarted: () => this.tourService.destroy()
    });
  }

}
