# PatternBuilder - API Fluida para Expresiones Regulares

PatternBuilder es un módulo que proporciona una **API humanizada y fluida** para construir expresiones regulares complejas sin escribir sintaxis regex cruda. Transforma la forma en que los desarrolladores interactúan con regex, haciéndola más accesible y legible.

## 📦 Instalación

El módulo está incluido en nicola-framework y se exporta automáticamente:

```javascript
import { PatternBuilder } from 'nicola-framework';

const pattern = new PatternBuilder();
```

## 🚀 Uso Rápido

```javascript
// Buscar emails simples
const email = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .find('.')
  .word().oneOrMore()
  .endOfLine();

email.matches('user@example.com'); // true

// Capturar contenido entre comillas
const quoted = new PatternBuilder()
  .find('name=')
  .cut('"');

const text = 'name="Alice" age="30"';
const match = quoted.get(text);
// match[0] = 'name="Alice"'
// match[1] = 'Alice' (grupo de captura)
```

## 📚 API Completa

### **Grupo A: Anclas y Posición** (¿Dónde?)

Define dónde comienza y termina el patrón.

#### `startOfLine()`
Añade `^` al inicio del patrón. Indica inicio de línea.

```javascript
new PatternBuilder()
  .startOfLine()
  .find('hello');
  
// Regex: /^hello/
```

#### `endOfLine()`
Añade `$` al final del patrón. Indica final de línea.

```javascript
new PatternBuilder()
  .find('world')
  .endOfLine();
  
// Regex: /world$/
```

#### `wordBoundary()`
Añade `\b` para límite de palabra.

```javascript
new PatternBuilder()
  .wordBoundary()
  .find('hello');
  
// Regex: /\bhello/
```

---

### **Grupo B: Contenido** (¿Qué busco?)

Define qué caracteres o patrones buscar.

#### `find(texto)`
**CRÍTICO**: Busca texto literal con **escaping automático**. Cualquier carácter especial se escapa automáticamente.

```javascript
// find() escapa automáticamente caracteres especiales
new PatternBuilder().find('img.png');
// Genera: /img\.png/ (no busca "img" + cualquier carácter + "png")

new PatternBuilder().find('[test]');
// Genera: /\[test\]/ (busca literalmente [test])
```

#### `any()`
Comodín: coincide con **cualquier carácter** (`.` en regex).

```javascript
new PatternBuilder()
  .find('a')
  .any()
  .find('c');
  
// Regex: /a.c/
// Coincide: "abc", "adc", "a c", etc.
```

#### `digit() / word() / whitespace() / tab()`
Clases de caracteres predefinidas.

```javascript
new PatternBuilder()
  .startOfLine()
  .digit().oneOrMore()
  .endOfLine();
  
// Regex: /^\d+$/
// Coincide: "123", "999", etc.
```

**Aliases disponibles:**
- `digit()` → `\d` (0-9)
- `word()` → `\w` (a-z, A-Z, 0-9, _)
- `whitespace()` → `\s` (espacios, tabs, saltos)
- `tab()` → `\t` (tabulación)

#### `range(inicio, fin)`
Crea un rango de caracteres `[a-z]`.

```javascript
new PatternBuilder()
  .range('a', 'z')
  .oneOrMore();
  
// Regex: /[a-z]+/
// Coincide: "hello", "world", etc.
```

---

### **Grupo C: Cuantificadores** (¿Cuántos?)

Define cuántas veces debe repetirse el elemento anterior.

#### `exactly(n)`
Repite **exactamente n veces** `{n}`.

```javascript
new PatternBuilder()
  .find('a')
  .exactly(3);
  
// Regex: /a{3}/
// Coincide: "aaa", "aaa", etc. (exactamente 3 'a')
```

#### `maybe()`
Hace el elemento **opcional** `?`.

```javascript
new PatternBuilder()
  .find('cat')
  .maybe();
  
// Regex: /(?:cat)?/
// Coincide: "", "cat" (atomicidad garantizada)
```

#### `oneOrMore()`
Una **o más repeticiones** `+`.

```javascript
new PatternBuilder()
  .digit()
  .oneOrMore();
  
// Regex: /\d+/
// Coincide: "1", "123", "999", etc.
```

#### `anyAmount()`
**Cualquier cantidad** (incluyendo cero) `*`.

```javascript
new PatternBuilder()
  .digit()
  .anyAmount();
  
// Regex: /\d*/
// Coincide: "", "1", "123", etc.
```

---

### **Grupo D: Lógica Negativa** (El poder oculto)

Define lo que **NO** debe coincidir.

#### `not(caracter)`
Niega un carácter `[^caracter]`.

```javascript
new PatternBuilder()
  .not('a');
  
// Regex: /[^a]/
// Coincide: "b", "c", "1", etc. (cualquier char EXCEPTO 'a')
```

