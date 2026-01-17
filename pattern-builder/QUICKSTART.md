# PatternBuilder - Guía Rápida (QUICKSTART)

## ⚡ Instalación Ultra-Rápida

```javascript
import { PatternBuilder } from 'nicola-framework';
```

---

## 🎯 Ejemplos de 30 Segundos

### Email Validation
```javascript
const email = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .find('.')
  .word().oneOrMore()
  .endOfLine();

email.matches('user@example.com');  // true
```

### Find & Replace
```javascript
const pattern = new PatternBuilder()
  .find('world')
  .global();

pattern.replace('hello world, hello world', 'nicola');
// "hello nicola, hello nicola"
```

### Capture Content (cut)
```javascript
const quoted = new PatternBuilder().cut('"');

const result = quoted.get('message="Hello"');
result[1];  // "Hello"
```

### Phone Validation
```javascript
const phone = new PatternBuilder()
  .startOfLine()
  .find('(').digit().exactly(3).find(')')
  .whitespace()
  .digit().exactly(3).find('-')
  .digit().exactly(4)
  .endOfLine();

phone.matches('(123) 456-7890');  // true
```

### Multiple Patterns (OR)
```javascript
const language = new PatternBuilder()
  .find('javascript')
  .or('python')
  .or('rust');

language.matches('I love python');  // true
```

### Case-Insensitive
```javascript
const greeting = new PatternBuilder()
  .find('hello')
  .insensitive();

greeting.matches('HELLO');  // true
greeting.matches('HeLLo');  // true
```

### Numbers Only
```javascript
const numbers = new PatternBuilder()
  .startOfLine()
  .digit().oneOrMore()
  .endOfLine();

numbers.matches('12345');   // true
numbers.matches('123abc');  // false
```

### Extract All Matches (global)
```javascript
const findAll = new PatternBuilder()
  .digit().oneOrMore()
  .global();

findAll.get('Price: $10, Quantity: 5');  // ['10', '5']
```

---

## 📚 Métodos Principales

| Método | Uso | Ejemplo |
|--------|-----|---------|
| `find(text)` | Busca literal (auto-escapa) | `.find('img.png')` |
| `digit()` | Dígitos `\d` | `.digit().oneOrMore()` |
| `word()` | Palabra `\w` | `.word().anyAmount()` |
| `any()` | Cualquier char `.` | `.any()` |
| `startOfLine()` | Inicio `^` | `.startOfLine()` |
| `endOfLine()` | Final `$` | `.endOfLine()` |
| `maybe()` | Opcional `?` | `.find('s').maybe()` |
| `oneOrMore()` | Uno+ `+` | `.digit().oneOrMore()` |
| `anyAmount()` | Cero+ `*` | `.digit().anyAmount()` |
| `exactly(n)` | Exactamente n | `.digit().exactly(3)` |
| `not(char)` | Negación `[^]` | `.not('a')` |
| `or(pattern)` | Alternancia `\|` | `.find('a').or('b')` |
| `cut(delim)` | Captura `()` | `.cut('"')` |
| `matches(str)` | Test boolean | `pattern.matches('test')` |
| `get(str)` | Extrae coincidencias | `pattern.get('hello')` |
| `replace(str, val)` | Reemplaza | `pattern.replace('a', 'b')` |
| `global()` | Bandera g | `.find('o').global()` |
| `insensitive()` | Bandera i | `.find('a').insensitive()` |

---

## 🔥 Patrones Comunes Listos para Copiar

### Email
```javascript
const email = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .find('.')
  .word().oneOrMore()
  .endOfLine();
```

### URL
```javascript
const url = new PatternBuilder()
  .find('http').maybe()
  .find('s').maybe()
  .find('://')
  .word().anyAmount()
  .find('.')
  .word().oneOrMore();
```

### Phone (XXX) XXX-XXXX
```javascript
const phone = new PatternBuilder()
  .startOfLine()
  .find('(').digit().exactly(3).find(')')
  .whitespace()
  .digit().exactly(3).find('-')
  .digit().exactly(4)
  .endOfLine();
```

