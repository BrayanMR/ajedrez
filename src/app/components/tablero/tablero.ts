import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Chess, Square } from 'chess.js';

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-[480px] aspect-square bg-[#0c101b] border border-gray-800 rounded-2xl p-3 shadow-2xl relative select-none">
      
      <!-- Grid Container (8x8) -->
      <div class="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden bg-[#1e2530] border border-gray-800 shadow-inner">
        <ng-container *ngFor="let squareIndex of indices">
          
          <!-- Cell calculations -->
          @let cell = getCell(squareIndex);
          @let coord = cell.square;
          @let isDark = cell.isDark;
          @let piece = cell.piece;
          @let isSelected = selectedSquare === coord;
          @let isLegalDest = legalMoves.includes(coord);
          @let isLastMoveSrc = ultimoMovimiento?.from === coord;
          @let isLastMoveDst = ultimoMovimiento?.to === coord;

          <div (click)="onSquareClick(coord)"
               [ngClass]="{
                 'bg-[#1e2533]': !isDark && !isSelected && !isLastMoveSrc && !isLastMoveDst,
                 'bg-[#121622]': isDark && !isSelected && !isLastMoveSrc && !isLastMoveDst,
                 'bg-amber-500/20 border-2 border-amber-500/40': isLastMoveSrc || isLastMoveDst,
                 'bg-amber-500/40 ring-2 ring-[#d9a01a] z-10': isSelected,
                 'cursor-pointer': esMiTurno && (piece && piece.color === miColor || isLegalDest)
               }"
               class="relative flex items-center justify-center aspect-square transition-all duration-300 ease-out hover:brightness-110">
            
            <!-- Cell Coordinates (Only on bottom row / left column) -->
            <span *ngIf="mostrarLetra(squareIndex)" 
                  [ngClass]="isDark ? 'text-[#f0d9b5]/25' : 'text-[#b58863]/25'"
                  class="absolute bottom-0.5 right-1.5 text-[9px] font-black uppercase tracking-wider">
              {{ coord.substring(0, 1) }}
            </span>
            <span *ngIf="mostrarNumero(squareIndex)"
                  [ngClass]="isDark ? 'text-[#f0d9b5]/25' : 'text-[#b58863]/25'"
                  class="absolute top-0.5 left-1.5 text-[9px] font-black uppercase tracking-wider">
              {{ coord.substring(1, 2) }}
            </span>

            <!-- Legal Move Dot/Indicator -->
            <div *ngIf="isLegalDest" 
                 [ngClass]="piece ? 'border-4 border-[#d9a01a]/70 w-9 h-9 rounded-full scale-105 animate-pulse' : 'bg-[#d9a01a]/70 w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#d9a01a]'" 
                 class="absolute z-10 pointer-events-none transition-all duration-200">
            </div>

            <!-- Chess Piece SVG -->
            <div *ngIf="piece"
                 [innerHTML]="getPieceSvg(piece.type, piece.color)"
                 [ngClass]="{
                   'scale-110 -translate-y-1 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-20': isSelected,
                   'hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-transform duration-200 ease-out': esMiTurno && piece.color === miColor && !isSelected,
                   'opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]': !isSelected
                 }"
                 class="w-[82%] h-[82%] flex items-center justify-center z-0 select-none pointer-events-none transform transition-all duration-350 ease-out">
            </div>

          </div>
        </ng-container>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Tablero implements OnChanges {
  @Input() fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  @Input() miColor: 'w' | 'b' = 'w';
  @Input() esMiTurno: boolean = false;
  @Input() ultimoMovimiento: { from: string; to: string } | null = null;

  @Output() onMove = new EventEmitter<{ from: string; to: string; piece: string }>();

  private sanitizer = inject(DomSanitizer);
  private chess = new Chess();
  
  // Array de índices planos 0..63 para el tablero
  indices: number[] = Array.from({ length: 64 }, (_, i) => i);
  
  selectedSquare: string | null = null;
  legalMoves: string[] = [];

  // SVG Paths para piezas de ajedrez (Modernos y Minimalistas)
  private readonly SVGS: { [key: string]: string } = {
    // Pawn (Peón)
    wp: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.85 3.87 2.22 5.19C15.94 26.75 14 29.15 14 32v2h17v-2c0-2.85-1.94-5.25-4.22-6.81C28.15 24.87 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    bp: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.85 3.87 2.22 5.19C15.94 26.75 14 29.15 14 32v2h17v-2c0-2.85-1.94-5.25-4.22-6.81C28.15 24.87 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    
    // Knight (Caballo)
    wn: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,24 13,24 C 13,24 15,22 17,22 C 17,22 16,24 15,26 C 14,28 15,31 18,31 C 21,31 23,28 24,25 C 25,22 28,18 28,15 C 28,12 25,10 22,10 z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M 17,31 L 27,31 L 25,35 L 19,35 Z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    bn: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M 22,10 C 22,10 19,11 16,15 C 13,19 13,24 13,24 C 13,24 15,22 17,22 C 17,22 16,24 15,26 C 14,28 15,31 18,31 C 21,31 23,28 24,25 C 25,22 28,18 28,15 C 28,12 25,10 22,10 z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M 17,31 L 27,31 L 25,35 L 19,35 Z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/></svg>`,

    // Bishop (Alfil)
    wb: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 36h27v-2H9v2zm13.5-31c-3.31 0-6 4.03-6 9 0 2.24.55 4.3 1.5 5.86l-2 3.14h13l-2-3.14c.95-1.56 1.5-3.62 1.5-5.86 0-4.97-2.69-9-6-9z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="22.5" cy="5" r="2" fill="#ffffff" stroke="#d9a01a" stroke-width="1.5"/><path d="M22.5 11v8M18.5 15h8" stroke="#d9a01a" stroke-width="1.5"/></svg>`,
    bb: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 36h27v-2H9v2zm13.5-31c-3.31 0-6 4.03-6 9 0 2.24.55 4.3 1.5 5.86l-2 3.14h13l-2-3.14c.95-1.56 1.5-3.62 1.5-5.86 0-4.97-2.69-9-6-9z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="22.5" cy="5" r="2" fill="#181d2a" stroke="#d9a01a" stroke-width="1.5"/><path d="M22.5 11v8M18.5 15h8" stroke="#d9a01a" stroke-width="1.5"/></svg>`,

    // Rook (Torre)
    wr: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 39h27v-3H9v3zm3-13h21v-4H12v4zm2.5-4l1.5-12h14l1.5 12h-17z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 10h4v3h-4zm6 0h5v3h-5zm7 0h4v3h-4z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.5"/></svg>`,
    br: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 39h27v-3H9v3zm3-13h21v-4H12v4zm2.5-4l1.5-12h14l1.5 12h-17z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 10h4v3h-4zm6 0h5v3h-5zm7 0h4v3h-4z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.5"/></svg>`,

    // Queen (Reina)
    wq: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 37h27v-3H9v3zm3.5-4l3-18 7 9 7-9 3 18h-20z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12.5" cy="15" r="2" fill="#ffffff" stroke="#d9a01a" stroke-width="1.5"/><circle cx="22.5" cy="12" r="2" fill="#ffffff" stroke="#d9a01a" stroke-width="1.5"/><circle cx="32.5" cy="15" r="2" fill="#ffffff" stroke="#d9a01a" stroke-width="1.5"/></svg>`,
    bq: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 37h27v-3H9v3zm3.5-4l3-18 7 9 7-9 3 18h-20z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12.5" cy="15" r="2" fill="#181d2a" stroke="#d9a01a" stroke-width="1.5"/><circle cx="22.5" cy="12" r="2" fill="#181d2a" stroke="#d9a01a" stroke-width="1.5"/><circle cx="32.5" cy="15" r="2" fill="#181d2a" stroke="#d9a01a" stroke-width="1.5"/></svg>`,

    // King (Rey)
    wk: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 38h27v-3H9v3zm13.5-4c-3.62 0-6.5-3.87-6.5-8.5 0-3.32 1.59-6.2 4-7.46l-1.5-6h8l-1.5 6c2.41 1.26 4 4.14 4 7.46 0 4.63-2.88 8.5-6.5 8.5z" fill="#ffffff" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M22.5 5v5M20 7.5h5" stroke="#d9a01a" stroke-width="1.5"/></svg>`,
    bk: `<svg viewBox="0 0 45 45" class="w-full h-full"><path d="M9 38h27v-3H9v3zm13.5-4c-3.62 0-6.5-3.87-6.5-8.5 0-3.32 1.59-6.2 4-7.46l-1.5-6h8l-1.5 6c2.41 1.26 4 4.14 4 7.46 0 4.63-2.88 8.5-6.5 8.5z" fill="#181d2a" stroke="#d9a01a" stroke-width="1.8" stroke-linejoin="round"/><path d="M22.5 5v5M20 7.5h5" stroke="#d9a01a" stroke-width="1.5"/></svg>`
  };

  getPieceSvg(type: string, color: string): SafeHtml {
    const key = color + type;
    const svgContent = this.SVGS[key] || '';
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fen'] && this.fen) {
      try {
        this.chess.load(this.fen);
      } catch (e) {
        this.chess.reset();
      }
      this.selectedSquare = null;
      this.legalMoves = [];
    }
  }

  // Obtiene los datos del casillero según el índice
  getCell(index: number) {
    let actualIndex = index;
    
    // Si el jugador es Negro, volteamos el tablero
    if (this.miColor === 'b') {
      actualIndex = 63 - index;
    }

    const row = Math.floor(actualIndex / 8);
    const col = actualIndex % 8;
    const isDark = (row + col) % 2 === 1;

    const file = String.fromCharCode(97 + col); // a-h
    const rank = (8 - row).toString(); // 8-1
    const square = (file + rank) as Square;

    const piece = this.chess.get(square);

    return {
      square,
      isDark,
      piece
    };
  }

  onSquareClick(square: string) {
    if (!this.esMiTurno) return;

    const piece = this.chess.get(square as Square);

    // 1. Si hace clic en una pieza de su propio color, seleccionarla
    if (piece && piece.color === this.miColor) {
      this.selectedSquare = square;
      
      const moves = this.chess.moves({ square: square as Square, verbose: true });
      this.legalMoves = moves.map(m => m.to);
    } 
    // 2. Si hace clic en un movimiento válido, ejecutarlo
    else if (this.selectedSquare && this.legalMoves.includes(square)) {
      const from = this.selectedSquare;
      const to = square;
      const movedPiece = this.chess.get(from as Square);

      if (movedPiece) {
        this.onMove.emit({
          from,
          to,
          piece: movedPiece.type.toUpperCase()
        });
      }

      this.selectedSquare = null;
      this.legalMoves = [];
    } 
    // 3. De lo contrario, cancelar selección
    else {
      this.selectedSquare = null;
      this.legalMoves = [];
    }
  }

  // Helpers de coordenadas en los bordes
  mostrarLetra(index: number): boolean {
    return Math.floor(index / 8) === 7;
  }

  mostrarNumero(index: number): boolean {
    return index % 8 === 0;
  }
}
