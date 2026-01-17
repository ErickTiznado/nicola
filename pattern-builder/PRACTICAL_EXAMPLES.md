# PatternBuilder - Ejemplos Prácticos de Limitaciones

Este documento muestra **ejemplos reales** donde las limitaciones documentadas impactan el uso.

---

## 1. Atomicidad en `maybe()` - Ejemplo Práctico

### Caso de Uso: Validar extensiones de archivo opcionales

```javascript
import { PatternBuilder } from 'nicola-framework';

// Intentamos: "archivo" o "archivo.txt" (opcional)
const filePattern = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('.txt')  // Extensión opcional
  .maybe()
  .endOfLine();

// Problemas:
filePattern.matches('documento.txt');     // ✅ true  - esperado
filePattern.matches('documento');         // ✅ true  - esperado
filePattern.matches('documento.t');       // ✅ true  - ❌ BUG! Solo la 't' es opcional
filePattern.matches('documento.tx');      // ✅ true  - ❌ BUG! Solo la 't' es opcional

// Lo que se genera: /^\w+\.txt?$/
// Significa: word + punto + "txt" con "t" opcional = word + punto + "tx" o "txt"
```

### ¿Por qué ocurre?

La implementación:
```javascript
maybe() {
  // __lastToken = ".txt"
  // solo hace opcional el ÚLTIMO carácter: "t"
  this.source += '?';  // Genera: .txt?
}
```

### Solución Actual: Pensar en componentes más pequeños

```javascript
// WORKAROUND:
const filePattern = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .find('.txt')  // Buscar literalmente
  // NO usar maybe() aquí

// O alternativa con or():
const filePattern = new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .or(''); // Fin de palabra, o sigue con .txt

// O usar regex directo si es crítico:
const regex = /^\w+(?:\.txt)?$/;
```

---

## 2. Cut() con Delimitadores Escapados - Ejemplo Práctico

### Caso de Uso: Parsear strings con JSON escapado

```javascript
import { PatternBuilder } from 'nicola-framework';

// JSON con strings que contienen comillas escapadas
const jsonInput = `{
  "message": "He said \\"Hello\\" to me",
  "name": "Alice",
  "escaped": "Quote: \\"test\\""
}`;

const fieldValue = new PatternBuilder()
  .find('"message":')
  .whitespace().anyAmount()
  .cut('"');

const match = fieldValue.get(jsonInput);

if (match) {
  console.log('Capturado:', match[1]);
  // ❌ PROBLEMA: Captura solo: He said \"
  // ✅ ESPERADO: He said \"Hello\" to me
}
```

### ¿Por qué ocurre?

El regex generado es: `/"([^"]*)"/`

