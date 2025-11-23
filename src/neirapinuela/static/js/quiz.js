document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        selector: document.getElementById('quiz-selector'),
        promptSelector: document.getElementById('prompt-selector'),
        questionText: document.getElementById('question-text'),
        inputsArea: document.getElementById('inputs-area'),
        feedback: document.getElementById('feedback'),
        btnCheck: document.getElementById('btn-check'),
        btnNext: document.getElementById('btn-next'),
        scoreVal: document.getElementById('score-val'),
        totalVal: document.getElementById('total-val'),
        errorsVal: document.getElementById('errors-val'),
        activityLogContainer: document.getElementById('activity-log-container'),
        activityLog: document.getElementById('activity-log')
    };

    let state = {
        data: null,
        weights: [], // Array of weights corresponding to items
        currentItem: null,
        currentItemIndex: -1,
        currentPromptField: null,
        score: 0,
        total: 0,
        errors: 0,
        answered: false
    };

    // Helper to get localized text
    function getLocalizedText(obj) {
        if (typeof obj === 'object' && obj !== null) {
            const lang = window.currentLanguage || 'es';
            return obj[lang] || obj['es'] || '';
        }
        return obj;
    }

    // Initialize
    init();

    function init() {
        // Load initial category from URL or default
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'europe_capitals';
        if (elements.selector.querySelector(`option[value="${category}"]`)) {
            elements.selector.value = category;
        }

        loadQuiz(elements.selector.value);

        // Listeners
        elements.selector.addEventListener('change', (e) => {
            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('category', e.target.value);
            window.history.pushState({}, '', url);

            loadQuiz(e.target.value);
        });

        elements.promptSelector.addEventListener('change', (e) => {
            nextQuestion();
        });

        elements.btnCheck.addEventListener('click', checkAnswer);
        elements.btnNext.addEventListener('click', nextQuestion);
    }

    async function loadQuiz(category) {
        resetState();
        const url = window.quizDataUrls[category];
        try {
            const response = await fetch(url);
            state.data = await response.json();
            // Initialize weights
            state.weights = new Array(state.data.items.length).fill(1);
            updatePromptSelector();
            nextQuestion();
        } catch (e) {
            console.error("Failed to load quiz data", e);
            elements.questionText.textContent = "Error loading quiz.";
        }
    }

    function resetState() {
        state.score = 0;
        state.total = 0;
        state.errors = 0;
        state.weights = [];
        updateScore();
        elements.feedback.className = 'alert d-none';
        elements.activityLogContainer.classList.add('d-none');
        elements.activityLog.innerHTML = '';
    }

    function updatePromptSelector() {
        elements.promptSelector.innerHTML = `<option value="random">${window.translations.random}</option>`;
        if (state.data && state.data.fields) {
            state.data.fields.forEach(field => {
                const option = document.createElement('option');
                option.value = field;
                // Use translation if available
                const label = window.translations.fields && window.translations.fields[field]
                    ? window.translations.fields[field]
                    : field.charAt(0).toUpperCase() + field.slice(1);
                option.textContent = label;
                elements.promptSelector.appendChild(option);
            });
            elements.promptSelector.disabled = false;
        } else {
            elements.promptSelector.disabled = true;
        }
    }

    function nextQuestion() {
        if (!state.data || !state.data.items.length) return;

        state.answered = false;
        elements.feedback.className = 'alert d-none';
        elements.btnCheck.classList.remove('d-none');
        elements.btnNext.classList.add('d-none');
        elements.inputsArea.innerHTML = '';

        // Pick weighted random item
        const items = state.data.items;
        const totalWeight = state.weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let index = 0;

        for (let i = 0; i < state.weights.length; i++) {
            random -= state.weights[i];
            if (random <= 0) {
                index = i;
                break;
            }
        }

        state.currentItemIndex = index;
        state.currentItem = items[index];

        renderQuestion();
    }

    function renderQuestion() {
        if (state.data.type === 'simple_pair') {
            // Simple Pair: Key -> Value
            // e.g. {"Spain": "Madrid"}
            // We pick the first key as question
            const key = Object.keys(state.currentItem)[0];
            state.currentPromptField = key;
            elements.questionText.textContent = key;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.placeholder = 'Answer...';
            input.dataset.key = key; // Store key to verify later
            elements.inputsArea.appendChild(input);
            input.focus();

            // Allow Enter to submit
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkAnswer();
            });

        } else if (state.data.type === 'multi_field') {
            // Multi Field: e.g. Irregular Verbs or Capitals
            const fields = state.data.fields;

            // Determine prompt field based on selector
            let promptField;
            const selectedPrompt = elements.promptSelector.value;

            if (selectedPrompt === 'random' || !fields.includes(selectedPrompt)) {
                // Pick a random field as prompt
                promptField = fields[Math.floor(Math.random() * fields.length)];
            } else {
                promptField = selectedPrompt;
            }

            state.currentPromptField = promptField;
            elements.questionText.textContent = getLocalizedText(state.currentItem[promptField]);

            // Create inputs for other fields
            fields.forEach(field => {
                if (field === promptField) return;

                const group = document.createElement('div');
                // Label
                const label = document.createElement('label');
                label.className = 'form-label small text-muted text-start w-100';
                // Try to get translation for field, fallback to capitalized field name
                const translatedLabel = window.translations.fields && window.translations.fields[field]
                    ? window.translations.fields[field]
                    : field.charAt(0).toUpperCase() + field.slice(1);
                label.textContent = translatedLabel;
                group.appendChild(label);

                // Input
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.dataset.field = field;

                // Allow Enter to submit
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') checkAnswer();
                });

                group.appendChild(input);

                elements.inputsArea.appendChild(group);
            });

            // Focus first input
            const firstInput = elements.inputsArea.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }

    function checkAnswer() {
        if (state.answered) return;

        let correct = true;
        let feedbackHtml = '';

        let userAnswers = [];

        if (state.data.type === 'simple_pair') {
            const input = elements.inputsArea.querySelector('input');
            const key = input.dataset.key;
            const expected = state.currentItem[key];
            const actual = input.value.trim();

            if (actual.toLowerCase() !== expected.toLowerCase()) {
                correct = false;
                feedbackHtml = `${window.translations.incorrect} <strong>${expected}</strong>`;
            }

            userAnswers.push({
                value: actual,
                correct: correct
            });

        } else if (state.data.type === 'multi_field') {
            const inputs = elements.inputsArea.querySelectorAll('input');
            let errors = [];

            inputs.forEach(input => {
                const field = input.dataset.field;
                const expected = state.currentItem[field];
                const actual = input.value.trim();

                // Get expected string for comparison
                const expectedStr = getLocalizedText(expected);

                // Simple check
                const isMatch = actual.toLowerCase() === expectedStr.toLowerCase() ||
                    (expectedStr.includes('/') && expectedStr.toLowerCase().includes(actual.toLowerCase()));

                if (!isMatch) {
                    correct = false;
                    errors.push(`${field}: <strong>${expectedStr}</strong>`);
                    input.classList.add('is-invalid');
                } else {
                    input.classList.add('is-valid');
                }

                userAnswers.push({
                    value: actual,
                    correct: isMatch
                });
            });

            if (!correct) {
                feedbackHtml = `${window.translations.incorrect}<br>${errors.join('<br>')}`;
            }
        }

        state.answered = true;
        state.total++;
        if (correct) {
            state.score++;
            // Reset weight for correct answer
            if (state.currentItemIndex !== -1) {
                state.weights[state.currentItemIndex] = 1;
            }
            elements.feedback.className = 'alert alert-success';
            elements.feedback.textContent = window.translations.correct;

            logActivity(state.currentItem, true);
        } else {
            state.errors++;
            // Increase weight for incorrect answer (make it 5x more likely)
            if (state.currentItemIndex !== -1) {
                state.weights[state.currentItemIndex] += 4;
            }
            elements.feedback.className = 'alert alert-danger';
            elements.feedback.innerHTML = feedbackHtml;

            logActivity(state.currentItem, false);
        }

        elements.feedback.classList.remove('d-none');
        updateScore();

        elements.btnCheck.classList.add('d-none');
        elements.btnNext.classList.remove('d-none');
        elements.btnNext.focus();
    }

    function updateScore() {
        elements.scoreVal.textContent = state.score;
        elements.totalVal.textContent = state.total;
        elements.errorsVal.textContent = state.errors;
    }

    function logActivity(item, correct) {
        elements.activityLogContainer.classList.remove('d-none');

        // Construct a summary of the item (Prompt only)
        let summary = '';
        if (state.data.type === 'simple_pair') {
            const key = Object.keys(item)[0];
            summary = `${key}`;
        } else {
            // Show only the prompt value
            const promptField = state.currentPromptField;
            // Just the value, no label
            summary = `${getLocalizedText(item[promptField])}`;
        }

        const badge = document.createElement('span');
        badge.className = `badge ${correct ? 'bg-success' : 'bg-danger'} rounded-pill`;
        badge.textContent = summary;

        elements.activityLog.prepend(badge);
    }

});
