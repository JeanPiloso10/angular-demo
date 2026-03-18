import { Injectable } from '@angular/core';
import { driver, DriveStep, Driver, Config } from 'driver.js';


@Injectable({
  providedIn: 'root'
})
export class TourService {

   private driverInstance: Driver | null = null;
  private centerAnchorEl: HTMLElement | null = null;

  constructor() {}

  /**
   * Starts a guided tour with the provided steps
   * @param steps - Array of tour steps
   * @param config - Optional driver.js configuration
   */
  startTour(steps: DriveStep[], config?: Partial<Config>): void {
    // We intentionally use Partial<Config> & any to allow driver.js lifecycle callbacks
    const defaultConfig: Partial<Config> & any = {
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      stagePadding: 4,
      stageRadius: 10,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: 'Paso {{current}} de {{total}}',
      // Center the highlighted element within its nearest scrollable container
      onHighlightStarted: (element: HTMLElement) => {
        // Allow callers to disable auto-centering/scrolling for specific tours
        const noCenter = !!(config as any)?.disableAutoCenter;
        if (!noCenter) {
          try { this.centerInScrollableContainer(element); } catch (err) { console.error('Error in centerInScrollableContainer:', err); }
        }
        if (config && (config as any).onHighlightStarted) {
          try { (config as any).onHighlightStarted(element); } catch (err) { console.error('Error in onHighlightStarted callback:', err); }
        }
      },
      onHighlighted: (element: HTMLElement) => {
        const noCenter = !!(config as any)?.disableAutoCenter;
        if (!noCenter) {
          try { this.centerInScrollableContainer(element); } catch (err) { console.error('Error in centerInScrollableContainer:', err); }
        }
        if (config && (config as any).onHighlighted) {
          try { (config as any).onHighlighted(element); } catch (err) { console.error('Error in onHighlighted callback:', err); }
        }
      },
      ...config
    };

    // Optionally move first step to a centered, fixed anchor to show popover mid-screen
    let localSteps: DriveStep[] = steps;
    const useCenterAnchor = !!(config as any)?.useCenterAnchorForFirstStep;
    if (useCenterAnchor && steps && steps.length > 0) {
      try {
        const anchor = this.ensureCenterAnchor();
        localSteps = [
          { element: anchor as any, popover: (steps[0] as any).popover },
          ...steps.slice(1)
        ];
      } catch { /* ignore anchor errors */ }
    }

    const originalOnDestroyStarted = (defaultConfig as any).onDestroyStarted;
    (defaultConfig as any).onDestroyStarted = () => {
      try { this.removeCenterAnchor(); } catch { /* ignore */ }
      if (typeof originalOnDestroyStarted === 'function') {
        try { originalOnDestroyStarted(); } catch { /* ignore */ }
      }
    };

    this.driverInstance = driver({
      ...defaultConfig,
      steps: localSteps
    });

    this.driverInstance.drive();
  }

  /**
   * Highlights a single element without starting a full tour
   * @param element - Element selector or HTMLElement
   * @param config - Optional configuration for the highlight
   */
  highlight(element: string | HTMLElement, config?: Partial<Config>): void {
    const highlightConfig: Config = {
      animate: true,
      allowClose: true,
      popoverClass: 'driverjs-theme',
      ...config
    };

    this.driverInstance = driver(highlightConfig);
    this.driverInstance.highlight({ element, popover: config?.steps?.[0]?.popover });
  }

