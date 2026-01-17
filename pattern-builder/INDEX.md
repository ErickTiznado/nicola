# PatternBuilder - Índice de Documentación

> Una API fluida y humanizada para construir expresiones regulares en JavaScript sin escribir sintaxis regex cruda.

---

## 📖 Documentación Disponible

### 🚀 **Para Empezar Rápido**
- **[QUICKSTART.md](QUICKSTART.md)** ← Empieza aquí
  - 30 ejemplos de segundo
  - Patrones comunes listos para copiar
  - Tips & tricks

### 📚 **Documentación Completa**
- **[PatternBuilder.README.md](PatternBuilder.README.md)**
  - Guía de uso completa
  - Referencia API detallada (todos los 25+ métodos)
  - Casos de uso reales
  - Arquitectura interna

### 💻 **Ejemplos de Código**
- **[PatternBuilder.examples.js](PatternBuilder.examples.js)**
  - 20 ejemplos prácticos ejecutables
  - Desde básico hasta avanzado
  - Puedes correr: `node utils/PatternBuilder.examples.js`

### 🔌 **Ejemplos de Integración**
- **[PatternBuilder.integration.js](PatternBuilder.integration.js)**
  - 8 clases con patrones de integración real
  - Middleware de validación
  - Extractores de datos
  - Parsers y scrappers
  - Data cleaners

### 🧪 **Tests**
- **[../../test/PatternBuilder.test.js](../../test/PatternBuilder.test.js)**
  - 81 tests (100% pasando)
  - Puedes correr: `npm test -- test/PatternBuilder.test.js`
  - Cobertura completa de todas las funcionalidades

### 📋 **Resumen de Implementación**
- **[../../IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md)**
  - Qué se implementó
  - Estadísticas
  - Roadmap futuro

---

## 🎯 Elegir tu Ruta de Aprendizaje

### Soy nuevo y quiero aprender rápido ⚡
1. Lee [QUICKSTART.md](QUICKSTART.md) (5 min)
2. Copia un ejemplo que te guste
3. Modifica y experimenta
4. Si necesitas más, lee la API completa

### Quiero una referencia completa 📖
1. Lee [PatternBuilder.README.md](PatternBuilder.README.md)
2. Busca el método que necesitas
3. Copia el ejemplo
4. Ejecuta `node utils/PatternBuilder.examples.js` para ver en acción

### Necesito casos de integración real 🔌
1. Abre [PatternBuilder.integration.js](PatternBuilder.integration.js)
2. Encuentra la clase que se adapte a tu caso
3. Cópiala y personaliza
4. Usa en tu aplicación

### Soy escéptico y quiero ver tests 🧪
1. Abre [test/PatternBuilder.test.js](test/PatternBuilder.test.js)
2. Busca el test que corresponda a tu caso
3. Aprende cómo se prueba
4. Ejecuta: `npm test -- test/PatternBuilder.test.js`

---

## 🗺️ Mapa de API Rápido

### Anclas (¿Dónde?)
```javascript
.startOfLine()    // Inicio ^
.endOfLine()      // Final $
.wordBoundary()   // Límite de palabra \b
```

### Contenido (¿Qué?)
```javascript
.find(text)       // Busca literal (auto-escapa)
.digit()          // Dígitos \d
.word()           // Palabra \w
.whitespace()     // Espacio \s
.tab()            // Tab \t
.any()            // Cualquier char .
.range(a, z)      // Rango [a-z]
```

### Cuantificadores (¿Cuántos?)
```javascript
.exactly(n)       // Exactamente n {n}
.maybe()          // Cero o uno ?
.oneOrMore()      // Uno o más +
.anyAmount()      // Cero o más *
```

### Lógica (¿Lógica?)
```javascript
.not(char)        // Negación [^char]
.or(pattern)      // Alternancia |
```

### Captura (¿Extraer?)
```javascript
.cut(delim)       // Captura automática
.cut(open, close) // Delimitadores diferentes
```

### Métodos de Acción (¿Ejecutar?)
```javascript
.matches(str)     // ¿Coincide? → boolean
.get(str)         // Extrae → Array | null
.replace(str, v)  // Reemplaza → string
.toRegex()        // Obtiene RegExp → RegExp
.toString()       // Obtiene patrón → string
```

### Banderas (¿Comportamiento?)
```javascript
.global()         // Todas las coincidencias g
.insensitive()    // Sin importar mayúsculas i
.multiline()      // Multiline m
.addFlag(f)       // Personalizado
```

### Debug (¿Entender?)
```javascript
.debug()          // Imprime regex + explicación
```

---

## ⚡ Ejemplos Ultra-Rápidos

