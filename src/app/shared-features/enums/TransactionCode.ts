export enum TransactionCode {
  // ABASTECIMIENTO Y COMPRAS
  proveedor = "ABCO10-PRV",
  pagoElectronicoProveedor = "ABCO10A-PEP",
  formaPagoProveedor = "ABCO10B-FPP",
  plazoPagoProveedor = "ABCO10C-PPP",
  cuentaContableProveedor = "ABCO10D-CCP",
  serieDocumentoProveedor = "ABCO10E-SDP",
  proveedorRelacionado = "ABCO10F-PRR",
  requisicion = "ABCO20-REQ",
  consolaAprobacionRequisiciones = "ABCO20A-CAR",
  ordencompra = "ABCO30-COM",
  ordencompraBienes = "ABCO30A-BIE",
  ordencompraServicios = "ABCO30B-SRV",
  consolaAprobacionOrdenCompra = "ABCO31-CAO",
  recepcionServicio = "ABCO40-RES",
  importacion = "ABCO50-IMP",
  recepcionAdministrativa = "ABCO60-REA",
  loteRecepcionCompra = "ABCO70-LRC",
  recepcionCompra = "ABCO70-REC",
  categoriaCompra = "ABCO32-CCOM",
  consolaAprobacionLoteRecepcionCompra = "ABCO70-CAL",
  reposicionCaja = "ABCO80-RCA",
  consolaAprobacionReposicionCaja = "ABCO81-CAR",
  consolaContabilizacionReposicionCaja = "ABCO82-CCR",
  comprobanteElectronicoReposicionCaja ="ABC083-CER",



  // CONFIGURACIONES
  secuencia = "CONFI10-SEC",
  configuracion = "CONFI20-CON",
  configuracionPersonalizada = "CONFI20A-CONPER",
  tipoArchivoAnexos = "CONFI30-TIAR",
  tipoArchivoAnexosTransaccion = "CONFI40-TIART",
  configuracionFirma = "CONFI50-FIR",
  tareaProgramadas = "CONFI55-TASK",
  reporte = "CONFI60-REP",
  motivoAuditoria = "CONFI70-MOAUD",
  motivoAuditoriaTransaccion = "CONFI80-MOAUDT",
  area = "CONFI90-AREA",
  errorLog = "CONFI90-ERR",
  


  // DOCUMENTOS ELECTRONICOS
  recepcionComprobantes = "EDOCS10-REC",
  buzonCorreo = "EDOCS20-BUZ",
  descargaComprobantes = "EDOCS30-DES",
  credencialesSRI = "EDOCS40-CPSRI",
  cronogramaDescargaSRI = "EDOCS40-CDSRI",
  recepcionOrdenCompraComprobanteElectronico = "EDOCS50-RCCE",

  // FINANCIERO Y CONTABILIDAD
  banco = "FICO20-BAN",
  formaPago = "FICO65-FPA",
  plazoPago = "FICO66-PPA",
  tipoSustento = "FICO68-TSU",
  tipoComprobanteFiscal = "FICO69-TCF",
  departamentos = "FICO50B-DEP",
  proyectosInversion = "FICO80-PIN",
  auxiliarContable = "FICO90A-AUX",
  tipoAuxiliarContable = "FICO90B-TAUX",
  loteOrdenPago = "FICO30A-LOP",
  ordenPago = "FICO30B-OPA",
  solicitudAnticipo = "FICO30-SAN",
  pagoElectronico = "FICO30C-PEL",
  consolaAprobacionLoteOrdenPago = "FICO30A-CAL",
  consolaAprobacionSolicitudAnticipo = "FICO30-CAA",
  tipoCentroCosto = "FICO40-TCC",
  planCuenta = "FICO10-PDC",
  cuentaContable = "FICO11-CTA",
  


  // GEOLOCALIZACION
  region = "GELO10-REG",
  pais = "GELO20-PAI",
  provincia = "GELO30-PROV",
  ciudad = "GELO20-CIU",
  puerto = "GELO40-PORT",

  // INVENTARIO Y ALMACENAMIENTO 
  //producto = "INAL10-PRO",
  catalogoItem = "INAL10-ITEM",
  lineaProducto = "INAL10A-LIN",
  claseProducto = "INAL10B-CLA",
  categoriaProducto = "INAL10C-CAT",
  unidadMedida = "INAL10D-UME",
  conversionUnidadMedida = "INAL10D-CUME",
  bodega = "INAL20-BOA",
  ubicacionesFisicas = "INAL20A-UBF",
  // saldoBodega = "INAL30D-SAL",
  motivoInventario = "INAL40-MIN",
  requerimientoInventario = "INAL41-REQ",
  requerimientoInventarioEgreso = "INAL41A-REQE",
  ingresoOrdenCompra = "INAL50-IOC",
  liquidacionImportacion = "INAL60-LQI",
  consolaRequerimientoInventarioEgreso = "INAL41A-CAR",
  requerimientoInventarioIngreso = "INAL41B-REQI",
  plantillaInventario = "INAL70-PLIN",
  movimientoInventario ="INAL50-MI",
  movimientoInventarioIngreso ="INAL50-MII",
  movimientoInventarioEgreso = "INAL50-MIE",
  transferenciaInventario = "INAL50-MT",
  transferenciaInventarioEnvio = "INAL50-MTE",
  transferenciaInventarioRecibe = "INAL50-MTR",


  // SEGURIDAD
  rolUsuario = "SEGU10-ROL",
  usuario = "SEGU20-USR",
  permisorol = "SEGU60-PER",
  permisousuario = "SEGU60A-PUS",
  operaciones = "SEGU30-OPE",
  transacciones = "SEGU40-TRA",
  operacionTransaccion = "SEGU50-OPTRA",
  menu = "SEGU70-MEN",
  apisExternas = "SEGU80-APE",
  notificacionOperacionTransaccion = 'SEGU90-NOT',

  // SOCIO DE NEGOCIOS
  socionegocio = "SONE10-MAE",
  empresa = "SONE10B-EMP",
  sucursal = "SONE11B-SUC",
  solicitante = "SONE10D-SOL",
  actividadEconomica = "SONE20-ACE",
  regimenContribuyente = "SONE30-RCO",
  tipoIdentificacion = "SONE40-TID",
  solicitudPagoElectronico = "FICO30E",

  // LISTA DE PRECIO
  listaPrecio = 'LPRE10-LPR',
  listaPrecioMaterialEmpaque = 'LPRE10A-MAE',
  solicitudAprobacionListaPrecio = "LPRE10-SLPR",
  listaPrecioTransporte = 'LPRE10B-TTE',

  //Exportaciones
  liquidacionExportacion = "EXPO30-LIQ",
  anticipoExportacion = "EXPO10-ANT",
  solicitudLiquidacionExportacion = "EXPO30-SLIQ",

  //Logística de Transporte
  liquidacionTransporte = "LOGT30-LIQ",

  // Logística de Hielo
  liquidacionHielo = "LOGH30-LIQ",

  // ANALYTICS / IA
  asistenteAnalytics = "ANLY10-AIA"
}
