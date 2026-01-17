/**
 * PatternBuilder - Ejemplos Prácticos y Casos de Uso
 * Demostraciones de cómo usar la API fluida para resolver problemas reales
 */

import { PatternBuilder } from '../index.js';

// ==================== EJEMPLOS BÁSICOS ====================

console.log('🎯 EJEMPLOS BÁSICOS DE PATTERNBUILDER\n');

// Ejemplo 1: Validar email simple
const email = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .find('.')
  .word().oneOrMore()
  .endOfLine();

console.log('📧 Email Validation:');
console.log('  user@example.com:', email.matches('user@example.com'));     // true
console.log('  invalid@:', email.matches('invalid@'));                     // false
console.log('  plaintext:', email.matches('plaintext'));                   // false

// Ejemplo 2: Buscar números
const numbers = new PatternBuilder()
  .digit().oneOrMore();

console.log('\n🔢 Find Numbers:');
console.log('  "Price: $99.99":', numbers.get('Price: $99.99'));  // ['99', '99']
console.log('  "No numbers":', numbers.get('No numbers'));        // null

// Ejemplo 3: Búsqueda insensible a mayúsculas
const greeting = new PatternBuilder()
  .find('hello')
  .insensitive();

console.log('\n👋 Case-Insensitive:');
console.log('  matches "HELLO":', greeting.matches('HELLO'));     // true
console.log('  matches "HeLLo":', greeting.matches('HeLLo'));     // true
console.log('  matches "goodbye":', greeting.matches('goodbye')); // false

// ==================== EJEMPLOS DE CUT (CAPTURA) ====================

console.log('\n\n🎁 EJEMPLOS DE CUT (CAPTURA)\n');

// Ejemplo 4: Extraer contenido entre comillas
const quoted = new PatternBuilder()
  .find('message=')
  .cut('"');

const text1 = 'message="Hello World" user="Alice"';
const match1 = quoted.get(text1);
console.log('📝 Quoted Text:');
console.log('  Input:', text1);
console.log('  Captured:', match1 ? match1[1] : null);  // "Hello World"

// Ejemplo 5: Extraer URLs de atributos HTML
const href = new PatternBuilder()
  .find('href=')
  .cut('"');

const html = '<a href="https://example.com">click</a>';
const matchHref = href.get(html);
console.log('\n🔗 Extract URL:');
console.log('  Input:', html);
console.log('  URL:', matchHref ? matchHref[1] : null);  // "https://example.com"

// Ejemplo 6: Capturar contenido JSON
const jsonValue = new PatternBuilder()
  .find('"name":')
  .whitespace().anyAmount()
  .cut('"');

const json = '{"name":"Alice","age":30,"email":"alice@example.com"}';
const nameMatch = jsonValue.get(json);
console.log('\n📋 JSON Field:');
console.log('  Input:', json);
console.log('  Name:', nameMatch ? nameMatch[1] : null);  // "Alice"

// Ejemplo 7: Capturar entre diferentes delimitadores
const htmlTag = new PatternBuilder()
  .cut('<', '>');

const htmlText = '<h1>Welcome</h1><p>Hello</p>';
const allTags = htmlText.match(/<([^<]*)>/g);  // Con global
console.log('\n🏷️  HTML Tags:');
console.log('  Input:', htmlText);
console.log('  Tags found:', allTags);  // ['<h1>', '<p>']

// ==================== EJEMPLOS COMPLEJOS ====================

console.log('\n\n🚀 EJEMPLOS COMPLEJOS\n');

// Ejemplo 8: Validar teléfono en formato (XXX) XXX-XXXX
const phone = new PatternBuilder()
  .startOfLine()
  .find('(')
  .digit().exactly(3)
  .find(')')
  .whitespace()
  .digit().exactly(3)
  .find('-')
  .digit().exactly(4)
  .endOfLine();

console.log('📞 Phone Number Validation:');
console.log('  (123) 456-7890:', phone.matches('(123) 456-7890'));   // true
console.log('  123-456-7890:', phone.matches('123-456-7890'));       // false
console.log('  (123)456-7890:', phone.matches('(123)456-7890'));     // false (sin espacio)

// Ejemplo 9: Buscar palabras completas (word boundary)
const wholeWord = new PatternBuilder()
  .wordBoundary()
  .find('test')
  .wordBoundary();

console.log('\n🔤 Whole Word Matching:');
console.log('  "testing" contains "test":', wholeWord.matches('testing'));     // false
console.log('  "this is a test":', wholeWord.matches('this is a test'));       // true
console.log('  "test":', wholeWord.matches('test'));                           // true

// Ejemplo 10: Encontrar múltiples coincidencias con global
const findAll = new PatternBuilder()
  .digit()
  .oneOrMore()
  .global();

