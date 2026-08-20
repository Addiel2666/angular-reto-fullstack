import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CancelarRequest, PageResponse, Transaccion, TransaccionRequest, TransaccionResponse } from '../../models/transaccion.models';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  constructor(private http: HttpClient) {}

  procesar(request: TransaccionRequest): Observable<TransaccionResponse> {
    return this.http.post<TransaccionResponse>(`${environment.transactionApi}/proceso`, request);
  }

  listar(page: number, size: number, sortField: string, direction: 'asc' | 'desc'): Observable<PageResponse<Transaccion>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortField},${direction}`);
    return this.http.get<PageResponse<Transaccion>>(environment.storageApi, { params });
  }

  cancelar(id: number | string, referencia: string): Observable<unknown> {
    const body: CancelarRequest = { id, referencia, estatus: 'cancelar' };
    return this.http.patch(`${environment.storageApi}/cancelar`, body);
  }
}
