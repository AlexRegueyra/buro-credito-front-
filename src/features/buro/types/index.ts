// ─── Request ──────────────────────────────────────────────────────────────────

export type TipoConsulta = 'PM' | 'PFAE';

export interface DomicilioRequest {
  direccion?: string;
  segundaDireccion?: string;
  codigoPostal?: string;
  coloniaOPoblacion?: string;
  ciudad?: string;
  estado?: string;
  paisDeOrigenDelDomicilio?: string;
  alcaldiaOMunicipio?: string;
}

export interface PersonaRequest {
  rfc: string;
  razonSocial?: string;
  tipoCliente?: number;
  apellidoAdicional?: string;
  apellidoMaterno?: string;
  apellidoPaterno?: string;
  nombre?: string;
  segundoNombre?: string;
  curp?: string;
  fechaDeNacimiento?: string;
  nacionalidad?: string;
  domicilio?: DomicilioRequest;
}

export interface ConsultaRequest {
  persona: PersonaRequest;
  firmaDeAutorizacionDelCliente?: string;
  ambiguedad?: string;
  referenciaCrediticia?: string;
  claveDeConsolidacion?: string;
  indicadorScore?: string;
  codigoScore?: string;
  indicadorVariablesCalifica?: string;
  indicadorVariablesCalificador?: string;
}

// ─── Response — bloques comunes ───────────────────────────────────────────────

export interface Encabezado {
  claveRetorno?: string;
  identificadorTransaccion?: string;
  fechaConsulta?: string;
}

export interface DatosGenerales {
  tipoCliente?: string;
  rfcCliente?: string;
  nombre?: string;
  direccion1?: string;
  coloniaPoblacion?: string;
  delegacionMunicipio?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  extension?: string;
  fax?: string;
  actividadEconomica1?: string;
  actividadEconomica2?: string;
  actividadEconomica3?: string;
  nacionalidad?: string;
  calificacionCartera?: string;
  clavePrevencion?: string;
  clavePrevencionPersonaRelacionada?: string;
  clavePrevencionImpugnada?: string;
  clavePrevencionImpugnadaPersonaRelacionada?: string;
  consultaEntidadFinancieraUltimos3Meses?: string;
  consultaEntidadFinancieraUltimos12Meses?: string;
  consultaEntidadFinancieraUltimos24Meses?: string;
  consultaEntidadFinancieraMas24Meses?: string;
  consultaEmpresaComercialUltimos3Meses?: string;
  consultaEmpresaComercialUltimos12Meses?: string;
  consultaEmpresaComercialUltimos24Meses?: string;
  consultaEmpresaComercialMas24Meses?: string;
  indicadorInformacionAdicional?: string;
}

export interface CreditoFinanciero {
  rfcCliente?: string;
  numeroCuenta?: string;
  tipoUsuario?: string;
  saldoInicial?: string;
  moneda?: string;
  apertura?: string;
  plazo?: string;
  tipoCambio?: string;
  claveObservacion?: string;
  tipoCredito?: string;
  saldoVigente?: string;
  saldoVencidoDe1a29Dias?: string;
  saldoVencidoDe30a59Dias?: string;
  saldoVencidoDe60a89Dias?: string;
  saldoVencidoDe90a119Dias?: string;
  saldoVencidoDe120a179Dias?: string;
  saldoVencidoDe180DiasOMas?: string;
  ultimoPeriodoActualizado?: string;
  fechaCierre?: string;
  pagoCierre?: string;
  quita?: string;
  dacion?: string;
  quebranto?: string;
  registroImpugnado?: string;
  historiaDias?: string;
  historicoPagos?: string;
  atrasoMayor?: string;
  numeroPagos?: string;
  frecuenciaPagos?: string;
  montoPago?: string;
  fechaUltimoPago?: string;
  fechaReestructura?: string;
  fechaPrimerIncumplimiento?: string;
  saldoInsoluto?: string;
  creditoMaximoUtilizado?: string;
  fechaIngresoCarteraVencida?: string;
  delegacionMunicipio?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  estatusPersona?: string;
  porcentaje?: string;
}

