import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, Renderer2 } from '@angular/core';

/**
 * Make table columns resizable by dragging the right edge of each header cell (th),
 * applying the new width to all cells in that column. Attach to a <table> via
 * the attribute selector: [appResizableTableColumns].
 */
@Directive({
  selector: '[appResizableTableColumns]',
  standalone: true
})
export class ResizableTableColumnsDirective implements AfterViewInit, OnDestroy {
  private removeFns: Array<() => void> = [];
  private measureCanvas?: HTMLCanvasElement;
  private observer?: MutationObserver;
  private isInternalUpdate = false;
  private resizeEnabled = true;

  constructor(
    private host: ElementRef<HTMLTableElement>,
    private renderer: Renderer2,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const isTouch = this.isTouchEnvironment();
    this.resizeEnabled = !isTouch;
    if (!this.resizeEnabled) {
      return; // avoid attaching resize handles on touch-first devices
    }
    // Defer to ensure table content is rendered
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initHandles();
        this.observeStructureChanges();
      }, 0);
    });
  }

  ngOnDestroy(): void {
    if (!this.resizeEnabled) {
      return;
    }
    // Cleanup event listeners
    this.removeFns.forEach(fn => fn());
    this.removeFns = [];
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    // Remove existing handles
    const table = this.host.nativeElement;
    table.querySelectorAll('.table-resize-handle').forEach(h => h.remove());
  }

  private isTouchEnvironment(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    const maxTouch = (navigator as Navigator & { msMaxTouchPoints?: number }).maxTouchPoints ?? 0;
    const msTouch = (navigator as any).msMaxTouchPoints ?? 0;
    const hasTouchPoints = maxTouch > 0 || msTouch > 0;
    const prefersCoarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
    const narrowViewport = typeof window.innerWidth === 'number' ? window.innerWidth < 992 : false;

    // Treat as touch/mobile when user-agent indicates a mobile OS and the device exposes coarse/touch pointers,
    // or when the pointer is coarse and the viewport is small (common on tablets/phones).
    return (isMobileUA && (hasTouchPoints || prefersCoarsePointer)) || (prefersCoarsePointer && narrowViewport);
  }

  private observeStructureChanges(): void {
    const table = this.host.nativeElement;
    const thead = table.querySelector('thead');
    if (!thead) return;

    let scheduled = false;
    const scheduleReinit = () => {
      if (scheduled) return;
      if (this.isInternalUpdate) return; // ignore mutations caused by our own handle updates
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        this.reinitHandles();
      }, 0);
    };

    this.observer = new MutationObserver((_mutations) => {
      scheduleReinit();
    });

    this.observer.observe(thead, { childList: true, subtree: true });
  }

  private resetHandles(): void {
    // Remove event listeners
    this.removeFns.forEach(fn => fn());
    this.removeFns = [];
    // Remove handle elements
    const table = this.host.nativeElement;
    table.querySelectorAll('.table-resize-handle').forEach(h => h.remove());
  }

  private reinitHandles(): void {
    this.isInternalUpdate = true;
    try {
      this.resetHandles();
      this.initHandles();
    } finally {
      this.isInternalUpdate = false;
    }
  }

  private initHandles(): void {
    const table = this.host.nativeElement;
    if (!table) return;

    const theadRow = table.querySelector('thead tr');
    if (!theadRow) return;
  const headerCells = Array.from(theadRow.children) as HTMLTableCellElement[];
    headerCells.forEach((th, index) => {
      // Skip if it's an empty header or has no width context
      if (!(th instanceof HTMLTableCellElement)) return;

      // Ensure position for absolute handle
      const computedPos = getComputedStyle(th).position;
      if (computedPos === 'static') {
        this.renderer.setStyle(th, 'position', 'relative');
      }

      // Create handle
      const handle = this.renderer.createElement('span');
      this.renderer.addClass(handle, 'table-resize-handle');
      this.renderer.setAttribute(handle, 'aria-hidden', 'true');
      this.renderer.appendChild(th, handle);

  // Mouse events for resizing
  let startX = 0;
  let startWidth = 0;
  let moved = false;
  const DRAG_THRESHOLD = 3; // pixels

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) < DRAG_THRESHOLD) {
          return; // ignore micro-movements to not interfere with double click
        }
        moved = true;
        const newWidth = Math.max(60, startWidth + dx); // min 60px
        this.applyColumnWidth(table, index, newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        moved = false;
      };

      const onMouseDown = (e: MouseEvent) => {
        // Ignore right click
        if (e.button !== 0) return;
        // If this is the second click of a double click, don't start a drag;
        // dblclick on <th> will handle autofit.
          // If this is the second click of a double click, trigger autofit immediately
          if (e.detail > 1) {
            e.preventDefault();
            e.stopPropagation();
            this.autoFitColumn(table, index);
            return;
          }
        e.preventDefault();
        // Use current width including padding borders
        startX = e.clientX;
        startWidth = th.getBoundingClientRect().width;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      // Bind events on handle
      handle.addEventListener('mousedown', onMouseDown);
      this.removeFns.push(() => handle.removeEventListener('mousedown', onMouseDown));
        const onHandleDblClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          this.autoFitColumn(table, index);
        };
        handle.addEventListener('dblclick', onHandleDblClick);
        this.removeFns.push(() => handle.removeEventListener('dblclick', onHandleDblClick));

      // Also allow double click on the whole header cell for better UX
      const onThDblClick = (e: MouseEvent) => {
        // Ignore if originated from an interactive control to prevent side effects
        const target = e.target as HTMLElement;
        if (target && (target.closest('input,select,textarea,button,.e-control'))) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.autoFitColumn(table, index);
      };
      th.addEventListener('dblclick', onThDblClick);
      this.removeFns.push(() => th.removeEventListener('dblclick', onThDblClick));
    });
  }

  private applyColumnWidth(table: HTMLTableElement, colIndex: number, widthPx: number) {
    // Apply width to header cell
    const theadRow = table.querySelector('thead tr');
    const headerCells = theadRow ? Array.from(theadRow.children) as HTMLTableCellElement[] : [];
    const th = headerCells[colIndex];
    if (th) {
      this.renderer.setStyle(th, 'width', `${widthPx}px`);
      this.renderer.setStyle(th, 'minWidth', `${widthPx}px`);
      this.renderer.setStyle(th, 'maxWidth', `${widthPx}px`);
    }

    // Apply width to each body cell of that column
    const bodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
    bodyRows.forEach(row => {
      const cells = Array.from(row.children) as HTMLTableCellElement[];
      const td = cells[colIndex];
      if (td) {
        this.renderer.setStyle(td, 'width', `${widthPx}px`);
        this.renderer.setStyle(td, 'minWidth', `${widthPx}px`);
        this.renderer.setStyle(td, 'maxWidth', `${widthPx}px`);
      }
    });
  }

  private autoFitColumn(table: HTMLTableElement, colIndex: number) {
    const theadRow = table.querySelector('thead tr');
    const headerCells = theadRow ? Array.from(theadRow.children) as HTMLTableCellElement[] : [];
    const th = headerCells[colIndex];

    let maxContent = 0;

    if (th) {
      maxContent = Math.max(maxContent, this.getCellContentWidth(th));
    }

    const bodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
    const LIMIT = 300; // performance limit
    for (let i = 0; i < bodyRows.length && i < LIMIT; i++) {
      const row = bodyRows[i];
      const cells = Array.from(row.children) as HTMLTableCellElement[];
      const td = cells[colIndex];
      if (td) {
        maxContent = Math.max(maxContent, this.getCellContentWidth(td));
      }
    }

    // Add a little extra spacing
    const target = Math.min(Math.max(60, Math.ceil(maxContent + 12)), 800);
    this.applyColumnWidth(table, colIndex, target);
  }

  private getCellContentWidth(cell: HTMLTableCellElement): number {
    const style = getComputedStyle(cell);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

    // If there is an input/control, try to use its scrollWidth or text width
    const control = cell.querySelector('input, textarea, select, .e-input, .e-input-group, .e-combobox, .e-control, .e-ddl') as HTMLElement | null;
    if (control) {
      const ctrlStyle = getComputedStyle(control);
      const text = (control as HTMLInputElement).value ?? control.textContent ?? '';
      const textWidth = this.measureTextWidth(text.trim(), ctrlStyle);
      const nativeWidth = Math.max(control.scrollWidth, control.getBoundingClientRect().width);
      return Math.max(textWidth, nativeWidth) + padding;
    }

    // Fallbacks: check cell text and direct children widths
    const textWidth = this.measureTextWidth((cell.textContent || '').trim(), style);
    let childMax = 0;
    const children = Array.from(cell.children) as HTMLElement[];
    for (const ch of children) {
      childMax = Math.max(childMax, ch.scrollWidth, ch.getBoundingClientRect().width);
    }
    const ownScroll = Math.max(cell.scrollWidth, cell.getBoundingClientRect().width);
    return Math.max(textWidth + padding, childMax + padding, ownScroll);
  }

  private measureTextWidth(text: string, baseStyle: CSSStyleDeclaration): number {
    if (!this.measureCanvas) {
      this.measureCanvas = document.createElement('canvas');
    }
    const ctx = this.measureCanvas.getContext('2d');
    if (!ctx) return text.length * 8; // rough fallback

    const font = `${baseStyle.fontStyle} ${baseStyle.fontVariant} ${baseStyle.fontWeight} ${baseStyle.fontSize} / ${baseStyle.lineHeight} ${baseStyle.fontFamily}`.trim();
    ctx.font = font;
    const metrics = ctx.measureText(text || '');
    return metrics.width;
  }
}
