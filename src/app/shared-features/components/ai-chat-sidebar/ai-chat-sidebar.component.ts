import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, ConfirmationDto } from '@app/views/ai-assistants/analytics-assistant/analytics.service';
import { ResponseDto } from '@core/models/ResponseDto';
import { SecurityService } from '@core/services/security.service';
import { DataCacheService } from '@core/services/data-cache.service';
import { firstValueFrom } from 'rxjs';
import { StorageType } from '@shared/enums/StorageType';
import {
  OffcanvasModule,
} from '@coreui/angular';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { AiChatSidebarService } from '@core/services/ai-chat-sidebar.service';
import { obtenerDateEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { FormatCellValuePipe } from './format-cell-value.pipe';
import { FormatColumnHeaderPipe } from './format-column-header.pipe';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  rows?: any[];
  columns?: string[];
  plan?: any;
  suggestions?: any[];  // disambiguation candidates from backend
  mode?: string;        // greeting, conversational, suggestion_list, etc.
  chartSpec?: any;      // Vega-Lite spec for chart rendering
  fileExport?: {        // CSV or Excel export data
    fileName: string;
    csv: string;
    format: 'csv' | 'excel';
  };
}

@Component({
  selector: 'app-ai-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, OffcanvasModule, IconDirective, FormatCellValuePipe, FormatColumnHeaderPipe],
  templateUrl: './ai-chat-sidebar.component.html',
  styleUrls: ['./ai-chat-sidebar.component.scss'],
  providers: [{
    provide: IconSetService,
    useFactory: () => {
      const iconSet = new IconSetService();
      iconSet.icons = { ...iconSubset };
      return iconSet;
    }
  }]
})
export class AiChatSidebarComponent implements OnInit, OnDestroy {

  @Input() domain: string = 'ventas';
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @ViewChild('messageContainer') messageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField!: ElementRef<HTMLTextAreaElement>;

  // Offscreen element used during chart download (for cleanup on destroy)
  private _chartOffscreen: HTMLElement | null = null;
  private _destroyed = false;

  // Chat state
  public messages: ChatMessage[] = [];
  public inputText: string = '';
  public loading: boolean = false;
  public isTyping: boolean = false;

  // Voice
  public isListening: boolean = false;
  public voiceSupported: boolean = false;
  private recognition: any = null;

  // Confirmations
  public confirmations: ConfirmationDto[] = [];
  public activeSuggestions: any[] = [];
  private lastQuestion: string = '';

  // Quick suggestions
  public quickSuggestions: string[] = [
    '¿Cuáles son las ventas del mes actual?',
    '¿Cuál es el top 10 de clientes por venta?',
    '¿Cuál es el precio promedio por libra este año?',
    '¿Cuántos contenedores se han embarcado este mes?',
    'Margen promedio por vendedor este año',
    'Ventas por región últimos 3 meses'
  ];
  public showQuickSuggestions: boolean = true;

  private cacheKey = '';
  private userName = 'usuario';
  private sessionId = '';

