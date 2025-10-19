/* This class handles the rules of chess and ensures pieces are moved according to the game's rules. */
export default class Referee {

  // Define the board state
  private board: (string | undefined)[][] = [];
  private prevX = 0;
  private prevY = 0;
  private newX = 0;
  private newY = 0;
  private moveCount = 0;
  private destPiece?: string;


  setMoveCount(moveCount: number) {
    this.moveCount = moveCount;
  }

  /**
  * Validates a move for a given piece.
  *
  * @param prevX - The starting x-coordinate of the piece.
  * @param prevY - The starting y-coordinate of the piece.
  * @param newX - The target x-coordinate for the piece.
  * @param newY - The target y-coordinate for the piece.
  * @param piece - The type of the piece being moved.
  * @param destPiece - The piece being captured, if any.
  * 
  */
  isValidMove(
    board: (string | undefined)[][],
    prevX: number,
    prevY: number,
    newX: number,
    newY: number,
    piece: string,
    destPiece?: string
  ): boolean {

    // Set up the board state
    this.board = board;
    this.prevX = prevX;
    this.prevY = prevY;
    this.newX = newX;
    this.newY = newY;
    this.destPiece = destPiece;

    // Calculate the difference in position
    const dx = newX - prevX;
    const dy = newY - prevY;

    // checks if selected piece's colour is the one whose turn it is
    if (((piece.split('_')[1] == "white") && (this.moveCount % 2 == 1)) || ((piece.split('_')[1] == "black") && (this.moveCount % 2 == 0))) {
      return false;
    }

    // Check for blocking pieces
    if (destPiece && this.isOwnPiece(piece, destPiece)) {
      console.warn(`Invalid move: cannot capture own piece: ${destPiece}`);
      return false;
    }

    // First validate the move based on piece type
    let isValidPieceMove = false;

    // Validate the move based on the piece type
    switch (piece) {
      case "pawn_white":
        isValidPieceMove = this.validatePawn(true);
        break;

      case "pawn_black":
        isValidPieceMove = this.validatePawn(false);
        break;

      case "rook_white":
      case "rook_black":
        isValidPieceMove = this.validateRook();
        break;

      case "bishop_white":
      case "bishop_black":
        isValidPieceMove = this.validateBishop();
        break;

      case "queen_white":
      case "queen_black":
        isValidPieceMove = this.validateQueen();
        break;

      case "king_white":
      case "king_black":
        isValidPieceMove = this.validateKing(dx, dy);
        break;

      case "knight_white":
      case "knight_black":
        isValidPieceMove = this.validateKnight(dx, dy);
        break;

      default:
        isValidPieceMove = false;
    }

    // If the piece move is invalid, return false
    if (!isValidPieceMove) {
      return false;
    }

    // Check if this move would leave the king in check
    const isWhite = piece.includes("white");
    if (this.wouldMoveLeaveKingInCheck(board, prevX, prevY, newX, newY, isWhite)) {
      console.warn(`Invalid move: would leave king in check`);
      return false;
    }

    return true;
  }

  /**
   * Determines if two pieces belong to the same player.
   *
   * @param piece - The piece being moved.
   * @param destPiece - The piece at the destination.
   * @returns Whether both pieces belong to the same player.
   */
  private isOwnPiece(piece: string, destPiece: string): boolean {
    // Assumes piece strings are in the format 'type_color'
    const pieceColor = piece.split('_')[1];
    const destColor = destPiece.split('_')[1];
    return pieceColor === destColor;
  }

  /**
   * Determines the step direction between two positions.
   *
   * @param prev - The previous position.
   * @param next - The next position.
   * @returns The step direction (-1, 0, 1).
   */
  private getStep(prev: number, next: number): number {
    if (prev === next) return 0;
    return next > prev ? 1 : -1;
  }

  /**
   * Checks if the path is clear for a piece to move.
   * 
   * @returns Whether the path is clear.
   */
  private isPathClear(): boolean {
    const stepX = this.getStep(this.prevX, this.newX);
    const stepY = this.getStep(this.prevY, this.newY);

    let x = this.prevX + stepX;
    let y = this.prevY + stepY;

    // Check for obstacles in the path
    while (x !== this.newX || y !== this.newY) {
      if (this.board[y][x]) {
        console.warn(`Invalid move: path blocked at ${x}, ${y}`);
        return false;
      }
      x += stepX;
      y += stepY;
    }
    return true;
  }