export interface CreditoComercial {
  rfcCliente?: string;
  identificadoUsuario?: string;
  identificadorUsuario?: string;
  saldoTotal?: string;
  saldoVigente?: string;
  saldoVencido?: string;
  saldoVencidoDe1a29Dias?: string;
  saldoVencidoDe30a59Dias?: string;
  saldoVencidoDe60a89Dias?: string;
  saldoVencidoDe90a119Dias?: string;
  saldoVencidoDe120a179Dias?: string;
  saldoVencidoDe180DiasOMas?: string;
  ultimoPeriodoActualizado?: string;
  maximoSaldo?: string;
  saldoPromedio?: string;
  historicoPagos?: string;
  regInpugnado?: string;
  regImpugnado?: string;
}

export interface Historia {
  rfc?: string;
  periodo?: string;
  saldoVigente?: string;
  saldoVencido1A29Dias?: string;
  saldoVencido30A59Dias?: string;
  saldoVencido60A89Dias?: string;
  saldoVencidoA90Dias?: string;
  calificacioncartera?: string;
  maximoSaldoVencido?: string;
  mayorNumeroDiasVencido?: string;
}

export interface Califica {
  clave?: string;
  nombre?: string;
  valorCaracteristica?: string;
  codigoError?: string;
}

export interface Score {
  referenciaConsultado?: string;
  codigoScore?: string;
  valorScore?: string;
  codigoRazon1?: string;
  codigoRazon2?: string;
  codigoRazon3?: string;
  codigoRazon4?: string;
  errorScore?: string;
}

// ─── Response — bloques exclusivos de Informe / Perfilador ────────────────────

export interface HawkAlert {
  fechaMensajeHawk?: string;
  codigoHawk?: string;
  usuarioReporta?: string;
  tipoUsuarioReporta?: string;
  descripcionPrevencionHawk?: string;
}

export interface Declarativa {
  rfc?: string;
  declarativa1?: string;
  declarativa2?: string;
  declarativa3?: string;
  declarativa4?: string;
  declarativa5?: string;
  declarativa6?: string;
  declarativa7?: string;
  declarativa8?: string;
  declarativa9?: string;
  declarativa10?: string;
  declarativa11?: string;
  declarativa12?: string;
  declarativa13?: string;
  declarativa14?: string;
  declarativa15?: string;
  declarativa16?: string;
  declarativa17?: string;
  declarativa18?: string;
  declarativa19?: string;
  declarativa20?: string;
  declarativa21?: string;
  fechaDeclarativa?: string;
  tipoDeclarativa?: string;
  tipoOtorgante?: string;
  numeroContrato?: string;
  tipoCredito?: string;
}

export interface Accionista {
  tipoPersona?: string;
  rfc?: string;
  curp?: string;
  nombreAccionista?: string;
  segundoNombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  direccion1?: string;
  direccion2?: string;
  coloniaPoblacion?: string;
}

export interface HistorialConsultasModel {
  rfc?: string;
  fechaConsulta?: string;
  tipoUsuario?: string;
}

// ─── Modelo de respuesta unificado ────────────────────────────────────────────

export interface ApiResponseModel {
  encabezado?: Encabezado;
  datosGenerales?: DatosGenerales;
  creditoFinanciero?: CreditoFinanciero[];
  creditoComercial?: CreditoComercial[];
  historia?: Historia[];
  calificador?: Califica[];
  califica?: Califica[];
  score?: Score[];
  hawkHc?: HawkAlert[];
  hawkHr?: HawkAlert[];
  declarativa?: Declarativa;
  accionista?: Accionista[];
  historialConsultas?: HistorialConsultasModel;
  previsorHr?: unknown[];
}
