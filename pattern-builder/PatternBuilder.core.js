/**
 * PatternBuilder.core.js - Clase Base
 * Estructura de datos interna
 */

/**
 * Clase base que define la estructura de datos
 */
export class PatternBuilderCore {
  constructor() {
    // Estructura de datos: Las cuatro propiedades clave
    this.prefixes = '';        // Inicio del patrón (ej. ^)
    this.source = '';          // Cuerpo del patrón
    this.suffixes = '';        // Final del patrón (ej. $)
    this.flags = [];           // Array para banderas (g, i, m, s, etc)
    this.__lastToken = '';     // Trackea el último token agregado (Opción A)
    this.__groupStack = [];    // Stack de grupos abiertos (para group/endGroup)
  }

  /**
   * Resetea el patrón y limpia el estado interno
   */
  reset() {
    this.prefixes = '';
    this.source = '';
    this.suffixes = '';
    this.flags = [];
    this.__lastToken = '';
    this.__groupStack = [];
    return this;
  }
}
