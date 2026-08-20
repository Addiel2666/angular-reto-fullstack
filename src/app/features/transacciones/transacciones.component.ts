import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CryptoService } from '../../core/services/crypto.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Transaccion } from '../../models/transaccion.models';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.css'
})
export class TransaccionesComponent implements OnInit {
  loading = signal(false);
  loadingTable = signal(false);
  notification = signal<{ type: 'ok' | 'error'; text: string } | null>(null);
  transacciones = signal<Transaccion[]>([]);
  page = signal(0);
  size = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);
  sortField = signal('id');
  direction = signal<'asc' | 'desc'>('desc');

  form = this.fb.nonNullable.group({
    operacion: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$/)]],
    importe: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    cliente: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$/)]],
    secreto: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private cryptoService: CryptoService,
    private service: TransaccionService
  ) {}

  ngOnInit(): void { this.cargarTransacciones(); }

  async registrar(): Promise<void> {
    this.notification.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      const raw = this.form.getRawValue();
      const secretoCifrado = await this.cryptoService.encryptSecret(raw.secreto);
      this.service.procesar({ ...raw, secreto: secretoCifrado })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: response => {
            this.notification.set({ type: 'ok', text: `Transacción ${response.estatus}. ID ${response.id} · Referencia ${response.referencia}` });
            this.form.reset({ operacion: '', importe: '', cliente: '', secreto: '' });
            this.page.set(0);
            this.cargarTransacciones();
          },
          error: err => this.notification.set({ type: 'error', text: this.errorMessage(err, 'No fue posible registrar la transacción.') })
        });
    } catch (e) {
      this.loading.set(false);
      this.notification.set({ type: 'error', text: e instanceof Error ? e.message : 'No fue posible cifrar el secreto.' });
    }
  }

  cargarTransacciones(): void {
    this.loadingTable.set(true);
    this.service.listar(this.page(), this.size(), this.sortField(), this.direction())
      .pipe(finalize(() => this.loadingTable.set(false)))
      .subscribe({
        next: result => {
          console.log('Página recibida desde H2:', result);
          this.transacciones.set(result.content ?? []);
          this.totalPages.set(result.totalPages ?? 0);
          this.totalElements.set(result.totalElements ?? 0);
        },
        error: err => this.notification.set({ type: 'error', text: this.errorMessage(err, 'No se pudo cargar la consulta paginada. Revisa el endpoint GET de la segunda API.') })
      });
  }

  cancelar(t: Transaccion): void {
    if (t.estatus?.toLowerCase() === 'cancelada') return;
    this.service.cancelar(t.id, t.referencia).subscribe({
      next: () => {
        this.notification.set({ type: 'ok', text: `Transacción ${t.referencia} cancelada correctamente.` });
        this.cargarTransacciones();
      },
      error: err => this.notification.set({ type: 'error', text: this.errorMessage(err, 'No se pudo cancelar la transacción.') })
    });
  }

  changePage(delta: number): void {
    const next = this.page() + delta;
    if (next >= 0 && next < this.totalPages()) {
      this.page.set(next);
      this.cargarTransacciones();
    }
  }

  changeSize(event: Event): void {
    this.size.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(0);
    this.cargarTransacciones();
  }

  changeSort(event: Event): void {
    this.sortField.set((event.target as HTMLSelectElement).value);
    this.page.set(0);
    this.cargarTransacciones();
  }

  toggleDirection(): void {
    this.direction.set(this.direction() === 'asc' ? 'desc' : 'asc');
    this.cargarTransacciones();
  }

  logout(): void { this.auth.logout(); }

  private errorMessage(err: any, fallback: string): string {
    if (typeof err?.error === 'string') return err.error;
    return err?.error?.message ?? err?.error?.error ?? fallback;
  }
}
