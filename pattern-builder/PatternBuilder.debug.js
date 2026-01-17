/**
 * PatternBuilder.debug.js - Debug Avanzado
 * Método: debug() con explicación humanizada
 */

import { compile, explainPattern } from './PatternBuilder.utils.js';

export const DebugMixin = {
  /**
   * Debug: Imprime el regex generado + explicación humanizada
   * Nivel DX Dios: Ayuda al desarrollador a entender qué está buscando
   */
  debug() {
    const regex = compile(this);
    const flagsString = this.flags.length > 0 ? this.flags.join('') : 'sin flags';

    console.log('\n' + '='.repeat(60));
    console.log('🔍 NICOLA PATTERN BUILDER - DEBUG');
    console.log('='.repeat(60));
    console.log(`\n📋 Componentes internos:`);
    console.log(`   prefixes: "${this.prefixes}"`);
    console.log(`   source:   "${this.source}"`);
    console.log(`   suffixes: "${this.suffixes}"`);
    console.log(`   flags:    [${flagsString}]`);

    console.log(`\n🎯 Regex Generado:`);
    console.log(`   ${regex}`);

    console.log(`\n💡 Explicación Humanizada:`);
    console.log(explainPattern(this));

    console.log('\n' + '='.repeat(60) + '\n');
    return this;
  },
};
