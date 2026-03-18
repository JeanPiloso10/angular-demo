import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatUIModule, MessageModel, MessageSendEventArgs, UserModel } from '@syncfusion/ej2-angular-interactive-chat';
import { AnalyticsService } from './analytics.service';
import { ResponseDto } from '@core/models/ResponseDto';
import { SecurityService } from '@core/services/security.service';
import { DataCacheService } from '@core/services/data-cache.service';
import { firstValueFrom } from 'rxjs';
import { StorageType } from '@shared/enums/StorageType';

@Component({
  selector: 'app-analytics-assistant',
  imports: [CommonModule, FormsModule, ChatUIModule],
  templateUrl: './analytics-assistant.component.html',
  styleUrl: './analytics-assistant.component.scss'
})
export class AnalyticsAssistantComponent {

  @Input() domain: string = 'ventas';

  @ViewChild('chatui') chatui: any;

  constructor(
    private analytics: AnalyticsService,
    private security: SecurityService,
    private cache: DataCacheService,
    private elRef: ElementRef
  ) {}

  public user: UserModel = { id: this.security.getUserName?.() || 'usuario', user: this.security.getUserName?.() || 'usuario' };
  public messages: MessageModel[] = [
    {
      id: 'welcome',
      author: { id: 'assistant', user: 'Analytics' },
      text: 'Hola, pregúntame sobre tus datos (por ejemplo: "¿Cuál es el precio promedio por talla en 2025 por mes?")',
      timeStamp: new Date()
    }
  ];
  public loading = false;
  private cacheKey = '';
  private lastQuestion: string = '';

  // Último resultado estructurado para render amigable
  public lastResult: any = null;
  public lastPlan: any = null;
  public lastRows: any[] = [];
  public lastColumns: string[] = [];

  // Confirmaciones pendientes/sugerencias
  public suggestions: Array<any> = [];
  public confirmations: { field: string; value: string }[] = [];

