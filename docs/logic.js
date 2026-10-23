'use strict';
(() => {
  const definitions = Object.freeze({
    AND: Object.freeze({ symbol: '∧', formula: 'Y = A ∧ B', title: 'AND — it takes both.', description: 'The output is 1 only when both inputs are 1. In every other case, it is 0.', example: 'A lamp with two switches in series: both switches must be closed for the light to turn on.' }),
    OR: Object.freeze({ symbol: '∨', formula: 'Y = A ∨ B', title: 'OR — one is enough.', description: 'The output is 1 if at least one input is 1. When both inputs are 1, the output is still 1.', example: 'Two sensors: an alarm turns on if at least one of them is triggered.' }),
    XOR: Object.freeze({ symbol: '⊕', formula: 'Y = A ⊕ B', title: 'XOR — different is the key.', description: 'For two inputs, the output is 1 when they differ. Two zeros or two ones give 0.', example: 'Compare two bits: 1 means they differ, and 0 means they match.' }),
    NOT: Object.freeze({ symbol: '¬', formula: 'Y = ¬A', title: 'NOT — flip the bit.', description: 'An inverter has one input and flips its value: 0 becomes 1, and 1 becomes 0.', example: 'A "door closed" indicator: it turns on when the "door open" signal is 0.' })
  });
  function evaluate(gate, a, b = 0) {
    if (!Object.hasOwn(definitions, gate) || (a !== 0 && a !== 1) || (b !== 0 && b !== 1)) throw new TypeError('Unknown gate or non-binary input');
    switch (gate) {
      case 'AND': return a & b;
      case 'OR': return a | b;
      case 'XOR': return a ^ b;
      case 'NOT': return 1 - a;
    }
  }
  function rows(gate) {
    if (!Object.hasOwn(definitions, gate)) throw new TypeError('Unknown gate');
    return (gate === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]]).map(inputs => Object.freeze({ inputs: Object.freeze(inputs), output: evaluate(gate, ...inputs) }));
  }
  globalThis.GateLogic = Object.freeze({ definitions, evaluate, rows });
})();
