import { Component, ElementRef, Optional, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '@core/services/ai-assistant.service';
import { ResponseDto } from '@core/models/ResponseDto';
import { SecurityService } from '@core/services/security.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatUIModule, UserModel, MessageModel, MessageSendEventArgs } from '@syncfusion/ej2-angular-interactive-chat';
import { firstValueFrom } from 'rxjs';
import { DataCacheService } from '@core/services/data-cache.service';
import { StorageType } from '@shared/enums/StorageType';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatUIModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss'],
})
export class AiAssistantComponent {

  @ViewChild('chatui') chatui: any;

  constructor(
    private ai: AiAssistantService,
    private security: SecurityService,
    private elRef: ElementRef,
    private cache: DataCacheService,
    @Optional() public activeModal: NgbActiveModal
  ) {}

  public user: UserModel = { id: this.security.getUserName?.() || 'usuario', user: this.security.getUserName?.() || 'usuario' };
  public messages: MessageModel[] = [
    {
      id: 'welcome',
      author: { id: 'assistant', user: 'Asistente' },
      text: 'Hola, ¿en qué puedo ayudarte?',
      timeStamp: new Date()
    }
  ];
  public loading = false;
  private cacheKey = '';

  close() {
    // Si se usa como modal de Ngb, cerrar; si está dentro de Syncfusion Dialog, se ignora
    this.activeModal?.close();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chatui.scrollToBottom();

      const textarea = this.elRef.nativeElement.querySelector('.e-chat-textarea');
      if (textarea) {
        textarea.focus();
      }
      // Intentar "linkificar" cualquier contenido ya renderizado (URLs y rutas #/...)
      this.linkifyRenderedMessages();
    }, 100);
  }

  ngOnInit() {
    // Recalcular usuario por si cambia y construir la clave de caché por usuario
    const userName = this.security.getUserName?.() || this.user.user || 'usuario';
    this.user = { id: userName, user: userName };
    this.cacheKey = `ai-assistant:messages:${this.user.id}`;

    // Intentar recuperar conversación previa de la sesión
    const cached = this.cache.getCache(this.cacheKey, StorageType.session) as MessageModel[] | null;
    if (cached && Array.isArray(cached) && cached.length) {
      this.messages = cached.map(m => ({
        ...m,
        // Asegurar que timeStamp sea Date
        timeStamp: m && (m as any).timeStamp ? new Date((m as any).timeStamp as any) : new Date()
      }));
      // Asegurar scroll al final cuando cargue el historial
      setTimeout(() => {
        this.chatui?.scrollToBottom?.();
        this.linkifyRenderedMessages();
      }, 0);
    }
  }

  async onMessageSend(args: MessageSendEventArgs) {
    const text = args?.message?.text?.trim();
    if (!text) return;

    // Añadir el mensaje del usuario al hilo
    this.messages = [
      ...this.messages,
      {
        id: `u-${Date.now()}`,
        author: { id: this.user.id, user: this.user.user },
        text,
        timeStamp: new Date()
      }
    ];
    // Persistir inmediatamente por si la página se cierra o navega
    this.persistMessages();

    this.loading = true;
    const userName = this.user.user || 'usuario';
    try {
      const resp: ResponseDto = await firstValueFrom(this.ai.askQuestion(text, userName));
      // Prefer the domain answer when success
      let display = '';
      if (resp?.isSuccess) {
        const result: any = resp?.result;
        const answer = result && typeof result === 'object' ? result?.answer : undefined;
        display = answer
          ?? resp?.naturalMessage
          ?? resp?.message
          ?? '';
      } else {
        display = resp?.message ?? resp?.naturalMessage ?? '';
      }

      // Normalizar pasos sin saltos de línea: insertar \n antes de "N. " para listas numeradas en línea
      display = this.normalizeStepList(display);

      this.messages = [
        ...this.messages,
        {
          id: `a-${Date.now()}`,
          author: { id: 'assistant', user: 'Asistente' },
          text: display,
          timeStamp: new Date()
        }
      ];
      this.persistMessages();
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Error al consultar el asistente');
      this.messages = [
        ...this.messages,
        {
          id: `e-${Date.now()}`,
          author: { id: 'assistant', user: 'Asistente' },
          text: msg,
          timeStamp: new Date()
        }
      ];
      this.persistMessages();
    } finally {
      this.loading = false;
      // Dar tiempo a que el chat renderice y luego "linkificar" el nuevo contenido
      setTimeout(() => this.linkifyRenderedMessages(), 50);
    }
  }

  // Guarda la conversación en sessionStorage restringiendo a las últimas N entradas
  private persistMessages(max: number = 200) {
    try {
      const pruned = this.messages.slice(-max);
      this.cache.setCache(this.cacheKey, pruned, StorageType.session);
    } catch {
      // Ignorar errores de cuota o serialización
    }
  }

  /**
   * Convierte URLs y rutas con hash (#/ruta) en enlaces clicables dentro de los mensajes ya renderizados.
   * Se aplica directamente al DOM del componente de chat para evitar escapes de HTML internos.
   */
  private linkifyRenderedMessages() {
    const root: HTMLElement = this.elRef.nativeElement as HTMLElement;
    if (!root) return;

    // Posibles contenedores de texto del mensaje (abarcamos varias clases utilizadas por Syncfusion)
    const selectors = [
      '.e-message-text',
      '.e-msg-text',
      '.e-message-content',
      '.e-msg-content',
      '.e-text',
    ].join(',');

    const nodes: NodeListOf<HTMLElement> = root.querySelectorAll(selectors);
    nodes.forEach(node => {
      if (!node || node.getAttribute('data-linked') === '1') return;
      const originalText = node.innerText || '';
      if (!originalText) return;

      const html = this.renderMarkdownHtml(originalText);
      if (html && html !== originalText) {
        node.innerHTML = html;
        node.setAttribute('data-linked', '1');
      }
    });

    // Delegar clicks en enlaces por seguridad y comportamiento consistente
    this.ensureClickDelegation();
  }

  // Renderiza un subconjunto seguro de Markdown (listas y saltos de línea) y aplica linkificación
  private renderMarkdownHtml(text: string): string {
    // Normalizar pasos en línea primero
    const normalized = this.normalizeStepList(text || '');
    // Escape general
    const escaped = this.escapeHtml(normalized);

    const lines = escaped.split(/\r?\n/);
    let html: string[] = [];
    let inOl = false;
    let inUl = false;

    const flushLists = () => {
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (inUl) { html.push('</ul>'); inUl = false; }
    };

    const linkifyEscaped = (s: string) => this.linkifyOnEscaped(s);

    for (const raw of lines) {
      const line = raw; // ya escapada
      const olMatch = /^\s*(\d+)\.\s+(.+)$/.exec(line);
      const ulMatch = /^\s*[-*+]\s+(.+)$/.exec(line);

      if (olMatch) {
        const content = linkifyEscaped(olMatch[2]);
        if (!inOl) { flushLists(); html.push('<ol>'); inOl = true; }
        html.push(`<li>${content}</li>`);
        continue;
      }
      if (ulMatch) {
        const content = linkifyEscaped(ulMatch[1]);
        if (!inUl) { flushLists(); html.push('<ul>'); inUl = true; }
        html.push(`<li>${content}</li>`);
        continue;
      }

      // Línea en blanco -> cerrar listas y agregar separación
      if (!line.trim()) {
        flushLists();
        html.push('');
        continue;
      }

      // Párrafo normal con linkificación y saltos de línea como <br>
      flushLists();
      html.push(`<div>${linkifyEscaped(line)}</div>`);
    }

    flushLists();
    // Unir y colapsar separadores vacíos
    const out = html.join('\n').replace(/\n{3,}/g, '\n\n');
    return out;
  }

  // Aplica linkificación sobre texto YA escapado
  private linkifyOnEscaped(safe: string): string {
    // 1) Reemplazar Markdown links con placeholders para evitar que URL/hash regex actúe dentro de href
    const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|#\/[^^\s)]+)\)/g;
    const anchorStore: string[] = [];
    let withPlaceholders = safe.replace(mdRegex, (_m, label: string, url: string) => {
      const { target, rel } = this.anchorAttrs(url);
      const anchor = `<a href="${this.escapeAttr(url)}" target="${target}" rel="${rel}">${this.escapeHtml(label)}</a>`;
      const idx = anchorStore.push(anchor) - 1;
      return `__ANCHOR_${idx}__`;
    });

    // 2) Auto-link URLs completas http(s) en el resto del texto
    const urlRegex = /((https?:\/\/[^\s<]+))/g;
    withPlaceholders = withPlaceholders.replace(urlRegex, (m: string) => {
      const { target, rel } = this.anchorAttrs(m);
      return `<a href="${this.escapeAttr(m)}" target="${target}" rel="${rel}">${m}</a>`;
    });

    // 3) Auto-link rutas hash internas #/...
    const hashRegex = /(^|[\s(])(#[^\s)]+)(?=$|[\s),.;!])/g;
    withPlaceholders = withPlaceholders.replace(hashRegex, (_full: string, prefix: string, route: string) => {
      const { target, rel } = this.anchorAttrs(route);
      return `${prefix}<a href="${this.escapeAttr(route)}" target="${target}" rel="${rel}">${route}</a>`;
    });

    // 4) Restaurar anchors de Markdown
    const restored = withPlaceholders.replace(/__ANCHOR_(\d+)__/g, (_m, i: string) => anchorStore[+i] || '');
    return restored;
  }

  // Inserta saltos de línea antes de "N. " cuando vienen pasos concatenados en una sola línea
  private normalizeStepList(text: string): string {
    if (!text) return text;
    // Solo si detecta al menos dos numeraciones
    const hasTwoSteps = /(\d+\.\s).*(\d+\.\s)/.test(text);
    if (!hasTwoSteps) return text;
    // Insertar salto de línea cuando hay espacio simple antes de N. (evita números decimales tipo 1.23 si no hay espacio)
    return text.replace(/\s(\d+\.\s)/g, '\n$1');
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttr(s: string): string {
    // Escapar solo lo necesario en atributos
    return s
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private anchorAttrs(href: string): { target: string; rel: string } {
    const isExternal = /^https?:\/\//i.test(href);
    // Para rutas internas con hash, abrimos en la misma pestaña; externas en nueva pestaña
    return isExternal
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : { target: '_self', rel: 'noopener noreferrer' };
  }

  // Asegura una única vez el delegado de clicks dentro del modal para manejar anchors
  private clickDelegationBound = false;
  private ensureClickDelegation() {
    if (this.clickDelegationBound) return;
    const root: HTMLElement = this.elRef.nativeElement as HTMLElement;
    const container = root.querySelector('.modal-body');
    if (!container) return;
    container.addEventListener('click', (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!href) return;
      // Dejar que el navegador maneje el comportamiento por defecto del anchor
      // pero aseguramos atributos de seguridad
      anchor.setAttribute('rel', 'noopener noreferrer');
      if (/^https?:\/\//i.test(href)) {
        anchor.setAttribute('target', '_blank');
      } else {
        anchor.setAttribute('target', '_self');
      }
    });
    this.clickDelegationBound = true;
  }
}
