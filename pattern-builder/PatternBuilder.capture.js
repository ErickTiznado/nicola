/**
 * PatternBuilder.capture.js - La Joya de la Corona: cut()
 * Método: cut() para grupos de captura automáticos
 */

import { escape, escapeCharClass } from './PatternBuilder.utils.js';

export const CaptureMixin = {
  /**
   * CRÍTICO: cut() para Grupos de Captura
   * 
   * Lógica interna:
   * - Pan de arriba: delimitador escapado
   * - La Carne (Captura): paréntesis (
   * - El Relleno: cualquier cosa que NO sea el delimitador [^delimitador]*
   * - Cierre: paréntesis )
   * - Pan de abajo: delimitador escapado
   * 
   * Ejemplo: .cut('"') → "([^"]*)"
   */
  cut(delimitador, delimitadorFinal = null, options = {}) {
    const { lazy = false, escaped = false } = options;
    const delim1 = escape(delimitador);
    const delim2 = escape(delimitadorFinal || delimitador);
    const delimClass = escapeCharClass(delimitadorFinal || delimitador);

    const quantifier = lazy ? '*?' : '*';
    // Cuando escaped=true, permitimos caracteres escapados dentro del contenido:
    // (?:[^delimClass]|\\.)*  → cualquier cosa que NO sea el delimitador
    //                           o secuencias escapadas (barra + cualquier carácter)
    // Nota: Para que el patrón final contenga \\ en la RegExp, en string JS usamos \\\\.
    const inner = escaped
      ? `(?:\\\\.|[^${delimClass}])${quantifier}`
      : `[^${delimClass}]${quantifier}`;

    const closing = escaped ? `(?<!\\\\)${delim2}` : delim2;
    const captura = `${delim1}(${inner})${closing}`;
    this.source += captura;
    this.__lastToken = captura;
    return this;
  },
};
