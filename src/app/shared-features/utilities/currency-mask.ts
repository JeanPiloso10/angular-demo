import { NgxCurrencyInputMode } from "ngx-currency";

export const DEFAULT_CURRENCY_CONFIG = {
  align: 'right',
  allowNegative: false,
  decimal: '.',
  precision: 6,
  prefix: '$ ',
  suffix: '',
  thousands: ',',
  nullable: false,
  inputMode: NgxCurrencyInputMode.Natural
};

export function buildCurrencyConfig(overrides: Partial<typeof DEFAULT_CURRENCY_CONFIG> = {}) {
  return {
    ...DEFAULT_CURRENCY_CONFIG, ...overrides
  };
}