const allNumbers = findAll.get('Price: $10, Quantity: 5, Total: 50');
console.log('\n🔍 Global Search:');
console.log('  Input: "Price: $10, Quantity: 5, Total: 50"');
console.log('  All numbers:', allNumbers);  // ['10', '5', '50']

// Ejemplo 11: Reemplazar contenido
const replace = new PatternBuilder()
  .find('world')
  .global();

const result = replace.replace('hello world, hello world', 'nicola');
console.log('\n♻️  Replace:');
console.log('  Input: "hello world, hello world"');
console.log('  Output:', result);  // "hello nicola, hello nicola"

// Ejemplo 12: Validar contraseña compleja
const password = new PatternBuilder()
  .startOfLine()
  // Al menos una mayúscula
  .find('(?=.*[A-Z])')
  .digit().oneOrMore()
  // Al menos un dígito
  .find('(?=.*\\d)')
  // Al menos 8 caracteres
  .word().exactly(8)
  .endOfLine();

console.log('\n🔐 Password Complexity:');
console.log('  Note: Este ejemplo es simplificado (lookahead no implementado aún)');
console.log('  Patrón generado:', password.toString());

// Ejemplo 13: Encontrar URLs en texto
const urlPattern = new PatternBuilder()
  .find('https')
  .maybe()  // https?
  .find('://')
  .word().anyAmount()
  .find('.')
  .word().oneOrMore();

console.log('\n🌐 URL Pattern:');
console.log('  URL match:', urlPattern.matches('https://example.com'));  // true
console.log('  URL match:', urlPattern.matches('http://example.com'));   // true

// Ejemplo 14: CSV Parser simple (extraer campos entre comillas)
const csvField = new PatternBuilder()
  .cut('"')
  .global();

const csv = '"Alice","30","alice@example.com"';
const fields = csv.match(/"([^"]*)"/g);
console.log('\n📊 CSV Parsing:');
console.log('  Input:', csv);
console.log('  Raw matches:', fields);  // ['"Alice"', '"30"', '"alice@example.com"']

// Ejemplo 15: Validar IPv4 simplificado
const ipv4 = new PatternBuilder()
  .startOfLine()
  .digit().oneOrMore()
  .find('.')
  .digit().oneOrMore()
  .find('.')
  .digit().oneOrMore()
  .find('.')
  .digit().oneOrMore()
  .endOfLine();

console.log('\n🌐 IPv4 Validation:');
console.log('  192.168.1.1:', ipv4.matches('192.168.1.1'));     // true
console.log('  256.1.1.1:', ipv4.matches('256.1.1.1'));         // true (no valida rango)
console.log('  192.168.1:', ipv4.matches('192.168.1'));         // false

// ==================== EJEMPLOS DE DEBUG ====================

console.log('\n\n🐛 EJEMPLOS CON DEBUG\n');

// Ejemplo 16: Ver patrón generado con debug
console.log('🔍 Email Pattern Debug:');
new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .find('.')
  .word().oneOrMore()
  .endOfLine()
  .debug();

// ==================== CASOS DE USO AVANZADOS ====================

console.log('\n\n⚡ CASOS DE USO AVANZADOS\n');

// Ejemplo 17: Extraer atributos de HTML
const attributes = new PatternBuilder()
  .find('class=')
  .cut('"');

const htmlWithClass = '<div class="container main">Content</div>';
const classMatch = attributes.get(htmlWithClass);
console.log('🏗️  HTML Attributes:');
console.log('  Input:', htmlWithClass);
console.log('  Class:', classMatch ? classMatch[1] : null);  // "container main"

// Ejemplo 18: Buscar fechas simples (DD/MM/YYYY)
const date = new PatternBuilder()
  .digit().exactly(2)
  .find('/')
  .digit().exactly(2)
  .find('/')
  .digit().exactly(4);

console.log('\n📅 Date Pattern (DD/MM/YYYY):');
console.log('  "25/12/2024":', date.matches('25/12/2024'));     // true
console.log('  "5/12/2024":', date.matches('5/12/2024'));       // false (no rellena con 0)
console.log('  "25-12-2024":', date.matches('25-12-2024'));     // false

// Ejemplo 19: Negación - buscar líneas que NO contienen cierta palabra
const notTest = new PatternBuilder()
  .startOfLine()
  .not('t')
  .oneOrMore()
  .endOfLine();

console.log('\n❌ Negation Example:');
console.log('  "hello" (no contains "t"):', notTest.matches('hello'));  // true
console.log('  "test" (contains "t"):', notTest.matches('test'));       // false

// Ejemplo 20: Alternancia (OR)
const language = new PatternBuilder()
  .find('javascript')
  .or('python')
  .or('rust')
  .or('go');

console.log('\n🔀 Alternation (OR):');
console.log('  "I love javascript":', language.matches('I love javascript'));  // true
console.log('  "I love python":', language.matches('I love python'));          // true
console.log('  "I love java":', language.matches('I love java'));              // false

console.log('\n✅ Ejemplos completados!\n');
