/**
 * PatternBuilder.content.js - Grupo B: Contenido
 * Métodos: find(), any(), digit(), word(), whitespace(), tab(), range()
 */

import { escape } from './PatternBuilder.utils.js';

export const ContentMixin = {
  /**
   * CRÍTICO: find() con lógica de escaping automático
   */
  find(texto) {
    const escapado = escape(texto);
    this.source += escapado;
    this.__lastToken = escapado;
    return this;
  },

  /**
   * Comodín: Cualquier carácter (el punto .)
   */
  any() {
    this.source += '.';
    this.__lastToken = '.';
    return this;
  },

  /**
   * Alias para \d: Cualquier dígito (0-9)
   */
  digit() {
    this.source += '\\d';
    this.__lastToken = '\\d';
    return this;
  },

  /**
   * Alias para \w: Cualquier carácter de palabra
   */
  word() {
    this.source += '\\w';
    this.__lastToken = '\\w';
    return this;
  },

  /**
   * Alias para \s: Cualquier espacio en blanco
   */
  whitespace() {
    this.source += '\\s';
    this.__lastToken = '\\s';
    return this;
  },

  /**
   * Alias para \t: Tabulación
   */
  tab() {
    this.source += '\\t';
    this.__lastToken = '\\t';
    return this;
  },

  /**
   * Crea un rango de caracteres [a-z]
   */
  range(inicio, fin) {
    const escapadoInicio = escape(inicio);
    const escapadoFin = escape(fin);
    const rango = `[${escapadoInicio}-${escapadoFin}]`;
    this.source += rango;
    this.__lastToken = rango;
    return this;
  },
};