### Validar Email
```javascript
new PatternBuilder()
  .startOfLine()
  .word().oneOrMore().find('@').word().oneOrMore().find('.').word().oneOrMore()
  .endOfLine()
  .matches('user@example.com')  // true
```

### Extraer entre comillas
```javascript
new PatternBuilder()
  .cut('"')
  .get('text="hello"')[1]  // "hello"
```

### Buscar números
```javascript
new PatternBuilder()
  .digit().oneOrMore()
  .global()
  .get('Price: $10, Total: $50')  // ['10', '50']
```

### Case-insensitive
```javascript
new PatternBuilder()
  .find('hello')
  .insensitive()
  .matches('HELLO')  // true
```

### Alternancia (OR)
```javascript
new PatternBuilder()
  .find('cat').or('dog').or('bird')
  .matches('I have a cat')  // true
```

---

## 📊 Estadísticas del Módulo

- **Métodos Públicos:** 25+
- **Tests:** 81 (100% pasando)
- **Tiempo de compilación:** <1 segundo
- **Ejemplos:** 20 básicos + 8 avanzados
- **Documentación:** 6 archivos

---

## 🤔 Preguntas Frecuentes

### ¿Qué diferencia hay con regex nativo?
**PatternBuilder** = Legible, mantenible, seguro (auto-escaping)
**Regex Nativo** = Compacto, pero criptográfico

### ¿Es más lento?
No, la compilación es instantánea. El rendimiento al ejecutar es idéntico al regex nativo.

### ¿Puedo usar lookahead/lookbehind?
No aún, pero está en el roadmap. Puedes usar regex nativo combinado:
```javascript
pattern.toRegex().test(str)  // Acceso a RegExp nativa
```

### ¿Dónde reporto bugs?
Este es un módulo de nicola-framework. Reporta en el repositorio principal.

---

## 🎓 Conceptos Clave

### 1. **Encadenamiento Fluido**
Todos los métodos retornan `this`, permitiendo cadenas indefinidas:
```javascript
pattern
  .startOfLine()
  .word().oneOrMore()
  .find('@')
  .word().oneOrMore()
  .endOfLine()
  .global()
  .insensitive()
```

### 2. **Escaping Automático**
No escribas `\`, PatternBuilder lo maneja:
```javascript
.find('img.png')  // ✅ Genera /img\.png/
.find('[test]')   // ✅ Genera /\[test\]/
```

### 3. **Captura Automática (cut)**
Genera paréntesis de captura automáticamente:
```javascript
.cut('"')  // Genera /"([^"]*)"/
.get(str)[1]  // Accede al contenido capturado
```

### 4. **Opción A - Cuantificadores**
Usan trackeo de último token en lugar de re-parsing:
- ✅ Más rápido
- ✅ Más limpio
- ✅ Menos errores

---

## 🚀 Próximos Pasos

### Principiante
1. Lee [QUICKSTART.md](QUICKSTART.md)
2. Copia un ejemplo
3. Ejecuta `node utils/PatternBuilder.examples.js`
4. Experimenta modificando los ejemplos

### Intermedio
1. Lee [PatternBuilder.README.md](PatternBuilder.README.md)
2. Aprende todos los métodos
3. Mira [PatternBuilder.integration.js](PatternBuilder.integration.js)
4. Implementa un caso en tu app

### Avanzado
1. Revisa [test/PatternBuilder.test.js](test/PatternBuilder.test.js)
2. Contribuye mejoras o casos de uso
3. Propone nuevas features
4. Consulta [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) para arquitectura

---

## 📄 Resumen de Archivos

| Archivo | Propósito | Para Quién |
|---------|-----------|-----------|
| QUICKSTART.md | Empezar rápido | Todos |
| PatternBuilder.README.md | Referencia completa | Desarrolladores |
| PatternBuilder.examples.js | 20 ejemplos ejecutables | Aprendices |
| PatternBuilder.integration.js | Patrones de integración | Arquitectos |
| test/PatternBuilder.test.js | Tests y validación | QA/Testing |
| IMPLEMENTATION_SUMMARY.md | Qué se implementó | Gerentes/Leads |
| INDEX.md (este archivo) | Navegar documentación | Todos |

---

## 💬 Contribuciones

Si encuentras un error, tienes una idea o quieres añadir un ejemplo:
1. Abre una issue con detalles
2. Proporciona un test que demuestre el caso
3. Incluye un ejemplo del uso deseado

---

**¡Felicidades por usar PatternBuilder!** 🎉

*Creado para hacer regex accesible a todos.*

---

**Última actualización:** 16 de Enero, 2026  
**Framework:** nicola-framework v1.0.5  
**Versión:** 1.0.0
