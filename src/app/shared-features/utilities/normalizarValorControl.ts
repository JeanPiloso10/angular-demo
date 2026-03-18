export function normalizarAArray(val: any): string[] {
  if (Array.isArray(val)) {
    return val.filter((v: any) => v != null && v !== '').map((v: any) => String(v));
  }
  if (val == null || val === '') return [];
  if (typeof val === 'object') {
    const inner = (val as any).value ?? (val as any).codigo ?? null;
    if (Array.isArray(inner)) {
      return inner.filter((v: any) => v != null && v !== '').map((v: any) => String(v));
    }
    if (inner == null || inner === '') return [];
    return [String(inner)];
  }
  return [String(val)];
}

export function valorControlAStringSeparadoPorComas(val: any): string | undefined {
  const arr = normalizarAArray(val);
  return arr.length ? arr.join(',') : undefined;
}
