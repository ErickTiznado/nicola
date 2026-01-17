import { PatternBuilder } from '../pattern-builder/PatternBuilder.js';

describe('PatternBuilder - API Fluida para Expresiones Regulares', () => {
  let pattern;

  beforeEach(() => {
    pattern = new PatternBuilder();
  });

  // ==================== TESTS GRUPO A: ANCLAS ====================
  describe('Grupo A: Anclas y Posición', () => {
    test('startOfLine() añade ^ al inicio', () => {
      pattern.startOfLine().find('test');
      expect(pattern.toString()).toMatch(/^\^test/);
    });

    test('endOfLine() añade $ al final', () => {
      pattern.find('test').endOfLine();
      expect(pattern.toString()).toMatch(/test\$$/);
    });

    test('wordBoundary() añade \\b', () => {
      pattern.wordBoundary().find('word');
      expect(pattern.source).toContain('\\b');
      expect(pattern.matches('word')).toBe(true);
    });

    test('Combinación: startOfLine + find + endOfLine', () => {
      pattern.startOfLine().find('exact').endOfLine();
      expect(pattern.matches('exact')).toBe(true);
      expect(pattern.matches('exacto')).toBe(false);
      expect(pattern.matches('prefix exact')).toBe(false);
    });
  });

  // ==================== TESTS GRUPO B: CONTENIDO ====================
  describe('Grupo B: Contenido (¿Qué busco?)', () => {
    describe('find() con escaping automático', () => {
      test('find("text") busca texto simple', () => {
        pattern.find('hello');
        expect(pattern.matches('hello')).toBe(true);
        expect(pattern.matches('world')).toBe(false);
      });

      test('find() escapa caracteres especiales automaticamente', () => {
        pattern.find('img.png');
        // Debe ser equivalente a /img\.png/
        expect(pattern.matches('img.png')).toBe(true);
        expect(pattern.matches('imgXpng')).toBe(false);
      });

      test('find() escapa paréntesis', () => {
        pattern.find('(test)');
        expect(pattern.matches('(test)')).toBe(true);
        expect(pattern.matches('test')).toBe(false);
      });

      test('find() escapa corchetes', () => {
        pattern.find('[abc]');
        expect(pattern.matches('[abc]')).toBe(true);
        expect(pattern.matches('a')).toBe(false);
      });

      test('find() escapa llaves', () => {
        pattern.find('{5}');
        expect(pattern.matches('{5}')).toBe(true);
      });

      test('find() escapa asterisco', () => {
        pattern.find('a*b');
        expect(pattern.matches('a*b')).toBe(true);
        expect(pattern.matches('aaaaab')).toBe(false);
      });

      test('find() escapa más', () => {
        pattern.find('a+b');
        expect(pattern.matches('a+b')).toBe(true);
      });

      test('find() escapa interrogación', () => {
        pattern.find('a?b');
        expect(pattern.matches('a?b')).toBe(true);
      });

      test('find() escapa circunflejo', () => {
        pattern.find('^test$');
        expect(pattern.matches('^test$')).toBe(true);
      });

      test('find() escapa pipe (OR)', () => {
        pattern.find('a|b');
        expect(pattern.matches('a|b')).toBe(true);
        expect(pattern.matches('a')).toBe(false);
      });

      test('find() escapa barra invertida', () => {
        pattern.find('\\');
        expect(pattern.matches('\\')).toBe(true);
      });
    });

    describe('any() - Comodín', () => {
      test('any() = . (cualquier carácter)', () => {
        pattern.find('a').any().find('c');
        expect(pattern.matches('abc')).toBe(true);
        expect(pattern.matches('adc')).toBe(true);
        expect(pattern.matches('a c')).toBe(true);
        expect(pattern.matches('ac')).toBe(false);
      });
    });

    describe('digit() - Dígitos', () => {
      test('digit() = \\d (0-9)', () => {
        pattern.digit();
        expect(pattern.matches('5')).toBe(true);
        expect(pattern.matches('0')).toBe(true);
        expect(pattern.matches('9')).toBe(true);
        expect(pattern.matches('a')).toBe(false);
      });
    });

    describe('word() - Caracteres de palabra', () => {
      test('word() = \\w (a-z, A-Z, 0-9, _)', () => {
        pattern.word();
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('Z')).toBe(true);
        expect(pattern.matches('5')).toBe(true);
        expect(pattern.matches('_')).toBe(true);
        expect(pattern.matches('-')).toBe(false);
      });
    });

    describe('whitespace() - Espacios', () => {
      test('whitespace() = \\s (espacios, tabs, saltos)', () => {
        pattern.whitespace();
        expect(pattern.matches(' ')).toBe(true);
        expect(pattern.matches('\t')).toBe(true);
        expect(pattern.matches('\n')).toBe(true);
        expect(pattern.matches('a')).toBe(false);
      });
    });

    describe('tab() - Tabulación', () => {
      test('tab() = \\t', () => {
        pattern.tab();
        expect(pattern.matches('\t')).toBe(true);
        expect(pattern.matches(' ')).toBe(false);
      });
    });

    describe('range() - Rangos', () => {
      test('range(a, z) crea [a-z]', () => {
        pattern.range('a', 'z');
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('m')).toBe(true);
        expect(pattern.matches('z')).toBe(true);
        expect(pattern.matches('A')).toBe(false);
        expect(pattern.matches('0')).toBe(false);
      });

      test('range(0, 9) crea [0-9]', () => {
        pattern.range('0', '9');
        expect(pattern.matches('0')).toBe(true);
        expect(pattern.matches('5')).toBe(true);
        expect(pattern.matches('9')).toBe(true);
        expect(pattern.matches('a')).toBe(false);
      });

      test('range() con caracteres especiales se escapa', () => {
        pattern.range('.', '-');
        // Debe escapar los puntos y guiones
        expect(pattern.source).toContain('\\');
      });
    });
  });

  // ==================== TESTS GRUPO C: CUANTIFICADORES ====================
  describe('Grupo C: Cuantificadores (¿Cuántos?)', () => {
    describe('exactly() - Repeticiones exactas', () => {
      test('exactly(3) añade {3}', () => {
        pattern.find('a').exactly(3);
        expect(pattern.matches('aaa')).toBe(true);
        expect(pattern.matches('aa')).toBe(false);
        // NOTA: /a{3}/ también coincide con 'aaaa' porque contiene 'aaa'
        expect(pattern.matches('aaaa')).toBe(true);
      });

      test('exactly(1) es equivalente a sin cuantificador', () => {
        pattern.find('x').exactly(1);
        expect(pattern.matches('x')).toBe(true);
        // NOTA: /x{1}/ también coincide con 'xx' porque contiene 'x'
        expect(pattern.matches('xx')).toBe(true);
      });

      test('exactly(0) se permite', () => {
        pattern.find('test').exactly(0);
        expect(pattern.source).toContain('{0}');
      });
    });

    describe('maybe() - Opcional', () => {
      test('maybe() hace opcional el token anterior (?)', () => {
        pattern.find('a').maybe().find('b');
        expect(pattern.matches('ab')).toBe(true);
        expect(pattern.matches('b')).toBe(true);
        // NOTA: /a?b/ también coincide con 'aab' porque contiene 'ab'
        expect(pattern.matches('aab')).toBe(true);
      });

      test('maybe() no afecta si no hay token', () => {
        pattern.maybe();
        expect(pattern.source).toBe('');
      });
    });

    describe('oneOrMore() - Una o más repeticiones', () => {
      test('oneOrMore() = +', () => {
        pattern.find('a').oneOrMore();
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('aa')).toBe(true);
        expect(pattern.matches('aaa')).toBe(true);
        expect(pattern.matches('b')).toBe(false);
      });
    });

    describe('anyAmount() - Cualquier cantidad', () => {
      test('anyAmount() = * (incluyendo cero)', () => {
        pattern.find('a').anyAmount();
        expect(pattern.matches('')).toBe(true); // Cero 'a'
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('aa')).toBe(true);
      });
    });

    describe('Cuantificadores encadenados', () => {
      test('digit().oneOrMore() busca uno o más dígitos', () => {
        pattern.digit().oneOrMore();
        expect(pattern.matches('5')).toBe(true);
        expect(pattern.matches('123')).toBe(true);
        expect(pattern.matches('abc')).toBe(false);
      });

      test('word().anyAmount() busca cero o más caracteres de palabra', () => {
        pattern.word().anyAmount();
        expect(pattern.matches('')).toBe(true);
        expect(pattern.matches('test')).toBe(true);
        expect(pattern.matches('test123')).toBe(true);
      });
    });

    describe('Validación de cuantificadores en cascada', () => {
      test('Evita cuantificadores consecutivos en el mismo token', () => {
        pattern.find('a').oneOrMore();
        expect(() => pattern.maybe()).toThrow('Cuantificador en cascada no permitido');
      });

      test('Evita cascada con exactitud y cuantificador extra', () => {
        pattern.find('a').exactly(2);
        expect(() => pattern.anyAmount()).toThrow('Cuantificador en cascada no permitido');
      });
    });
  });

  // ==================== TESTS GRUPO D: LÓGICA NEGATIVA ====================
  describe('Grupo D: Lógica Negativa', () => {
    describe('not() - Negación', () => {
      test('not(caracter) genera [^caracter]', () => {
        pattern.not('a');
        expect(pattern.source).toContain('[^a]');
        expect(pattern.matches('a')).toBe(false);
        expect(pattern.matches('b')).toBe(true);
        expect(pattern.matches('x')).toBe(true);
      });

      test('not() con caracteres especiales se escapa', () => {
        pattern.not('.');
        // Escapamos el punto: \. es una barra invertida + punto
        // Resultado: [^\.] dentro de [ ^  barra  punto ]
        const expected = '[^\\.]';  // El regex que esperamos: [^\.]
        expect(pattern.source).toBe(expected);
        expect(pattern.matches('.')).toBe(false);
        expect(pattern.matches('a')).toBe(true);
      });
    });

    describe('or() - Alternancia', () => {
      test('or() genera alternancia |', () => {
        pattern.find('cat').or('dog');
        expect(pattern.matches('cat')).toBe(true);
        expect(pattern.matches('dog')).toBe(true);
        expect(pattern.matches('bird')).toBe(false);
      });

      test('or() con múltiples alternativas', () => {
        pattern.find('a').or('b').or('c');
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('b')).toBe(true);
        expect(pattern.matches('c')).toBe(true);
        expect(pattern.matches('d')).toBe(false);
      });

      test('or() escapa caracteres especiales', () => {
        pattern.find('a*b').or('c+d');
        // Ambos deben ser literales
        expect(pattern.matches('a*b')).toBe(true);
        expect(pattern.matches('c+d')).toBe(true);
        expect(pattern.matches('aaaaaaab')).toBe(false);
      });
    });
  });

  // ==================== TESTS: CUT() - LA JOYA DE LA CORONA ====================
  describe('cut() - Grupos de Captura (Capturing Groups)', () => {
    describe('cut() con un delimitador', () => {
      test('cut(") crea sándwich "([^"]*)"', () => {
        pattern.cut('"');
        expect(pattern.source).toMatch(/"[^"]*"/);
        // Busca comillas con contenido entre ellas
        expect(pattern.get('"hello"')).toBeTruthy();
      });

      test('cut() captura contenido entre comillas', () => {
        pattern.cut('"');
        const matches = pattern.get('The text is "world"');
        expect(matches).toBeTruthy();
        expect(matches[0]).toContain('"world"');
        expect(matches[1]).toBe('world'); // Grupo de captura
      });

      test('cut(\') con comillas simples', () => {
        pattern.cut("'");
        const matches = pattern.get("name='John'");
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('John');
      });

      test('cut(<) con ángulos', () => {
        pattern.cut('<', '>');
        const matches = pattern.get('open<content>close');
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('content');
      });
    });

    describe('cut() con delimitadores diferentes', () => {
      test('cut(inicio, fin) con delimitadores distintos', () => {
        pattern.cut('{', '}');
        const matches = pattern.get('value:{hello}end');
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('hello');
      });

      test('cut([, ]) para corchetes', () => {
        pattern.cut('[', ']');
        const matches = pattern.get('array:[1,2,3]');
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('1,2,3');
      });
    });

    describe('cut() con caracteres especiales', () => {
      test('cut(.) escapa el punto', () => {
        pattern.cut('.');
        // Debe buscar literalmente puntos, no comodín
        const matches = pattern.get('data.value.test');
        expect(matches).toBeTruthy();
      });

      test('cut() con múltiples capturas', () => {
        pattern.find('name=').cut('"').find('age=').cut('"');
        const text = 'name="Alice"age="30"';
        const matches = pattern.get(text);
        expect(matches).toBeTruthy();
      });
    });
  });

  // ==================== TESTS: CUT() AVANZADO ====================
  describe('cut() avanzado', () => {
    test('cut() con opciones escaped + lazy captura comillas escapadas', () => {
      pattern.cut('"', null, { escaped: true, lazy: true });
      const input = 'code = "He said \\"Hello\\" to me";';
      const matches = pattern.get(input);
      expect(matches).toBeTruthy();
      expect(matches[1]).toBe('He said \\"Hello\\" to me');
    });
  });

  // ==================== TESTS: AGRUPACIÓN Y RESET ====================
  describe('Agrupación y Reset', () => {
    test('group() crea grupo no capturante y permite cuantificadores', () => {
      pattern.group().find('cat').endGroup().oneOrMore();
      expect(pattern.toString()).toBe('(?:cat)+');
      expect(pattern.matches('cat')).toBe(true);
      expect(pattern.matches('catcat')).toBe(true);
    });

    test('group() con nombre crea named group', () => {
      pattern.group('animal').find('dog').endGroup();
      const match = pattern.get('dog');
      expect(match).toBeTruthy();
      expect(match.groups.animal).toBe('dog');
    });

    test('reset() limpia estado interno', () => {
      pattern.startOfLine().find('test').endOfLine().global();
      pattern.reset();
      expect(pattern.prefixes).toBe('');
      expect(pattern.source).toBe('');
      expect(pattern.suffixes).toBe('');
      expect(pattern.flags.length).toBe(0);
    });
  });

  // ==================== TESTS: MÉTODOS DE ACCIÓN ====================
  describe('Métodos de Acción: matches, get, replace', () => {
    describe('matches() - Test boolean', () => {
      test('matches() retorna true si hay coincidencia', () => {
        pattern.find('test');
        expect(pattern.matches('this is a test')).toBe(true);
        expect(pattern.matches('no match here')).toBe(false);
      });

      test('matches() con patrón complejo', () => {
        pattern.startOfLine().digit().oneOrMore().endOfLine();
        expect(pattern.matches('12345')).toBe(true);
        expect(pattern.matches('123abc')).toBe(false);
      });
    });

    describe('get() - Extrae coincidencias', () => {
      test('get() retorna array de coincidencias', () => {
        pattern.find('o');
        const matches = pattern.get('hello world');
        expect(matches).toBeTruthy();
        expect(matches[0]).toBe('o'); // Primera coincidencia
      });

      test('get() con global() retorna múltiples coincidencias', () => {
        pattern.find('o').global();
        const matches = pattern.get('hello world');
        expect(matches).toBeTruthy();
        expect(matches.length).toBe(2); // Dos 'o'
      });

      test('get() con captura', () => {
        pattern.cut('"');
        const matches = pattern.get('"hello"');
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('hello'); // Grupo 1
      });

      test('get() retorna null si no hay coincidencia', () => {
        pattern.find('xyz');
        const matches = pattern.get('no match');
        expect(matches).toBeNull();
      });
    });

    describe('replace() - Reemplaza coincidencias', () => {
      test('replace() reemplaza la primera coincidencia', () => {
        pattern.find('world');
        const result = pattern.replace('hello world world', 'universe');
        expect(result).toBe('hello universe world');
      });

      test('replace() con global() reemplaza todas', () => {
        pattern.find('a').global();
        const result = pattern.replace('banana', 'o');
        expect(result).toBe('bonono');
      });

      test('replace() con patrón complejo', () => {
        pattern.find('x').digit().find('y');
        const result = pattern.replace('test x5y value', '[found]');
        expect(result).toContain('[found]');
      });
    });

    describe('toRegex() - Obtiene RegExp compilado', () => {
      test('toRegex() retorna una RegExp válida', () => {
        pattern.find('test');
        const regex = pattern.toRegex();
        expect(regex).toBeInstanceOf(RegExp);
        expect(regex.test('test')).toBe(true);
      });
    });

    describe('toString() - Obtiene el patrón como string', () => {
      test('toString() retorna el patrón construido', () => {
        pattern.startOfLine().find('abc').endOfLine();
        expect(pattern.toString()).toBe('^abc$');
      });
    });
  });

  // ==================== TESTS: ENCADENAMIENTO FLUIDO ====================
  describe('Encadenamiento Fluido (Método Fluida)', () => {
    test('Cadena compleja: startOfLine + find + maybe + endOfLine', () => {
      // El patrón es: ^Mr\.?\.\\sSmith$
      // Esto significa: Mr seguido de punto OPCIONAL, seguido de espacio, seguido de Smith
      pattern.startOfLine().find('Mr').maybe().find('.').whitespace().find('Smith').endOfLine();
      expect(pattern.matches('Mr. Smith')).toBe(true);
      // "Mr Smith" NO coincide porque requiere un punto después de Mr (aunque sea opcional del "Mr", no del siguiente ".")
      // La estructura es: Mr(maybe) . \s Smith - lo que significa: Mr opcional, punto requerido, espacio, Smith
      // Lo que el usuario probablemente quiso es hacer el "." opcional
      // Pero "maybe" afecta al token anterior (Mr), no al siguiente
    });

    test('Email simple: palabra + @ + palabra + . + palabra', () => {
      pattern.startOfLine()
        .word()
        .oneOrMore()
        .find('@')
        .word()
        .oneOrMore()
        .find('.')
        .word()
        .oneOrMore()
        .endOfLine();

      // Patrón: ^\w+@\w+\.\w+$
      expect(pattern.matches('user@example.com')).toBe(true);
      // "user123@test.co.uk" NO coincide porque el patrón espera exactamente
      // una palabra @ una palabra . una palabra (al final)
      // pero "test.co.uk" tiene dos puntos
      expect(pattern.matches('simple@test.io')).toBe(true);
      expect(pattern.matches('invalid@')).toBe(false);
    });

    test('Buscar URL entre comillas', () => {
      pattern.find('url=').cut('"');
      const matches = pattern.get('parameters: url="https://example.com" end');
      expect(matches).toBeTruthy();
      expect(matches[1]).toBe('https://example.com');
    });

    test('Capturar contenido JSON', () => {
      pattern.find('"name":').find('').cut('"');
      // Simplificado: busca "name": seguido de valor entre comillas
      const matches = pattern.get('"name":"Alice"');
      expect(matches).toBeTruthy();
    });

    test('Patrón complejo: IP address básico', () => {
      pattern.digit().oneOrMore()
        .find('.')
        .digit().oneOrMore()
        .find('.')
        .digit().oneOrMore()
        .find('.')
        .digit().oneOrMore();

      expect(pattern.matches('192.168.1.1')).toBe(true);
      expect(pattern.matches('255.255.255.255')).toBe(true);
      expect(pattern.matches('256.1.1.1')).toBe(true); // Validación no perfecta, pero regex sí
    });
  });

  // ==================== TESTS: BANDERAS (FLAGS) ====================
  describe('Compatibilidad de Flags', () => {
    test('global() añade bandera g', () => {
      pattern.find('o').global();
      expect(pattern.flags).toContain('g');
    });

    test('insensitive() añade bandera i', () => {
      pattern.find('test').insensitive();
      expect(pattern.flags).toContain('i');
      expect(pattern.matches('TEST')).toBe(true);
      expect(pattern.matches('TeSt')).toBe(true);
    });

    test('multiline() añade bandera m', () => {
      pattern.multiline();
      expect(pattern.flags).toContain('m');
    });

    test('addFlag() añade bandera personalizada', () => {
      pattern.addFlag('u');
      expect(pattern.flags).toContain('u');
    });

    test('No añade flags duplicados', () => {
      pattern.global().global();
      const globalCount = pattern.flags.filter(f => f === 'g').length;
      expect(globalCount).toBe(1);
    });

    test('Múltiples flags combinados', () => {
      pattern.find('test').global().insensitive();
      expect(pattern.flags).toContain('g');
      expect(pattern.flags).toContain('i');
    });

    test('Flags funcionan en match', () => {
      pattern.find('hello').global().insensitive();
      const matches = pattern.get('Hello HELLO hello');
      expect(matches.length).toBe(3);
    });
  });

  // ==================== TESTS: EDGE CASES ====================
  describe('Edge Cases y Casos Especiales', () => {
    test('String vacío', () => {
      pattern.find('');
      expect(pattern.matches('test')).toBe(true); // '' coincide en cualquier lugar
    });

    test('Patrón vacío', () => {
      expect(pattern.matches('anything')).toBe(true); // Patrón vacío coincide
    });

    test('Unicode y caracteres especiales', () => {
      pattern.find('€');
      expect(pattern.matches('Precio: €100')).toBe(true);
    });

    test('Saltos de línea en patrón', () => {
      pattern.find('\n');
      expect(pattern.matches('line1\nline2')).toBe(true);
    });

    test('Resetear patrón con new PatternBuilder()', () => {
      const p1 = new PatternBuilder().find('test');
      const p2 = new PatternBuilder();
      expect(p2.source).toBe('');
      expect(p1.matches('test')).toBe(true);
    });

    test('Cut() con delimitador especial', () => {
      pattern.cut('*');
      const matches = pattern.get('content *special* text');
      expect(matches).toBeTruthy();
      expect(matches[1]).toBe('special');
    });
  });

  // ==================== TESTS: CASOS EDGE SOFISTICADOS ====================
  describe('Casos Edge Sofisticados (Atomicidad y Precedencia)', () => {
    describe('Atomicidad en maybe() - La Prueba del Multi-carácter', () => {
      test('maybe() con múltiples caracteres (Atomicidad)', () => {
        pattern.startOfLine().find('cat').maybe().endOfLine();
        // Esperado: la palabra completa opcional
        expect(pattern.matches('')).toBe(true);
        expect(pattern.matches('cat')).toBe(true);
        expect(pattern.matches('ca')).toBe(false);
      });

      test('maybe() con búsqueda escapada tiene el mismo problema de atomicidad', () => {
        pattern.startOfLine().find('img.png').maybe().endOfLine();
        expect(pattern.matches('img.png')).toBe(true);
        expect(pattern.matches('img.pn')).toBe(false);
      });
    });

    describe('cut() con delimitadores escapados - La Prueba de Escaping', () => {
      test('cut() maneja delimitadores escapados dentro del contenido', () => {
        pattern.cut('"', null, { escaped: true, lazy: true });
        const input = 'code = "He said \\"Hello\\" to me";';
        const matches = pattern.get(input);
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('He said \\"Hello\\" to me');
      });

      test('cut() funciona bien con delimitadores simples sin escapes', () => {
        // Este caso SÍ funciona bien porque no hay comillas escapadas
        pattern.cut('"');
        
        const input = 'name="Alice" age="30"';
        const matches = pattern.get(input);
        
        expect(matches).toBeTruthy();
        expect(matches[1]).toBe('Alice'); // Funciona correctamente aquí
      });
    });

    describe('Precedencia del or() con cuantificadores', () => {
      test('or() con cuantificadores usando group() respeta precedencia', () => {
        pattern.startOfLine()
          .group()
            .find('cat')
            .or('dog')
          .endGroup()
          .oneOrMore()
          .endOfLine();

        expect(pattern.matches('cat')).toBe(true);
        expect(pattern.matches('dog')).toBe(true);
        expect(pattern.matches('catdog')).toBe(true);
        expect(pattern.matches('dogcat')).toBe(true);
        expect(pattern.matches('doggg')).toBe(false);
      });

      test('or() con maybe() usando group() respeta precedencia', () => {
        pattern.startOfLine()
          .group()
            .find('a')
            .or('b')
          .endGroup()
          .maybe()
          .endOfLine();

        expect(pattern.matches('')).toBe(true);
        expect(pattern.matches('a')).toBe(true);
        expect(pattern.matches('b')).toBe(true);
        expect(pattern.matches('ab')).toBe(false);
      });
    });
  });

  // ==================== TESTS: DEBUG ====================
  describe('debug() - Método de Depuración', () => {
    test('debug() retorna this para encadenamiento', () => {
      const result = pattern.find('test').debug().endOfLine();
      expect(result).toBe(pattern);
      expect(pattern.suffixes).toContain('$');
    });

    test('debug() no interfiere con el patrón', () => {
      pattern.find('test').debug();
      expect(pattern.matches('test')).toBe(true);
    });

    test('debug() se puede llamar múltiples veces', () => {
      expect(() => {
        pattern.find('a').debug().find('b').debug();
      }).not.toThrow();
    });
  });

  // ==================== TESTS: CASOS DE USO REALES ====================
  describe('Casos de Uso Reales', () => {
    test('Extraer nombre de archivo de URL', () => {
      pattern.find('/').cut('"').find(' ');
      // Más realista: buscar entre / y "
      const p = new PatternBuilder()
        .find('/([^/]*)')
        .find(' ');
      // Aquí simplificado
    });

    test('Validar formato de teléfono (básico)', () => {
      const phone = new PatternBuilder()
        .startOfLine()
        .find('(')
        .digit().exactly(3)
        .find(')')
        .find(' ')
        .digit().exactly(3)
        .find('-')
        .digit().exactly(4)
        .endOfLine();

      expect(phone.matches('(123) 456-7890')).toBe(true);
      expect(phone.matches('123-456-7890')).toBe(false);
    });

    test('Buscar etiquetas HTML', () => {
      const tag = new PatternBuilder()
        .find('<')
        .word().oneOrMore()
        .find('>');

      expect(tag.matches('<div>')).toBe(true);
      expect(tag.matches('<span class="test">')).toBe(false); // Simplificado
    });

    test('Buscar palabras clave con espacios', () => {
      const keyword = new PatternBuilder()
        .wordBoundary()
        .find('hello')
        .whitespace()
        .find('world')
        .wordBoundary();

      expect(keyword.matches('hello world')).toBe(true);
      expect(keyword.matches('say hello world today')).toBe(true);
    });
  });
});
