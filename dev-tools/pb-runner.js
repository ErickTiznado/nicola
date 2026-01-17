import { PatternBuilder } from '../pattern-builder/PatternBuilder.js';

const p = new PatternBuilder();
p.cut('"', null, { escaped: true, lazy: true });
console.log('PATTERN:', p.toString());
const input = 'code = "He said \\"Hello\\" to me";';
const m = p.get(input);
console.log('MATCHED:', Boolean(m));
console.log('GROUP1:', m && m[1]);