  constructor(
    private analytics: AnalyticsService,
    private security: SecurityService,
    private cache: DataCacheService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private sidebarService: AiChatSidebarService
  ) {
    // Check voice support
    const win = window as any;
    this.voiceSupported = !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  ngOnInit(): void {
    this.userName = this.security.getUserName?.() || 'usuario';
    this.cacheKey = `ai-chat-sidebar:messages:${this.userName}:${this.domain}`;
    this.sessionId = `sidebar-${this.userName}-${this.domain}`;

    // Restore cached messages
    const cached = this.cache.getCache(this.cacheKey, StorageType.session) as ChatMessage[] | null;
    if (cached && Array.isArray(cached) && cached.length) {
      this.messages = cached.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp as any) : obtenerDateEnHusoHorarioMinus5()
      }));
      this.showQuickSuggestions = false;
    } else {
      // Welcome message
      this.messages = [{
        id: 'welcome',
        role: 'assistant',
        text: '¡Hola! Soy tu asistente de analytics. Pregúntame sobre tus datos de ventas y te daré la información al instante.',
        timestamp: obtenerDateEnHusoHorarioMinus5()
      }];
    }

    this.initVoiceRecognition();
  }

  ngOnDestroy(): void {
    this._destroyed = true;
    this.stopListening();
    // Limpiar elemento offscreen si hay un chart download en progreso
    if (this._chartOffscreen && this._chartOffscreen.parentNode) {
      this._chartOffscreen.parentNode.removeChild(this._chartOffscreen);
      this._chartOffscreen = null;
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(visible);
    // Sync service state when offcanvas closes via backdrop/escape
    this.sidebarService.setVisible(visible);
    if (visible) {
      setTimeout(() => {
        this.scrollToBottom();
        this.focusInput();
      }, 300);
    } else {
      this.stopListening();
    }
  }

  close(): void {
    this.stopListening();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // ─── Message Handling ────────────────────────────────────────

  async sendMessage(text?: string): Promise<void> {
    const msg = (text || this.inputText || '').trim();
    if (!msg || this.loading) return;

    this.inputText = '';
    this.showQuickSuggestions = false;
    this.lastQuestion = msg;

    // Add user message
    this.messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      text: msg,
      timestamp: obtenerDateEnHusoHorarioMinus5()
    });
    this.persistMessages();
    this.scrollToBottom();

    // Show typing indicator
    this.loading = true;
    this.isTyping = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    try {
      const resp: ResponseDto = await firstValueFrom(
        this.analytics.askQuestion(msg, this.domain, this.userName, this.sessionId,
          this.confirmations?.length ? this.confirmations : undefined)
      );

      const parsed = this.parseResponse(resp);
      this.messages.push(parsed);

      // Handle suggestions
      this.handleSuggestions(resp);
      this.persistMessages();
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : (err?.message || 'Error al consultar analytics');
      this.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        text: errorMsg,
        timestamp: obtenerDateEnHusoHorarioMinus5()
      });
      this.persistMessages();
    } finally {
      this.loading = false;
      this.isTyping = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
      this.focusInput();
    }
  }

  useQuickSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ─── Confirmations ──────────────────────────────────────────

  chooseCandidate(field: string, value: string): void {
    const idx = this.confirmations.findIndex(c => c.field === field);
    if (idx >= 0) {
      this.confirmations[idx].value = value;
    } else {
      this.confirmations.push({ field, value });
    }
  }

  isChosen(field: string, candidate: string): boolean {
    return (this.confirmations.find(x => x.field === field)?.value || '') === candidate;
  }

  async runWithConfirmations(): Promise<void> {
    const chosen = this.confirmations.filter(c => !!c.value);
    if (!chosen.length) return;

    this.activeSuggestions = [];
    // Re-send the original question with confirmations so the backend resolves the ambiguity
    await this.sendWithConfirmations(this.lastQuestion, chosen);
  }

  dismissSuggestions(): void {
    this.activeSuggestions = [];
    this.confirmations = [];
  }

  /** User taps a candidate chip directly in the bubble */
  pickCandidate(field: string, value: string): void {
    if (!value || this.loading) return;

    // Build confirmations: include the picked candidate + any other single-candidate suggestions
    const confs: ConfirmationDto[] = [{ field, value }];

    // Find the latest assistant message with suggestions to check for other auto-confirmable ones
    const lastMsg = [...this.messages].reverse().find(m => m.suggestions?.length);
    if (lastMsg?.suggestions) {
      for (const s of lastMsg.suggestions) {
        if (s.field === field) continue; // already handled
        if (s.chosen) {
          confs.push({ field: s.field, value: s.chosen });
        } else if (s.candidates?.length === 1) {
          confs.push({ field: s.field, value: s.candidates[0] });
        }
        // Suggestions with 0 or >1 candidates (other than the picked one) are ignored
      }
    }

    this.activeSuggestions = [];
    this.confirmations = [];
    this.sendWithConfirmations(this.lastQuestion, confs);
  }

  /** Re-send the original question with confirmations attached */
  private async sendWithConfirmations(question: string, confs: ConfirmationDto[]): Promise<void> {
    if (!question || this.loading) return;

    const displayText = confs.map(c => c.value).join(', ');
    this.messages.push({
      id: crypto.randomUUID(), role: 'user',
      text: displayText, timestamp: obtenerDateEnHusoHorarioMinus5()
    });
    this.persistMessages();
    this.scrollToBottom();

    this.loading = true;
    this.isTyping = true;
    this.confirmations = [];
    this.cdr.detectChanges();
    this.scrollToBottom();

    try {
      const resp: ResponseDto = await firstValueFrom(
        this.analytics.askQuestion(question, this.domain, this.userName, this.sessionId, confs)
      );
      const parsed = this.parseResponse(resp);
      this.messages.push(parsed);
      this.handleSuggestions(resp);
      this.persistMessages();
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : (err?.message || 'Error al consultar analytics');
      this.messages.push({ id: crypto.randomUUID(), role: 'assistant', text: errorMsg, timestamp: obtenerDateEnHusoHorarioMinus5() });
      this.persistMessages();
    } finally {
      this.loading = false;
      this.isTyping = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
      this.focusInput();
    }
  }

  // ─── Voice Input ─────────────────────────────────────────────

  private initVoiceRecognition(): void {
    if (!this.voiceSupported) return;

    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
        if (this._destroyed) return;
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        if (final) {
          this.inputText = final;
          this.sendMessage();
        } else {
          this.inputText = interim;
        }
        this.cdr.detectChanges();
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        if (this._destroyed) return;
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onerror = (event: any) => {
      this.zone.run(() => {
        if (this._destroyed) return;
        this.isListening = false;
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
        }
        this.cdr.detectChanges();
      });
    };
  }

  toggleVoice(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening(): void {
    if (!this.recognition) return;
    try {
      this.isListening = true;
      this.recognition.start();
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      this.isListening = false;
    }
  }

  private stopListening(): void {
    if (!this.recognition) return;
    try {
      this.isListening = false;
      this.recognition.stop();
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
    }
  }

  // ─── Response Parsing ───────────────────────────────────────

  /**
   * Parses the backend ResponseDto into a ChatMessage.
   *
   * Backend response shapes:
   *
   * 1) SUCCESS WITH DATA:
   *    result = { answer: "...", data: { resumen, plan, rows[], sql } }
   *
   * 2) NEEDS CONFIRMATION (disambiguation):
   *    result = { resumen: "...", needConfirmations: true, plan: {...}, suggestions: [...] }
   *
   * 3) GREETING / CONVERSATIONAL / SUGGESTION_LIST / SUGGESTION_RETRY:
   *    result = { answer: "...", mode: "greeting" | "conversational" | "suggestion_list" | "suggestion_retry" }
   *
   * 4) EMIT CHART: resp.message === "emit_chart", result = { spec: {...}, fileName }
   * 5) EMIT CSV:   resp.message === "emit_csv",   result = { csv: "...", fileName }
   * 6) ERROR:      isSuccess = false
   */
  private parseResponse(resp: ResponseDto): ChatMessage {
    if (!resp) {
      return this.buildAssistantMsg('Sin respuesta del servidor.');
    }

    // ── Error response ──
    if (!resp.isSuccess) {
      const text = resp.naturalMessage || resp.message || 'La consulta no fue exitosa.';
      return this.buildAssistantMsg(text);
    }

    const result: any = resp.result || {};
    const respMessage = (resp.message || '').toLowerCase();

    // ── Emit Chart ──
    if (respMessage === 'emit_chart') {
      // Support both { spec } (unwrapped) and { r: { spec } } (wrapped by param name)
      const spec = result.spec || result.r?.spec;
      if (spec) {
        return this.buildAssistantMsg('Se generó tu gráfico.', undefined, undefined, undefined, undefined, spec);
      }
    }

    // ── Emit CSV ──
    if (respMessage === 'emit_csv') {
      const csvPayload = result.csv ? result : result.r || {};
      if (csvPayload.csv) {
        const fileName = csvPayload.fileName || 'analytics.csv';
        return this.buildAssistantMsg(
          'Se generó tu archivo CSV.',
          undefined, undefined, undefined, undefined, undefined,
          { fileName, csv: csvPayload.csv, format: 'csv' as const }
        );
      }
    }

    // ── Emit Excel ──
    if (respMessage === 'emit_excel') {
      const excelPayload = result.csv ? result : result.r || {};
      if (excelPayload.csv) {
        const fileName = excelPayload.fileName || 'analytics.xlsx';
        return this.buildAssistantMsg(
          'Se generó tu archivo Excel.',
          undefined, undefined, undefined, undefined, undefined,
          { fileName, csv: excelPayload.csv, format: 'excel' as const }
        );
      }
    }

    // ── Needs Confirmation (disambiguation) ──
    if (result.needConfirmations && Array.isArray(result.suggestions)) {
      const text = result.resumen || 'Necesito que confirmes a qué te refieres.';
      // Only show suggestions that have candidates to pick from (filter out empty ones)
      const actionableSuggestions = result.suggestions.filter(
        (s: any) => s.candidates?.length > 0 && !s.chosen
      );
      return this.buildAssistantMsg(
        text, undefined, undefined, undefined,
        actionableSuggestions.length ? actionableSuggestions : undefined
      );
    }

    // ── Mode-based responses (greeting, conversational, suggestion_list, suggestion_retry) ──
    if (result.mode) {
      const text = result.answer || result.resumen || 'Respuesta del asistente.';
      return this.buildAssistantMsg(text);
    }

    // ── Success with data (main analytics response) ──
    // Structure: { answer: "...", data: { resumen, plan, rows[], sql } }
    const answer = result.answer;
    const data = result.data || {};
    const rows: any[] = Array.isArray(data.rows) ? data.rows : [];
    const plan = data.plan || null;

    // Filter out rows where all values are null (e.g. aggregate with no data)
    const meaningfulRows = rows.filter((r: any) =>
      Object.values(r).some(v => v !== null && v !== undefined)
    );

    const columns = meaningfulRows.length ? Object.keys(meaningfulRows[0]) : [];

    // Build display text: prefer answer, then data.resumen, then naturalMessage
    let text = answer || data.resumen || resp.naturalMessage || '';
    if (!text) {
      text = meaningfulRows.length
        ? `Se encontraron ${meaningfulRows.length} resultado(s).`
        : 'Consulta ejecutada sin resultados.';
    }

    return this.buildAssistantMsg(
      text,
      meaningfulRows.length ? meaningfulRows : undefined,
      columns.length ? columns : undefined,
      plan ? { plan } : undefined
    );
  }

  private buildAssistantMsg(
    text: string,
    rows?: any[],
    columns?: string[],
    planOrExtra?: any,
    suggestions?: any[],
    chartSpec?: any,
    fileExport?: { fileName: string; csv: string; format: 'csv' | 'excel' }
  ): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      text,
      timestamp: obtenerDateEnHusoHorarioMinus5(),
      rows,
      columns,
      plan: planOrExtra?.plan || undefined,
      suggestions,
      chartSpec,
      fileExport
    };
  }

  private handleSuggestions(resp: ResponseDto): void {
    const result: any = resp?.result || {};

    if (result.needConfirmations && Array.isArray(result.suggestions) && result.suggestions.length) {
      const allSuggestions: any[] = result.suggestions;

      // Separate actionable suggestions (with candidates) from empty ones
      const actionable = allSuggestions.filter((s: any) => s.candidates?.length > 0 && !s.chosen);
      const autoConfirmed = allSuggestions.filter((s: any) => !!s.chosen);

      // If there's exactly one actionable suggestion with exactly 1 candidate,
      // and all others either have no candidates or are already chosen → auto-confirm
      if (actionable.length === 1 && actionable[0].candidates.length === 1) {
        const singleSug = actionable[0];
        const confs: ConfirmationDto[] = [
          ...autoConfirmed.map((s: any) => ({ field: s.field, value: s.chosen })),
          { field: singleSug.field, value: singleSug.candidates[0] }
        ];
        this.activeSuggestions = [];
        this.confirmations = [];
        this.sendWithConfirmations(this.lastQuestion, confs);
        return;
      }

      // Filter out suggestions with no candidates (nothing to pick)
      this.activeSuggestions = allSuggestions.filter(
        (s: any) => (s.candidates?.length > 0 && !s.chosen)
      );

      // If nothing actionable remains, dismiss
      if (this.activeSuggestions.length === 0) {
        this.confirmations = [];
        return;
      }

      this.confirmations = this.activeSuggestions.map((s: any) => ({
        field: s.field,
        value: s.chosen || ''
      }));
    } else {
      // Clear confirmations when we get a resolved response
      this.activeSuggestions = [];
      this.confirmations = [];
    }
  }

  // ─── Formatting Helpers ─────────────────────────────────────

  getTimeString(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
  }

  // ─── Chart Download ─────────────────────────────────────────

  /**
   * Detects current dark/light mode for chart theming.
   */
  private getChartTheme() {
    const isDark = document.body.classList.contains('dark-theme')
                || document.documentElement.getAttribute('data-coreui-theme') === 'dark'
                || window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    const textColor = isDark ? '#c4c9d2' : '#2c384a';
    const gridColor = isDark ? '#3c4b64' : '#d8dbe0';
    const bgColor = isDark ? '#1e2533' : '#ffffff';
    return { textColor, gridColor, bgColor, isDark };
  }

  /**
   * Patches a Vega-Lite spec with theme colors, value labels, and sizing.
   * Preserves the original spec's mark, encoding, and color choices.
   */
  private buildPatchedSpec(spec: any, width: number, height: number): any {
    const { textColor, gridColor, bgColor } = this.getChartTheme();

    // Deep copy encoding to patch scale without mutating original
    const encoding = spec.encoding ? JSON.parse(JSON.stringify(spec.encoding)) : {};
    if (encoding.y && !encoding.y.scale) {
      encoding.y.scale = { zero: false };
    }
    // Ensure y-axis labels use thousands-separator format (only if not already specified)
    if (encoding.y && encoding.y.type === 'quantitative' && !encoding.y.axis?.format) {
      encoding.y.axis = { ...(encoding.y.axis || {}), format: ',.0f' };
    }

    // Preserve original mark exactly — don't override colors
    const mark = spec.mark || { type: 'bar' };
    const barLayer: any = { mark, encoding };
    const layers: any[] = [barLayer];

    // Add value labels above data points (with thousands separator)
    const yField = encoding.y?.field;
    if (yField) {
      layers.push({
        mark: { type: 'text', dy: -10, fontSize: 11, fontWeight: 600, color: textColor },
        encoding: {
          x: encoding.x,
          y: encoding.y,
          text: { field: yField, type: 'quantitative', format: encoding.y?.axis?.format || ',.2f' }
        }
      });
    }

    return {
      $schema: spec.$schema || 'https://vega.github.io/schema/vega-lite/v5.json',
      description: spec.description,
      data: spec.data,
      width,
      height,
      autosize: { type: 'fit', contains: 'padding' },
      padding: { left: 10, right: 20, top: 30, bottom: 15 },
      title: spec.description || spec.title || undefined,
      layer: layers,
      config: {
        background: bgColor,
        view: { stroke: 'transparent' },
        axis: {
          labelColor: textColor,
          titleColor: textColor,
          gridColor,
          domainColor: gridColor,
          labelFontSize: 12,
          titleFontSize: 13,
          titlePadding: 12,
          labelLimit: 150
        },
        axisX: {
          labelAngle: -35,
          labelAlign: 'right',
          labelBaseline: 'top'
        },
        legend: { labelColor: textColor, titleColor: textColor, labelFontSize: 11 },
        title: { color: textColor, fontSize: 15, fontWeight: 600, offset: 14 }
      }
    };
  }

  // ─── Chart Download ────────────────────────────────────────

  async downloadChart(spec: any): Promise<void> {
    try {
      const vegaEmbed = (await import('vega-embed')).default;

      // Render at full size in a hidden off-screen container
      const offscreen = document.createElement('div');
      offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:600px;';
      document.body.appendChild(offscreen);
      this._chartOffscreen = offscreen;

      const fullSpec = this.buildPatchedSpec(spec, 750, 450);

      await vegaEmbed(offscreen, fullSpec, {
        actions: false,
        renderer: 'svg',
        theme: undefined
      });

      // Wait for render
      await new Promise(r => setTimeout(r, 200));

      if (this._destroyed) {
        this.removeOffscreen(offscreen);
        return;
      }

      const svgEl = offscreen.querySelector('svg');
      if (!svgEl) {
        this.removeOffscreen(offscreen);
        return;
      }

      const clone = svgEl.cloneNode(true) as SVGElement;
      const bbox = svgEl.getBoundingClientRect();
      clone.setAttribute('width', `${bbox.width}`);
      clone.setAttribute('height', `${bbox.height}`);

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = bbox.width * scale;
      canvas.height = bbox.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        this.removeOffscreen(offscreen);

        canvas.toBlob(blob => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (spec?.description || 'grafico')
            .replace(/[^a-zA-Z0-9áéíóúñ ]/g, '').trim().replace(/\s+/g, '_') + '.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        this.removeOffscreen(offscreen);
      };
      img.src = url;
    } catch (err) {
      console.error('Error downloading chart:', err);
    }
  }

  private removeOffscreen(el: HTMLElement): void {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    if (this._chartOffscreen === el) {
      this._chartOffscreen = null;
    }
  }

  // ─── File Download (CSV / Excel) ──────────────────────────

  downloadFile(exp: { fileName: string; csv: string; format: 'csv' | 'excel' }): void {
    try {
      if (exp.format === 'excel') {
        this.downloadAsExcel(exp.fileName, exp.csv);
      } else {
        this.downloadAsCsv(exp.fileName, exp.csv);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  }

  private downloadAsCsv(fileName: string, csv: string): void {
    // BOM for UTF-8 so Excel opens accented characters correctly
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, fileName.endsWith('.csv') ? fileName : fileName + '.csv');
  }

  private downloadAsExcel(fileName: string, csv: string): void {
    // Parse CSV into rows
    const rows = this.parseCsvRows(csv);
    if (!rows.length) return;

    // Build XML Spreadsheet 2003 (natively opened by Excel without warnings)
    const header = rows[0];
    const dataRows = rows.slice(1);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '  <Styles>\n';
    xml += '    <Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#D9E2F3" ss:Pattern="Solid"/></Style>\n';
    xml += '    <Style ss:ID="num"><NumberFormat ss:Format="#,##0.00"/></Style>\n';
    xml += '  </Styles>\n';
    xml += '  <Worksheet ss:Name="Datos">\n';
    xml += '    <Table>\n';

    // Header row
    xml += '      <Row ss:StyleID="hdr">\n';
    for (const col of header) {
      xml += `        <Cell><Data ss:Type="String">${this.escapeXml(col)}</Data></Cell>\n`;
    }
    xml += '      </Row>\n';

    // Data rows
    for (const row of dataRows) {
      xml += '      <Row>\n';
      for (const cell of row) {
        const trimmed = cell.trim();
        const isNum = trimmed !== '' && !isNaN(Number(trimmed));
        if (isNum) {
          xml += `        <Cell ss:StyleID="num"><Data ss:Type="Number">${trimmed}</Data></Cell>\n`;
        } else {
          xml += `        <Cell><Data ss:Type="String">${this.escapeXml(cell)}</Data></Cell>\n`;
        }
      }
      xml += '      </Row>\n';
    }

    xml += '    </Table>\n';
    xml += '  </Worksheet>\n';
    xml += '</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const name = fileName.replace(/\.(csv|xlsx?)$/i, '') + '.xls';
    this.triggerDownload(blob, name);
  }

  private parseCsvRows(csv: string): string[][] {
    const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
    return lines.map(line => {
      // Handle quoted CSV fields: "value with, comma","other"
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      fields.push(current);
      return fields;
    });
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── Utilities ──────────────────────────────────────────────

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messageContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  private focusInput(): void {
    setTimeout(() => {
      this.inputField?.nativeElement?.focus();
    }, 100);
  }

  private persistMessages(max: number = 200): void {
    try {
      // Don't persist rows/plan to keep storage light
      const lite = this.messages.slice(-max).map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp
      }));
      this.cache.setCache(this.cacheKey, lite, StorageType.session);
    } catch { /* ignore quota errors */ }
  }

  clearChat(): void {
    this.messages = [{
      id: 'welcome',
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de analytics. Pregúntame sobre tus datos de ventas y te daré la información al instante.',
      timestamp: obtenerDateEnHusoHorarioMinus5()
    }];
    this.showQuickSuggestions = true;
    this.activeSuggestions = [];
    this.confirmations = [];
    this.lastQuestion = '';
    this.persistMessages();
  }

  trackByMessageId(_index: number, msg: ChatMessage): string {
    return msg.id;
  }
}