  /**
   * Stops the current tour
   */
  destroy(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = null;
    }
  }

  /**
   * Builds a Driver.js step only if the target element exists in the DOM.
   * Helps avoid runtime errors when optional UI elements are not rendered.
   * @param selector - CSS selector or HTMLElement to target
   * @param title - Popover title
   * @param description - Popover description
   * @param side - Preferred popover side (default: 'bottom')
   * @returns An array with a single DriveStep if the element exists; otherwise, an empty array
   */
  stepIfExists(
    selector: string | HTMLElement,
    title: string,
    description: string,
    side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
  ): DriveStep[] {
    try {
      const pickVisible = (nodeList: NodeListOf<Element>): HTMLElement | null => {
        for (const el of Array.from(nodeList)) {
          const htmlEl = el as HTMLElement;
          const style = window.getComputedStyle(htmlEl);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && htmlEl.getClientRects().length > 0;
          if (isVisible) return htmlEl;
        }
        return null;
      };

      const targetEl = typeof selector === 'string'
        ? pickVisible(document.querySelectorAll(selector))
        : (selector as HTMLElement);

      return targetEl ? [{ element: targetEl as any, popover: { title, description, side } }] : [];
    } catch {
      return [];
    }
  }

  /**
   * Moves to the next step in the current tour
   */
  moveNext(): void {
    if (this.driverInstance) {
      this.driverInstance.moveNext();
    }
  }

  /**
   * Moves to the previous step in the current tour
   */
  movePrevious(): void {
    if (this.driverInstance) {
      this.driverInstance.movePrevious();
    }
  }

  /**
   * Checks if there's an active tour
   */
  isActive(): boolean {
    return this.driverInstance !== null;
  }

  /**
   * Attempts to center the target element within the nearest scrollable ancestor
   * both horizontally and vertically. This helps when elements live inside
   * horizontally scrollable grids/tables (like the ROC detail section).
   */
  private centerInScrollableContainer(element: HTMLElement): void {
    if (!element) return;

    // Special handling for Syncfusion Grid headers: ensure horizontal scroll sync to focused column
    try {
      const handled = this.tryScrollSyncfusionGridHeader(element);
      if (handled) {
        // If we could handle scrolling via grid logic, still attempt generic vertical centering below
      }
    } catch (err) {
      // fail silently, will fallback to generic centering
    }

    const container = this.findScrollableAncestor(element);
    if (!container) return;

    // Compute element position relative to container's scroll content
    const containerRect = container.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();

    const currentScrollLeft = container.scrollLeft;
    const currentScrollTop = container.scrollTop;

    const relativeLeft = elRect.left - containerRect.left + currentScrollLeft;
    const relativeTop = elRect.top - containerRect.top + currentScrollTop;

    const targetLeft = Math.max(
      0,
      Math.min(
        relativeLeft - (container.clientWidth / 2 - element.clientWidth / 2),
        container.scrollWidth - container.clientWidth
      )
    );
    const targetTop = Math.max(
      0,
      Math.min(
        relativeTop - (container.clientHeight / 2 - element.clientHeight / 2),
        container.scrollHeight - container.clientHeight
      )
    );

    // Smoothly scroll; fallback to instant if not supported
    try {
      container.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
    } catch {
      container.scrollLeft = targetLeft;
      container.scrollTop = targetTop;
    }
  }

  /**
   * Attempts to horizontally scroll a Syncfusion Grid to bring a header cell into view.
   * Returns true if the operation was applied, false otherwise.
   */
  private tryScrollSyncfusionGridHeader(element: HTMLElement): boolean {
    // If the target or its ancestors include a header cell in a Syncfusion grid, scroll the grid content.
    const headerCell = element.closest('.e-headercell') as HTMLElement | null;
    const grid = (headerCell || element).closest?.('.e-grid') as HTMLElement | null;
    if (!grid) return false;

    // Grid containers
    const content = grid.querySelector('.e-content') as HTMLElement | null;
    const headerContent = grid.querySelector('.e-headercontent') as HTMLElement | null;

    // We can only control scroll if content exists (Syncfusion syncs header with content scroll)
    if (!content) return false;

    // Identify reference element for offset: prefer headerCell if available; fallback to element
    const refEl = headerCell ?? element;

    // Compute desired horizontal center position relative to the scrollable content width
    // offsetLeft is relative to offsetParent; using getBoundingClientRect + container rect for accuracy
    const contentRect = content.getBoundingClientRect();
    const refRect = refEl.getBoundingClientRect();

    // Translate element's left position to content scroll coordinates
    const relativeLeft = (refRect.left - contentRect.left) + content.scrollLeft;
    const targetLeft = Math.max(
      0,
      Math.min(
        relativeLeft - (content.clientWidth / 2 - refEl.clientWidth / 2),
        content.scrollWidth - content.clientWidth
      )
    );

    try {
      content.scrollTo({ left: targetLeft, behavior: 'smooth' });
      // Also push header content to same scrollLeft just in case sync is delayed
      if (headerContent) headerContent.scrollLeft = targetLeft;
    } catch {
      content.scrollLeft = targetLeft;
      if (headerContent) headerContent.scrollLeft = targetLeft;
    }
    return true;
  }

  /**
   * Finds the nearest ancestor that is actually scrollable either horizontally or vertically
   */
  private findScrollableAncestor(el: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const overflowX = style.overflowX;
      const overflowY = style.overflowY;
      const canScrollX = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') && node.scrollWidth > node.clientWidth;
      const canScrollY = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight;
      if (canScrollX || canScrollY) return node;
      node = node.parentElement;
    }
    return null;
  }

  private ensureCenterAnchor(): HTMLElement {
    if (this.centerAnchorEl && document.body.contains(this.centerAnchorEl)) {
      return this.centerAnchorEl;
    }
    const el = document.createElement('div');
    el.id = 'driver-center-anchor';
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.pointerEvents = 'none';
    el.style.background = 'transparent';
    document.body.appendChild(el);
    this.centerAnchorEl = el;
    return el;
  }

  private removeCenterAnchor(): void {
    if (this.centerAnchorEl && this.centerAnchorEl.parentNode) {
      try { this.centerAnchorEl.parentNode.removeChild(this.centerAnchorEl); } catch { /* ignore */ }
    }
    this.centerAnchorEl = null;
  }

  /**
   * Returns a step for a Syncfusion Grid header cell matched by its visible header text.
   * This avoids brittle nth-child selectors when columns move or visibility changes.
   */
  stepForGridHeaderByText(
    gridSelectorOrEl: string | HTMLElement,
    headerText: string,
    title: string,
    description: string,
    side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
  ): DriveStep[] {
    try {
      const gridEl = typeof gridSelectorOrEl === 'string'
        ? (document.querySelector(gridSelectorOrEl) as HTMLElement | null)
        : (gridSelectorOrEl as HTMLElement | null);
      if (!gridEl) return [];

      const headers = Array.from(
        gridEl.querySelectorAll<HTMLElement>('.e-gridheader .e-headercell, .e-gridheader th[role="columnheader"]')
      );

      const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
      const targetText = normalize(headerText);

      const target = headers.find(h => {
        const visible = this.isElementVisible(h);
        if (!visible) return false;
        const textEl = h.querySelector<HTMLElement>('.e-headertext') || h;
        const txt = normalize(textEl.innerText || textEl.textContent || '');
        return txt === targetText || txt.includes(targetText);
      });

      return target ? [{ element: target as any, popover: { title, description, side } }] : [];
    } catch {
      return [];
    }
  }

  private isElementVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  /**
   * Returns a step for a grid header cell by its visible column index (1-based).
   * Useful for special columns like checkbox selection and command columns
   * that may not have header text.
   */
  stepForGridHeaderByVisibleIndex(
    gridSelectorOrEl: string | HTMLElement,
    visibleIndex1Based: number,
    title: string,
    description: string,
    side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
  ): DriveStep[] {
    try {
      const gridEl = typeof gridSelectorOrEl === 'string'
        ? (document.querySelector(gridSelectorOrEl) as HTMLElement | null)
        : (gridSelectorOrEl as HTMLElement | null);
      if (!gridEl) return [];

      const headers = Array.from(
        gridEl.querySelectorAll<HTMLElement>('.e-gridheader .e-headercell, .e-gridheader th[role="columnheader"]')
      ).filter(h => this.isElementVisible(h));

      if (headers.length === 0) return [];

      const index = Math.max(1, Math.min(visibleIndex1Based, headers.length)) - 1;
      const target = headers[index];
      return target ? [{ element: target as any, popover: { title, description, side } }] : [];
    } catch {
      return [];
    }
  }
}
