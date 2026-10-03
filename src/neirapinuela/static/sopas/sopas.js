/**
 * Sopas de Letras (Word Search) Game Application
 * Improved UX with auto-validation and drag tracking
 */

class SopasApp {
    constructor() {
        this.config = { ...SOPAS_DEFAULTS };
        this.grid = [];
        this.gridSize = this.config.gridSize;
        this.wordsFound = [];
        this.targetWords = [];
        this.category = 'animales';
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalTime: 0,
            currentGameStart: null
        };
        this.startTime = 0;
        this.isDragging = false;
        this.isMouseDown = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectedCells = [];
        this.dragHistory = [];
        this.currentDirection = null;
        this.previewCells = [];
        
        this.hintsVisible = false;
        
        this.cacheElements();
        this.loadStats();
        this.initEventListeners();
        this.startNewGame();
    }
    
    cacheElements() {
        this.elements = {
            title: document.querySelector('.sopas-title'),
            board: document.getElementById('sopas-board'),
            wordList: document.querySelector('.sopas-word-list'),
            wordsContainer: document.querySelector('.sopas-words-container'),
            statsContainer: document.getElementById('sopas-stats-container'),
            selectCategory: document.getElementById('sopas-category'),
            statusMsg: document.getElementById('sopas-status'),
            toastContainer: document.querySelector('.sopas-toast-container'),
            modalHelp: document.getElementById('helpModal'),
            modalStats: document.getElementById('statsModal'),
            hintBtn: document.getElementById('sopas-hint-btn')
        };
        
        // Initialize hint button
        if (this.elements.hintBtn) {
            this.elements.hintBtn.textContent = '👁️ Mostrar pistas';
            this.elements.hintBtn.classList.add('sopas-btn-hint');
            this.elements.hintBtn.onclick = () => this.toggleHints();
        }
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('sopas-stats');
        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
    }
    
    saveStats() {
        localStorage.setItem('sopas-stats', JSON.stringify(this.stats));
        this.renderStats();
    }
    
    initEventListeners() {
        // Category selector
        this.elements.selectCategory?.addEventListener('change', (e) => {
            this.setCategory(e.target.value);
            this.startNewGame();
        });
        
        // Modal buttons
        const btnNewGame = document.querySelector('[data-action="new-game"]');
        const btnHelp = document.querySelector('[data-action="help"]');
        const btnStats = document.querySelector('[data-action="stats"]');
        const btnCloseHelp = document.querySelector('#helpModal .sopas-modal-close');
        const btnCloseStats = document.querySelector('#statsModal .sopas-modal-close');
        const btnPlayAgain = document.querySelector('.sopas-btn-play-again');
        
        btnNewGame?.addEventListener('click', () => this.startNewGame());
        btnHelp?.addEventListener('click', () => this.showModal('helpModal'));
        btnStats?.addEventListener('click', () => this.showModal('statsModal'));
        btnCloseHelp?.addEventListener('click', () => this.hideModal('helpModal'));
        btnCloseStats?.addEventListener('click', () => this.hideModal('statsModal'));
        btnPlayAgain?.addEventListener('click', () => {
            this.hideModal('statsModal');
            this.startNewGame();
        });
        
        // Event listeners with touch support
        this.initBoardListeners();
        this.initZoomAndScroll();
    }
    
    initZoomAndScroll() {
        const boardWrapper = document.querySelector('.sopas-board-wrapper');
        if (!boardWrapper) return;
        
        let scale = 1;
        let isZooming = false;
        let lastScale = 1;
        let lastPinchDistance = null;
        
        // Zoom with mouse wheel
        boardWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.min(Math.max(scale * delta, 0.5), 2);
            
            if (Math.abs(newScale - scale) > 0.01) {
                scale = newScale;
                boardWrapper.style.transform = `scale(${scale})`;
                boardWrapper.style.transformOrigin = 'center center';
                lastScale = scale;
            }
        });
        
        // Touch pinch to zoom
        boardWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                lastPinchDistance = this.getPinchDistance(e.touches);
                isZooming = true;
                e.preventDefault();
            }
        }, { passive: false });
        
        boardWrapper.addEventListener('touchmove', (e) => {
            if (isZooming && e.touches.length === 2) {
                const currentDistance = this.getPinchDistance(e.touches);
                if (lastPinchDistance) {
                    const delta = currentDistance / lastPinchDistance;
                    const newScale = Math.min(Math.max(scale * delta, 0.5), 2);
                    
                    if (Math.abs(newScale - scale) > 0.01) {
                        scale = newScale;
                        boardWrapper.style.transform = `scale(${scale})`;
                        boardWrapper.style.transformOrigin = 'center center';
                        lastScale = scale;
                    }
                }
                lastPinchDistance = currentDistance;
                e.preventDefault();
            }
        }, { passive: false });
        
        boardWrapper.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                isZooming = false;
                lastPinchDistance = null;
            }
        });
    }
    
    getPinchDistance(touches) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    initBoardListeners() {
        const board = this.elements.board;
        if (!board) return;
        
        // Desktop mouse events
        board.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        board.addEventListener('mousemove', (e) => this.handleMouseOver(e));
        board.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        board.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Mobile touch events
        board.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        board.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        board.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        board.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
        
        // Auto-adjust for mobile
        this.autoAdjustForMobile();
        
        // Double-click to select single letter
        board.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.sopas-cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            const validationResult = this.validateSingleCellSelection(row, col);
            if (validationResult) {
                this.handleCorrectSelection(
                    validationResult.word, 
                    validationResult.wordObj, 
                    validationResult.cells
                );
            }
            
            this.isMouseDown = false;
        });
    }
    
    setCategory(category) {
        this.category = category;
        localStorage.setItem('sopas-category', category);
    }
    
    toggleHints() {
        this.hintsVisible = !this.hintsVisible;
        if (this.elements.hintBtn) {
            this.elements.hintBtn.textContent = this.hintsVisible ? '👁️ Ocultar pistas' : '👁️ Mostrar pistas';
            this.elements.hintBtn.classList.toggle('active', this.hintsVisible);
        }
        this.renderBoard();
    }
    
    startNewGame() {
        this.generateStats();
        this.startTime = Date.now();
        this.stats.currentGameStart = this.startTime;
        this.wordsFound = [];
        this.targetWords = [];
        this.isDragging = false;
        this.isMouseDown = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectedCells = [];
        this.dragHistory = [];
        this.currentDirection = null;
        this.previewCells = [];
        
        // Hide previous selections
        this.clearSelection();
        
        // Generate word list
        this.generateTargetWords();
        
        // Generate grid
        this.generateGrid();
        
        // Render UI
        this.renderWordList();
        this.renderBoard();
        this.renderStats();
        this.updateStatus('¡Busca las palabras ocultadas!');
    }
    
    generateStats() {
        const savedStats = localStorage.getItem('sopas-stats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        } else {
            this.stats = {
                gamesPlayed: 0,
                gamesWon: 0,
                totalTime: 0,
                currentGameStart: null
            };
        }
        
        const savedCategory = localStorage.getItem('sopas-category');
        if (savedCategory) {
            this.category = savedCategory;
            if (this.elements.selectCategory) {
                this.elements.selectCategory.value = this.category;
            }
        }
    }
    
    renderStats() {
        const container = document.getElementById('sopas-stats-container');
        const avgTime = this.stats.gamesWon > 0 
            ? ((this.stats.totalTime / this.stats.gamesWon) / 6000).toFixed(1) 
            : '0.0';
        
        container.innerHTML = `
            <div class="sopas-stat-box">
                <div class="sopas-stats-value">${this.stats.gamesWon}</div>
                <div class="sopas-stats-label">Victorias</div>
            </div>
            <div class="sopas-stat-box">
                <div class="sopas-stats-value">${(this.stats.gamesWon / Math.max(1, this.stats.gamesPlayed)).toFixed(1)}</div>
                <div class="sopas-stats-label">Victorias</div>
            </div>
            <div class="sopas-stat-box">
                <div class="sopas-stats-value">${avgTime}s</div>
                <div class="sopas-stats-label">Tiempo medio</div>
            </div>
        `;
    }
    
    renderWordList() {
        const container = document.querySelector('.sopas-word-list');
        container.innerHTML = `
            <h3>Palabras por encontrar:</h3>
            <div class="sopas-words-container">
                ${this.targetWords.map((word, index) => `
                    <div class="sopas-word-item" id="word-${index}">
                        <input type="checkbox" class="sopas-word-checkbox" 
                               data-word="${word.word}" 
                               data-index="${index}"
                               ${this.wordsFound.includes(word.word) ? 'checked disabled' : ''}>
                        <span class="sopas-word-text" data-word="${word.word}">${word.word}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    generateTargetWords() {
        const categories = SOPAS_CATEGORIES.find(c => c.id === this.category);
        const availableWords = [...SOPAS_WORDS[this.category]];
        
        // Get random words
        const pool = this.shuffleArray([...availableWords]);
        this.targetWords = [];
        
        for (let i = 0; i < this.config.wordsPerGame && i < pool.length; i++) {
            const word = pool[i];
            // Get similar words for confusion
            const similar = this.findSimilarWords(word, pool, 3);
            
            this.targetWords.push({
                word: word,
                similar: similar
            });
        }
    }
    
    findSimilarWords(word, list, count) {
        let similar = [];
        const targetLength = word.length;
        
        for (let w of list) {
            if (w === word || similar.length >= count) break;
            
            if (w.length >= targetLength - 2 && w.length <= targetLength + 2) {
                // Calculate similarity
                const similarity = this.calculateSimilarity(word, w);
                if (similarity > 0.7) {
                    similar.push(w);
                }
            }
        }
        
        return similar;
    }
    
    calculateSimilarity(word1, word2) {
        const len1 = word1.length;
        const len2 = word2.length;
        
        // Simple similarity: common letters ratio
        const set1 = new Set(word1.toUpperCase());
        const set2 = new Set(word2.toUpperCase());
        
        const common = [...set1].filter(c => set2.has(c)).length;
        const total = [...new Set([...set1, ...set2])].length;
        
        return total > 0 ? (common / total) : 0;
    }
    
    generateGrid() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => 
            Array(this.gridSize).fill('')
        );
        
        // Track occupied rows and columns
        const occupiedRows = new Set();
        const occupiedCols = new Set();
        
        // Directions: horizontal, vertical, diagonal (6 directions)
        const directions = [
            [0, 1], [0, -1],  // horizontal
            [1, 0], [-1, 0],  // vertical
            [1, 1], [-1, -1], [1, -1], [-1, 1]  // diagonal
        ];
        
        // Place words with spread algorithm
        for (let wordIndex = 0; wordIndex < this.targetWords.length; wordIndex++) {
            const target = this.targetWords[wordIndex];
            const word = target.word;
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 250) {
                // Random direction
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const pos = this.findValidPositionForSpread(word, dir, occupiedRows, occupiedCols);
                
                if (pos) {
                    this.placeWord(word, pos.r, pos.c, dir);
                    placed = true;
                    
                    // Mark row and column as occupied (for horizontal/vertical only)
                    const [dr, dc] = dir;
                    if (dr === 0) {
                        occupiedCols.add(pos.c);
                    } else if (dc === 0) {
                        occupiedRows.add(pos.r);
                    }
                }
                
                attempts++;
            }

            if (!placed) {
                console.warn(`No se pudo colocar la palabra: ${word}`);
            }
        }
        
        // Add filler letters to empty cells
        this.addFillerLetters();
    }
    
    findValidPositionForSpread(word, direction, occupiedRows, occupiedCols) {
        const [dr, dc] = direction;
        const wordLen = word.length;
        
        // Create and shuffle all positions for better distribution
        const positions = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                positions.push({ r, c });
            }
        }
        const shuffledPositions = this.shuffleArray(positions);
        
        for (const pos_item of shuffledPositions) {
            const { r, c } = pos_item;
            // Check if position valid
            const endR = r + dr * (wordLen - 1);
            const endC = c + dc * (wordLen - 1);
            
            if (endR < 0 || endR >= this.gridSize || endC < 0 || endC >= this.gridSize) {
                continue;
            }
            
            // Check if cells are empty or match letters
            let canPlace = true;
            for (let i = 0; i < wordLen; i++) {
                const currR = r + dr * i;
                const currC = c + dc * i;
                const cell = this.grid[currR][currC];
                const cellLetter = typeof cell === 'object' ? cell.letter : cell;
                
                // Allow placement if cell is empty or contains same letter
                if (cell !== '' && cellLetter !== word[i]) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                return { r, c };
            }
        }
        
        return null;
    }
    
    findValidPosition(word, direction) {
        const [dr, dc] = direction;
        const wordLen = word.length;
        
        // Randomize search positions
        const positions = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                positions.push({ r, c });
            }
        }
        this.shuffleArray(positions);
        
        for (const pos_item of positions) {
            const { r, c } = pos_item;
            // Check if position valid
            const endR = r + dr * (wordLen - 1);
            const endC = c + dc * (wordLen - 1);
            
            if (endR < 0 || endR >= this.gridSize || endC < 0 || endC >= this.gridSize) {
                continue;
            }
            
            // Check if cells are empty or match letters
            let canPlace = true;
            for (let i = 0; i < wordLen; i++) {
                const currR = r + dr * i;
                const currC = c + dc * i;
                const cell = this.grid[currR][currC];
                
                // Allow placement if cell is empty or contains same letter
                if (cell !== '' && cell !== word[i]) {
                    canPlace = false;
                    break;
                }
            }
            
            if (canPlace) {
                return { r, c };
            }
        }
        
        return null;
    }
    
    placeWord(word, row, col, direction) {
        const [dr, dc] = direction;
        
        for (let i = 0; i < word.length; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            
            const existingCell = this.grid[r][c];
            
            // Keep the letter
            const letter = word[i];
            
            // If it's the first letter, it gets a hint (unless already has one, but we prioritize the first word for now)
            if (i === 0) {
                this.grid[r][c] = { letter, hint: '✦' };
            } else {
                // If it's not the first letter, only overwrite if it's not already an object (hint cell)
                if (typeof existingCell !== 'object') {
                    this.grid[r][c] = letter;
                }
            }
        }
    }
    
    addFillerLetters() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (typeof this.grid[r][c] === 'string' && this.grid[r][c] === '') {
                    this.grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }
    
    renderBoard() {
        const board = this.elements.board;
        board.className = 'sopas-board';
        board.style.gridTemplateColumns = `repeat(${this.gridSize}, var(--sopas-cell-size))`;
        board.innerHTML = '';
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'sopas-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.style.cursor = 'pointer';
                cell.style.minWidth = 'clamp(32px, 7vw, 48px)';
                cell.style.minHeight = 'clamp(32px, 7vw, 48px)';
                
                const content = this.grid[r][c];
                if (typeof content === 'object') {
                    cell.textContent = content.letter;
                    if (content.hint && this.hintsVisible) {
                        cell.classList.add('hint-arrow');
                    }
                } else {
                    cell.textContent = content;
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        const cell = e.target.closest('.sopas-cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        this.isMouseDown = true;
        this.isDragging = true;
        this.dragHistory = [];
        
        // Store first click as start point
        this.selectionStart = { row, col };
        this.dragHistory.push({ row, col });
        
        // Visual feedback for start
        this.clearSelectionHighlights('preview');
        this.getCell(row, col)?.classList.add('selected');
    }
    
    handleMouseOver(e) {
        if (!this.isMouseDown) return;
        
        const cell = e.target.closest('.sopas-cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        const prevDrag = this.dragHistory[this.dragHistory.length - 1];
        
        // Check if movement is still valid (horizontal, vertical, or diagonal)
        if (this.isContinuous(prevDrag, { row, col })) {
            this.dragHistory.push({ row, col });
            this.updateSelectionPreview();
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.sopas-cell');
        
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        this.isMouseDown = true;
        this.isDragging = true;
        this.dragHistory = [];
        
        this.selectionStart = { row, col };
        this.dragHistory.push({ row, col });
        
        this.clearSelectionHighlights('preview');
        this.getCell(row, col)?.classList.add('selected');
    }
    
    handleTouchMove(e) {
        if (!this.isMouseDown) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.sopas-cell');
        
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        const prevDrag = this.dragHistory[this.dragHistory.length - 1];
        
        if (this.isContinuous(prevDrag, { row, col })) {
            this.dragHistory.push({ row, col });
            this.updateSelectionPreview();
        }
    }
    
    handleMouseUp() {
        if (!this.isMouseDown || !this.dragHistory.length) return;
        
        this.selectionStart = this.dragHistory[0];
        
        // Get position from last point in dragHistory
        const lastDrag = this.dragHistory[this.dragHistory.length - 1];
        
        this.validateAndLockSelection(lastDrag.row, lastDrag.col);
        
        this.isMouseDown = false;
        this.isDragging = false;
    }
    
    validateSingleCellSelection(row, col) {
        const cells = this.calculateLineCells(row, col, row, col, { dr: 0, dc: 0 });
        
        if (cells.length > 1) {
            return null;
        }
        
        const selectedWord = this.getWordFromDragHistory();
        if (!selectedWord) {
            return null;
        }
        
        const targetWordObj = this.targetWords.find(tw => tw.word === selectedWord);
        
        if (targetWordObj) {
            return { word: selectedWord, wordObj: targetWordObj, cells };
        }
        
        return null;
    }
    
    handleTouchEnd(e) {
        if (!this.isMouseDown || !this.dragHistory.length) return;
        
        e.preventDefault();
        
        this.selectionStart = this.dragHistory[0];
        
        // Get position from last point in dragHistory
        const lastDrag = this.dragHistory[this.dragHistory.length - 1];
        
        this.validateAndLockSelection(lastDrag.row, lastDrag.col);
        
        this.isMouseDown = false;
        this.isDragging = false;
    }
    
    isContinuous(prevDrag, currDrag) {
        const dr = Math.abs(currDrag.row - prevDrag.row);
        const dc = Math.abs(currDrag.col - prevDrag.col);
        
        return (dr === 0 || dc === 0 || dr === dc);
    }
    
    updateSelectionPreview() {
        if (this.dragHistory.length < 2) return;
        
        const start = this.dragHistory[0];
        const end = this.dragHistory[this.dragHistory.length - 1];
        
        const dr = end.row - start.row;
        const dc = end.col - start.col;
        
        // Check if valid line movement
        if (!this.isValidLine(start.row, start.col, end.row, end.col)) {
            return;
        }
        
        // Store current direction for validation
        this.currentDirection = this.normalizeDirection({ dr, dc });
        
        // Clear previous preview highlights (but keep found words)
        this.clearSelectionHighlights('preview');
        
        // Highlight all cells in the drag path
        this.highlightDragCells();
    }
    
    highlightDragCells() {
        if (this.dragHistory.length < 2) return;
        
        const cells = this.calculateLineCells(
            this.dragHistory[0].row, 
            this.dragHistory[0].col,
            this.dragHistory[this.dragHistory.length - 1].row,
            this.dragHistory[this.dragHistory.length - 1].col,
            this.currentDirection
        );
        
        this.previewCells = cells;
        this.highlightCells(cells, 'selected', 'preview');
    }
    
    validateAndLockSelection(finalRow, finalCol) {
        const end = { row: finalRow, col: finalCol };
        
        // Check if line is valid
        if (!this.isValidLine(this.selectionStart.row, this.selectionStart.col, end.row, end.col)) {
            this.clearSelection();
            return;
        }
        
        // Update drag history with final point
        if (!this.dragHistory.length) {
            this.dragHistory.push(this.selectionStart);
        }
        this.dragHistory.push(end);
        
        // Get the complete word based on drag history
        const selectedWord = this.getWordFromDragHistory().toUpperCase();
        const selectedCells = this.getSelectedCellsFromDrag();
        
        console.log('Validando selección:', { selectedWord, selectedCells });
        
        if (!selectedWord) {
            this.clearSelection();
            return;
        }
        
        // Find if this is a target word
        const alreadyFound = this.wordsFound.includes(selectedWord);
        if (alreadyFound) {
            console.log('Palabra ya encontrada:', selectedWord);
            this.clearSelection();
            return;
        }
        
        const targetWordObj = this.targetWords.find(tw => tw.word === selectedWord);
        const targetWordObjRev = this.targetWords.find(tw => tw.word === selectedWord.split('').reverse().join(''));
        
        console.log('Resultado de búsqueda:', { targetWordObj, targetWordObjRev });
        
        if (targetWordObj || targetWordObjRev) {
            // Word found - validate and mark
            if (targetWordObj) {
                this.handleCorrectSelection(selectedWord, targetWordObj, selectedCells);
            } else {
                this.handleCorrectSelection(selectedWord.split('').reverse().join(''), targetWordObjRev, selectedCells);
            }
        } else {
            // Invalid word - only show error if user actually tried to select a word (length >= 2)
            if (selectedWord.length >= 2) {
                this.showToast('Palabra no válida', 'error');
            }
            this.clearSelection();
        }
    }
    
    validateSingleCellSelection(row, col) {
        const cells = this.calculateLineCells(row, col, row, col, { dr: 0, dc: 0 });
        
        if (cells.length > 1) {
            return null;
        }
        
        const selectedWord = this.getWordFromDragHistory();
        if (!selectedWord) {
            return null;
        }
        
        const targetWordObj = this.targetWords.find(tw => tw.word === selectedWord);
        
        return targetWordObj ? { word: selectedWord, wordObj: targetWordObj, cells } : null;
    }
    
    isValidLine(row1, col1, row2, col2) {
        const dr = Math.abs(row2 - row1);
        const dc = Math.abs(col2 - col1);
        
        // Horizontal, vertical, or diagonal
        if (dr === 0 || dc === 0 || dr === dc) return true;
        
        return false;
    }
    
    normalizeDirection({ dr, dc }) {
        if (dr === 0) return { dr: 0, dc: dc > 0 ? 1 : -1 };
        if (dc === 0) return { dr: dr > 0 ? 1 : -1, dc: 0 };
        if (Math.abs(dr) === Math.abs(dc)) {
            return { 
                dr: dr > 0 ? 1 : -1, 
                dc: dc > 0 ? 1 : -1 
            };
        }
        return { dr: 0, dc: 1 };
    }
    
    getSelectedCellsFromDrag() {
        if (this.dragHistory.length < 1) return [];
        
        if (this.dragHistory.length === 1) {
            const cell = this.dragHistory[0];
            return [{ r: cell.row, c: cell.col }];
        }
        
        const start = this.dragHistory[0];
        const end = this.dragHistory[this.dragHistory.length - 1];
        
        const dr = end.row - start.row;
        const dc = end.col - start.col;
        
        if (!this.isValidLine(start.row, start.col, end.row, end.col)) {
            return [];
        }
        
        // Get normalized direction based on actual line
        let normalizedDr, normalizedDc;
        if (dr === 0 && dc === 0) {
            normalizedDr = 0;
            normalizedDc = 0;
        } else if (dr === 0) {
            normalizedDr = 0;
            normalizedDc = dc > 0 ? 1 : -1;
        } else if (dc === 0) {
            normalizedDr = dr > 0 ? 1 : -1;
            normalizedDc = 0;
        } else if (Math.abs(dr) === Math.abs(dc)) {
            normalizedDr = dr > 0 ? 1 : -1;
            normalizedDc = dc > 0 ? 1 : -1;
        } else {
            return [];
        }
        
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        const cells = [];
        
        for (let i = 0; i <= steps; i++) {
            const r = start.row + normalizedDr * i;
            const c = start.col + normalizedDc * i;
            
            if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
                cells.push({ r, c });
            }
        }
        
        return cells;
    }
    
    calculateLineCells(row1, col1, row2, col2, direction) {
        const cells = [];
        const start = { row: row1, col: col1 };
        const end = { row: row2, col: col2 };
        
        const dr = direction.dr;
        const dc = direction.dc;
        
        const steps = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));
        
        for (let i = 0; i <= steps; i++) {
            const r = start.row + dr * i;
            const c = start.col + dc * i;
            
            if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
                cells.push({ r, c });
            }
        }
        
        return cells;
    }
    
     getWordFromDragHistory() {
        if (this.dragHistory.length < 1) return '';
        
        if (this.dragHistory.length === 1) {
            const cell = this.grid[this.dragHistory[0].row][this.dragHistory[0].col];
            return typeof cell === 'object' ? cell.letter : cell;
        }
        
        // Normalize the selection to always go from start to end
        const start = this.dragHistory[0];
        const end = this.dragHistory[this.dragHistory.length - 1];
        
        // Check direction
        const dr = end.row - start.row;
        const dc = end.col - start.col;
        
        if (!this.isValidLine(start.row, start.col, end.row, end.col)) {
            return '';
        }
        
        // Get normalized direction based on actual line
        let normalizedDr, normalizedDc;
        if (dr === 0 && dc === 0) {
            normalizedDr = 0;
            normalizedDc = 0;
        } else if (dr === 0) {
            normalizedDr = 0;
            normalizedDc = dc > 0 ? 1 : -1;
        } else if (dc === 0) {
            normalizedDr = dr > 0 ? 1 : -1;
            normalizedDc = 0;
        } else if (Math.abs(dr) === Math.abs(dc)) {
            normalizedDr = dr > 0 ? 1 : -1;
            normalizedDc = dc > 0 ? 1 : -1;
        } else {
            return ''; // Invalid direction
        }
        
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        
        let word = '';
        for (let i = 0; i <= steps; i++) {
            const r = start.row + normalizedDr * i;
            const c = start.col + normalizedDc * i;
            
            if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
                const cell = this.grid[r][c];
                word += typeof cell === 'object' ? cell.letter : cell;
            }
        }
        
        console.log('Obteniendo palabra del drag:', { dragHistory: this.dragHistory, word: word, direction: { normalizedDr, normalizedDc } });
        return word.toUpperCase();
    }
    
    clearSelectionHighlights(keepType = 'all') {
        document.querySelectorAll('.sopas-cell').forEach(cell => {
            const shouldBePreview = keepType === 'preview' && cell.classList.contains('sopas-cell-preview');
            const shouldBeFound = keepType === 'found' && cell.classList.contains('sopas-cell-found');
            
            if (shouldBePreview || shouldBeFound) return;
            
            cell.classList.remove('selected', 'start', 'end', 'sopas-cell-preview', 'sopas-cell-found', 'sopas-cell-correct');
        });
    }
    
    clearSelection() {
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectedCells = [];
        this.dragHistory = [];
        this.currentDirection = null;
        this.previewCells = [];
        this.clearSelectionHighlights();
        
        // Also clear found style
        document.querySelectorAll('.sopas-cell').forEach(cell => {
            cell.classList.remove('sopas-cell-found', 'sopas-cell-correct');
        });
    }
    
    highlightCells(cells, className, extraClass = null) {
        cells.forEach(({ r, c }) => {
            const cell = this.getCell(r, c);
            if (cell) {
                cell.classList.add(className);
                if (extraClass) {
                    cell.classList.add(extraClass);
                }
            }
        });
    }
    
    getCell(row, col) {
        return this.elements.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    handleCorrectSelection(word, targetWordObj, foundCells) {
        // Add found style to cells
        this.highlightCells(foundCells, 'found', 'sopas-cell-correct');
        
        // Mark the word as found
        this.wordsFound.push(word);
        
        console.log('Palabra encontrada:', word, 'Total encontradas:', this.wordsFound);
        
        this.showToast(`¡Encontrada: ${word}!`, 'success');
        
        // Update UI - re-render word list to show found words
        this.renderWordList();

        // Check win condition
        this.checkWinCondition();
        
        // Clear drag history and preview
        this.dragHistory = [];
        this.clearSelectionHighlights('found');
    }
    
    autoAdjustForMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.querySelector('.sopas-board-wrapper').style.overflow = 'auto';
            document.querySelector('.sopas-board-wrapper').style.maxWidth = '100vw';
            document.querySelector('.sopas-board-wrapper').style.maxHeight = '70vh';
        }
    }
    
    updateWordList() {
        document.querySelectorAll('.sopas-word-checkbox').forEach(checkbox => {
            const word = checkbox.dataset.word;
            if (this.wordsFound.includes(word)) {
                checkbox.checked = true;
                checkbox.disabled = true;
                const wordText = checkbox.parentElement.querySelector('.sopas-word-text');
                if (wordText) {
                    wordText.style.color = '#4caf50';
                    wordText.style.textDecoration = 'line-through';
                    wordText.style.opacity = '0.6';
                }
            }
        });

        // Mark checkbox row as found
        document.querySelectorAll('.sopas-word-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const wordText = item.querySelector('.sopas-word-text');
            const word = checkbox ? (wordText ? wordText.dataset.word : checkbox.dataset.word) : '';
            
            if (word && this.wordsFound.includes(word)) {
                item.classList.add('found-word');
            }
        });
    }
    
    checkWinCondition() {
        if (this.wordsFound.length === this.targetWords.length) {
            const endTime = Date.now();
            const duration = endTime - this.startTime;
            
            this.stats.gamesWon++;
            this.stats.totalTime += duration;
            this.stats.gamesPlayed++;
            
            this.saveStats();
            this.showToast('¡Victoria! 🎉', 'success');
            
            setTimeout(() => {
                this.showModal('statsModal');
            }, 1000);
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
        }
    }
    
    showToast(message, type = 'default') {
        const container = this.elements.toastContainer;
        const toast = document.createElement('div');
        toast.className = `sopas-toast ${type === 'success' ? 'sopas-toast-success' : 'sopas-toast-error'}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2500);
    }
    
    updateStatus(message) {
        if (this.elements.statusMsg) {
            this.elements.statusMsg.style.visibility = 'visible';
            this.elements.statusMsg.textContent = message;
            
            setTimeout(() => {
                this.elements.statusMsg.style.visibility = 'hidden';
            }, 3000);
        }
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}