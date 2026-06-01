/* === Practica Ecuaciones - logica cliente === */
(function () {
    'use strict';

    var STORAGE_KEY = 'ec:done';
    var form = document.getElementById('exercise-form');
    if (!form) return;

    var exerciseId = parseInt(form.getAttribute('data-exercise-id'), 10);
    var stepCards = Array.prototype.slice.call(
        form.querySelectorAll('.step-card')
    );
    var checkBtns = Array.prototype.slice.call(
        form.querySelectorAll('.check-btn')
    );
    var checklistCard = document.getElementById('checklist-card');
    var checklistChecks = Array.prototype.slice.call(
        document.querySelectorAll('.checklist-check')
    );
    var celebration = document.getElementById('celebration');
    var nextBtn = document.getElementById('next-exercise-btn');

    function getStatusIcon(card, state) {
        var status = card.querySelector('.step-status i');
        if (!status) return;
        status.className = 'bi';
        if (state === 'correct') {
            status.classList.add('bi-check-circle-fill');
        } else if (state === 'wrong') {
            status.classList.add('bi-x-circle-fill');
        } else if (state === 'active') {
            status.classList.add('bi-arrow-right-circle-fill', 'text-primary');
        } else {
            status.classList.add('bi-circle', 'text-muted');
        }
    }

    function setStepState(card, state) {
        card.classList.remove('is-pending', 'is-active', 'is-correct', 'is-wrong');
        if (state === 'pending') card.classList.add('is-pending');
        if (state === 'active') card.classList.add('is-active');
        if (state === 'correct') card.classList.add('is-correct');
        if (state === 'wrong') card.classList.add('is-wrong');
        getStatusIcon(card, state);
    }

    function unlockStep(card) {
        var input = card.querySelector('.step-input');
        var btn = card.querySelector('.check-btn');
        if (input) input.disabled = false;
        if (btn) btn.disabled = false;
        setStepState(card, 'active');
    }

    function setFeedback(card, message, kind) {
        var fb = card.querySelector('.step-feedback');
        if (!fb) return;
        fb.classList.remove('is-ok', 'is-error');
        if (kind) fb.classList.add('is-' + kind);
        fb.textContent = message || '';
    }

    function indexOfStep(key) {
        for (var i = 0; i < stepCards.length; i++) {
            if (stepCards[i].getAttribute('data-step') === key) return i;
        }
        return -1;
    }

    function nextStepOf(key) {
        var i = indexOfStep(key);
        if (i === -1 || i + 1 >= stepCards.length) return null;
        return stepCards[i + 1];
    }

    function isLastStep(key) {
        return indexOfStep(key) === stepCards.length - 1;
    }

    function markExerciseDone(id) {
        try {
            var done = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (done.indexOf(id) === -1) {
                done.push(id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
            }
        } catch (e) {
            /* localStorage no disponible: ignorar */
        }
    }

    function getValidateUrl() {
        if (typeof window.VALIDATE_URL === 'string' && window.VALIDATE_URL) {
            return window.VALIDATE_URL;
        }
        return '/apps/ecuaciones/ejercicio/' + exerciseId + '/validar';
    }

    function validateStep(card) {
        var stepKey = card.getAttribute('data-step');
        var input = card.querySelector('.step-input');
        var btn = card.querySelector('.check-btn');
        var value = (input.value || '').trim();
        if (!value) {
            setFeedback(card, 'Escribe algo antes de comprobar.', 'error');
            input.focus();
            return;
        }

        btn.disabled = true;
        var originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

        fetch(getValidateUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: stepKey, value: value })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            if (data.ok) {
                setStepState(card, 'correct');
                setFeedback(card, '✓ Correcto', 'ok');
                if (isLastStep(stepKey)) {
                    showChecklist();
                } else {
                    var nxt = nextStepOf(stepKey);
                    if (nxt) {
                        unlockStep(nxt);
                        var nxtInput = nxt.querySelector('.step-input');
                        if (nxtInput) nxtInput.focus();
                    }
                }
            } else {
                setStepState(card, 'wrong');
                setFeedback(card, data.hint || 'Revisa la respuesta.', 'error');
                btn.disabled = false;
                input.focus();
                input.select();
            }
        })
        .catch(function () {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            setStepState(card, 'wrong');
            setFeedback(card, 'Error de conexion. Vuelve a intentarlo.', 'error');
        });
    }

    function showChecklist() {
        if (!checklistCard) return;
        checklistCard.classList.remove('d-none');
        checklistCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function checkAllChecked() {
        for (var i = 0; i < checklistChecks.length; i++) {
            if (!checklistChecks[i].checked) return false;
        }
        return true;
    }

    function onChecklistChange() {
        if (checkAllChecked()) {
            if (celebration) celebration.classList.remove('d-none');
            markExerciseDone(exerciseId);
            if (nextBtn) {
                nextBtn.classList.remove('d-none');
                nextBtn.setAttribute('href', nextStepUrl());
            }
        } else {
            if (celebration) celebration.classList.add('d-none');
            if (nextBtn) nextBtn.classList.add('d-none');
        }
    }

    function nextStepUrl() {
        if (typeof window.NEXT_EXERCISE_URL === 'string') {
            return window.NEXT_EXERCISE_URL;
        }
        return '/apps/ecuaciones/bloque/' + window.BLOCK_ID;
    }

    // --- Inicializacion ---
    checkBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var stepKey = btn.getAttribute('data-step');
            var card = form.querySelector('.step-card[data-step="' + stepKey + '"]');
            if (card) validateStep(card);
        });
    });

    // Enter en input -> Comprobar
    stepCards.forEach(function (card) {
        var input = card.querySelector('.step-input');
        if (!input) return;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!input.disabled) {
                    var btn = card.querySelector('.check-btn');
                    if (btn && !btn.disabled) btn.click();
                }
            }
        });
    });

    // Checklist
    checklistChecks.forEach(function (c) {
        c.addEventListener('change', onChecklistChange);
    });

    // Estado inicial: solo el primer paso esta activo
    if (stepCards.length > 0) {
        setStepState(stepCards[0], 'active');
        var firstInput = stepCards[0].querySelector('.step-input');
        if (firstInput) setTimeout(function () { firstInput.focus(); }, 300);
    }
})();

/* === Renderizado de matematicas con KaTeX === */
(function () {
    'use strict';

    function renderMath(root) {
        if (typeof katex === 'undefined') return;
        var scope = root || document;
        var nodes = scope.querySelectorAll('.math:not(.math-rendered)');
        nodes.forEach(function (el) {
            var latex = el.getAttribute('data-latex');
            if (latex === null || latex === '') return;
            var displayMode = el.classList.contains('math-display');
            try {
                katex.render(latex, el, {
                    throwOnError: false,
                    displayMode: displayMode,
                    strict: 'ignore',
                });
                el.classList.add('math-rendered');
            } catch (e) {
                el.textContent = latex;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { renderMath(); });
    } else {
        renderMath();
    }

    window.renderMath = renderMath;
})();