  /**
   * Validates a pawn move.
   *
   * @param isWhite - Whether the pawn is white or black.
   * @returns Whether the move is valid.
   */
  private validatePawn(isWhite = true): boolean {
    // Determine the direction of movement based on the pawn's color
    const dir = isWhite ? 1 : -1;
    const startRow = isWhite ? 1 : 6;

    // Single move logic
    if (this.prevX === this.newX && this.newY - this.prevY === dir && !this.destPiece) return true;

    // Double move logic from starting row
    if (this.prevX === this.newX && this.prevY === startRow && this.newY - this.prevY === 2 * dir) {
      if (!this.destPiece) {
        // Check the intermediate square for a blockage
        const intermediateY = this.prevY + dir;
        if (this.board[intermediateY][this.prevX]) {
          console.warn(`Invalid move: path blocked at ${this.prevX}, ${intermediateY}`);
          return false; // path blocked
        }
        return true;
      }
    }

    // Capture diagonally
    if (Math.abs(this.newX - this.prevX) === 1 && this.newY - this.prevY === dir && this.destPiece) return true;

    return false;
  }

  /**
   * Validates a bishop move.
   *
   * @returns Whether the move is valid.
   */
  private validateBishop() {
    // Check for valid diagonal movement
    if (Math.abs(this.newX - this.prevX) !== Math.abs(this.newY - this.prevY)) return false;
    return this.isPathClear();
  }

