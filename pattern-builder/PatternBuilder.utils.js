/**
 * PatternBuilder.utils.js - Métodos Privados Utilitarios
 * Funcionalidad base: escape, compilación, explicación
 */

/**
 * Escapa caracteres especiales de regex
 * Caracteres hostiles: [] () {} . * + ? ^ $ | \
 */
export function escape(texto) {
  return texto.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Escapa caracteres especiales para usar dentro de un character class
 */
/**
 * Escapa carácter para uso dentro de una clase de caracteres [...]
 * Maneja casos especiales: '-', ']', '\\'
 */
export function escapeCharClass(char) {
  if (char === '-') return '\\-';
  if (char === ']') return '\\]';
  if (char === '\\') return '\\\\';
  return char;
}

/**
 * Compila el regex final
 * Ensambla prefixes + source + suffixes + flags
 */
export function compile(builder) {
  const pattern = builder.prefixes + builder.source + builder.suffixes;
  const flagString = builder.flags.join('');
  return new RegExp(pattern, flagString);
}

/**
 * Genera explicación humanizada del patrón
 */
export function explainPattern(builder) {
  const regex = builder.toString();
  let explanation = '   ';

  if (builder.prefixes.includes('^')) {
    explanation += 'Inicio de línea, ';
  }

  if (builder.source.includes('\\d')) {
    explanation += 'dígitos ';
  }
  if (builder.source.includes('\\w')) {
    explanation += 'caracteres de palabra ';
  }
  if (builder.source.includes('\\s')) {
    explanation += 'espacios ';
  }
  if (builder.source.includes('[^')) {
    explanation += 'caracteres negados ';
  }
  if (builder.source.includes('|')) {
    explanation += 'alternativas (OR) ';
  }
  if (builder.source.includes('(')) {
    explanation += 'con captura ';
  }

  if (builder.suffixes.includes('$')) {
    explanation += ', al final de línea';
  }

  if (builder.flags.includes('g')) {
    explanation += ' [global: todas las coincidencias]';
  }
  if (builder.flags.includes('i')) {
    explanation += ' [insensible a mayúsculas]';
  }

  return explanation.trim() + '.';
}
