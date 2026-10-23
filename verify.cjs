'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, 'docs');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'logic.js'), 'utf8'), context);
const { evaluate, rows } = context.GateLogic;
const expected = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0], NOT: [1, 0] };
let combinations = 0;
for (const [gate, outputs] of Object.entries(expected)) {
  assert.deepEqual(Array.from(rows(gate), r => r.output), outputs);
  for (const [index, output] of outputs.entries()) {
    const a = gate === 'NOT' ? index : index >> 1;
    const b = gate === 'NOT' ? 0 : index & 1;
    assert.equal(evaluate(gate, a, b), output);
    combinations += 1;
  }
}
for (const bad of [['__proto__', 0, 0], ['AND', '1', 0], ['OR', 1, 2], ['NOT', -1, 0]]) assert.throws(() => evaluate(...bad));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(html.includes("script-src 'self'"));
assert(html.includes("connect-src 'none'"));
assert(html.includes("form-action 'none'"));
assert(html.includes("base-uri 'none'"));
assert(!/unsafe-inline|unsafe-eval/i.test(html));
assert(!/<form\b|<iframe\b|\son\w+\s*=/i.test(html));
for (const asset of [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)]) assert(fs.existsSync(path.join(root, asset[1])), 'Missing asset: ' + asset[1]);
for (const filename of ['app.js', 'logic.js']) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  assert(!/\b(innerHTML|outerHTML|eval|fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b|document\.write|new Function/.test(source), 'Unexpected unsafe sink or network/storage use');
  assert(!/location\.(search|hash)|URLSearchParams|document\.cookie/.test(source));
}
assert.deepEqual(fs.readdirSync(root).sort(), ['.nojekyll', 'FONT-LICENSE.txt', 'app.js', 'favicon.svg', 'index.html', 'lab-sans.woff', 'logic.js', 'styles.css']);
assert(html.includes('lang="en"'));
for (const filename of ['index.html', 'app.js', 'logic.js']) assert(!/[А-Яа-яЁё]/.test(fs.readFileSync(path.join(root, filename), 'utf8')), 'Untranslated text remains');
console.log('PASS: 14 truth-table combinations, invalid-input rejection, local assets, restrictive CSP, no HTML injection sinks or application network/storage calls.');
