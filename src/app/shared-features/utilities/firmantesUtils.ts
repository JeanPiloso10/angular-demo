/**
 * Determina si el usuario actual es firmante designado en algún detalle pendiente de firma.
 */
export function esFirmanteDesignado(detallesFirma: any[], userName: string): boolean {
  return detallesFirma.some((sf: any) =>
    !sf.firmado && (
      sf.usuarioFirmanteDesignado === userName ||
      (Array.isArray(sf.userNamesRol) && sf.userNamesRol.includes(userName))
    )
  );
}

/**
 * Determina si el usuario ya firmó algún detalle.
 */
export function yaFirmoUsuario(detallesFirma: any[], userName: string): boolean {
  return detallesFirma.some((sf: any) => sf.usuarioFirmanteReal === userName);
}
