/**
 * PatternBuilder Integration Examples
 * Ejemplos de cómo usar PatternBuilder en una aplicación Nicola/Express
 */

import { PatternBuilder } from '../index.js';

// ==================== EJEMPLO 1: MIDDLEWARE DE VALIDACIÓN ====================

/**
 * Middleware para validar email en request body
 */
const validateEmailMiddleware = (req, res, next) => {
  const emailPattern = new PatternBuilder()
    .startOfLine()
    .word().oneOrMore()
    .find('@')
    .word().oneOrMore()
    .find('.')
    .word().oneOrMore()
    .endOfLine();

  if (req.body && req.body.email && emailPattern.matches(req.body.email)) {
    next();
  } else {
    res.status(400).json({ error: 'Invalid email format' });
  }
};

// ==================== EJEMPLO 2: EXTRACTOR DE DATOS ====================

/**
 * Extrae valores de atributos JSON
 */
class JSONExtractor {
  constructor(fieldName) {
    this.fieldName = fieldName;
    this.pattern = new PatternBuilder()
      .find(`"${fieldName}":`)
      .whitespace().anyAmount()
      .cut('"');
  }

  extract(jsonString) {
    const match = this.pattern.get(jsonString);
    return match ? match[1] : null;
  }
}

// Uso:
const emailExtractor = new JSONExtractor('email');
const json = '{"name":"Alice","email":"alice@example.com","age":30}';
const email = emailExtractor.extract(json);  // "alice@example.com"

// ==================== EJEMPLO 3: VALIDADOR COMBINADO ====================

/**
 * Validador que combina múltiples patrones
 */
class FormValidator {
  constructor() {
    this.validators = {
      email: new PatternBuilder()
        .startOfLine()
        .word().oneOrMore()
        .find('@')
        .word().oneOrMore()
        .find('.')
        .word().oneOrMore()
        .endOfLine(),

      phone: new PatternBuilder()
        .startOfLine()
        .find('(')
        .digit().exactly(3)
        .find(')')
        .whitespace()
        .digit().exactly(3)
        .find('-')
        .digit().exactly(4)
        .endOfLine(),

      url: new PatternBuilder()
        .startOfLine()
        .find('http')
        .maybe()
        .find('s')
        .maybe()
        .find('://')
        .word().anyAmount()
        .find('.')
        .word().oneOrMore()
        .endOfLine(),

      zipcode: new PatternBuilder()
        .startOfLine()
        .digit().exactly(5)
        .endOfLine(),
    };
  }

  validate(field, value) {
    if (!this.validators[field]) {
      return { valid: false, error: `Unknown field: ${field}` };
    }

    const isValid = this.validators[field].matches(value);
    return {
      valid: isValid,
      error: isValid ? null : `Invalid ${field} format`,
    };
  }

