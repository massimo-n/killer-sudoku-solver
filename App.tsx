import React, { useState, useEffect, useRef } from 'react';
import { Cage, Position } from './types';
import { solveKillerSudokuLocally } from './services/solverService';
import Spinner from './components/Spinner';
import { MagicWandIcon, TrashIcon, StepForwardIcon, EyeIcon, PencilIcon } from './components/icons';

const App = () => {
    const [grid, setGrid] = useState<number[][]>(Array(9).fill(0).map(() => Array(9).fill(0)));
    const [cages, setCages] = useState<Cage[]>([]);
    const [selectedCells, setSelectedCells] = useState<Position[]>([]);
    const [solution, setSolution] = useState<number[][] | null>(null);
    const [revealedCells, setRevealedCells] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [solveMode, setSolveMode] = useState<'instant' | 'step'>('instant');
    
    const [editingCageIndex, setEditingCageIndex] = useState<number | null>(null);
    const [tempCageCells, setTempCageCells] = useState<Position[]>([]);
    const [inlineSum, setInlineSum] = useState<string>('');
    const [hoveredCageIndex, setHoveredCageIndex] = useState<number | null>(null);

    const inlineInputRef = useRef<HTMLInputElement>(null);

    const isPositionInArray = (arr: Position[], pos: Position) => arr.some(p => p.row === pos.row && p.col === pos.col);

    useEffect(() => {
        if (inlineInputRef.current) {
            inlineInputRef.current.focus();
        }
    }, [selectedCells, tempCageCells]);

    const handleCellClick = (row: number, col: number) => {
        if (solution) return;
        const pos = { row, col };
        const currentSelection = editingCageIndex !== null ? tempCageCells : selectedCells;
        
        let newSelection;
        if (isPositionInArray(currentSelection, pos)) {
            newSelection = currentSelection.filter(p => p.row !== pos.row || p.col !== pos.col);
        } else {
            newSelection = [...currentSelection, pos];
        }

        if (editingCageIndex !== null) {
            setTempCageCells(newSelection);
        } else {
            setSelectedCells(newSelection);
            if (newSelection.length === 0) setInlineSum('');
        }
    };
    
    const getTopLeftMostCell = (cells: Position[]): Position | null => {
        if (cells.length === 0) return null;
        return cells.reduce((topLeft, cell) => {
            if (cell.row < topLeft.row) return cell;
            if (cell.row === topLeft.row && cell.col < topLeft.col) return cell;
            return topLeft;
        }, cells[0]);
    };

    const handleAddOrUpdateCage = () => {
        const sum = parseInt(inlineSum, 10);
        const cellsToUse = editingCageIndex !== null ? tempCageCells : selectedCells;

        if (!sum || isNaN(sum) || cellsToUse.length === 0) {
            setError('Inserisci una somma e seleziona le celle per la gabbia.');
            return;
        }

        const minPossibleSum = cellsToUse.length * (cellsToUse.length + 1) / 2;
        const maxPossibleSum = 9 * cellsToUse.length - (cellsToUse.length * (cellsToUse.length - 1) / 2);
        if (sum < minPossibleSum || sum > maxPossibleSum) {
            setError(`Somma non valida. Per ${cellsToUse.length} celle, la somma deve essere tra ${minPossibleSum} e ${maxPossibleSum}.`);
            return;
        }

        const newCage: Cage = { sum, cells: cellsToUse };
        let newCages;

        if (editingCageIndex !== null) {
            newCages = [...cages];
            newCages[editingCageIndex] = newCage;
            setEditingCageIndex(null);
            setTempCageCells([]);
        } else {
            newCages = [...cages, newCage];
        }
        
        setCages(newCages);
        setSelectedCells([]);
        setInlineSum('');
        setError(null);
    };

    const handleEditCage = (index: number) => {
        setEditingCageIndex(index);
        setTempCageCells(cages[index].cells);
        setInlineSum(cages[index].sum.toString());
        setSelectedCells([]);
    };
    
    const handleCancelEdit = () => {
        setEditingCageIndex(null);
        setTempCageCells([]);
        setInlineSum('');
        setError(null);
    }

    const handleDeleteCage = (index: number) => {
        if (editingCageIndex === index) handleCancelEdit();
        setCages(cages.filter((_, i) => i !== index));
    };

    const handleSolve = async () => {
        setIsLoading(true);
        setError(null);
        setSolution(null);
        setRevealedCells([]);

        setTimeout(() => {
            try {
                const result = solveKillerSudokuLocally(cages);
                if (result) {
                    setSolution(result);
                    if (solveMode === 'instant') {
                        setGrid(result);
                    }
                } else {
                    setError("Nessuna soluzione trovata per questa configurazione.");
                }
            } catch (e) {
                setError("Si è verificato un errore durante la risoluzione.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 50); // Timeout allows UI to update to loading state
    };
    
    const handleStep = () => {
        if (!solution || revealedCells.length >= 81) return;
        const flatSolutionCells: Position[] = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                flatSolutionCells.push({row: r, col: c});
            }
        }
        const nextCellToReveal = flatSolutionCells.find(pos => !isPositionInArray(revealedCells, pos));

        if (nextCellToReveal) {
            const newRevealedCells = [...revealedCells, nextCellToReveal];
            setRevealedCells(newRevealedCells);

            const newGrid = grid.map(row => [...row]);
            for (const { row, col } of newRevealedCells) {
                newGrid[row][col] = solution[row][col];
            }
            setGrid(newGrid);
        }
    };

    const handleRevealAll = () => {
        if (!solution) return;
        setGrid(solution);
        const allCells = [];
        for(let r=0; r<9; r++) for(let c=0; c<9; c++) allCells.push({row:r, col:c});
        setRevealedCells(allCells);
    };

    const handleClear = () => {
        setGrid(Array(9).fill(0).map(() => Array(9).fill(0)));
        setCages([]);
        setSelectedCells([]);
        setSolution(null);
        setRevealedCells([]);
        setIsLoading(false);
        setError(null);
        setEditingCageIndex(null);
        setTempCageCells([]);
        setInlineSum('');
    };
    
    const cageColors = [
        'rgba(255, 165, 0, 0.3)', 'rgba(50, 205, 50, 0.3)', 'rgba(255, 105, 180, 0.3)',
        'rgba(30, 144, 255, 0.3)', 'rgba(218, 112, 214, 0.3)', 'rgba(255, 215, 0, 0.3)',
        'rgba(135, 206, 250, 0.3)', 'rgba(240, 128, 128, 0.3)', 'rgba(0, 250, 154, 0.3)'
    ];

    const getCageForCell = (row: number, col: number) => {
        const cageIndex = cages.findIndex(cage => isPositionInArray(cage.cells, { row, col }));
        if (cageIndex !== -1) {
            return { cage: cages[cageIndex], color: cageColors[cageIndex % cageColors.length] };
        }
        return null;
    };
    
    const getBorders = (row: number, col: number) => {
        const cageInfo = getCageForCell(row, col);
        if (!cageInfo) return {};

        const { cage } = cageInfo;
        const borders: React.CSSProperties = {};
        if (!isPositionInArray(cage.cells, { row: row - 1, col })) borders.borderTop = '2px solid black';
        if (!isPositionInArray(cage.cells, { row: row + 1, col })) borders.borderBottom = '2px solid black';
        if (!isPositionInArray(cage.cells, { row, col: col - 1 })) borders.borderLeft = '2px solid black';
        if (!isPositionInArray(cage.cells, { row, col: col + 1 })) borders.borderRight = '2px solid black';
        return borders;
    };

    const currentSelection = editingCageIndex !== null ? tempCageCells : selectedCells;
    const inlineInputPos = getTopLeftMostCell(currentSelection);
    const cellsToHighlight = hoveredCageIndex !== null ? cages[hoveredCageIndex].cells : [];

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
            <h1 className="epic-title mb-8">
                ⚔️ KILLER SUDOKU ⚔️
            </h1>
            <main className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
                <div className="flex-grow flex justify-center items-start">
                    <div className="grid grid-cols-9 relative sudoku-grid">
                        {grid.map((row, r) =>
                            row.map((cell, c) => {
                                const cageInfo = getCageForCell(r, c);
                                const isSelected = isPositionInArray(currentSelection, { row: r, col: c });
                                const isHighlighted = isPositionInArray(cellsToHighlight, { row: r, col: c });
                                const cageSum = cageInfo && getTopLeftMostCell(cageInfo.cage.cells)?.row === r && getTopLeftMostCell(cageInfo.cage.cells)?.col === c ? cageInfo.cage.sum : null;
                                
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={`sudoku-cell
                                            ${isSelected ? 'selected debug-selected' : ''}
                                            ${isHighlighted ? 'highlighted debug-highlighted' : ''}
                                        `}
                                        style={{ 
                                            backgroundColor: isSelected || isHighlighted ? undefined : cageInfo?.color,
                                            ...getBorders(r,c) 
                                        }}
                                    >
                                        {cageSum && <span className="cage-sum">{cageSum}</span>}
                                        {cell !== 0 && <span>{cell}</span>}

                                        {inlineInputPos && inlineInputPos.row === r && inlineInputPos.col === c && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <input
                                                    ref={inlineInputRef}
                                                    type="number"
                                                    value={inlineSum}
                                                    onChange={e => setInlineSum(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddOrUpdateCage()}
                                                    className="inline-input"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="w-full md:w-96 p-8 epic-panel">
                    <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                        ⚔️ Killer Sudoku
                    </h1>
                    
                    <div className="space-y-4 mb-6">
                        <button 
                            onClick={handleAddOrUpdateCage}
                            className="w-full epic-btn py-4 px-6"
                            disabled={isLoading || currentSelection.length === 0}
                        >
                            {editingCageIndex !== null ? 'Aggiorna Gabbia' : 'Aggiungi Gabbia'}
                        </button>
                        {editingCageIndex !== null && (
                            <button onClick={handleCancelEdit} className="w-full epic-btn py-4 px-6" style={{background: 'linear-gradient(145deg, rgba(150, 150, 150, 0.8), rgba(120, 120, 120, 0.8))'}}>
                                Annulla Modifica
                            </button>
                        )}
                    </div>
                    
                    <div className="h-40 overflow-y-auto mb-4 p-2 bg-black bg-opacity-20 rounded-lg">
                        {cages.map((cage, index) => (
                            <div 
                                key={index}
                                className="cage-item flex items-center justify-between p-3 mb-2"
                                onMouseEnter={() => setHoveredCageIndex(index)}
                                onMouseLeave={() => setHoveredCageIndex(null)}
                            >
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: cageColors[index % cageColors.length].replace('0.3', '1') }}></div>
                                    <span>Somma: {cage.sum} ({cage.cells.length} celle)</span>
                                </div>
                                <div>
                                    <button onClick={() => handleEditCage(index)} className="p-1 text-gray-400 hover:text-white"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteCage(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <select value={solveMode} onChange={(e) => setSolveMode(e.target.value as 'instant' | 'step')} className="bg-gray-700 bg-opacity-80 backdrop-filter backdrop-blur-lg text-white p-3 rounded-lg w-full border border-gray-600 focus:border-blue-400 outline-none transition-colors">
                                <option value="instant">⚡ Risoluzione Immediata</option>
                                <option value="step">👣 Passo Dopo Passo</option>
                            </select>
                            <button onClick={handleSolve} disabled={isLoading || cages.length === 0} className="p-3 glass-button rounded-lg transition-colors" style={{background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))'}}><MagicWandIcon className="w-6 h-6"/></button>
                        </div>
                        
                        {isLoading && <Spinner />}
                        {error && <p className="text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md text-sm">{error}</p>}
                        
                        {solution && solveMode === 'step' && (
                            <div className="bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-lg p-4 rounded-lg border border-gray-600">
                                <p className="text-center mb-2">Svelati: {revealedCells.length} / 81</p>
                                <div className="flex space-x-2">
                                    <button onClick={handleStep} disabled={revealedCells.length >= 81} className="w-full glass-button flex items-center justify-center gap-2 py-3 px-4 rounded-lg" style={{background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.8))'}}><StepForwardIcon className="w-5 h-5"/>Prossimo</button>
                                    <button onClick={handleRevealAll} className="w-full glass-button flex items-center justify-center gap-2 py-3 px-4 rounded-lg" style={{background: 'linear-gradient(145deg, rgba(147, 51, 234, 0.8), rgba(126, 34, 206, 0.8))'}}><EyeIcon className="w-5 h-5"/>Rivela Tutto</button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleClear} className="w-full glass-button text-white font-bold py-3 px-4 rounded-lg" style={{background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))'}}>
                            Pulisci Tutto
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
