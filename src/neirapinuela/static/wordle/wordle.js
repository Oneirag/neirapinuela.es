// ─── Palabras cargadas desde wordle-words.js ─────────────────────────────────
// Edita /static/wordle/wordle-words.js para añadir o cambiar palabras.

// Solo palabras de 5 letras y letras españolas válidas
const ANSWERS = [...new Set(ANSWER_WORDS)].filter(
    w => w.length === 5 && /^[a-záéíóúüñ]+$/i.test(w)
);

const VALID_WORDS = new Set(
    [...ANSWER_WORDS, ...VALID_WORDS_EXTRA].filter(
        w => w.length === 5 && /^[a-záéíóúüñ]+$/i.test(w)
    )
);


// ─── Game State ──────────────────────────────────────────────────────────────
class WordleApp {
    constructor() {
        this.MAX_GUESSES = 6;
        this.WORD_LENGTH = 5;

        this.stats = this.loadStats();
        this.loadOrStartGame();
        this.buildUI();
        this.attachEvents();
        this.renderBoard();
        this.renderKeyboard();
    }

    // ── Persistence ──────────────────────────────────────────────────────────
    loadStats() {
        try {
            return JSON.parse(localStorage.getItem('wordle_stats_es') || 'null') || {
                played: 0, wins: 0, streak: 0, maxStreak: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
            };
        } catch { return { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } }; }
    }

    saveStats() {
        localStorage.setItem('wordle_stats_es', JSON.stringify(this.stats));
    }

    loadOrStartGame() {
        try {
            const saved = JSON.parse(localStorage.getItem('wordle_state_es') || 'null');
            const today = new Date().toDateString();
            if (saved && saved.date === today) {
                this.answer = saved.answer;
                this.guesses = saved.guesses;
                this.currentRow = saved.currentRow;
                this.currentCol = saved.currentCol;
                this.gameOver = saved.gameOver;
                this.won = saved.won;
                this.letterStates = saved.letterStates;
                return;
            }
        } catch { }
        this.newGame();
    }

    newGame(forceNew = false) {
        // Pick daily word based on date
        const today = new Date().toDateString();
        const dayIndex = Math.floor(Date.now() / 86400000) % ANSWERS.length;
        this.answer = forceNew
            ? ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
            : ANSWERS[dayIndex];

        this.guesses = Array(this.MAX_GUESSES).fill(null).map(() => Array(this.WORD_LENGTH).fill(''));
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.won = false;
        this.letterStates = {}; // letter → 'correct'|'present'|'absent'
        this.saveState(today);
    }

    saveState(date) {
        const today = date || new Date().toDateString();
        try {
            localStorage.setItem('wordle_state_es', JSON.stringify({
                date: today,
                answer: this.answer,
                guesses: this.guesses,
                currentRow: this.currentRow,
                currentCol: this.currentCol,
                gameOver: this.gameOver,
                won: this.won,
                letterStates: this.letterStates
            }));
        } catch { }
    }

    // ── Build UI ─────────────────────────────────────────────────────────────
    buildUI() {
        this.boardEl = document.getElementById('wordle-board');
        this.keyboardEl = document.getElementById('wordle-keyboard');
        this.toastContainer = document.getElementById('wordle-toasts');

        // Build board rows & tiles
        this.boardEl.innerHTML = '';
        this.tiles = [];
        for (let r = 0; r < this.MAX_GUESSES; r++) {
            const row = document.createElement('div');
            row.className = 'wordle-row';
            row.id = `wordle-row-${r}`;
            this.tiles[r] = [];
            for (let c = 0; c < this.WORD_LENGTH; c++) {
                const tile = document.createElement('div');
                tile.className = 'wordle-tile';
                tile.id = `wordle-tile-${r}-${c}`;
                tile.dataset.letter = '';
                row.appendChild(tile);
                this.tiles[r][c] = tile;
            }
            this.boardEl.appendChild(row);
        }

        // Keyboard layout (Spanish)
        const rows = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
            ['ENTER', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫']
        ];
        this.keyboardEl.innerHTML = '';
        this.keyEls = {};
        rows.forEach(rowKeys => {
            const rowEl = document.createElement('div');
            rowEl.className = 'wordle-keyboard-row';
            rowKeys.forEach(key => {
                const btn = document.createElement('button');
                btn.className = 'wordle-key' + (key === 'ENTER' || key === '⌫' ? ' key-wide' : '');
                btn.textContent = key;
                btn.dataset.key = key;
                btn.id = `wordle-key-${key}`;
                btn.addEventListener('click', () => this.handleKey(key));
                rowEl.appendChild(btn);
                this.keyEls[key.toLowerCase()] = btn;
            });
            this.keyboardEl.appendChild(rowEl);
        });
    }

    attachEvents() {
        // Called ONCE from constructor. Never call again to avoid duplicate keydown listeners.
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'Enter') this.handleKey('ENTER');
            else if (e.key === 'Backspace') this.handleKey('⌫');
            else if (/^[a-záéíóúüñ]$/i.test(e.key)) this.handleKey(e.key.toLowerCase());
        });

        document.getElementById('wordle-btn-help').addEventListener('click', () => this.openModal('help'));
        document.getElementById('wordle-btn-stats').addEventListener('click', () => this.openModal('stats'));
        document.getElementById('wordle-btn-new').addEventListener('click', () => this.resetGame());
        document.getElementById('wordle-close-stats').addEventListener('click', () => this.closeModal('stats'));
        document.getElementById('wordle-close-help').addEventListener('click', () => this.closeModal('help'));
        document.getElementById('wordle-play-again').addEventListener('click', () => {
            this.closeModal('stats');
            this.resetGame();
        });

        // Close modals on overlay click
        document.getElementById('wordle-stats-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal('stats');
        });
        document.getElementById('wordle-help-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal('help');
        });
    }

    resetGame() {
        this.newGame(true);
        this.buildUI();
        this.renderBoard();
        this.renderKeyboard();
    }

    // ── Input handling ────────────────────────────────────────────────────────
    handleKey(key) {
        if (this.gameOver) return;
        if (key === '⌫') {
            this.deleteLetter();
        } else if (key === 'ENTER') {
            this.submitGuess();
        } else if (/^[a-záéíóúüñ]$/i.test(key)) {
            this.typeLetter(key.toLowerCase());
        }
    }

    typeLetter(letter) {
        if (this.currentCol >= this.WORD_LENGTH) return;
        this.guesses[this.currentRow][this.currentCol] = letter;
        const tile = this.tiles[this.currentRow][this.currentCol];
        tile.textContent = letter;
        tile.dataset.letter = letter;
        this.currentCol++;
    }

    deleteLetter() {
        if (this.currentCol <= 0) return;
        this.currentCol--;
        this.guesses[this.currentRow][this.currentCol] = '';
        const tile = this.tiles[this.currentRow][this.currentCol];
        tile.textContent = '';
        tile.dataset.letter = '';
    }

    submitGuess() {
        if (this.currentCol < this.WORD_LENGTH) {
            this.shakeRow(this.currentRow);
            this.showToast('Faltan letras');
            return;
        }

        const guess = this.guesses[this.currentRow].join('');

        // Validate — accept if it's a known word OR if we relax validation
        // We accept any 5-letter combination for better UX
        const isValid = VALID_WORDS.has(guess) || ANSWERS.includes(guess) || true; // relaxed
        if (!isValid) {
            this.shakeRow(this.currentRow);
            this.showToast('Palabra no encontrada');
            return;
        }

        const result = this.evaluate(guess);
        this.animateRow(this.currentRow, result, guess, () => {
            this.updateLetterStates(guess, result);
            this.renderKeyboard();

            const isWin = result.every(r => r === 'correct');
            if (isWin) {
                this.won = true;
                this.gameOver = true;
                const winMessages = ['¡Brillante!', '¡Excelente!', '¡Fantástico!', '¡Bien hecho!', '¡Lo conseguiste!', '¡Por los pelos!'];
                setTimeout(() => {
                    this.animateBounce(this.currentRow);
                    this.showToast(winMessages[Math.min(this.currentRow, winMessages.length - 1)]);
                    this.stats.played++;
                    this.stats.wins++;
                    this.stats.streak++;
                    this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
                    this.stats.distribution[this.currentRow + 1]++;
                    this.saveStats();
                }, 300);
                setTimeout(() => this.openModal('stats'), 2200);
            } else {
                this.currentRow++;
                this.currentCol = 0;
                if (this.currentRow >= this.MAX_GUESSES) {
                    this.gameOver = true;
                    this.stats.played++;
                    this.stats.streak = 0;
                    this.saveStats();
                    setTimeout(() => {
                        this.showToast(this.answer.toUpperCase(), 3000);
                        setTimeout(() => this.openModal('stats'), 2000);
                    }, 400);
                }
            }
            this.saveState();
        });
    }

    evaluate(guess) {
        const result = Array(this.WORD_LENGTH).fill('absent');
        const answerArr = this.answer.split('');
        const guessArr = guess.split('');
        const answerCounts = {};

        // First pass: mark correct
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (guessArr[i] === answerArr[i]) {
                result[i] = 'correct';
                answerArr[i] = null;
                guessArr[i] = null;
            } else {
                answerCounts[answerArr[i]] = (answerCounts[answerArr[i]] || 0) + 1;
            }
        }

        // Second pass: mark present
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            if (guessArr[i] !== null && answerCounts[guessArr[i]] > 0) {
                result[i] = 'present';
                answerCounts[guessArr[i]]--;
            }
        }

        return result;
    }

    updateLetterStates(guess, result) {
        const priority = { correct: 3, present: 2, absent: 1 };
        for (let i = 0; i < this.WORD_LENGTH; i++) {
            const letter = guess[i];
            const current = this.letterStates[letter];
            if (!current || priority[result[i]] > priority[current]) {
                this.letterStates[letter] = result[i];
            }
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    renderBoard() {
        for (let r = 0; r < this.MAX_GUESSES; r++) {
            for (let c = 0; c < this.WORD_LENGTH; c++) {
                const tile = this.tiles[r][c];
                const letter = this.guesses[r][c];
                tile.textContent = letter;
                tile.dataset.letter = letter;
                // Remove old states
                delete tile.dataset.state;
            }
            // Re-apply evaluated states for completed rows
            if (r < this.currentRow || (this.gameOver && r === this.currentRow - 1 && this.won)) {
                const guess = this.guesses[r].join('');
                const result = this.evaluate(guess);
                for (let c = 0; c < this.WORD_LENGTH; c++) {
                    this.tiles[r][c].dataset.state = result[c];
                }
            }
        }
    }

    renderKeyboard() {
        Object.entries(this.letterStates).forEach(([letter, state]) => {
            const btn = this.keyEls[letter];
            if (btn) btn.dataset.state = state;
        });
    }

    // ── Animations ────────────────────────────────────────────────────────────
    animateRow(rowIndex, result, guess, callback) {
        const tiles = this.tiles[rowIndex];
        const delay = 120; // ms per tile

        tiles.forEach((tile, i) => {
            setTimeout(() => {
                tile.classList.add('flip');
                // Change color at halfway point
                setTimeout(() => {
                    tile.dataset.state = result[i];
                }, delay / 2);

                tile.addEventListener('animationend', () => {
                    tile.classList.remove('flip');
                }, { once: true });

                if (i === this.WORD_LENGTH - 1) {
                    setTimeout(callback, delay / 2 + 50);
                }
            }, i * delay);
        });
    }

    animateBounce(rowIndex) {
        const tiles = this.tiles[rowIndex];
        tiles.forEach((tile, i) => {
            setTimeout(() => {
                tile.classList.add('bounce');
                tile.addEventListener('animationend', () => tile.classList.remove('bounce'), { once: true });
            }, i * 100);
        });
    }

    shakeRow(rowIndex) {
        const row = document.getElementById(`wordle-row-${rowIndex}`);
        row.classList.add('shake');
        row.addEventListener('animationend', () => row.classList.remove('shake'), { once: true });
    }

    showToast(message, duration = 1800) {
        const toast = document.createElement('div');
        toast.className = 'wordle-toast';
        toast.textContent = message;
        toast.style.animationDuration = `${duration}ms`;
        this.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    // ── Modals ────────────────────────────────────────────────────────────────
    openModal(type) {
        if (type === 'stats') this.renderStats();
        const overlay = document.getElementById(`wordle-${type}-modal`);
        overlay.classList.add('open');
    }

    closeModal(type) {
        document.getElementById(`wordle-${type}-modal`).classList.remove('open');
    }

    renderStats() {
        const pct = this.stats.played > 0 ? Math.round(this.stats.wins / this.stats.played * 100) : 0;
        document.getElementById('stat-played').textContent = this.stats.played;
        document.getElementById('stat-pct').textContent = pct;
        document.getElementById('stat-streak').textContent = this.stats.streak;
        document.getElementById('stat-max').textContent = this.stats.maxStreak;

        // Distribution
        const maxVal = Math.max(1, ...Object.values(this.stats.distribution));
        const distEl = document.getElementById('wordle-distribution');
        distEl.innerHTML = '';
        for (let i = 1; i <= 6; i++) {
            const count = this.stats.distribution[i] || 0;
            const pctBar = Math.max(8, Math.round((count / maxVal) * 100));
            const isCurrent = this.gameOver && this.won && this.currentRow === i - 1;
            const row = document.createElement('div');
            row.className = 'wordle-dist-row';
            row.innerHTML = `
                <div class="wordle-dist-label">${i}</div>
                <div class="wordle-dist-bar-container">
                    <div class="wordle-dist-bar ${isCurrent ? 'current' : ''}" style="width:${pctBar}%">${count}</div>
                </div>`;
            distEl.appendChild(row);
        }
    }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.wordleApp = new WordleApp();
});
