import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  private readonly documento = inject(DOCUMENT);
  protected readonly conectado = inject(AuthService).isAuthenticated;
  protected readonly anio = new Date().getFullYear();

  protected inicioPagina() {
    this.documento.defaultView?.scrollTo({ top: 0 });
  }
}