- `[^"]` significa "cualquier carácter EXCEPTO comilla"
- `\` es un carácter válido para `[^"]`
- Pero la `"` después de `\` termina el patrón prematuramente

```
JSON: "He said \"Hello\" to me"
      ^         ^
      inicio    fin (aquí termina porque [^"] encuentra ")
```

### Solución Actual: Usar delimitadores diferentes

```javascript
// Si es posible, usar delimitadores que no necesiten escape:
const fieldValue = new PatternBuilder()
  .find('"message":')
  .whitespace().anyAmount()
  .cut('<<', '>>');  // Usar delimitadores únicos

// O extrae manualmente con regex robusto:
const regex = /"([^"]*(?:\\.[^"]*)*)/;  // Entiende escapes
const match = jsonInput.match(regex);
```

---

## 3. Precedencia del `or()` - Ejemplo Práctico

### Caso de Uso: Buscar múltiples formatos de teléfono

```javascript
import { PatternBuilder } from 'nicola-framework';

// Queremos: (123) 456-7890 O 123-456-7890 O +1 123 456 7890
// Y validar que haya exactamente este patrón repetido

const phonePattern = new PatternBuilder()
  .find('(123)')
  .or('123')
  .or('+1')
  .oneOrMore();

// Problemas:
phonePattern.matches('(123)');     // ✅ true
phonePattern.matches('123');       // ✅ true
phonePattern.matches('+1');        // ✅ true
phonePattern.matches('(123)123'); // ✅ true - ¡ESPERA! ¿Es esto correcto?

// Lo que se genera: /(123)|123|\+1+/
// Significa: "(123)" O "123" O "+1 repetido"
// El oneOrMore() solo aplica al último elemento
```

### ¿Por qué ocurre?

```javascript
or(patron) {
  this.source += `|${patron}`;  // Solo concatena |, sin agrupar
}

oneOrMore() {
  // this.__lastToken = "+1"
  this.source += '+';  // Genera: ...|\+1+
}
```

El regex interpreta como:
```
/patrón1|patrón2|patrón3+/
```

Cuando debería ser:
```
/(patrón1|patrón2|patrón3)+/
```

### Solución Actual: Construir separadamente o usar regex directo

```javascript
// WORKAROUND 1: Construir patrones separados
const phone1 = new PatternBuilder().find('(123)');
const phone2 = new PatternBuilder().find('123');
const phone3 = new PatternBuilder().find('+1');

// Luego combinar manualmente o usar regex directo

// WORKAROUND 2: Usar regex directo para casos complejos
const phoneRegex = /((123)|123|\+1)+/;
const isValid = phoneRegex.test(input);

// WORKAROUND 3: Usar alternativas más simples
const phonePattern = new PatternBuilder()
  .digit().exactly(3)
  .find('-')
  .digit().exactly(3)
  .find('-')
  .digit().exactly(4);

// Esto funciona bien porque no combina or() con cuantificadores
```

---

## 4. Tabla Comparativa: Cuando Usar PatternBuilder vs. Regex Directo

| Caso de Uso | PatternBuilder | Regex Directo | Recomendación |
|------------|-----------------|---------------|---------------|
| Validación simple (email) | ✅ Bueno | ❌ Complejo | **PatternBuilder** |
| Búsqueda entre delimitadores | ✅ Bueno | ❌ Verboso | **PatternBuilder** |
| Múltiples alternativas simples | ✅ Bueno | ❌ Confuso | **PatternBuilder** |
| Múltiples alternativas + cuantificadores | ❌ Limitado | ✅ Necesario | **Regex Directo** |
| Atomicidad en cuantificadores | ❌ Limitado | ✅ Necesario | **Regex Directo** |
| Escapes en cut() | ❌ Limitado | ✅ Necesario | **Regex Directo** |
| Lookahead/lookbehind | ❌ No soportado | ✅ Soportado | **Regex Directo** |

---

## 5. Guía de Decisión: ¿Usar PatternBuilder o Regex?

### Usa PatternBuilder cuando:
- ✅ Necesitas validar formatos simples (email, teléfono, URL)
- ✅ Necesitas extraer contenido entre delimitadores
- ✅ El patrón es lineal sin alternativas complejas
- ✅ Quieres código más legible

### Usa Regex Directo cuando:
- ✅ Necesitas múltiples alternativas con cuantificadores
- ✅ El contenido contiene delimitadores escapados
- ✅ Necesitas atomicidad completa en cuantificadores
- ✅ Requieres lookahead/lookbehind
- ✅ El patrón es altamente optimizado (performance crítica)

---

## 6. Patrones Recomendados vs. No Recomendados

### ✅ RECOMENDADOS (Funcionan bien)

```javascript
// Búsqueda simple
new PatternBuilder().find('hello');

// Validación con anclas
new PatternBuilder()
  .startOfLine()
  .word().oneOrMore()
  .endOfLine();

// Captura entre delimitadores
new PatternBuilder()
  .find('name=')
  .cut('"');

// Búsqueda con alternativas simples (sin cuantificadores después)
new PatternBuilder()
  .find('cat')
  .or('dog');

// Cuantificadores sobre tokens simples
new PatternBuilder()
  .digit().oneOrMore()
  .find('-')
  .digit().oneOrMore();
```

### ❌ NO RECOMENDADOS (Limitaciones conocidas)

```javascript
// EVITAR: maybe() con múltiples caracteres
new PatternBuilder()
  .find('cat').maybe();  // ⚠️ Genera /cat?/ no /(?:cat)?/

// EVITAR: or() con cuantificadores después
new PatternBuilder()
  .find('a').or('b').oneOrMore();  // ⚠️ Genera /a|b+/ no /(a|b)+/

// EVITAR: cut() con delimitadores que pueden estar escapados
new PatternBuilder()
  .cut('"');  // ⚠️ No maneja \"

// EVITAR: Patrones complejos que requieren precedencia específica
new PatternBuilder()
  .find('a').or('b')
  .maybe();  // ⚠️ Precedencia incorrecta
```

---

## Conclusión

PatternBuilder es excelente para **90% de casos de uso reales**, pero los desarrolladores deben:

1. ✅ Conocer las limitaciones documentadas
2. ✅ Usar patrones lineales y simples
3. ✅ Recurrir a regex directo para casos complejos
4. ✅ Usar métodos como `debug()` para verificar el patrón generado

La recomendación es: **"Comienza con PatternBuilder, pero no dudes en cambiar a regex directo si lo necesitas"**.
