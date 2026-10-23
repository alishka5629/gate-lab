'use strict';
(() => {
  const { definitions, evaluate, rows } = globalThis.GateLogic;
  const $ = id => document.getElementById(id);
  let gate = 'AND', a = 0, b = 0;
  const shapes = Object.freeze({
    AND: 'M138 90h72a60 60 0 0 1 0 120h-72z',
    OR: 'M138 90 Q205 86 270 150 Q205 214 138 210 Q175 150 138 90z',
    XOR: 'M138 90 Q205 86 270 150 Q205 214 138 210 Q175 150 138 90z',
    NOT: 'M138 90 270 150 138 210z'
  });
  function render() {
    const d = definitions[gate], isNot = gate === 'NOT', y = evaluate(gate, a, b);
    for (const tab of document.querySelectorAll('[data-gate]')) {
      const active = tab.dataset.gate === gate;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    }
    for (const [id, value] of [['input-a', a], ['input-b', b]]) {
      $(id).classList.toggle('on', value === 1);
      $(id).setAttribute('aria-pressed', String(value === 1));
      $(id).querySelector('.bit-number').textContent = String(value);
    }
    $('input-b-group').hidden = isNot;
    $('wire-b').setAttribute('visibility', isNot ? 'hidden' : 'visible');
    $('wire-a').querySelector('path').setAttribute('d', isNot ? 'M0 150h138' : 'M0 85h83v35h55');
    $('wire-a').querySelector('circle').setAttribute('cy', isNot ? '150' : '85');
    $('wire-out').querySelector('path').setAttribute('d', isNot ? 'M290 150h108' : 'M270 150h128');
    $('input-a').closest('.input-controls').classList.toggle('single', isNot);
    $('wire-a').classList.toggle('on', a === 1);
    $('wire-b').classList.toggle('on', b === 1);
    $('wire-out').classList.toggle('on', y === 1);
    $('gate-shape').classList.toggle('on', y === 1);
    $('shape-main').setAttribute('d', shapes[gate]);
    $('shape-extra').setAttribute('visibility', gate === 'XOR' ? 'visible' : 'hidden');
    $('not-bubble').setAttribute('visibility', isNot ? 'visible' : 'hidden');
    $('shape-extra').removeAttribute('hidden');
    $('not-bubble').removeAttribute('hidden');
    $('gate-label').textContent = gate;
    $('gate-label').setAttribute('x', isNot ? '185' : '201');
    $('circuit-title').textContent = 'Circuit: ' + gate;
    $('formula').textContent = d.formula;
    $('output-bit').textContent = String(y);
    $('output-bit').classList.toggle('on', y === 1);
    $('output-state').textContent = y ? 'SIGNAL ON' : 'SIGNAL OFF';
    $('live-result').textContent = gate + ': A ' + a + (isNot ? '' : ', B ' + b) + '. Output ' + y + '.';
    $('explanation-symbol').textContent = d.symbol;
    $('explanation-title').textContent = d.title;
    $('explanation-text').textContent = d.description;
    $('example-text').textContent = d.example;
    $('table-caption').textContent = 'Truth table ' + gate;
    $('b-heading').hidden = isNot;
    const fragment = document.createDocumentFragment();
    for (const row of rows(gate)) {
      const tr = document.createElement('tr');
      const active = row.inputs[0] === a && (isNot || row.inputs[1] === b);
      tr.classList.toggle('selected', active);
      if (active) tr.setAttribute('aria-current', 'true');
      for (const value of [...row.inputs, row.output]) {
        const td = document.createElement('td');
        td.textContent = String(value);
        tr.append(td);
      }
      fragment.append(tr);
    }
    $('truth-body').replaceChildren(fragment);
  }
  for (const button of document.querySelectorAll('[data-gate]')) button.addEventListener('click', () => { gate = button.dataset.gate; render(); });
  $('input-a').addEventListener('click', () => { a = 1 - a; render(); });
  $('input-b').addEventListener('click', () => { b = 1 - b; render(); });
  $('reset').addEventListener('click', () => { a = b = 0; render(); });
  $('compare-xor').addEventListener('click', () => { gate = 'XOR'; a = b = 1; render(); });

  const questions = Object.freeze([
    { gate: 'XOR', a: 1, b: 1, explanation: 'XOR gives 0 when the two inputs match.' },
    { gate: 'AND', a: 1, b: 0, explanation: 'AND needs two ones. Here, one input is 0.' },
    { gate: 'NOT', a: 0, explanation: 'NOT flips the input: zero becomes one.' },
    { gate: 'OR', a: 1, b: 1, explanation: 'OR needs at least one input to be 1. Two ones work too.' },
    { gate: 'XOR', a: 0, b: 1, explanation: 'The inputs are different, so XOR gives 1.' }
  ]);
  let questionIndex = 0, score = 0, answered = false, finished = false;
  function renderQuestion() {
    const q = questions[questionIndex];
    $('quiz-progress').textContent = 'QUESTION ' + String(questionIndex + 1).padStart(2, '0') + ' / 05';
    $('quiz-score').textContent = 'CORRECT: ' + score;
    $('quiz-question').textContent = 'What is the output?';
    $('quiz-equation').textContent = q.gate === 'NOT' ? 'NOT ' + q.a + ' = ?' : q.a + ' ' + q.gate + ' ' + q.b + ' = ?';
    $('quiz-feedback').textContent = 'Choose one of the two answers.';
    $('quiz-feedback').className = 'quiz-feedback';
    $('quiz-answers').hidden = false;
    $('quiz-next').hidden = true;
    for (const button of document.querySelectorAll('[data-answer]')) { button.disabled = false; button.classList.remove('correct', 'incorrect'); }
    for (const [index, bar] of [...document.querySelectorAll('.progress-bars i')].entries()) { bar.classList.toggle('done', index < questionIndex); bar.classList.toggle('current', index === questionIndex); }
  }
  for (const button of document.querySelectorAll('[data-answer]')) button.addEventListener('click', () => {
    if (answered || finished) return;
    answered = true;
    const q = questions[questionIndex], expected = evaluate(q.gate, q.a, q.b), correct = Number(button.dataset.answer) === expected;
    if (correct) score += 1;
    $('quiz-score').textContent = 'CORRECT: ' + score;
    $('quiz-feedback').textContent = (correct ? 'Correct! ' : 'Answer: ' + expected + '. ') + q.explanation;
    $('quiz-feedback').classList.add(correct ? 'success' : 'mistake');
    for (const answer of document.querySelectorAll('[data-answer]')) { answer.disabled = true; if (Number(answer.dataset.answer) === expected) answer.classList.add('correct'); }
    if (!correct) button.classList.add('incorrect');
    $('quiz-next').hidden = false;
    $('quiz-next').textContent = questionIndex === questions.length - 1 ? 'See your result ↗' : 'Next question ↗';
  });
  $('quiz-next').addEventListener('click', () => {
    if (finished) { questionIndex = score = 0; finished = answered = false; renderQuestion(); document.querySelector('[data-answer="0"]').focus(); return; }
    if (!answered) return;
    if (questionIndex < questions.length - 1) { questionIndex += 1; answered = false; renderQuestion(); document.querySelector('[data-answer="0"]').focus(); return; }
    finished = true;
    $('quiz-progress').textContent = 'EXPERIMENT COMPLETE';
    $('quiz-question').textContent = score === 5 ? 'Logic is on your side.' : 'Keep experimenting.';
    $('quiz-equation').textContent = score + ' / 5';
    $('quiz-answers').hidden = true;
    $('quiz-feedback').textContent = score === 5 ? 'Five out of five. You now know four fundamental logic gates.' : 'Head back to the lab, check the rules and try again.';
    $('quiz-feedback').className = 'quiz-feedback';
    $('quiz-next').textContent = 'Try again ↺';
    for (const bar of document.querySelectorAll('.progress-bars i')) { bar.classList.remove('current'); bar.classList.add('done'); }
  });
  render();
  renderQuestion();
})();
