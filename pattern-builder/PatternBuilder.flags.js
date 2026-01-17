/**
 * PatternBuilder.flags.js - Compatibilidad de Flags
 * Métodos: global(), insensitive(), multiline(), addFlag()
 */

export const FlagsMixin = {
  /**
   * Añade la bandera global (g)
   */
  global() {
    if (!this.flags.includes('g')) {
      this.flags.push('g');
    }
    return this;
  },

  /**
   * Añade la bandera insensible a mayúsculas (i)
   */
  insensitive() {
    if (!this.flags.includes('i')) {
      this.flags.push('i');
    }
    return this;
  },

  /**
   * Añade la bandera multiline (m)
   */
  multiline() {
    if (!this.flags.includes('m')) {
      this.flags.push('m');
    }
    return this;
  },

  /**
   * Añade bandera personalizada
   */
  addFlag(flag) {
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
    return this;
  },
};