#### `or(otroPatron)`
Alternancia con `|` (OR lógico).

```javascript
new PatternBuilder()
  .find('cat')
  .or('dog')
  .or('bird');
  
// Regex: /cat|dog|bird/
// Coincide: "cat", "dog", "bird"
```

---

### **La Joya de la Corona: `cut()`** (Agrupación)

Método crítico para **capturar contenido** entre delimitadores. Construye grupos de captura automáticamente.

#### `cut(delimitador, delimitadorFinal?)`
Crea una captura de contenido entre delimitadores.

**Lógica interna:**
- Busca el delimitador de apertura (escapado)
- Captura todo lo que NO sea el delimitador
- Busca el delimitador de cierre

```javascript
// Capturar contenido entre comillas
new PatternBuilder()
  .cut('"');
  
// Regex: /"([^"]*)"/
// Resultado: "hello" → captura "hello"

// Capturar con delimitadores diferentes
new PatternBuilder()
  .cut('<', '>');
  
// Regex: /<([^<]*)>/
// Resultado: <content> → captura "content"
```

**Opciones avanzadas (nuevo):**

```javascript
// Soporta comillas escapadas y captura lazy
new PatternBuilder()
  .cut('"', null, { escaped: true, lazy: true });

// Regex generado (aprox): /"((?:\\.|[^"])*?)(?<!\\)"/
```

**Ejemplos comunes:**

```javascript
// Extraer JSON value
const jsonValue = new PatternBuilder()
  .find('"name":')
  .cut('"');
  
const text = '{"name":"Alice","age":30}';
const match = jsonValue.get(text);
// match[1] = "Alice"

// Capturar URL en atributo href
const href = new PatternBuilder()
  .find('href=')
  .cut('"');
  
const html = '<a href="https://example.com">link</a>';
const match = href.get(html);
// match[1] = "https://example.com"
```

---

### **Agrupación (Group) - Nuevo**

Agrupa patrones para controlar precedencia o aplicar cuantificadores a bloques completos.

#### `group(name?, options?)`
Abre un grupo. Por defecto es **no capturante** `(?:...)`.

```javascript
// Grupo no capturante
new PatternBuilder()
  .group()
    .find('cat')
  .endGroup()
  .oneOrMore();
// Regex: /(?:cat)+/
```

#### Named groups

```javascript
// Grupo nombrado
new PatternBuilder()
  .group('animal')
    .find('dog')
  .endGroup();
// Regex: /(?<animal>dog)/
```

#### `endGroup()`
Cierra el grupo abierto más reciente.

---

### **Métodos de Acción** (Salida)

Métodos que ejecutan la búsqueda en strings.

#### `matches(cadena) → boolean`
¿Coincide la cadena con el patrón?

```javascript
const pattern = new PatternBuilder().find('test');
pattern.matches('this is a test'); // true
pattern.matches('no match here');  // false
```

#### `get(cadena) → Array | null`
Extrae todas las coincidencias (incluyendo grupos de captura).

```javascript
const pattern = new PatternBuilder()
  .find('hello')
  .global();
  
const matches = pattern.get('hello world hello');
// matches = ["hello", "hello"]

// Con grupo de captura
const quoted = new PatternBuilder().cut('"');
const result = quoted.get('say "hello"');
// result[0] = '"hello"' (coincidencia completa)
// result[1] = 'hello'   (grupo de captura)
```

#### `replace(cadena, nuevoValor) → string`
Reemplaza coincidencias con un nuevo valor.

```javascript
const pattern = new PatternBuilder()
  .find('world')
  .global();
  
const result = pattern.replace('hello world world', 'nicola');
// result = "hello nicola nicola"
```

#### `toRegex() → RegExp`
Obtiene la RegExp compilada para uso directo.

```javascript
const pattern = new PatternBuilder().find('test');
const regex = pattern.toRegex();
regex.test('test');  // true
```

#### `toString() → string`
Obtiene el patrón como string sin compilar.

```javascript
const pattern = new PatternBuilder()
  .startOfLine()
  .find('test')
  .endOfLine();
  
pattern.toString(); // "^test$"
```

---

### **Debug: Modo Dios de DX**

#### `debug()`
Imprime el regex generado y una explicación humanizada. Retorna `this` para encadenamiento.

```javascript
new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .endOfLine()
  .debug();

// Output:
// ============================================================
// 🔍 NICOLA PATTERN BUILDER - DEBUG
// ============================================================
// 
// 📋 Componentes internos:
//    prefixes: "^"
//    source:   "\w+@\w+"
//    suffixes: "$"
//    flags:    [sin flags]
// 
// 🎯 Regex Generado:
//    /^\w+@\w+$/
// 
// 💡 Explicación Humanizada:
//    Inicio de línea, buscando: caracteres de palabra alternativas, al final de línea.
// 
// ============================================================
```

---

### **Compatibilidad de Flags**

