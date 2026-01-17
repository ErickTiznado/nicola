/**
 * PatternBuilder.anchors.js - Grupo A: Anclas y Posición
 * Métodos: startOfLine(), endOfLine(), wordBoundary()
 */

export const AnchorsMixin = {
  /**
   * Añade ^ al inicio (inicio de línea)
   */
  startOfLine() {
    this.prefixes = '^';
    return this;
  },

  /**
   * Añade $ al final (final de línea)
   */
  endOfLine() {
    this.suffixes = '$';
    return this;
  },

  /**
   * Añade \b (límite de palabra)
   */
  wordBoundary() {
    this.source += '\\b';
    this.__lastToken = '\\b';
    return this;
  },
};
