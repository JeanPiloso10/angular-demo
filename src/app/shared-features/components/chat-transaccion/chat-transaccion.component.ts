import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, OnInit, ViewChild, NgModule, ElementRef } from '@angular/core';
import { ChatUIModule, UserModel, MessageModel, MessageSendEventArgs } from '@syncfusion/ej2-angular-interactive-chat';
import { firstValueFrom } from 'rxjs';
import { ChatTransaccionService } from '@core/services/chat-transaccion.service';
import { SecurityService } from '@app/core/services/security.service';
import { ButtonGroupModule, ButtonModule } from '@coreui/angular';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chat-transaccion',
  imports: [ FormsModule, ReactiveFormsModule, ChatUIModule, ButtonGroupModule, ButtonModule ],
  templateUrl: './chat-transaccion.component.html',
  styleUrl: './chat-transaccion.component.scss'
})
export class ChatTransaccionComponent implements OnInit {

  @Input() codigoTransaccion!: string;
  @Input() identificacionPrincipal!: string;
  @Input() idSucursal!: number | null;
  @Input() titulo!: string;

  @ViewChild('chatui') chatui: any;
  public idChat!: number;
  public user: UserModel;
  public messages: MessageModel[] = [];

  constructor(
    private chatTransaccionService: ChatTransaccionService,
    private securityService: SecurityService,
    private activeModal : NgbActiveModal,
    private elRef: ElementRef
  ) {
    this.user = { id: this.securityService.getUserName(), user: this.securityService.getUserName() };
  }

  async ngOnInit() {
    await this.loadMessages();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chatui.scrollToBottom();

      const textarea = this.elRef.nativeElement.querySelector('.e-chat-textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  async loadMessages() {

  const request = {
    idChat: this.idChat, // puede venir null inicialmente
    codigoTransaccion: this.codigoTransaccion,
    identificacionPrincipal: this.identificacionPrincipal.toString(), // importante: siempre string
    idSucursal: this.idSucursal,
    author: this.user.user
  };


  const response = await firstValueFrom(this.chatTransaccionService.obtenerChatPorTransaccion(request));

  if (!response?.isSuccess || !response.result) {
    console.error('Error al obtener chat:', response?.message);
    return;
  }
  console.log('Chat obtenido:', response);

  const chat = response.result;
  this.idChat = chat?.idChat;
  this.messages = (chat?.chatMensajeTransaccion ?? []).map((m: any) => ({
    id: m.idMensaje.toString(),
    author: { id: m.author, user: m.author },
    text: m.text,
    timeStamp: new Date(m.timeStamp),
    status: m.status ? { text: m.status } : undefined,
    isPinned: m.isPinned,
    replyTo: m.replyToMessageId?.toString()
  }));
    
// (No replacement lines; the block is removed entirely)

  }


   async onMessageSend(args: MessageSendEventArgs) {
    await firstValueFrom(this.chatTransaccionService.crearMensaje({
      idChat: this.idChat,
      codigoTransaccion: this.codigoTransaccion,
      identificacionPrincipal: this.identificacionPrincipal.toString(),
      idSucursal: this.idSucursal,
      author: this.user.user,
      text: args.message.text,
      // replyToMessageId: args.message.replyTo ? parseInt(args.message.replyTo.messageID) : null
    }));

    await this.loadMessages();
  }

      
  cerrar() {
    this.activeModal.close();
  }
  
}
