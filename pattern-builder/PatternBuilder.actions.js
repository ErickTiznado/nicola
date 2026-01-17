/**
 * PatternBuilder.actions.js - Métodos de Acción
 * Métodos: matches(), get(), replace(), toRegex(), toString()
 */

import { compile } from './PatternBuilder.utils.js';

export const ActionsMixin = {
  /**
   * Test: ¿Coincide la cadena con el patrón?
   */
  matches(cadena) {
    return compile(this).test(cadena);
  },

  /**
   * Get: Extrae todas las coincidencias
   */
  get(cadena) {
    const regex = compile(this);
    return cadena.match(regex);
  },

  /**
   * Replace: Reemplaza coincidencias con un nuevo valor
   */
  replace(cadena, nuevoValor) {
    const regex = compile(this);
    return cadena.replace(regex, nuevoValor);
  },

  /**
   * Obtiene el regex compilado
   */
  toRegex() {
    return compile(this);
  },

  /**
   * Obtiene el patrón como string
   */
  toString() {
    return this.prefixes + this.source + this.suffixes;
  },
};
