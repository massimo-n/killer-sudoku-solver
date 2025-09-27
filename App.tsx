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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <main className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
                <div className="flex-grow flex justify-center items-start">
                    <div className="grid grid-cols-9 relative">
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
                                        className={`w-12 h-12 md:w-14 md:h-14 flex justify-center items-center text-2xl font-bold cursor-pointer relative transition-all duration-200
                                            ${r % 3 === 2 && r !== 8 ? 'border-b-4 border-gray-400' : 'border-b border-gray-600'}
                                            ${c % 3 === 2 && c !== 8 ? 'border-r-4 border-gray-400' : 'border-r border-gray-600'}
                                            ${r === 0 ? 'border-t border-gray-600' : ''}
                                            ${c === 0 ? 'border-l border-gray-600' : ''}
                                            ${isSelected ? 'bg-blue-400 bg-opacity-50' : ''}
                                            ${isHighlighted ? 'bg-yellow-400 bg-opacity-40' : ''}
                                        `}
                                        style={{ backgroundColor: isSelected ? undefined : cageInfo?.color, ...getBorders(r,c) }}
                                    >
                                        {cageSum && <span className="absolute top-0 left-1 text-xs font-normal">{cageSum}</span>}
                                        {cell !== 0 && <span>{cell}</span>}

                                        {inlineInputPos && inlineInputPos.row === r && inlineInputPos.col === c && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <input
                                                    ref={inlineInputRef}
                                                    type="number"
                                                    value={inlineSum}
                                                    onChange={e => setInlineSum(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddOrUpdateCage()}
                                                    className="w-full h-full bg-black bg-opacity-70 text-white text-center text-lg outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="w-full md:w-96 p-6 rounded-xl bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700 shadow-2xl">
                    <h1 className="text-3xl font-bold mb-6 text-center">Killer Sudoku</h1>
                    
                    <div className="space-y-4 mb-6">
                        <button 
                            onClick={handleAddOrUpdateCage}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
                            disabled={isLoading || currentSelection.length === 0}
                        >
                            {editingCageIndex !== null ? 'Aggiorna Gabbia' : 'Aggiungi Gabbia'}
                        </button>
                        {editingCageIndex !== null && (
                            <button onClick={handleCancelEdit} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg">
                                Annulla Modifica
                            </button>
                        )}
                    </div>
                    
                    <div className="h-40 overflow-y-auto mb-4 p-2 bg-black bg-opacity-20 rounded-lg">
                        {cages.map((cage, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-2 rounded-md mb-2 bg-gray-700 bg-opacity-50"
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
                            <select value={solveMode} onChange={(e) => setSolveMode(e.target.value as 'instant' | 'step')} className="bg-gray-700 text-white p-2 rounded-md w-full">
                                <option value="instant">Risoluzione Immediata</option>
                                <option value="step">Passo Dopo Passo</option>
                            </select>
                            <button onClick={handleSolve} disabled={isLoading || cages.length === 0} className="p-2 bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-500 transition-colors"><MagicWandIcon className="w-6 h-6"/></button>
                        </div>
                        
                        {isLoading && <Spinner />}
                        {error && <p className="text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md text-sm">{error}</p>}
                        
                        {solution && solveMode === 'step' && (
                            <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                                <p className="text-center mb-2">Svelati: {revealedCells.length} / 81</p>
                                <div className="flex space-x-2">
                                    <button onClick={handleStep} disabled={revealedCells.length >= 81} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 py-2 px-4 rounded-lg transition-colors"><StepForwardIcon className="w-5 h-5"/>Prossimo</button>
                                    <button onClick={handleRevealAll} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-lg transition-colors"><EyeIcon className="w-5 h-5"/>Rivela Tutto</button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleClear} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Pulisci Tutto</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
