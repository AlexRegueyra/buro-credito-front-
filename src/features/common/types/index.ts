/**
 * Área del catálogo
 */
export interface CatalogoArea {
  id: number;
  claveArea: string;
  descripcion: string;
}

/**
 * Puesto del catálogo
 */
export interface CatalogoPuesto {
  id: number;
  descripcion: string;
}

/**
 * Respuesta del API de catálogos
 */
export interface CatalogosResponse {
  areas: CatalogoArea[];
  puestos: CatalogoPuesto[];
}
