import { Cage } from '../types';

export function solveKillerSudokuLocally(cages: Cage[]): number[][] | null {
  const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

  function findEmpty(): [number, number] | null {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          return [r, c];
        }
      }
    }
    return null;
  }

  function isValid(num: number, row: number, col: number): boolean {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num && i !== col) {
        return false;
      }
    }
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num && i !== row) {
        return false;
      }
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[boxRow + r][boxCol + c] === num && (boxRow + r !== row || boxCol + c !== col)) {
          return false;
        }
      }
    }
    return true;
  }
    
  function checkCages(): boolean {
    for (const cage of cages) {
        let currentSum = 0;
        const cageCells = cage.cells;
        let isCageFull = true;
        const seenNumbers = new Set<number>();

        for (const cell of cageCells) {
            const val = board[cell.row][cell.col];
            if (val === 0) {
                isCageFull = false;
                break;
            }
            if(seenNumbers.has(val)) return false; // Duplicate numbers in cage
            seenNumbers.add(val);
            currentSum += val;
        }

        if (isCageFull) {
            if (currentSum !== cage.sum) {
                return false;
            }
        } else {
             if (currentSum >= cage.sum) {
                return false;
            }
        }
    }
    return true;
  }

  function solve(): boolean {
    const emptyPos = findEmpty();
    if (!emptyPos) {
      return checkCages(); // Final check when board is full
    }
    const [row, col] = emptyPos;

    for (let num = 1; num <= 9; num++) {
      board[row][col] = num;
      if (isValid(num, row, col) && checkCages()) {
        if (solve()) {
          return true;
        }
      }
    }
    
    board[row][col] = 0; // Backtrack
    return false;
  }

  if (solve()) {
    return board;
  } else {
    return null;
  }
}
