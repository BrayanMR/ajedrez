import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square } from 'chess.js';

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-[480px] aspect-square retro-panel p-3 shadow-2xl relative select-none">
      
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
          @let reyAmenazado = casillaEnJaque === coord;

          <div (click)="onSquareClick(coord)"
               [class.casilla-en-jaque]="reyAmenazado"
               [ngClass]="{
                 'bg-[#493758]': !isDark && !isSelected && !isLastMoveSrc && !isLastMoveDst,
                 'bg-[#211b32]': isDark && !isSelected && !isLastMoveSrc && !isLastMoveDst,
                 'bg-amber-500/20 border-2 border-amber-500/40': isLastMoveSrc || isLastMoveDst,
                 'bg-amber-500/40 ring-2 ring-[#d9a01a] z-10': isSelected,
                 'cursor-pointer': esMiTurno && (piece && piece.color === miColor || isLegalDest)
               }"
               class="relative flex items-center justify-center aspect-square transition-all duration-300 ease-out hover:brightness-110">
            
            <!-- Cell Coordinates (Only on bottom row / left column) -->
            <span *ngIf="mostrarLetra(squareIndex)" 
                  [ngClass]="isDark ? 'text-[#f0d9b5]/80' : 'text-[#f0d9b5]/85'"
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

            <div *ngIf="piece"
                 [attr.data-pieza]="piece.type"
                 [class.pieza-negra]="piece.color === 'b'"
                 [class.pieza-recien-movida]="isLastMoveDst"
                 aria-hidden="true"
                 [ngClass]="{
                   'scale-110 -translate-y-1 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-20': isSelected,
                   'hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-transform duration-200 ease-out': esMiTurno && piece.color === miColor && !isSelected,
                   'opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]': !isSelected
                 }"
                 class="pieza w-[82%] h-[82%] flex items-center justify-center z-0 select-none pointer-events-none transform transition-all duration-350 ease-out">
            </div>

          </div>
        </ng-container>
      </div>

    </div>
  `,
  styleUrl: './tablero.css'
})
export class Tablero implements OnChanges {
  @Input() fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  @Input() miColor: 'w' | 'b' = 'w';
  @Input() esMiTurno: boolean = false;
  @Input() ultimoMovimiento: { from: string; to: string } | null = null;

  @Output() onMove = new EventEmitter<{ from: string; to: string; piece: string }>();

  private chess = new Chess();
  
  // Array de índices planos 0..63 para el tablero
  indices: number[] = Array.from({ length: 64 }, (_, i) => i);
  
  selectedSquare: string | null = null;
  legalMoves: string[] = [];
  casillaEnJaque?: Square;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fen'] && this.fen) {
      try {
        this.chess.load(this.fen);
      } catch (e) {
        this.chess.reset();
      }
      this.selectedSquare = null;
      this.legalMoves = [];
      const turno = this.chess.turn();
      this.casillaEnJaque = this.chess.isCheck()
        ? this.chess.board().flat().find(pieza => pieza?.type === 'k' && pieza.color === turno)?.square
        : undefined;
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
