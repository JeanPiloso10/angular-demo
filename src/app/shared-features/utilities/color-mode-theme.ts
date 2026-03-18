import { ActivatedRoute } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { delay, filter, map, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColorModeService} from '@coreui/angular';

export function initColorModeFromRoute({
  colorModeService,
  route,
  destroyRef,
}: {
  colorModeService: ColorModeService,
  route: ActivatedRoute,
  destroyRef: DestroyRef,
}) {
  colorModeService.localStorageItemName.set('coreui-free-angular-admin-template-theme-default');
  colorModeService.eventName.set('ColorSchemeChange');

  route.queryParams.pipe(
    delay(1),
    map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
    filter(theme => ['dark', 'light', 'auto'].includes(theme)),
    tap(theme => colorModeService.colorMode.set(theme)),
    takeUntilDestroyed(destroyRef),
  ).subscribe();
}