  ngOnInit() {
    const userName = this.security.getUserName?.() || this.user.user || 'usuario';
    this.user = { id: userName, user: userName };
    this.cacheKey = `analytics-assistant:messages:${this.user.id}:${this.domain}`;

    const cached = this.cache.getCache(this.cacheKey, StorageType.session) as MessageModel[] | null;
    if (cached && Array.isArray(cached) && cached.length) {
      this.messages = cached.map(m => ({ ...m, timeStamp: m && (m as any).timeStamp ? new Date((m as any).timeStamp as any) : new Date() }));
      setTimeout(() => this.chatui?.scrollToBottom?.(), 0);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chatui?.scrollToBottom?.();
      const textarea = this.elRef.nativeElement.querySelector('.e-chat-textarea');
      if (textarea) textarea.focus();
    }, 100);
  }

  async onMessageSend(args: MessageSendEventArgs) {
    const text = args?.message?.text?.trim();
    if (!text) return;

    this.appendUserMessage(text);
    this.persistMessages();

    this.loading = true;
    const userName = this.user.user || 'usuario';
    try {
      this.lastQuestion = text;
      const resp: ResponseDto = await firstValueFrom(this.analytics.askQuestion(text, this.domain, userName, undefined, this.confirmations?.length ? this.confirmations : undefined));
      // Preparar panel visual
      this.prepareVisualStateFromResponse(resp);
      const display = this.formatAnalyticsResponse(resp);
      this.appendAssistantMessage(display);
      this.persistMessages();
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Error al consultar analytics');
      this.appendAssistantMessage(msg);
      this.persistMessages();
    } finally {
      this.loading = false;
      setTimeout(() => this.chatui?.scrollToBottom?.(), 50);
    }
  }

  private appendUserMessage(text: string) {
    this.messages = [
      ...this.messages,
      { id: `u-${Date.now()}`,
        author: { id: this.user.id, user: this.user.user },
        text,
        timeStamp: new Date()
      }
    ];
  }

  private appendAssistantMessage(text: string) {
    this.messages = [
      ...this.messages,
      {
        id: `a-${Date.now()}`,
        author: { id: 'assistant', user: 'Analytics' },
        text,
        timeStamp: new Date()
      }
    ];
  }

  private persistMessages(max: number = 200) {
    try {
      const pruned = this.messages.slice(-max);
      this.cache.setCache(this.cacheKey, pruned, StorageType.session);
    } catch { /* ignore quota errors */ }
  }

  private formatAnalyticsResponse(resp: ResponseDto): string {
    if (!resp) return 'Sin respuesta';
    if (!resp.isSuccess) return resp.message || resp.naturalMessage || 'La consulta no fue exitosa';

    const result: any = resp.result || {};

    const resumen = result?.resumen ? `Resumen: ${result.resumen}` : '';
    const plan = result?.plan || {};
    const dims = Array.isArray(plan.dimensions) ? plan.dimensions.join(', ') : '';
    const meas = Array.isArray(plan.measures) ? plan.measures.join(', ') : '';
    const range = plan?.dateRange ? `${plan.dateRange.from || ''} → ${plan.dateRange.to || ''}` : '';
    const planLine = [dims && `Dimensiones: ${dims}`, meas && `Medidas: ${meas}`, range && `Rango: ${range}`]
      .filter(Boolean)
      .join('\n');

    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const preview = rows.slice(0, 10)
      .map((r: any) => {
        const keys = Object.keys(r);
        return keys.map(k => `${k}: ${r[k]}`).join(' — ');
      })
      .join('\n');

    const more = rows.length > 10 ? `\n… (${rows.length - 10} filas más)` : '';

    const pieces = [resumen, planLine, preview + more].filter(Boolean);
    return pieces.join('\n\n');
  }

  // Construye estado para el panel visual (tabla/plan/sugerencias)
  private prepareVisualStateFromResponse(resp: ResponseDto) {
    // Reset básicas
    this.lastResult = null;
    this.lastPlan = null;
    this.lastRows = [];
    this.lastColumns = [];
    this.suggestions = [];
    // No limpiamos confirmations aquí; se mantienen si el server pide confirmaciones

    if (!resp) return;
    const result: any = resp.result || {};
    this.lastResult = result || null;
    this.lastPlan = result?.plan || null;

    // Sugerencias/confirmaciones
    if (Array.isArray(result?.suggestions) && result.suggestions.length) {
      this.suggestions = result.suggestions;
      // Inicializar confirmations con lo elegido si viene (chosen)
      this.confirmations = this.suggestions.map(s => ({ field: s.field, value: s.chosen || '' }));
    } else {
      // Si no hay sugerencias, limpiamos confirmaciones anteriores
      this.confirmations = [];
    }

    // Filas y columnas
    const rows: any[] = Array.isArray(result?.rows) ? result.rows : [];
    this.lastRows = rows;
    if (rows && rows.length) {
      const first = rows[0];
      this.lastColumns = Object.keys(first);
    }
  }

  // Cambia la selección de un candidato para un campo
  public chooseCandidate(field: string, value: string) {
    const idx = this.confirmations.findIndex(c => c.field === field);
    if (idx >= 0) this.confirmations[idx].value = value;
    else this.confirmations.push({ field, value });
  }

  // Actualiza confirmación manual (input)
  public updateConfirmation(field: string, value: string) {
    this.chooseCandidate(field, value);
  }

  public getConfirmationValue(field: string): string {
    return this.confirmations.find(x => x.field === field)?.value || '';
  }

  public isChosen(field: string, candidate: string): boolean {
    return (this.confirmations.find(x => x.field === field)?.value || '') === candidate;
  }

  // Re-ejecutar con confirmaciones actuales y misma pregunta
  public async runWithConfirmations() {
    if (!this.lastQuestion) return;
    this.loading = true;
    const userName = this.user.user || 'usuario';
    try {
      const resp: ResponseDto = await firstValueFrom(this.analytics.askQuestion(
        this.lastQuestion,
        this.domain,
        userName,
        undefined,
        this.confirmations?.length ? this.confirmations : undefined
      ));
      this.prepareVisualStateFromResponse(resp);
      const display = this.formatAnalyticsResponse(resp);
      this.appendAssistantMessage(display);
      this.persistMessages();
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Error al ejecutar con confirmaciones');
      this.appendAssistantMessage(msg);
      this.persistMessages();
    } finally {
      this.loading = false;
      setTimeout(() => this.chatui?.scrollToBottom?.(), 50);
    }
  }
}