  validateForm(formData) {
    const errors = {};
    let isValid = true;

    for (const [field, value] of Object.entries(formData)) {
      const result = this.validate(field, value);
      if (!result.valid) {
        errors[field] = result.error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

// Uso:
const validator = new FormValidator();
const formData = {
  email: 'user@example.com',
  phone: '(123) 456-7890',
  url: 'https://example.com',
  zipcode: '12345',
};
const validation = validator.validateForm(formData);
console.log('Form Validation:', validation);
// { isValid: true, errors: {} }

// ==================== EJEMPLO 4: PARSER DE LOGS ====================

/**
 * Parser de logs con patrones específicos
 */
class LogParser {
  constructor() {
    // Patrón: [TIMESTAMP] [LEVEL] MESSAGE
    this.logPattern = new PatternBuilder()
      .find('[')
      .cut(']')  // timestamp
      .whitespace()
      .find('[')
      .cut(']')  // level
      .whitespace()
      .anyAmount();  // message
  }

  parseLog(logLine) {
    // Ejemplo simplificado
    const timestampMatch = new PatternBuilder().find('[').cut(']').get(logLine);
    const levelMatch = new PatternBuilder()
      .find('[')
      .cut(']')
      .get(logLine.substring(timestampMatch ? timestampMatch[0].length : 0));

    return {
      timestamp: timestampMatch ? timestampMatch[1] : null,
      level: levelMatch ? levelMatch[1] : null,
      message: logLine,
    };
  }

  filterByLevel(logs, level) {
    const levelPattern = new PatternBuilder()
      .find(`[${level}]`);

    return logs.filter(log => levelPattern.matches(log));
  }
}

// Uso:
const parser = new LogParser();
const logs = [
  '[2024-01-16 10:30:45] [INFO] Application started',
  '[2024-01-16 10:30:46] [ERROR] Database connection failed',
  '[2024-01-16 10:30:47] [INFO] Retrying connection',
];
const errorLogs = parser.filterByLevel(logs, 'ERROR');
console.log('Error Logs:', errorLogs);

// ==================== EJEMPLO 5: HTML SCRAPER ====================

/**
 * Scraper simple para extraer datos de HTML
 */
class HTMLScraper {
  constructor() {
    this.patterns = {
      href: new PatternBuilder().find('href=').cut('"'),
      class: new PatternBuilder().find('class=').cut('"'),
      id: new PatternBuilder().find('id=').cut('"'),
      content: new PatternBuilder().cut('<', '>'),
    };
  }

  extractLinks(html) {
    const linkPattern = new PatternBuilder()
      .find('<a')
      .whitespace().anyAmount()
      .find('href=')
      .cut('"');

    const matches = [];
    const regex = linkPattern.toRegex();
    let match;
    regex.lastIndex = 0;

    // Para global, necesitamos usar matchAll
    while ((match = regex.exec(html)) !== null) {
      matches.push({
        url: match[1],
        fullTag: match[0],
      });
    }

    return matches;
  }

  extractAttributes(html, tagName, attribute) {
    const pattern = new PatternBuilder()
      .find(`<${tagName}`)
      .whitespace().anyAmount()
      .find(`${attribute}=`)
      .cut('"');

    const matches = [];
    const regex = pattern.toRegex();
    let match;
    regex.lastIndex = 0;

    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }
}

// Uso:
const scraper = new HTMLScraper();
const sampleHTML = `
  <a href="https://example.com">Example</a>
  <a href="https://google.com">Google</a>
  <div class="container" id="main">Content</div>
`;
const links = scraper.extractLinks(sampleHTML);
console.log('Links found:', links);

// ==================== EJEMPLO 6: DATA CLEANUP ====================

/**
 * Limpiador de datos usando patrones
 */
class DataCleaner {
  constructor() {
    this.patterns = {
      // Eliminar espacios extra
      extraSpaces: new PatternBuilder().whitespace().exactly(2).oneOrMore().global(),
      // Eliminar puntuación al final
      trailingPunct: new PatternBuilder().find(',').endOfLine(),
      // Normalizar nombres
      email: new PatternBuilder().find('@').global().insensitive(),
    };
  }

  cleanText(text) {
    return text
      .replace(/\s{2,}/g, ' ')  // Extra spaces
      .trim();
  }

  normalizeEmail(email) {
    // Convertir a minúsculas
    return email.toLowerCase();
  }

  sanitizeUserInput(input) {
    // Remover caracteres especiales peligrosos
    const dangerous = new PatternBuilder()
      .find('<')
      .or('>')
      .or(';')
      .or('"')
      .global();

    return dangerous.replace(input, '');
  }
}

// Uso:
const cleaner = new DataCleaner();
const dirtyText = 'Hello    World  ';
const cleaned = cleaner.cleanText(dirtyText);
console.log('Cleaned text:', `"${cleaned}"`);  // "Hello World"

// ==================== EJEMPLO 7: URL PARSER ====================

/**
 * Parser de URLs con extracción de componentes
 */
class URLParser {
  constructor() {
    // Patterns para extraer componentes
    this.patterns = {
      protocol: new PatternBuilder().find('://'),
      domain: new PatternBuilder()
        .find('://')
        .word().oneOrMore()
        .find('.')
        .word().oneOrMore(),
      path: new PatternBuilder().find('/').cut('"'),
      query: new PatternBuilder().find('?').cut('&'),
    };
  }

  parse(url) {
    const protocolMatch = url.match(/^([a-z]+):\/\//);
    const protocol = protocolMatch ? protocolMatch[1] : null;

    // Extraer dominio
    const domainPattern = new PatternBuilder()
      .find('://')
      .word().oneOrMore()
      .find('.')
      .word().oneOrMore();

    const domainMatch = domainPattern.get(url);
    const domain = domainMatch ? domainMatch[0].substring(3) : null;

    // Extraer path
    const pathStart = url.indexOf('/', url.indexOf('://') + 3);
    const path = pathStart !== -1 ? url.substring(pathStart) : '/';

    return { protocol, domain, path };
  }
}

// Uso:
const urlParser = new URLParser();
const parsedURL = urlParser.parse('https://example.com/api/users?id=123');
console.log('Parsed URL:', parsedURL);

// ==================== EJEMPLO 8: REGEX BUILDER PARA API ====================

/**
 * Helper para construir rutas dinámicas con patrones
 */
class RoutePatternBuilder {
  static createUserRoute(userId) {
    // Validar que el userID sea solo números
    const pattern = new PatternBuilder()
      .startOfLine()
      .digit().oneOrMore()
      .endOfLine();

    return {
      isValid: pattern.matches(userId),
      pattern: pattern.toRegex(),
    };
  }

  static createSlugRoute(slug) {
    // Validar que el slug sea [a-z0-9-]+
    const pattern = new PatternBuilder()
      .startOfLine()
      .range('a', 'z')
      .oneOrMore()
      .find('-')
      .maybe()
      .digit().maybe()
      .endOfLine();

    return {
      isValid: pattern.matches(slug),
      pattern: pattern.toRegex(),
    };
  }
}

// Uso:
const userRoute = RoutePatternBuilder.createUserRoute('123');
console.log('User Route Valid:', userRoute.isValid);  // true

// ==================== EXPORTAR ====================

export {
  validateEmailMiddleware,
  JSONExtractor,
  FormValidator,
  LogParser,
  HTMLScraper,
  DataCleaner,
  URLParser,
  RoutePatternBuilder,
};

console.log('✅ PatternBuilder Integration Examples loaded successfully!');