### Date DD/MM/YYYY
```javascript
const date = new PatternBuilder()
  .digit().exactly(2).find('/')
  .digit().exactly(2).find('/')
  .digit().exactly(4);
```

### ZIP Code (5 digits)
```javascript
const zip = new PatternBuilder()
  .startOfLine()
  .digit().exactly(5)
  .endOfLine();
```

### Extract Quoted Text
```javascript
const quoted = new PatternBuilder().cut('"');
// Genera: /"([^"]*)"/
```

### Extract HTML Attribute
```javascript
const href = new PatternBuilder()
  .find('href=')
  .cut('"');
// Extrae: href="VALUE"
```

### Extract JSON Value
```javascript
const jsonValue = new PatternBuilder()
  .find('"name":')
  .whitespace().anyAmount()
  .cut('"');
// Extrae: "name":"VALUE"
```

---

## 💡 Tips & Tricks

### 1. Escaping Automático
`find()` escapa automáticamente caracteres especiales - no necesitas usar `\`

```javascript
new PatternBuilder().find('img.png');  // ✅ Genera /img\.png/
new PatternBuilder().find('(test)');   // ✅ Genera /\(test\)/
```

### 2. cut() para Capturas
Genera grupos de captura sin escribir paréntesis

```javascript
new PatternBuilder().cut('"');
// Genera: /"([^"]*)"/
// Acceso: match[1] = contenido dentro de comillas
```

### 3. Encadenamiento Fluido
Todos los métodos retornan `this`, puedes encadenar infinitamente

```javascript
pattern
  .startOfLine()
  .digit().oneOrMore()
  .find('-')
  .word().anyAmount()
  .endOfLine()
  .global()
  .insensitive();
```

### 4. Debug Avanzado
Usa `.debug()` para ver qué regex se genera

```javascript
pattern.find('test').debug();
// Imprime: /test/ + explicación humanizada
```

### 5. Múltiples Banderas
Combina `global()` e `insensitive()`

```javascript
pattern
  .find('hello')
  .global()
  .insensitive()
  .get('Hello HELLO hello');
// Retorna: ['Hello', 'HELLO', 'hello']
```

---

## 🚀 Próximos Pasos

1. **Lee la documentación completa:** [PatternBuilder.README.md](PatternBuilder.README.md)
2. **Revisa los ejemplos:** [PatternBuilder.examples.js](PatternBuilder.examples.js)
3. **Ve casos de integración:** [PatternBuilder.integration.js](PatternBuilder.integration.js)
4. **Ejecuta los tests:** `npm test -- test/PatternBuilder.test.js`

---

## 🎓 Estructura Mental

**PatternBuilder = Constructor de Regex en Lenguaje Natural**

```
┌─────────────────────────────────────────────────┐
│        DESARROLLADOR (Lenguaje Natural)         │
│  "Quiero buscar word-boundary hello"            │
│         pattern.wordBoundary().find('hello')    │
└────────────────────┬────────────────────────────┘
                     │
                     │ API Fluida
                     │
┌────────────────────▼────────────────────────────┐
│      PatternBuilder (Transformación)            │
│  prefixes: '', source: '\bhello', suffixes: '' │
└────────────────────┬────────────────────────────┘
                     │
                     │ __compile()
                     │
┌────────────────────▼────────────────────────────┐
│       RegExp (Motor Nativo de JavaScript)       │
│           /\bhello/  ← Regex crudo             │
└────────────────────┬────────────────────────────┘
                     │
                     │ matches() / get() / replace()
                     │
┌────────────────────▼────────────────────────────┐
│       RESULTADO (Búsqueda en Strings)           │
│    "hello" → true, "helloworld" → false        │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Lo que NO hace (Aún)

- Lookahead/lookbehind (`(?=...)`, `(?!...)`)
- Grupos sin captura (aún, todo `cut()` captura)
- Backreferences (`\1`, `\2`)
- Sustituciones avanzadas en `replace()`

Estas funcionalidades están en el roadmap.

---

**¡Listo! Comienza a construir regex de forma legible hoy mismo.** 🚀
