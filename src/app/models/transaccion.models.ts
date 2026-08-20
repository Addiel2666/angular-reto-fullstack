export interface TransaccionRequest {
  operacion: string;
  importe: string;
  cliente: string;
  secreto: string;
}

export interface TransaccionResponse {
  id: string;
  estatus: string;
  referencia: string;
  operacion: string;
}

export interface Transaccion {
  id: number | string;
  operacion: string;
  importe: string | number;
  cliente: string;
  referencia: string;
  estatus: string;
  secreto?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface CancelarRequest {
  id: number | string;
  referencia: string;
  estatus: 'cancelar';
}
