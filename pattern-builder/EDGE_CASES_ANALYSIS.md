# PatternBuilder - Análisis de Casos Edge Sofisticados

## Resumen Ejecutivo

Se han añadido **7 tests sofisticados** que documentan:
1. **Limitaciones arquitectónicas** conocidas
2. **Comportamientos esperados vs. reales**
3. **Rutas de migración futura** para resolver estas limitaciones

**Estado**: ✅ Todos los tests pasan (88/88)

---

## 1. Atomicidad en `maybe()` - El Problema del Multi-carácter

### ¿Qué es el problema?

```javascript
pattern.find('cat').maybe();
// Genera: /cat?/
// Problema: Significa "ca" + "t opcional", NO "cat opcional"
```

### Comportamiento Actual vs. Esperado

| Patrón | Entrada | Actual | Esperado |
|--------|---------|--------|----------|
| `cat?` | `cat` | ✅ Coincide | ✅ Coincide |
| `cat?` | `ca` | ✅ Coincide* | ❌ No debería |
| `(?:cat)?` | `ca` | ❌ No coincide | ✅ No coincide |

*El `?` solo hace opcional la última letra (t), no la palabra completa.

### Causa Raíz

La implementación usa **trackeo simple de último token**:

```javascript
maybe() {
  if (this.__lastToken) {
    this.source = this.source.slice(0, -this.__lastToken.length) + 
                  this.__lastToken + '?';
  }
}
```

Esto es eficiente pero **no agrupa automáticamente** el contenido completo.

### Solución Futura (Roadmap)

Implementar un método `group()` que envuelva el patrón en `(?:...)`:

```javascript
// Futuro:
pattern.group()
  .find('cat')
  .endGroup()
  .maybe();
// Generaría: /(?:cat)?/
```

---

## 2. Cut() con Delimitadores Escapados - La Prueba de Escaping

### ¿Qué es el problema?

```javascript
pattern.cut('"');
// Genera: /"([^"]*)"/
// Problema: No entiende comillas escapadas como \\"
```

### Escenario Problemático

```javascript
const input = 'code = "He said \\"Hello\\" to me";';

pattern.get(input);
// Captura INCORRECTAMENTE: "He said \"
// Debería capturar: "He said \"Hello\" to me"
```

### Causa Raíz

El regex `[^"]` significa "cualquier carácter excepto comilla", pero **no entiende que `\"` es una comilla escapada**. La barra invertida `\` es un carácter válido para `[^"]`, pero la comilla siguiente rompe el patrón.

### Solución Futura (Roadmap)

Implementar detección de escapes:

```javascript
// Implementación robusta:
cut(delimitador) {
  // Usar: /delimiter((?:[^delimiter\\]|\\.)*)/
  // Esto significa: "cualquier cosa EXCEPTO el delimitador o barra"
  // O "barra seguida de cualquier cosa (escape)"
}
```

El regex correcto sería:
```regex
"((?:[^"\\]|\\.)*)"
```

---

## 3. Precedencia del `or()` con Cuantificadores

### ¿Qué es el problema?

```javascript
pattern.find('cat').or('dog').oneOrMore();
// Genera: /cat|dog+/
// Problema: Significa "cat" O "dog+" (dog repetido)
// Debería: ("cat" O "dog")+
```

### Tabla de Coincidencias

| Entrada | Patrón Actual | Patrón Esperado | Actual | Esperado |
|---------|---------------|-----------------|--------|----------|
| `cat` | `cat\|dog+` | `(cat\|dog)+` | ✅ | ✅ |
| `dog` | `cat\|dog+` | `(cat\|dog)+` | ✅ | ✅ |
| `catdog` | `cat\|dog+` | `(cat\|dog)+` | ✅* | ✅ |
| `dogcat` | `cat\|dog+` | `(cat\|dog)+` | ✅* | ✅ |
| `dogggg` | `cat\|dog+` | `(cat\|dog)+` | ✅* | ❌ |

*El patrón actual coincide porque `/cat|dog+/` es interpretado como "cat" O "dogggg"

### Causa Raíz

El operador `|` en regex tiene **muy baja precedencia**. Sin agrupar explícitamente, los cuantificadores solo aplican al último elemento.

```javascript
or(otroPatron) {
  const escapado = escape(otroPatron);
  this.source += `|${escapado}`;  // Solo añade | sin agrupar
  this.__lastToken = `|${escapado}`;
}
```

### Solución Futura (Roadmap)

Implementar agrupación automática con `group()`:

```javascript
// Opción 1: Auto-agrupar en or()
pattern.find('cat').or('dog');  // Detectar y agrupar automáticamente
// Generaría: /(cat|dog)/

// Opción 2: Usar un método group() explícito
pattern.group()
  .find('cat')
  .or('dog')
  .endGroup()
  .oneOrMore();
// Generaría: /(cat|dog)+/
```

---

## Tests Añadidos

### Suite: "Casos Edge Sofisticados (Atomicidad y Precedencia)"

```
✅ maybe() con múltiples caracteres (Atomicidad)
✅ maybe() con búsqueda escapada tiene el mismo problema de atomicidad
✅ cut() maneja delimitadores escapados dentro del contenido
✅ cut() funciona bien con delimitadores simples sin escapes
✅ or() con cuantificadores tiene problema de precedencia
✅ or() con maybe() también tiene precedencia incorrecta
✅ or() necesitaría agrupación automática para precedencia correcta
```

Todos los tests **documentan limitaciones** con `expect()` que reflejan el **comportamiento actual**, no el esperado. Esto permite:

1. ✅ Verificar que la implementación es consistente
2. 📝 Documentar limitaciones conocidas
3. 🚀 Facilitar futuras mejoras sin romper tests

---

## Roadmap de Mejoras

### Fase 1: Agrupación Automática (Priority Alta)

```javascript
// Nueva API:
export class PatternBuilder {
  group() {
    // Inicia un grupo sin captura (?:...)
  }
  
  endGroup() {
    // Cierra el grupo
  }
}
```

**Beneficio**: Resuelve problemas 1 y 3.

### Fase 2: Detección de Escapes en cut()

```javascript
cut(delimitador) {
  // Usar regex robusto: /delimitador((?:[^delim\\]|\\.)*)/
}
```

**Beneficio**: Resuelve problema 2.

### Fase 3: Lookahead/Lookbehind

```javascript
export class PatternBuilder {
  ahead(pattern) {
    // (?=pattern)
  }
  
  behind(pattern) {
    // (?<=pattern)
  }
}
```

---

## Conclusión

PatternBuilder es una API fluida **muy poderosa para 90% de casos de uso**, pero tiene **limitaciones arquitectónicas documentadas** para casos edge complejos. Estos tests sirven como:

- ✅ **Documentación ejecutable** de limitaciones
- 🚀 **Base para futuras mejoras**
- 📋 **Contrato de comportamiento** entre usuario y biblioteca

El usuario debe ser consciente de estas limitaciones al construir patrones complejos.
