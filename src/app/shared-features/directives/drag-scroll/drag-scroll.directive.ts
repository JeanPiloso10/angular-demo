import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';

// Cache modal class selectors once to avoid re-allocating arrays on each check
const MODAL_CLASSNAMES = [
  'modal',
  'modal-dialog',
  'modal-content',
  'modal-body',
  'c-modal',
  'c-modal-content',
  'c-modal-body'
] as const;
const MODAL_SELECTOR = MODAL_CLASSNAMES.map(cls => `.${cls}`).join(', ');
// Subset commonly used as the scrollable container inside modals
const MODAL_SCROLL_CONTAINER_CLASSNAMES = [
  'modal-body',
  'c-modal-body',
  'modal-content',
  'c-modal-content'
] as const;
const MODAL_SCROLL_CONTAINER_SELECTOR = MODAL_SCROLL_CONTAINER_CLASSNAMES.map(cls => `.${cls}`).join(', ');

type DragAxis = 'x' | 'y' | 'both';

@Directive({
  selector: '[appDragScroll]',
  standalone: false
})
export class DragScrollDirective implements AfterViewInit, OnDestroy {
  // Centralized helper to test CSS selector matches with vendor-specific fallbacks
  private static matches(el: Element, selector: string): boolean {
    const fn = (el as any).matches || (el as any).msMatchesSelector || (el as any).webkitMatchesSelector;
    return typeof fn === 'function' ? fn.call(el, selector) : false;
  }

  /**
   * Axis to enable for panning. Defaults to both axes.
   * Usage: <div appDragScroll="x"> ...
   */
  @Input('appDragScroll') axis: DragAxis | { axis?: DragAxis; selector?: string } | undefined;

  /**
   * Optional CSS selector to locate the actual scrollable element inside the host.
   * Usage: <ejs-grid [appDragScroll]="{ selector: '.e-content' }">
   */
  @Input() appDragScrollSelector?: string;

  private scrollEl!: HTMLElement;
  private headerEl?: HTMLElement;
  private headerEls: HTMLElement[] = [];
  private activeScrollElX!: HTMLElement; // element to scroll horizontally
  private activeScrollElY!: HTMLElement; // element to scroll vertically (can be an ancestor like modal-body)
  private activeHeaderEl?: HTMLElement;  // grid header to sync horizontally
  private hostEl: HTMLElement;
  private removeMove?: () => void;
  private removeUp?: () => void;
  private removeDblClick?: () => void;
  private isPointerDown = false;
  private isDragging = false;
  // Selection mode: when true, directive won't start drag so the browser can select text
  private selectionArmed = false;   // set by dblclick, consumed on next pointerdown
  private selectionActive = false;  // active between pointerdown and pointerup
  private startX = 0;
  private startY = 0;
  private startScrollLeftX = 0;
  private startScrollTopY = 0;
  private axisResolved: DragAxis = 'both';
  private rafId: number | null = null;
  private lastClientX = 0;
  private lastClientY = 0;
  private readonly dragThreshold = 8; // px - slightly higher to avoid accidental drags on small mouse jitter

  /**
   * Prevents the directive from using the page (document/body) as the vertical scroll fallback for vertical dragging.
   * When set to `true`, dragging on a modal grid will not scroll the background page vertically.
   * This is useful to avoid unwanted background scrolling when interacting with scrollable modals or overlays.
   * 
   * @default true
   * 
   * @example
   *   <div appDragScroll [preventPageScrollY]="true"> ... </div>
   *   <!-- Prevents vertical drag from scrolling the page when inside a modal -->
   */
  @Input() preventPageScrollY: boolean = true;

  constructor(private elRef: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this.hostEl = this.elRef.nativeElement;
  }

  ngAfterViewInit(): void {
    // Resolve configuration
    if (typeof this.axis === 'string') {
      this.axisResolved = this.axis;
    } else if (typeof this.axis === 'object' && this.axis) {
      if (this.axis.axis) this.axisResolved = this.axis.axis;
      if (this.axis.selector) this.appDragScrollSelector = this.axis.selector;
    }

  // Attempt to detect initial scroll container; will be re-resolved on drag start
  this.scrollEl = this.resolveScrollElement();
  this.headerEl = this.resolveHeaderElement();
  this.headerEls = this.resolveHeaderElements();

  // Improve UX with proper cursor
  this.renderer.setStyle(this.hostEl, 'cursor', 'grab');
  // Do NOT disable touch-action to preserve native gestures on mobile

    // Listen to pointerdown on the host (mouse only) and resolve containers lazily
    this.renderer.listen(this.hostEl, 'pointerdown', (ev: PointerEvent) => this.onPointerDown(ev));
    // Arm selection mode on double click: the next mouse drag will select text instead of pan
    this.removeDblClick = this.renderer.listen(this.hostEl, 'dblclick', (_ev: MouseEvent) => {
      // Only for desktop/mouse scenarios; mobile already preserves native selection
      this.selectionArmed = true;
      // Give a visual hint that selection is armed
      this.renderer.setStyle(this.hostEl, 'cursor', 'text');
      // Encourage selection on hosts that might otherwise restrict it
      this.renderer.setStyle(this.hostEl, 'user-select', 'text');
    });
  }

