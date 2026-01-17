/**
 * PatternBuilder.quantifiers.js - Grupo C: Cuantificadores
 * Métodos: exactly(), maybe(), oneOrMore(), anyAmount()
 * Implementación: Opción A - Trackeo de último token
 */

export const QuantifiersMixin = {
  /**
   * Valida que no haya cuantificadores en cascada
   */
  __validateQuantifier() {
    if (!this.__lastToken) {
      return false;
    }

    const hasQuantifier = /(\?|\+|\*|\{\d+(,\d*)?\})$/.test(this.__lastToken);
    if (hasQuantifier) {
      throw new Error('Cuantificador en cascada no permitido');
    }

    return true;
  },

  /**
   * Envuelve el último token si es compuesto para mantener atomicidad
   */
  __wrapTokenForQuantifier(token) {
    if (!token) {
      return token;
    }

    if (token.startsWith('(') || token.startsWith('[') || token.startsWith('|')) {
      return token;
    }

    if (token.startsWith('\\') && token.length === 2) {
      return token; // \\d, \\w, \\s, \\t, etc.
    }

    if (token.length === 1) {
      return token;
    }

    return `(?:${token})`;
  },

  /**
   * Repite lo anterior exactamente n veces {n}
   */
  exactly(n) {
    if (this.__validateQuantifier()) {
      const baseToken = this.__wrapTokenForQuantifier(this.__lastToken);
      if (baseToken !== this.__lastToken) {
        this.source = this.source.slice(0, -this.__lastToken.length) + baseToken;
        this.__lastToken = baseToken;
      }
      this.source = this.source.slice(0, -this.__lastToken.length) + 
                    this.__lastToken + `{${n}}`;
      this.__lastToken += `{${n}}`;
    }
    return this;
  },

  /**
   * Hace que lo anterior sea opcional ?
   */
  maybe() {
    if (this.__validateQuantifier()) {
      const baseToken = this.__wrapTokenForQuantifier(this.__lastToken);
      if (baseToken !== this.__lastToken) {
        this.source = this.source.slice(0, -this.__lastToken.length) + baseToken;
        this.__lastToken = baseToken;
      }
      this.source = this.source.slice(0, -this.__lastToken.length) + 
                    this.__lastToken + '?';
      this.__lastToken += '?';
    }
    return this;
  },

  /**
   * Una o más repeticiones +
   */
  oneOrMore() {
    if (this.__validateQuantifier()) {
      const baseToken = this.__wrapTokenForQuantifier(this.__lastToken);
      if (baseToken !== this.__lastToken) {
        this.source = this.source.slice(0, -this.__lastToken.length) + baseToken;
        this.__lastToken = baseToken;
      }
      this.source = this.source.slice(0, -this.__lastToken.length) + 
                    this.__lastToken + '+';
      this.__lastToken += '+';
    }
    return this;
  },

  /**
   * Cualquier cantidad (incluyendo cero) *
   */
  anyAmount() {
    if (this.__validateQuantifier()) {
      const baseToken = this.__wrapTokenForQuantifier(this.__lastToken);
      if (baseToken !== this.__lastToken) {
        this.source = this.source.slice(0, -this.__lastToken.length) + baseToken;
        this.__lastToken = baseToken;
      }
      this.source = this.source.slice(0, -this.__lastToken.length) + 
                    this.__lastToken + '*';
      this.__lastToken += '*';
    }
    return this;
  },
};
