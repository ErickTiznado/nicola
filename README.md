# ⚡ Nicola Framework

[![npm version](https://img.shields.io/npm/v/nicola-framework.svg)](https://www.npmjs.com/package/nicola-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)

> Framework HTTP minimalista para Node.js (ESM): servidor, router, middlewares, JWT y una capa ORM sencilla.

Nicola expone un **servidor HTTP nativo** con un **router tipo Express** y utilidades integradas. El proyecto está escrito como **ES Modules** (`"type": "module"`), por lo que los ejemplos usan `import`.

---

## ✅ Estado actual del proyecto (lo que realmente hay)

- **Core/Router**: `Nicola` (default) extiende `Remote`.
- **Body parsing**: JSON si `Content-Type` incluye `application/json` (límite ~2MB). Si no, `req.body = {}`.
- **Helpers de response**: `res.json(data)` y `res.send(text)`. (No existe `res.status()`.)
- **CORS**: `EasyCors` permite `*` y responde `OPTIONS` con `204`.
- **Security headers**: `Teleforce` aplica headers básicos (no-sniff, frame deny, etc.).
- **Logger**: `Shadowgraph` loggea al terminar la respuesta.
- **Errores**: si un handler lanza error o llama `next(err)`, se responde HTML via `BlackBox`. En `NODE_ENV=production` no se envía stacktrace al cliente.
- **JWT**: `Coherer` (HS256) funciona vía métodos **estáticos** y requiere `NICOLA_SECRET` en env.
- **ORM**: `Dynamo` soporta **Postgres** hoy (driver `postgres`). La lib `pg` es **dependencia opcional** (se instala aparte).
- **Hot reload**: `LiveCurrent` reinicia el proceso Node al detectar cambios en el directorio.

---

## 📦 Instalación

```bash
npm install nicola-framework
```

### (Opcional) Postgres

El dialecto Postgres usa `pg` por import dinámico.

```bash
npm install pg
```

---

## ⚡ Quickstart

### Servidor HTTP básico

```js
import Nicola from 'nicola-framework';

const app = new Nicola();

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Hello from Nicola!' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// Opcional: timeouts del server (en ms)
// NICOLA_REQUEST_TIMEOUT=30000
// NICOLA_HEADERS_TIMEOUT=10000
// NICOLA_KEEP_ALIVE_TIMEOUT=65000
```

### Router anidado y params

```js
import { Nicola, Remote } from 'nicola-framework';

const app = new Nicola();
const api = new Remote();

api.get('/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob'] });
});

api.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

app.use('/api', api);
app.listen(3000);
```

---

## 🧠 API (resumen fiel al código)

### `Nicola` (Core)

- `new Nicola()`
- `app.get/post/put/patch/delete(path, ...handlers)`
- `app.use([path], ...handlers | router)`
- `app.listen(port, [callback])`

Notas:
- `Nicola.listen()` ejecuta internamente `Shadowgraph`, `EasyCors` y `Teleforce` en cada request.
- `req.query` se construye desde querystring.

### `Remote` (Router)

`Remote` es el router base. Soporta middlewares y rutas con params (`/users/:id`).

Ejemplo de middleware simple:

```js
app.use((req, res, next) => {
  // No existe res.status(); usa statusCode
  if (req.url === '/blocked') {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  next();
});
```

Errores:

```js
app.get('/boom', (req, res) => {
  throw new Error('Boom');
});
```

---

## 🔐 Seguridad

### `Regulator` (.env)

Lee `.env` desde el directorio actual (`process.cwd()`) y lo copia a `process.env`.

```js
import { Regulator } from 'nicola-framework';

Regulator.load();
```

### `Coherer` (JWT HS256)

`Coherer` es una clase con métodos **estáticos**.

```js
import { Regulator, Coherer } from 'nicola-framework';

Regulator.load();

const token = Coherer.sign(
  { userId: 123, role: 'admin' },
  { expiresIn: '24h' }
);

const payload = Coherer.verify(token);
console.log(payload.userId);
```

`.env` mínimo:

```env
NICOLA_SECRET=mi-secreto-super-seguro

# Opcional pero recomendado en producción
NODE_ENV=production
```

---

## 🗃️ Dynamo (ORM)

### Configuración

`Dynamo.connect()` **no recibe config**: toma la configuración desde variables de entorno.

```js
import { Regulator, Dynamo } from 'nicola-framework';

Regulator.load();
await Dynamo.connect();

// Recomendado en shutdown (SIGTERM/SIGINT)
await Dynamo.disconnect();
```

`.env` para Postgres:

```env
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=mydb

# Opcional: SSL en Postgres (depende de tu hosting)
DB_SSLMODE=require
```

### Modelos

```js
import { Dynamo } from 'nicola-framework';

export default class User extends Dynamo.Model {
  static tableName = 'users';

  static schema = {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    age: { type: 'number', required: false }
  };
}
```

### Queries

```js
// All
const users = await User.all();

// Where
const active = await User.where('active', true).get();

// Insert (valida contra schema)
const created = await User.create({ name: 'Alice', email: 'a@a.com', age: 20 });

// Update / Delete
await User.where('id', 1).update({ name: 'Alice 2' });
await User.where('id', 1).delete();

// Select específico (usa string con coma)
const names = await User.select('name,email').get();

// Order/limit/offset vía QueryBuilder
const latest = await User.query().orderBy('id', 'DESC').limit(10).offset(0).get();
```

---

## 🧩 Middlewares

### `Insulator(schema)`

Valida `req.body` con un esquema **simple** de tipos (`typeof`).

```js
import { Insulator } from 'nicola-framework';

const schema = {
  name: 'string',
  age: 'number'
};

app.post('/users', Insulator(schema), (req, res) => {
  res.json({ ok: true });
});
```

### `Shadowgraph`, `Teleforce`, `EasyCors`

Se ejecutan automáticamente dentro de `Nicola.listen()`. También puedes llamarlos manualmente si estás usando `Remote` por separado.

---

## 🔥 LiveCurrent (hot reload)

```js
import { LiveCurrent } from 'nicola-framework';

const dev = new LiveCurrent('app.js');
dev.boot();
```

---

## 🤝 Contribuir

1. Fork
2. Rama feature
3. PR

---

## 📝 Licencia

MIT © Erick Mauricio Tiznado Rodriguez