  ngOnDestroy(): void {
    this.detachDocListeners();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.removeDblClick) { this.removeDblClick(); this.removeDblClick = undefined; }
  }

  private resolveScrollElement(): HTMLElement {
    // 1) Explicit selector input
    if (this.appDragScrollSelector) {
      const el = this.hostEl.querySelector<HTMLElement>(this.appDragScrollSelector);
      if (el) return el;
    }
    // 2) Syncfusion Grid common containers: prefer the one that actually scrolls
    const candidates: HTMLElement[] = [];
    const content = this.hostEl.querySelector<HTMLElement>('.e-content');
    const gridContent = this.hostEl.querySelector<HTMLElement>('.e-gridcontent');
    const treeGridContent = this.hostEl.querySelector<HTMLElement>('.e-treegridcontent');
    if (content) candidates.push(content);
    if (gridContent) candidates.push(gridContent);
    if (treeGridContent) candidates.push(treeGridContent);
    for (const c of candidates) {
      const canScrollX = c.scrollWidth > c.clientWidth;
      const canScrollY = c.scrollHeight > c.clientHeight;
      if ((this.axisResolved === 'x' && canScrollX) ||
          (this.axisResolved === 'y' && canScrollY) ||
          (this.axisResolved === 'both' && (canScrollX || canScrollY))) {
        return c;
      }
    }
    // 3) Fallback to first candidate or host
    return content || gridContent || treeGridContent || this.hostEl;
  }

  private resolveHeaderElement(): HTMLElement | undefined {
    // For Syncfusion grid, keep header in sync horizontally
    const header = this.hostEl.querySelector<HTMLElement>('.e-headercontent');
    return header || undefined;
  }

  private resolveHeaderElements(): HTMLElement[] {
    // Some grids (frozen columns) render multiple header content containers
    return Array.from(this.hostEl.querySelectorAll<HTMLElement>('.e-headercontent'));
  }

  private onPointerDown(ev: PointerEvent) {
    // Only primary button
    if (ev.button !== 0) return;
    // Only mouse: preserve native touch gestures on mobile/tablet
    if (ev.pointerType && ev.pointerType !== 'mouse') return;
    // Avoid starting drag from interactive elements
  if (this.isInteractive(ev.target as Element)) return;

    // Selection overrides: if armed by double click or user holds a modifier, allow native text selection
    if (this.selectionArmed || ev.ctrlKey || ev.shiftKey || ev.altKey || (ev as any).metaKey) {
      this.selectionActive = true;
      this.selectionArmed = false; // consume the arm
      this.isPointerDown = true;   // so we can clean up on pointerup
      // Keep a text cursor to hint selection mode
      this.renderer.setStyle(this.hostEl, 'cursor', 'text');
      // Ensure host allows selecting
      this.renderer.setStyle(this.hostEl, 'user-select', 'text');
      // Listen only for pointerup to reset state; do not hijack move so browser can select
      this.removeUp = this.renderer.listen(document, 'pointerup', (e: PointerEvent) => this.onPointerUp(e));
      return;
    }

    // Resolve targets at drag start (grid may render later)
    const baseScrollEl = this.resolveScrollElement();
    this.activeScrollElX = baseScrollEl;
  this.activeHeaderEl = this.resolveHeaderElement();
  this.headerEls = this.resolveHeaderElements();

    // Determine vertical scroll element: prefer baseScrollEl; if it cannot scroll vertically, fallback to nearest scrollable ancestor
    if (this.axisResolved === 'y' || this.axisResolved === 'both') {
      this.activeScrollElY = this.findVerticalScrollContainer(baseScrollEl) || baseScrollEl;
    } else {
      this.activeScrollElY = baseScrollEl;
    }

    // If nothing to scroll, abort
  const canScrollX = this.activeScrollElX.scrollWidth > this.activeScrollElX.clientWidth;
  const canScrollY = this.activeScrollElY.scrollHeight > this.activeScrollElY.clientHeight;
    if (this.axisResolved === 'x' && !canScrollX) return;
    if (this.axisResolved === 'y' && !canScrollY) return;
    if (this.axisResolved === 'both' && !(canScrollX || canScrollY)) return;

    this.isPointerDown = true;
    this.isDragging = false; // will flip to true once threshold is exceeded
    this.startX = ev.clientX;
    this.startY = ev.clientY;
    this.lastClientX = ev.clientX;
    this.lastClientY = ev.clientY;
  this.startScrollLeftX = this.activeScrollElX.scrollLeft;
  this.startScrollTopY = this.activeScrollElY.scrollTop;

    // Capture pointer to continue receiving move events
    try { (this.hostEl as any).setPointerCapture?.(ev.pointerId); } catch {}

    this.removeMove = this.renderer.listen(document, 'pointermove', (e: PointerEvent) => this.onPointerMove(e));
    this.removeUp = this.renderer.listen(document, 'pointerup', (e: PointerEvent) => this.onPointerUp(e));
  }

  private onPointerMove(ev: PointerEvent) {
    if (!this.isPointerDown) return;

    const dx = ev.clientX - this.startX;
    const dy = ev.clientY - this.startY;

    if (!this.isDragging) {
      // Activate dragging after threshold to avoid hijacking clicks
      if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
        this.isDragging = true;
        this.renderer.setStyle(this.hostEl, 'cursor', 'grabbing');
        // Prevent text selection while dragging
        this.renderer.setStyle(document.body, 'user-select', 'none');
      } else {
        return;
      }
    }

    // Prevent page/text selection side-effects while dragging
    if (this.isDragging) {
      ev.preventDefault();
    }

    this.lastClientX = ev.clientX;
    this.lastClientY = ev.clientY;
    // Throttle via rAF
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const moveX = this.lastClientX - this.startX; // positive when moving right
        const moveY = this.lastClientY - this.startY; // positive when moving down
        if (this.axisResolved === 'x' || this.axisResolved === 'both') {
          this.activeScrollElX.scrollLeft = this.startScrollLeftX - moveX; // invert to mimic map-like panning
          // Keep headers aligned horizontally (support multiple header containers)
          if (this.activeHeaderEl) {
            this.activeHeaderEl.scrollLeft = this.activeScrollElX.scrollLeft;
          }
          if (this.headerEls && this.headerEls.length) {
            for (const h of this.headerEls) {
              if (h !== this.activeHeaderEl) h.scrollLeft = this.activeScrollElX.scrollLeft;
            }
          }
        }
        if (this.axisResolved === 'y' || this.axisResolved === 'both') {
          this.activeScrollElY.scrollTop = this.startScrollTopY - moveY;
        }
      });
    }
  }

  private onPointerUp(_ev: PointerEvent) {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    // Release capture
  try { (this.hostEl as any).releasePointerCapture?.((_ev as PointerEvent).pointerId); } catch {}

    // If we were dragging and the release isn't on an interactive target, prevent the next click
    if (this.isDragging) {
      const upTarget = _ev.target as Element | null;
      const releaseOnInteractive = this.isInteractive(upTarget);
      if (!releaseOnInteractive) {
        const preventClick = (e: Event) => {
          // Double-check target; allow clicks on interactive controls even after a drag
          const t = e.target as Element | null;
          if (!this.isInteractive(t)) {
            e.stopPropagation();
            e.preventDefault();
          }
          this.activeScrollElX?.removeEventListener('click', preventClick, true);
        };
        this.activeScrollElX?.addEventListener('click', preventClick, true);
      }
    }

    this.isDragging = false;
    // If we were in selection mode, reset styles and flags
    if (this.selectionActive) {
      this.selectionActive = false;
      this.renderer.setStyle(this.hostEl, 'cursor', 'grab');
      this.renderer.removeStyle(this.hostEl, 'user-select');
    } else {
      this.renderer.setStyle(this.hostEl, 'cursor', 'grab');
      this.renderer.removeStyle(document.body, 'user-select');
    }
    this.detachDocListeners();
  }

  private detachDocListeners() {
    if (this.removeMove) { this.removeMove(); this.removeMove = undefined; }
    if (this.removeUp) { this.removeUp(); this.removeUp = undefined; }
  }

  private isInteractive(el: Element | null): boolean {
    if (!el) return false;
    const interactiveTags = ['INPUT', 'BUTTON', 'A', 'TEXTAREA', 'SELECT', 'LABEL'];
    const interactiveSelectors = [
      '.e-btn', '.e-button', '.btn', '.e-link',
      '.cursor-pointer',
      '[role="button"]', '[role="link"]',
      // Syncfusion grid/treegrid specific interactive bits (filters, editors, drag handles, etc.)
      '.e-input', '.e-input-group', '.e-checkbox', '.e-radio', '.e-editcell',
      '.e-rowdragdrop', '.e-draghandler', '.e-flmenu', '.e-filter', '.e-search'
    ];
    let node: Element | null = el;
    while (node && node !== this.hostEl.parentElement) {
      if (interactiveTags.includes(node.tagName)) return true;
      if ((node as HTMLElement).isContentEditable) return true;
      if (interactiveSelectors.some(sel => (node as HTMLElement).matches(sel))) return true;
      // Do NOT treat generic tabindex as interactive: many grid cells use tabindex for accessibility
      // We only honor explicit roles (button/link) above to avoid blocking drag from normal cells
      try {
        const style = getComputedStyle(node as HTMLElement);
        if (style.cursor === 'pointer') return true;
      } catch { /* ignore */ }
      node = node.parentElement;
    }
    // Fallback to known syncfusion/coreui input groups or controls
    return this.closest(el, '.e-input-group, .e-checkbox, .e-radio') != null;
  }

  private closest(el: Element, selector: string): Element | null {
    // Polyfilled closest using centralized matches
    let node: Element | null = el;
    while (node && node !== this.hostEl.parentElement) {
      if (DragScrollDirective.matches(node, selector)) return node;
      node = node.parentElement;
    }
    return null;
  }

  private findVerticalScrollContainer(start: HTMLElement): HTMLElement | null {
    // 1) If the grid content has vertical overflow, use it
    if (start.scrollHeight > start.clientHeight) return start;

    // 2) TreeGrid often wraps content; check common containers nearby
    const tg = this.hostEl.querySelector<HTMLElement>('.e-treegridcontent, .e-content');
    if (tg && tg.scrollHeight > tg.clientHeight) return tg;

    // Determine if we're inside a modal context (used later to decide on page fallback)
    const insideModal = this.isInsideModalContext();

    // 3) Prefer a modal body/container if present to avoid scrolling the background page
    // Common selectors: Bootstrap/CoreUI modal body/content
    let node: HTMLElement | null = this.hostEl;
    const docEl = document.documentElement as HTMLElement;
    while (node && node !== docEl && node !== document.body) {
      if (DragScrollDirective.matches(node, MODAL_SCROLL_CONTAINER_SELECTOR)) {
        // If it can scroll, use it. Even if overflowY is not explicitly set, check dimensions.
        const style = getComputedStyle(node);
        const overflowY = style.overflowY;
        const canScroll = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay' || overflowY === 'hidden')
          ? node.scrollHeight > node.clientHeight
          : node.scrollHeight > node.clientHeight;
        if (canScroll) return node;
        // If it can't scroll, continue searching ancestors. We'll decide about page fallback later
      }
      node = node.parentElement as HTMLElement | null;
    }

    // 4) Walk up ancestors to find a generic scrollable container
    node = this.hostEl;
    while (node && node !== docEl && node !== document.body) {
      const style = getComputedStyle(node);
      const overflowY = style.overflowY;
      const canScroll = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight;
      if (canScroll) return node;
      node = node.parentElement as HTMLElement | null;
    }

    // 5) As a last resort, optionally use the page's scrolling element
    // Allow page fallback when NOT inside a modal; when inside a modal, honor preventPageScrollY
    if (!insideModal || (insideModal && !this.preventPageScrollY)) {
      const scrollingEl = (document.scrollingElement || document.documentElement) as HTMLElement;
      if (scrollingEl && scrollingEl.scrollHeight > scrollingEl.clientHeight) return scrollingEl;
      // Older quirks: body may be the scrolling element in some cases
      if (document.body && document.body.scrollHeight > document.body.clientHeight) return document.body as HTMLElement;
    }

    return null;
  }

  private isInsideModalContext(): boolean {
    let node: HTMLElement | null = this.hostEl;
    const docEl = document.documentElement as HTMLElement;
    while (node && node !== docEl && node !== document.body) {
      try {
        if (DragScrollDirective.matches(node, MODAL_SELECTOR)) return true;
      } catch (e) { console.debug('Modal detection failed:', e); }
      node = node.parentElement as HTMLElement | null;
    }
    return false;
  }
}
