class SudokuApp {
    constructor() {
        this.boardEl = document.getElementById('sudoku-board');
        this.overlayEl = this.boardEl.querySelector('.generating-overlay');
        this.modeSelect = document.getElementById('sudoku-mode');
        this.statusEl = document.getElementById('sudoku-status');
        this.btnCandidates = document.getElementById('btn-candidates');
        
        this.selectedCell = null;
        this.highlightedNumber = null;
        this.notesMode = false;
        this.checkingStatus = false;
        
        this.selectedCells = [];
        this.multiSelectMode = false;
        
        this.areaSumMode = false;
        this.selectedCages = [];
        this.comboFilters = new Set(); // Stores numbers that are EXCLUDED
        
        this.mode = 'standard'; // standard, killer, samurai
        
        // Data Structures
        this.grid = []; // user visible & empty
        this.solution = []; // full solution
        this.notesGrid = []; // user notes per cell (Set)
        this.cages = []; // for killer
        this.size = 9; 
        
        this.initEvents();
        
        // We will start generating on next tick to allow UI to render spinner
        setTimeout(() => this.startNewGame(), 100);
    }
    
    initEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.selectedCells.length === 0) return;
            
            // For movement, we use the last selected cell
            let r = this.selectedCells[this.selectedCells.length - 1][0];
            let c = this.selectedCells[this.selectedCells.length - 1][1];
            
            let num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                if (this.notesMode) {
                    this.toggleCandidateNote(num);
                } else {
                    this.setCellValue(num.toString());
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.setCellValue('');
            } else if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                let nr = r, nc = c;
                if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
                if (e.key === 'ArrowDown') nr = Math.min(this.size - 1, r + 1);
                if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
                if (e.key === 'ArrowRight') nc = Math.min(this.size - 1, c + 1);
                
                // Skip empty spaces in Samurai
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(nr, nc)) {
                    return; // simple block, ideally we'd jump over it
                }
                
                // When moving via keyboard, auto-disable multi-select to avoid accidental huge selections
                this.multiSelectMode = false;
                const btnM = document.getElementById('btn-multi-select');
                if (btnM) {
                    btnM.classList.remove('btn-primary', 'text-white');
                    btnM.classList.add('btn-outline-secondary');
                }
                
                this.selectCell(nr, nc);
            }
        });
    }
    
    changeMode() {
        this.mode = this.modeSelect.value;
        this.startNewGame();
    }
    
    toggleNotesMode() {
        this.notesMode = !this.notesMode;
        const btn = document.getElementById('btn-notes-mode');
        if (this.notesMode) {
            btn.classList.add('btn-info', 'text-white');
            btn.classList.remove('btn-outline-secondary');
        } else {
            btn.classList.add('btn-outline-secondary');
            btn.classList.remove('btn-info', 'text-white');
        }
        btn.blur(); // Remove browser focus so it doesn't look artificially checked
    }
    
    toggleMultiSelect() {
        this.multiSelectMode = !this.multiSelectMode;
        const btn = document.getElementById('btn-multi-select');
        if (this.multiSelectMode) {
            btn.classList.add('btn-primary', 'text-white');
            btn.classList.remove('btn-outline-secondary');
        } else {
            btn.classList.remove('btn-primary', 'text-white');
            btn.classList.add('btn-outline-secondary');
            // Retain only the first selected cell if toggled off
            if (this.selectedCells.length > 1) {
                this.selectedCells = [this.selectedCells[this.selectedCells.length - 1]];
            }
        }
        btn.blur();
        this.updateBoardUI();
        this.updateSumStatus();
    }
    
    toggleAreaSumMode() {
        if (this.mode !== 'killer') return;
        this.areaSumMode = !this.areaSumMode;
        const btn = document.getElementById('btn-area-sum');
        
        if (this.areaSumMode) {
            btn.classList.add('btn-danger', 'text-white');
            btn.classList.remove('btn-outline-danger');
            
            // Disable other modes
            if (this.multiSelectMode) this.toggleMultiSelect();
            if (this.notesMode) this.toggleNotesMode();
            
            this.selectedCells = [];
            this.selectedCages = [];
        } else {
            btn.classList.remove('btn-danger', 'text-white');
            btn.classList.add('btn-outline-danger');
            this.selectedCages = [];
        }
        btn.blur();
        this.updateBoardUI();
        this.updateSumStatus();
    }
    
    updateSumStatus() {
        const statusEl = document.getElementById('status-bar');
        
        if (this.areaSumMode) {
            statusEl.classList.remove('d-none', 'alert-info');
            statusEl.classList.add('alert-danger');
            
            if (this.selectedCages.length === 0) {
                statusEl.innerText = 'Modo Sumar Áreas: Haz clic en el tablero para sumar áreas completas';
                return;
            }
            
            let sum = 0;
            this.selectedCages.forEach(cage => {
                sum += cage.sum;
            });
            statusEl.innerText = `Suma total de áreas seleccionadas: ${sum} (en ${this.selectedCages.length} áreas completas)`;
            return;
        }
        
        // Reset status to blue for normal mode
        statusEl.classList.add('alert-info');
        statusEl.classList.remove('alert-danger');
        
        if (this.multiSelectMode) {
            statusEl.classList.remove('d-none');
            if (this.selectedCells.length === 0) {
                statusEl.innerText = 'Selección múltiple activada: haz clic para marcar múltiples celdas';
                return;
            }
        }
        
        if (this.selectedCells.length === 0) {
            if (this.mode === 'killer') {
                statusEl.classList.remove('d-none');
                statusEl.innerText = 'Selecciona una celda o activa "Sumar Áreas"';
            } else {
                statusEl.classList.add('d-none');
            }
            return;
        }
        
        let sum = 0;
        let complete = true;
        this.selectedCells.forEach(([r, c]) => {
            const val = this.grid[r][c];
            if (val !== 0) {
                sum += val;
            } else {
                complete = false;
            }
        });
        
        if (this.selectedCells.length > 1 || this.mode === 'killer') {
            statusEl.classList.remove('d-none');
            statusEl.innerText = `Suma marcada: ${sum} (en ${this.selectedCells.length} celdas)${complete ? '' : ' - Faltan casillas por rellenar'}`;
        } else {
            statusEl.classList.add('d-none');
        }
    }
    
    getKillerCombinations(targetSum, length, current = [], start = 1) {
        if (length === 0) {
            return targetSum === 0 ? [current] : [];
        }
        if (targetSum < 0) return [];
        
        let result = [];
        for (let i = start; i <= 9; i++) {
            result = result.concat(this.getKillerCombinations(targetSum - i, length - 1, [...current, i], i + 1));
        }
        return result;
    }
    
    toggleComboFilter(num) {
        let btn = document.querySelector(`.combo-filter-btn[data-num="${num}"]`);
        if (this.comboFilters.has(num)) {
            // Include again
            this.comboFilters.delete(num);
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-secondary');
        } else {
            // Exclude
            this.comboFilters.add(num);
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        }
        // Retrigger show to refresh list
        this.renderCombinationsList();
    }
    
    showCombinations() {
        if (this.mode !== 'killer') return;
        
        if (this.areaSumMode) {
            if (this.selectedCages.length === 0) {
                alert('Selecciona al menos un área para ver sus combinaciones.');
                return;
            }
        } else {
            if (this.selectedCells.length === 0) {
                alert('Selecciona una celda para ver las combinaciones de su área.');
                return;
            }
        }
        
        // Reset filters when opening modal freshly
        this.comboFilters.clear();
        document.querySelectorAll('.combo-filter-btn').forEach(btn => {
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-secondary');
        });
        
        this.renderCombinationsList();
        new bootstrap.Modal(document.getElementById('combinationsModal')).show();
    }
    
    renderCombinationsList() {
        let cage;
        if (this.areaSumMode) {
            cage = this.selectedCages[this.selectedCages.length - 1];
        } else {
            const [r, c] = this.selectedCells[this.selectedCells.length - 1];
            cage = this.cages.find(cg => this.cageContains(cg, r, c));
        }
        
        if (!cage) return;
        
        // generate combinations
        let combos = this.getKillerCombinations(cage.sum, cage.cells.length);
        
        // apply filters
        if (this.comboFilters.size > 0) {
            combos = combos.filter(combo => {
                for (let num of combo) {
                    if (this.comboFilters.has(num)) return false;
                }
                return true;
            });
        }
        
        document.getElementById('combinations-title').innerText = `Suma objetivo: ${cage.sum} en ${cage.cells.length} celdas`;
        
        const listEl = document.getElementById('combinations-list');
        listEl.innerHTML = '';
        if (combos.length === 0) {
            listEl.innerHTML = '<li class="list-group-item border-0 text-danger">No hay combinaciones válidas bajo estas condiciones</li>';
        } else {
            combos.forEach(combo => {
                const li = document.createElement('li');
                li.className = 'list-group-item border-0 py-2';
                li.innerHTML = combo.map(n => `<span class="badge bg-primary rounded-pill fs-5 mx-1">${n}</span>`).join(' <span class="text-muted">+</span> ');
                listEl.appendChild(li);
            });
        }
    }
    
    toggleCandidateNote(num) {
        this.selectedCells.forEach(([r, c]) => {
            if (this.givenMask[r][c] || this.grid[r][c] !== 0) return;
            
            if (this.notesGrid[r][c].has(num)) {
                this.notesGrid[r][c].delete(num);
            } else {
                this.notesGrid[r][c].add(num);
            }
        });
        this.updateBoardUI();
    }
    
    autoFillCandidates() {
        if (this.mode === 'killer') {
            alert('Las sugerencias automáticas están desactivadas en modo Killer. Puedes usar el Modo Notas manual.');
            return;
        }
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) continue;
                if (this.grid[r][c] === 0 && !this.givenMask[r][c]) {
                    this.notesGrid[r][c] = this.getCandidates(r, c);
                }
            }
        }
        this.updateBoardUI();
    }
    
    startNewGame() {
        this.overlayEl.classList.remove('d-none');
        this.statusEl.classList.add('d-none');
        this.selectedCells = [];
        this.highlightedNumber = null;
        
        if (this.checkingStatus) {
            this.checkingStatus = false;
            const btnCheck = document.getElementById('btn-check');
            if (btnCheck) {
                btnCheck.classList.add('btn-outline-success');
                btnCheck.classList.remove('btn-success', 'text-white');
            }
        }
        
        if (this.areaSumMode) {
            this.toggleAreaSumMode();
        }
        
        if (this.mode === 'killer') {
            this.btnCandidates.disabled = true;
            this.btnCandidates.classList.add('disabled', 'opacity-50');
            document.getElementById('btn-combinations').style.display = 'inline-block';
            document.getElementById('btn-area-sum').style.display = 'inline-block';
        } else {
            this.btnCandidates.disabled = false;
            this.btnCandidates.classList.remove('disabled', 'opacity-50');
            document.getElementById('btn-combinations').style.display = 'none';
            document.getElementById('btn-area-sum').style.display = 'none';
        }
        
        setTimeout(() => {
            try {
                if (this.mode === 'samurai') {
                    this.size = 21;
                    this.generateSamurai();
                } else if (this.mode === 'killer') {
                    this.size = 9;
                    this.generateKiller();
                } else {
                    this.size = 9;
                    this.generateStandard();
                }
                
                // Initialize notes grid
                this.notesGrid = Array(this.size).fill().map(() => 
                    Array(this.size).fill().map(() => new Set())
                );
                
                this.renderGrid();
                this.overlayEl.classList.add('d-none');
            } catch (e) {
                console.error(e);
                this.showStatus('Error generando el tablero. Intenta de nuevo.', 'danger');
                this.overlayEl.classList.add('d-none');
            }
        }, 50); // Small delay to let UI show overlay
    }
    
    showStatus(msg, type='info') {
        this.statusEl.className = `alert alert-${type} text-center`;
        this.statusEl.innerText = msg;
    }
    
    // --- UI/Rendering ---
    
    renderGrid() {
        this.boardEl.innerHTML = '';
        this.boardEl.className = 'sudoku-board' + (this.mode === 'samurai' ? ' samurai-board' : '');
        this.boardEl.appendChild(this.overlayEl);
        
        const gridEl = document.createElement('div');
        gridEl.className = 'sudoku-grid ' + (this.mode === 'samurai' ? 'samurai-grid' : '');
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.id = `cell-${r}-${c}`;
                
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) {
                    cell.classList.add('empty-space');
                    // Draw outer boundaries on the empty cells to guarantee visual alignment
                    if (r === 5 && c >= 9 && c <= 11) cell.classList.add('border-bottom-thick');
                    if (r === 11 && (c < 6 || c >= 15)) cell.classList.add('border-bottom-thick');
                    if (c === 5 && r >= 9 && r <= 11) cell.classList.add('border-right-thick');
                    if (c === 11 && (r < 6 || r >= 15)) cell.classList.add('border-right-thick');
                    
                    gridEl.appendChild(cell);
                    continue;
                }
                
                // Thicker borders for 3x3
                let boxR = r % 9;
                let boxC = c % 9;
                
                if (this.mode === 'samurai') {
                    if (r < 9 && c < 9) { boxR = r; boxC = c; } // TL
                    else if (r < 9 && c >= 12) { boxR = r; boxC = c - 12; } // TR
                    else if (r >= 12 && c < 9) { boxR = r - 12; boxC = c; } // BL
                    else if (r >= 12 && c >= 12) { boxR = r - 12; boxC = c - 12; } // BR
                    else { boxR = r - 6; boxC = c - 6; } // Center
                }
                
                if (boxR % 3 === 2) {
                    if (this.mode === 'samurai' || r !== this.size - 1) {
                        cell.classList.add('border-bottom-thick');
                    }
                }
                if (boxC % 3 === 2) {
                    if (this.mode === 'samurai' || c !== this.size - 1) {
                        cell.classList.add('border-right-thick');
                    }
                }
                
                if (this.mode === 'samurai') {
                    // Global absolute boundaries for top and left
                    if (r === 0) cell.classList.add('border-top-thick');
                    if (c === 0) cell.classList.add('border-left-thick');
                }
                
                // Add click event
                cell.addEventListener('mousedown', () => this.selectCell(r, c));
                cell.addEventListener('touchstart', (e) => { e.preventDefault(); this.selectCell(r, c); });
                
                gridEl.appendChild(cell);
            }
        }
        
        this.boardEl.appendChild(gridEl);
        
        // Add Killer Cages
        if (this.mode === 'killer') {
            this.cages.forEach(cage => {
                cage.cells.forEach(([cr, cc], idx) => {
                    const cEl = this.getCellEl(cr, cc);
                    
                    const cageBox = document.createElement('div');
                    cageBox.className = 'killer-cage-box';
                    
                    if (!this.cageContains(cage, cr - 1, cc)) cageBox.classList.add('killer-top');
                    if (!this.cageContains(cage, cr + 1, cc)) cageBox.classList.add('killer-bottom');
                    if (!this.cageContains(cage, cr, cc - 1)) cageBox.classList.add('killer-left');
                    if (!this.cageContains(cage, cr, cc + 1)) cageBox.classList.add('killer-right');
                    
                    cEl.appendChild(cageBox);
                    
                    if (idx === 0) {
                        cEl.classList.add('has-killer-hint');
                        const hint = document.createElement('div');
                        hint.className = 'killer-hint';
                        hint.innerText = cage.sum;
                        cageBox.appendChild(hint);
                    }
                });
            });
        }
        
        this.updateBoardUI();
    }
    
    cageContains(cage, r, c) {
        return cage.cells.some(([cr, cc]) => cr === r && cc === c);
    }
    
    getCellEl(r, c) {
        return document.getElementById(`cell-${r}-${c}`);
    }
    
    updateBoardUI() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) continue;
                
                const val = this.grid[r][c];
                const isGiven = this.givenMask && this.givenMask[r][c];
                const celEl = this.getCellEl(r, c);
                if (!celEl) continue;
                
                // Clear state
                celEl.classList.remove('given', 'selected', 'highlighted', 'crosshair-highlighted');
                Array.from(celEl.children).forEach(child => {
                    if (child.classList.contains('killer-cage-box')) {
                        const cage = this.cages.find(cg => this.cageContains(cg, r, c));
                        if (cage && this.selectedCages.includes(cage)) {
                            child.classList.add('killer-area-selected');
                        } else {
                            child.classList.remove('killer-area-selected');
                        }
                    } else {
                        child.remove(); 
                    }
                });
                
                // Set text node (avoid overwriting killer hint)
                let textNode = Array.from(celEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) {
                    textNode = document.createTextNode('');
                    celEl.appendChild(textNode);
                }
                textNode.nodeValue = val !== 0 ? val : '';
                
                if (isGiven) celEl.classList.add('given');
                
                const isSelected = this.selectedCells.some(cell => cell[0] === r && cell[1] === c);
                const lastSelected = this.selectedCells.length > 0 ? this.selectedCells[this.selectedCells.length - 1] : null;

                if (isSelected) {
                    celEl.classList.add('selected');
                } else if (val !== 0 && val === this.highlightedNumber) {
                    celEl.classList.add('highlighted');
                } else if (lastSelected && (lastSelected[0] === r || lastSelected[1] === c)) {
                    let inSameGrid = true;
                    if (this.mode === 'samurai') {
                        const myGrids = this.getSamuraiGrids(lastSelected[0], lastSelected[1]);
                        const targetGrids = this.getSamuraiGrids(r, c);
                        inSameGrid = myGrids.some(g => targetGrids.includes(g));
                    }
                    if (inSameGrid) {
                        celEl.classList.add('crosshair-highlighted');
                    }
                }
                
                // Show candidates
                if (val === 0) {
                    const cands = this.notesGrid[r][c];
                    if (cands && cands.size > 0) {
                        const candsEl = document.createElement('div');
                        candsEl.className = 'sudoku-candidates';
                        for (let n = 1; n <= 9; n++) {
                            const cn = document.createElement('div');
                            cn.className = 'candidate-num';
                            cn.textContent = cands.has(n) ? n : '';
                            candsEl.appendChild(cn);
                        }
                        celEl.appendChild(candsEl);
                    }
                }
            }
        }
    }
    
    selectCell(r, c) {
        if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) return;
        
        if (this.areaSumMode) {
            const cage = this.cages.find(cg => this.cageContains(cg, r, c));
            if (cage) {
                const idx = this.selectedCages.indexOf(cage);
                if (idx >= 0) {
                    this.selectedCages.splice(idx, 1);
                } else {
                    this.selectedCages.push(cage);
                }
                this.updateBoardUI();
                this.updateSumStatus();
            }
            return;
        }
        
        const existingIdx = this.selectedCells.findIndex(cell => cell[0] === r && cell[1] === c);
        
        if (this.multiSelectMode) {
            if (existingIdx >= 0) {
                this.selectedCells.splice(existingIdx, 1);
            } else {
                this.selectedCells.push([r, c]);
            }
        } else {
            this.selectedCells = [[r, c]];
        }
        
        const val = this.grid[r][c];
        if (val !== 0) {
            this.highlightedNumber = val;
        } else {
            this.highlightedNumber = null;
        }
        
        this.updateBoardUI();
        this.updateSumStatus();
    }
    
    setCellValue(valStr) {
        if (this.checkingStatus) {
            this.checkingStatus = false;
            const btnCheck = document.getElementById('btn-check');
            if (btnCheck) {
                btnCheck.classList.add('btn-outline-success');
                btnCheck.classList.remove('btn-success', 'text-white');
            }
        }
        
        document.querySelectorAll('.sudoku-cell.error, .sudoku-cell.correct').forEach(el => {
            el.classList.remove('error', 'correct');
        });
        
        let shouldCheckWin = false;

        this.selectedCells.forEach(([r, c]) => {
            if (this.givenMask[r][c]) return; // Cannot edit givens
            
            const val = valStr === '' ? 0 : parseInt(valStr);
            this.grid[r][c] = val;
            
            if (val !== 0) {
                this.highlightedNumber = val;
                this.notesGrid[r][c].clear();
                shouldCheckWin = true;
            } else {
                this.highlightedNumber = null;
            }
        });
        
        this.updateBoardUI();
        this.updateSumStatus();
        if (shouldCheckWin) this.checkWinCondition();
    }
    
    checkGrid() {
        const btn = document.getElementById('btn-check');
        
        if (this.checkingStatus) {
            // Turn off checking mode
            this.checkingStatus = false;
            btn.classList.add('btn-outline-success');
            btn.classList.remove('btn-success', 'text-white');
            btn.blur();
            
            document.querySelectorAll('.sudoku-cell.error, .sudoku-cell.correct').forEach(el => {
                el.classList.remove('error', 'correct');
            });
            return;
        }

        // Turn on checking mode
        this.checkingStatus = true;
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'text-white');
        btn.blur();
        
        let isComplete = true;
        let hasErrors = false;
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) continue;
                
                const val = this.grid[r][c];
                const celEl = this.getCellEl(r, c);
                celEl.classList.remove('error', 'correct');
                
                if (val === 0) {
                    isComplete = false;
                } else if (!this.givenMask[r][c]) {
                    // For user inputted numbers
                    if (val !== this.solution[r][c]) {
                        celEl.classList.add('error');
                        hasErrors = true;
                    } else {
                        celEl.classList.add('correct');
                    }
                }
            }
        }
        
        if (isComplete && !hasErrors) {
            new bootstrap.Modal(document.getElementById('successModal')).show();
        }
    }
    
    checkWinCondition() {
        let isComplete = true;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.mode === 'samurai' && !this.isValidSamuraiCell(r, c)) continue;
                
                if (this.grid[r][c] !== this.solution[r][c]) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }
        
        if (isComplete) {
            document.querySelectorAll('.sudoku-cell.error').forEach(el => el.classList.remove('error'));
            new bootstrap.Modal(document.getElementById('successModal')).show();
        }
    }

    // --- Generators & Solvers ---
    
    generateStandard() {
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(this.solution, 9);
        
        this.grid = this.solution.map(r => [...r]);
        this.givenMask = Array(9).fill().map(() => Array(9).fill(true));
        
        // Remove numbers to make it difficult (e.g. keep 25-30 given)
        let removals = 50 + Math.floor(Math.random() * 8); 
        while (removals > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (this.grid[r][c] !== 0) {
                this.grid[r][c] = 0;
                this.givenMask[r][c] = false;
                // typically symmetric
                this.grid[8-r][8-c] = 0;
                this.givenMask[8-r][8-c] = false;
                removals -= 2;
            }
        }
    }
    
    generateKiller() {
        // Generate complete standard grid
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(this.solution, 9);
        
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.givenMask = Array(9).fill().map(() => Array(9).fill(false)); // Killer has no givens
        
        // Generate Cages
        this.cages = [];
        let visited = Array(9).fill().map(() => Array(9).fill(false));
        
        const q = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!visited[r][c]) {
                    let size = 2 + Math.floor(Math.random() * 3); // 2 to 4 cells
                    let cells = [[r, c]];
                    visited[r][c] = true;
                    
                    let cr = r, cc = c;
                    for (let i = 1; i < size; i++) {
                        let dirs = [[0,1], [1,0], [0,-1], [-1,0]].sort(() => Math.random() - 0.5);
                        let added = false;
                        for (let [dr, dc] of dirs) {
                            let nr = cr + dr, nc = cc + dc;
                            if (nr >=0 && nr < 9 && nc >= 0 && nc < 9 && !visited[nr][nc]) {
                                let val = this.solution[nr][nc];
                                let hasDuplicate = cells.some(([cx, cy]) => this.solution[cx][cy] === val);
                                
                                if (!hasDuplicate) {
                                    visited[nr][nc] = true;
                                    cells.push([nr, nc]);
                                    cr = nr; cc = nc;
                                    added = true;
                                    break;
                                }
                            }
                        }
                        if (!added) {
                            // Try branching from another cell previously added to the cage
                            for (let [prevR, prevC] of cells) {
                                let subAdded = false;
                                let subDirs = [[0,1], [1,0], [0,-1], [-1,0]].sort(() => Math.random() - 0.5);
                                for (let [sdr, sdc] of subDirs) {
                                    let snr = prevR + sdr, snc = prevC + sdc;
                                    if (snr >=0 && snr < 9 && snc >= 0 && snc < 9 && !visited[snr][snc]) {
                                        let sVal = this.solution[snr][snc];
                                        let sHasDuplicate = cells.some(([cx, cy]) => this.solution[cx][cy] === sVal);
                                        if (!sHasDuplicate) {
                                            visited[snr][snc] = true;
                                            cells.push([snr, snc]);
                                            cr = snr; cc = snc;
                                            subAdded = true;
                                            added = true;
                                            break;
                                        }
                                    }
                                }
                                if (subAdded) break;
                            }
                            if (!added) break; // still unable to expand
                        }
                    }
                    
                    let sum = cells.reduce((acc, [cr, cc]) => acc + this.solution[cr][cc], 0);
                    // Ensure cage uniquely holds values (basic killer logic)
                    this.cages.push({cells, sum});
                }
            }
        }
    }
    
    generateSamurai() {
        this.solution = Array(21).fill().map(() => Array(21).fill(0));
        
        // Simple generation: pre-fill central cells fully randomly to seed, then solve full samurai
        // Full backtracking for Samurai in browser can be slow, using an optimized approach
        const subgrids = [
            {r: 0, c: 0}, // TL
            {r: 0, c: 12}, // TR
            {r: 12, c: 0}, // BL
            {r: 12, c: 12}, // BR
            {r: 6, c: 6} // Center
        ];
        
        // We will generate Center first
        let center = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(center, 9);
        this.copySubgrid(center, this.solution, 6, 6);
        
        // Then solve others, ensuring overlap stays
        this.solveSamurai(this.solution);
        
        // Remove numbers
        this.grid = this.solution.map(r => [...r]);
        this.givenMask = Array(21).fill().map(() => Array(21).fill(false));
        
        // Keep around ~30 givens per 9x9 roughly
        for (let r = 0; r < 21; r++) {
            for (let c = 0; c < 21; c++) {
                if (this.isValidSamuraiCell(r, c)) {
                    // Random drop 60% of numbers
                    if (Math.random() < 0.4) {
                        this.givenMask[r][c] = true;
                    } else {
                        this.grid[r][c] = 0;
                    }
                }
            }
        }
    }
    
    // --- Solvers ---
    
    solveSudoku(grid, size, r=0, c=0) {
        if (r === size) return true;
        let nextR = c === size - 1 ? r + 1 : r;
        let nextC = c === size - 1 ? 0 : c + 1;
        
        if (grid[r][c] !== 0) return this.solveSudoku(grid, size, nextR, nextC);
        
        let nums = [1,2,3,4,5,6,7,8,9];
        nums.sort(() => Math.random() - 0.5); // Randomize for generation
        
        for (let num of nums) {
            if (this.isValidMove(grid, r, c, num, size)) {
                grid[r][c] = num;
                if (this.solveSudoku(grid, size, nextR, nextC)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    }
    
    isValidMove(grid, r, c, num, size) {
        // Row & Col
        for (let i = 0; i < size; i++) {
            if (grid[r][i] === num) return false;
            if (grid[i][c] === num) return false;
        }
        // Box
        let boxR = Math.floor(r / 3) * 3;
        let boxC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxR + i][boxC + j] === num) return false;
            }
        }
        return true;
    }
    
    solveSamurai(grid) {
        // Simplified solving sequentially to avoid deep recursion over 21x21
        const grids = [
            {r: 0, c: 0}, // TL
            {r: 0, c: 12}, // TR
            {r: 12, c: 0}, // BL
            {r: 12, c: 12} // BR
        ];
        
        for (let g of grids) {
            this.solveSamuraiSection(grid, g.r, g.c);
        }
    }
    
    solveSamuraiSection(grid, startR, startC) {
        // Extract 9x9, solve, put back
        let sub = Array(9).fill().map(() => Array(9).fill(0));
        for (let i=0; i<9; i++) {
            for (let j=0; j<9; j++) {
                sub[i][j] = grid[startR+i][startC+j];
            }
        }
        this.solveSudoku(sub, 9);
        for (let i=0; i<9; i++) {
            for (let j=0; j<9; j++) {
                grid[startR+i][startC+j] = sub[i][j];
            }
        }
    }
    
    isValidSamuraiCell(r, c) {
        // Empty areas in 21x21
        if (r < 6 && c >= 9 && c < 12) return false; // top middle
        if (r >= 15 && c >= 9 && c < 12) return false; // bottom middle
        if (c < 6 && r >= 9 && r < 12) return false; // left middle
        if (c >= 15 && r >= 9 && r < 12) return false; // right middle
        return true;
    }
    
    getSamuraiGrids(r, c) {
        let grids = [];
        if (r <= 8 && c <= 8) grids.push(0);
        if (r <= 8 && c >= 12) grids.push(1);
        if (r >= 12 && c <= 8) grids.push(2);
        if (r >= 12 && c >= 12) grids.push(3);
        if (r >= 6 && r <= 14 && c >= 6 && c <= 14) grids.push(4);
        return grids;
    }
    
    copySubgrid(src, dest, startR, startC) {
        for(let r=0; r<9; r++){
            for(let c=0; c<9; c++){
                dest[startR+r][startC+c] = src[r][c];
            }
        }
    }
    
    // --- Candidates ---
    
    getCandidates(r, c) {
        let set = new Set([1,2,3,4,5,6,7,8,9]);
        
        if (this.mode === 'standard') {
            for(let i=0; i<9; i++) set.delete(this.grid[r][i]);
            for(let i=0; i<9; i++) set.delete(this.grid[i][c]);
            let br = Math.floor(r/3)*3;
            let bc = Math.floor(c/3)*3;
            for(let i=0; i<3; i++) {
                for(let j=0; j<3; j++) set.delete(this.grid[br+i][bc+j]);
            }
        } else if (this.mode === 'samurai') {
            const boxes = [
                {sr: 0, er: 8, sc: 0, ec: 8}, // TL
                {sr: 0, er: 8, sc: 12, ec: 20}, // TR
                {sr: 12, er: 20, sc: 0, ec: 8}, // BL
                {sr: 12, er: 20, sc: 12, ec: 20}, // BR
                {sr: 6, er: 14, sc: 6, ec: 14} // Center
            ];
            
            for (let box of boxes) {
                if (r >= box.sr && r <= box.er && c >= box.sc && c <= box.ec) {
                    // It's in this 9x9 grid, apply rules bounded by this grid
                    for(let i=box.sc; i<=box.ec; i++) set.delete(this.grid[r][i]);
                    for(let i=box.sr; i<=box.er; i++) set.delete(this.grid[i][c]);
                    
                    let br = box.sr + Math.floor((r - box.sr)/3)*3;
                    let bc = box.sc + Math.floor((c - box.sc)/3)*3;
                    for(let i=0; i<3; i++) {
                        for(let j=0; j<3; j++) set.delete(this.grid[br+i][bc+j]);
                    }
                }
            }
        }
        
        return set;
    }
}

// Initialize on load
window.addEventListener('load', () => {
    window.sudokuApp = new SudokuApp();
});

// Extra protection against sticky focus on mobile devices
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
        setTimeout(() => btn.blur(), 50);
    }
});