Métodos para controlar banderas de regex.

#### `global() → this`
Añade la bandera global `g` (todas las coincidencias).

```javascript
new PatternBuilder()
  .find('o')
  .global()
  .get('hello world');  // ["o", "o"]
```

#### `insensitive() → this`
Añade la bandera `i` (insensible a mayúsculas).

```javascript
new PatternBuilder()
  .find('hello')
  .insensitive()
  .matches('HELLO');  // true
```

#### `multiline() → this`
Añade la bandera `m` (multiline).

#### `addFlag(flag) → this`
Añade una bandera personalizada (g, i, m, s, u, y).

---

### **Utilidades**

#### `reset() → this`
Resetea completamente el patrón y el estado interno.

```javascript
const pattern = new PatternBuilder()
  .startOfLine()
  .find('test')
  .endOfLine();

pattern.reset();
pattern.toString(); // ""
```

---

## 💡 Casos de Uso Reales

### Validar teléfono (XXX) XXX-XXXX

```javascript
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

phone.matches('(123) 456-7890');  // true
phone.matches('123-456-7890');    // false
```

### Buscar URLs en HTML

```javascript
const href = new PatternBuilder()
  .find('href=')
  .cut('"');

const html = '<a href="https://example.com">link</a>';
const match = href.get(html);
// match[1] = "https://example.com"
```

### Extraer valores JSON

```javascript
const jsonField = new PatternBuilder()
  .find('"email":')
  .whitespace().anyAmount()
  .cut('"');

const json = '{"email":"user@example.com","name":"John"}';
const email = jsonField.get(json);
// email[1] = "user@example.com"
```

### Buscar palabras completas (con límites)

```javascript
const word = new PatternBuilder()
  .wordBoundary()
  .find('hello')
  .wordBoundary();

word.matches('hello world');      // true
word.matches('hellound');         // false (la palabra está dentro)
word.matches('say hello there');  // true
```

---

## 🏗️ Arquitectura Interna

### Estructura de Datos

```javascript
{
  prefixes: '',        // Inicio (ej. ^)
  source: '',          // Cuerpo del patrón
  suffixes: '',        // Final (ej. $)
  flags: [],           // Banderas [g, i, m, ...]
  __lastToken: '',     // Trackea último token para cuantificadores
  __groupStack: []     // Stack de grupos abiertos
}
```

### Diseño de Cuantificadores (Opción A)

Los cuantificadores (`maybe`, `oneOrMore`, `exactly`) usan **trackeo de último token** (Opción A - más limpio y performante) en lugar de regex para modificar el source. Esto permite:

1. ✅ Mejor rendimiento (no re-parsear el source)
2. ✅ Más legible y mantenible
3. ✅ Atomicidad en tokens compuestos (ej: `find('cat').maybe()` → `(?:cat)?`)

---

## 🧪 Testing

El módulo incluye **93 tests** cubriendo:

- ✅ Todos los grupos de métodos (A, B, C, D)
- ✅ Escaping automático en `find()`
- ✅ Cuantificadores encadenados
- ✅ Método `cut()` con delimitadores simples y complejos
- ✅ Métodos de acción (matches, get, replace)
- ✅ Encadenamiento fluido completo
- ✅ Banderas (global, insensitive, etc.)
- ✅ Edge cases y unicode
- ✅ Debug y depuración

Ejecuta los tests:

```bash
npm test -- test/PatternBuilder.test.js
```

---

## 🔄 Encadenamiento Fluido

Todos los métodos retornan `this`, permitiendo encadenamientos complejos:

```javascript
const complex = new PatternBuilder()
  .startOfLine()
  .digit().oneOrMore()
  .find('-')
  .word().oneOrMore()
  .find('.')
  .any().anyAmount()
  .endOfLine()
  .global()
  .insensitive();
```

---

## 📝 Notas Importantes

1. **`find()` escapa automáticamente**: No necesitas preocuparte por caracteres especiales
2. **`cut()` genera capturas automáticas**: Perfecto para extraer contenido
3. **Cuantificadores son post-fix**: Afectan al último token agregado
4. **El debug es tu amigo**: Úsalo para entender qué regex se genera
5. **`reset()` limpia todo el estado**: útil para reutilizar instancias
6. **Cuantificadores en cascada lanzan error**: evita patrones inválidos (ej: `oneOrMore().maybe()`)
7. **`group()` permite precedencia correcta**: útil con `or()` + cuantificadores

---

## 🚀 Mejoras Futuras (Roadmap)

- [ ] Métodos para alternancia avanzada `branch()`
- [ ] Lookahead/lookbehind `ahead()`, `behind()`
- [ ] Validación de regex en tiempo real
- [ ] Exportación de patrón a archivo

---

## 📄 Licencia

Parte del framework **nicola-framework v1.0.5**

---

**Creado con ❤️ para hacer regex accesible a todos.**
