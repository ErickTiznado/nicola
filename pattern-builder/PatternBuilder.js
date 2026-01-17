/**
 * PatternBuilder.js - API Fluida para Expresiones Regulares (Facade)
 * 
 * Transforma sintaxis cruda de regex en un lenguaje humano y accesible
 * Usa un patrón Facade que unifica todos los módulos mediante mixins
 * 
 * ARQUITECTURA MODULAR:
 * - PatternBuilder.core.js: Clase base con estructura de datos
 * - PatternBuilder.anchors.js: Grupo A (startOfLine, endOfLine, wordBoundary)
 * - PatternBuilder.content.js: Grupo B (find, digit, word, whitespace, etc)
 * - PatternBuilder.quantifiers.js: Grupo C (exactly, maybe, oneOrMore, anyAmount)
 * - PatternBuilder.logic.js: Grupo D (not, or)
 * - PatternBuilder.capture.js: cut() para captura automática
 * - PatternBuilder.actions.js: Métodos de acción (matches, get, replace)
 * - PatternBuilder.flags.js: Banderas (global, insensitive, etc)
 * - PatternBuilder.debug.js: debug() humanizado
 * - PatternBuilder.utils.js: Funciones privadas (__escape, __compile, __explainPattern)
 */

import { PatternBuilderCore } from './PatternBuilder.core.js';
import { AnchorsMixin } from './PatternBuilder.anchors.js';
import { ContentMixin } from './PatternBuilder.content.js';
import { QuantifiersMixin } from './PatternBuilder.quantifiers.js';
import { LogicMixin } from './PatternBuilder.logic.js';
import { CaptureMixin } from './PatternBuilder.capture.js';
import { ActionsMixin } from './PatternBuilder.actions.js';
import { FlagsMixin } from './PatternBuilder.flags.js';
import { DebugMixin } from './PatternBuilder.debug.js';

/**
 * PatternBuilder - Clase Facade
 * Unifica todos los módulos en una sola clase cohesiva mediante mixins
 */
export class PatternBuilder extends PatternBuilderCore {
  constructor() {
    super();
    
    // Aplicar todos los mixins
    Object.assign(this, AnchorsMixin);
    Object.assign(this, ContentMixin);
    Object.assign(this, QuantifiersMixin);
    Object.assign(this, LogicMixin);
    Object.assign(this, CaptureMixin);
    Object.assign(this, ActionsMixin);
    Object.assign(this, FlagsMixin);
    Object.assign(this, DebugMixin);
  }
}

// Exportar por defecto para importaciones directas
export default PatternBuilder;