  /**
   * Validates a knight move.
   * Note no jump prevention needed, as the knight can jump over pieces.
   *
   * @param dx - The change in x-coordinate.
   * @param dy - The change in y-coordinate.
   * @returns Whether the move is valid.
   */
  private validateKnight(dx: number, dy: number) {
    // Knights move in an L shape: two squares in one direction and then one square perpendicular
    return (
      (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
      (Math.abs(dx) === 1 && Math.abs(dy) === 2)
    );
  }

  /**
   * Validates a rook move.
   *
   * @returns Whether the move is valid.
   */
  private validateRook() {
    // Check for valid horizontal or vertical movement
    if (this.prevX !== this.newX && this.prevY !== this.newY) return false;
    return this.isPathClear();
  }

  /**
   * Validates a queen move.
   * Uses both rook and bishop movement rules.
   *
   * @returns Whether the move is valid.
   */
  private validateQueen() {
    // Queens move like both rooks and bishops
    return this.validateRook() || this.validateBishop();
  }

  /**
   * Validates a king move.
   * Note no jump prevention needed, as the king can only move one square.
   *
   * @param dx - The change in x-coordinate.
   * @param dy - The change in y-coordinate.
   * @returns Whether the move is valid.
   */
  private validateKing(dx: number, dy: number) {
    // King moves one square in any direction
    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
  }

  /**
   * Finds the position of a king on the board.
   *
   * @param isWhite - Whether to find the white or black king.
   * @returns The position [x, y] of the king, or null if not found.
   */
  private findKing(isWhite: boolean): [number, number] | null {
    const kingPiece = isWhite ? "king_white" : "king_black";

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.board[y][x] === kingPiece) {
          return [x, y];
        }
      }
    }
    return null;
  }

  /**
   * Checks if a square is under attack by the opposing player.
   *
   * @param x - The x-coordinate of the square.
   * @param y - The y-coordinate of the square.
   * @param isWhiteKing - Whether we're checking attacks on a white king.
   * @returns Whether the square is under attack.
   */
  private isSquareUnderAttack(x: number, y: number, isWhiteKing: boolean): boolean {
    const opponentColor = isWhiteKing ? "black" : "white";

    // Check all opponent pieces to see if they can attack this square
    for (let boardY = 0; boardY < 8; boardY++) {
      for (let boardX = 0; boardX < 8; boardX++) {
        const piece = this.board[boardY][boardX];
        if (piece && piece.includes(opponentColor)) {
          if (this.canPieceAttackSquare(piece, boardX, boardY, x, y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Checks if a piece can attack a specific square.
   *
   * @param piece - The piece to check.
   * @param fromX - The x position of the attacking piece.
   * @param fromY - The y position of the attacking piece.
   * @param toX - The x position of the target square.
   * @param toY - The y position of the target square.
   * @returns Whether the piece can attack the target square.
   */
  private canPieceAttackSquare(piece: string, fromX: number, fromY: number, toX: number, toY: number): boolean {
    const dx = toX - fromX;
    const dy = toY - fromY;

    // Store original values
    const originalPrevX = this.prevX;
    const originalPrevY = this.prevY;
    const originalNewX = this.newX;
    const originalNewY = this.newY;
    const originalDestPiece = this.destPiece;

    // Set values for attack check
    this.prevX = fromX;
    this.prevY = fromY;
    this.newX = toX;
    this.newY = toY;
    this.destPiece = this.board[toY][toX];

    let canAttack = false;

    switch (piece) {
      case "pawn_white":
        // White pawns attack diagonally upward
        canAttack = Math.abs(dx) === 1 && dy === 1;
        break;

      case "pawn_black":
        // Black pawns attack diagonally downward
        canAttack = Math.abs(dx) === 1 && dy === -1;
        break;

      case "rook_white":
      case "rook_black":
        canAttack = this.validateRook();
        break;

      case "bishop_white":
      case "bishop_black":
        canAttack = this.validateBishop();
        break;

      case "queen_white":
      case "queen_black":
        canAttack = this.validateQueen();
        break;

      case "king_white":
      case "king_black":
        canAttack = this.validateKing(dx, dy);
        break;

      case "knight_white":
      case "knight_black":
        canAttack = this.validateKnight(dx, dy);
        break;

      default:
        canAttack = false;
    }

    // Restore original values
    this.prevX = originalPrevX;
    this.prevY = originalPrevY;
    this.newX = originalNewX;
    this.newY = originalNewY;
    this.destPiece = originalDestPiece;

    return canAttack;
  }

  /**
   * Checks if a king is currently in check.
   *
   * @param board - The current board state.
   * @param isWhite - Whether to check the white or black king.
   * @returns Whether the king is in check.
   */
  isKingInCheck(board: (string | undefined)[][], isWhite: boolean): boolean {
    this.board = board;
    const kingPosition = this.findKing(isWhite);

    if (!kingPosition) {
      return false; // King not found
    }

    return this.isSquareUnderAttack(kingPosition[0], kingPosition[1], isWhite);
  }

  /**
   * Checks if a move would leave the king in check.
   *
   * @param board - The current board state.
   * @param fromX - Starting x position.
   * @param fromY - Starting y position.
   * @param toX - Target x position.
   * @param toY - Target y position.
   * @param isWhite - Whether it's white's move.
   * @returns Whether the move would leave the king in check.
   */
  wouldMoveLeaveKingInCheck(
    board: (string | undefined)[][],
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    isWhite: boolean
  ): boolean {
    // Create a copy of the board to simulate the move
    const tempBoard = board.map(row => [...row]);

    // Make the move on the temporary board
    const piece = tempBoard[fromY][fromX];
    tempBoard[toY][toX] = piece;
    tempBoard[fromY][fromX] = undefined;

    // Check if the king would be in check after this move
    return this.isKingInCheck(tempBoard, isWhite);
  }

  /**
   * Gets all valid moves for a player.
   *
   * @param board - The current board state.
   * @param isWhite - Whether to get moves for white or black.
   * @returns Whether there are any valid moves.
   */
  hasValidMoves(board: (string | undefined)[][], isWhite: boolean): boolean {
    this.board = board;
    const color = isWhite ? "white" : "black";
    let validMoveCount = 0;

    console.log(`Checking valid moves for ${color}...`);

    // Check all pieces of the current player
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.includes(color)) {
          // Check all possible destination squares for this piece
          for (let newY = 0; newY < 8; newY++) {
            for (let newX = 0; newX < 8; newX++) {
              if (newX === x && newY === y) continue; // Skip same position

              // For checkmate detection, we need to check if ANY move would get out of check
              // Use a simpler validation that bypasses the turn checking
              if (this.isValidMoveForCheckmate(board, x, y, newX, newY, piece, board[newY][newX])) {
                validMoveCount++;
                console.log(`Valid move found: ${piece} from (${x},${y}) to (${newX},${newY})`);
                return true; // Found at least one valid move
              }
            }
          }
        }
      }
    }

    console.log(`Total valid moves found: ${validMoveCount}`);
    return false; // No valid moves found
  }

  /**
   * Simplified move validation specifically for checkmate detection.
   * This bypasses turn checking and focuses on piece movement rules and check avoidance.
   */
  private isValidMoveForCheckmate(
    board: (string | undefined)[][],
    prevX: number,
    prevY: number,
    newX: number,
    newY: number,
    piece: string,
    destPiece?: string
  ): boolean {
    // Set up the board state
    this.board = board;
    this.prevX = prevX;
    this.prevY = prevY;
    this.newX = newX;
    this.newY = newY;
    this.destPiece = destPiece;

    // Calculate the difference in position
    const dx = newX - prevX;
    const dy = newY - prevY;

    // Check for blocking pieces (can't capture own piece)
    if (destPiece && this.isOwnPiece(piece, destPiece)) {
      return false;
    }

    // Validate the move based on the piece type
    let isValidPieceMove = false;
    switch (piece) {
      case "pawn_white":
        isValidPieceMove = this.validatePawn(true);
        break;
      case "pawn_black":
        isValidPieceMove = this.validatePawn(false);
        break;
      case "rook_white":
      case "rook_black":
        isValidPieceMove = this.validateRook();
        break;
      case "bishop_white":
      case "bishop_black":
        isValidPieceMove = this.validateBishop();
        break;
      case "queen_white":
      case "queen_black":
        isValidPieceMove = this.validateQueen();
        break;
      case "king_white":
      case "king_black":
        isValidPieceMove = this.validateKing(dx, dy);
        break;
      case "knight_white":
      case "knight_black":
        isValidPieceMove = this.validateKnight(dx, dy);
        break;
      default:
        isValidPieceMove = false;
    }

    if (!isValidPieceMove) {
      return false;
    }

    // Check if this move would leave the king in check
    const pieceIsWhite = piece.includes("white");
    if (this.wouldMoveLeaveKingInCheck(board, prevX, prevY, newX, newY, pieceIsWhite)) {
      return false;
    }

    return true;
  }

  /**
   * Checks if the current position is checkmate.
   *
   * @param board - The current board state.
   * @param isWhite - Whether to check for white or black checkmate.
   * @returns Whether it's checkmate.
   */
  isCheckmate(board: (string | undefined)[][], isWhite: boolean): boolean {
    // First check if the king is in check
    if (!this.isKingInCheck(board, isWhite)) {
      return false;
    }

    // If in check, see if there are any valid moves to escape
    return !this.hasValidMoves(board, isWhite);
  }

  /**
   * Checks if the current position is stalemate.
   *
   * @param board - The current board state.
   * @param isWhite - Whether to check for white or black stalemate.
   * @returns Whether it's stalemate.
   */
  isStalemate(board: (string | undefined)[][], isWhite: boolean): boolean {
    // King must not be in check for stalemate
    if (this.isKingInCheck(board, isWhite)) {
      return false;
    }

    // No valid moves available
    return !this.hasValidMoves(board, isWhite);
  }

  /**
   * Gets the current game status.
   *
   * @param board - The current board state.
   * @param isWhiteTurn - Whether it's currently white's turn.
   * @returns The game status: 'normal', 'check', 'checkmate', or 'stalemate'.
   */
  getGameStatus(board: (string | undefined)[][], isWhiteTurn: boolean): 'normal' | 'check' | 'checkmate' | 'stalemate' {
    this.board = board;

    const isInCheck = this.isKingInCheck(board, isWhiteTurn);
    const hasValidMovesAvailable = this.hasValidMoves(board, isWhiteTurn);

    console.log(`Game status check - Turn: ${isWhiteTurn ? 'White' : 'Black'}, In Check: ${isInCheck}, Has Valid Moves: ${hasValidMovesAvailable}`);

    // Checkmate: In check AND no valid moves
    if (isInCheck && !hasValidMovesAvailable) {
      console.log('CHECKMATE detected!');
      return 'checkmate';
    }

    // Stalemate: Not in check AND no valid moves
    if (!isInCheck && !hasValidMovesAvailable) {
      console.log('STALEMATE detected!');
      return 'stalemate';
    }

    // Check: In check but has valid moves
    if (isInCheck) {
      console.log('CHECK detected!');
      return 'check';
    }

    // Normal: Not in check and has valid moves
    return 'normal';
  }
}
