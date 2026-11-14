import { Component, input } from '@angular/core';

@Component({
  selector: 'app-aviso',
  host: { class: 'block' },
  template: `
    <div [attr.role]="tipo() === 'error' ? 'alert' : 'status'"
         [attr.data-tipo]="tipo()" class="aviso">
      <span class="icono" aria-hidden="true">
        @switch (tipo()) {
          @case ('exito') { ✓ }
          @case ('error') { ! }
          @default { <span class="espera"></span> }
        }
      </span>
      <div class="min-w-0">
        <p class="font-semibold text-sm">{{ titulo() }}</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-300">{{ mensaje() }}</p>
      </div>
    </div>
  `,
  styles: `
    .aviso {
      --acento: #f3c65f;
      display: flex;
      align-items: flex-start;
      gap: .75rem;
      padding: .875rem 1rem;
      border: 1px solid color-mix(in srgb, var(--acento) 30%, transparent);
      border-inline-start: 3px solid var(--acento);
      border-radius: .8rem;
      background: linear-gradient(120deg, color-mix(in srgb, var(--acento) 12%, #141722), #141722);
      color: var(--acento);
    }
    [data-tipo="error"] { --acento: #ff9caa; }
    [data-tipo="exito"] { --acento: #80e6b4; }
    .icono {
      display: grid;
      place-items: center;
      flex: 0 0 1.75rem;
      height: 1.75rem;
      border: 1px solid color-mix(in srgb, var(--acento) 32%, transparent);
      border-radius: .5rem;
      background: color-mix(in srgb, var(--acento) 15%, transparent);
      font-weight: 700;
    }
    .espera {
      width: .8rem;
      height: .8rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
    }
    @media (prefers-reduced-motion: no-preference) {
      .espera { animation: giro .9s linear infinite; }
      @keyframes giro { to { transform: rotate(360deg); } }
    }
  `
})
export class Aviso {
  readonly tipo = input.required<'error' | 'exito' | 'espera'>();
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
}
