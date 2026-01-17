/**
 * PatternBuilder.logic.js - Grupo D: Lógica Negativa
 * Métodos: not(), or()
 */

import { escape } from './PatternBuilder.utils.js';

export const LogicMixin = {
  /**
   * Agrupa patrones (no capturante por defecto)
   * @param {string|null} name - Nombre del grupo (named group)
   * @param {object} options - { capture: boolean }
   */
  group(name = null, options = {}) {
    const { capture = false } = options;
    let opener = '(?:';

    if (name) {
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        throw new Error('Nombre de grupo inválido');
      }
      opener = `(?<${name}>`;
    } else if (capture) {
      opener = '(';
    }

    const startIndex = this.source.length;
    this.source += opener;
    this.__groupStack = this.__groupStack || [];
    this.__groupStack.push(startIndex);
    this.__lastToken = opener;
    return this;
  },

  /**
   * Cierra un grupo previamente abierto
   */
  endGroup() {
    if (!this.__groupStack || this.__groupStack.length === 0) {
      throw new Error('No hay grupo abierto para cerrar');
    }

    this.source += ')';
    const startIndex = this.__groupStack.pop();
    this.__lastToken = this.source.slice(startIndex);
    return this;
  },

  /**
   * Niega un carácter o clase [^caracter]
   */
  not(caracter) {
    const escapado = escape(caracter);
    const negacion = `[^${escapado}]`;
    this.source += negacion;
    this.__lastToken = negacion;
    return this;
  },

  /**
   * Alternancia con OR |
   */
  or(otroPatron) {
    const escapado = escape(otroPatron);
    this.source += `|${escapado}`;
    this.__lastToken = `|${escapado}`;
    return this;
  },
};
