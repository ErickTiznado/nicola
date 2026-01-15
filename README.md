# ⚡ Nicola Framework

[![npm version](https://img.shields.io/npm/v/nicola-framework.svg)](https://www.npmjs.com/package/nicola-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)

> Framework HTTP minimalista para Node.js (ESM): servidor, router, middlewares, JWT y una capa ORM sencilla.

Nicola expone un **servidor HTTP nativo** con un **router tipo Express** y utilidades integradas. El proyecto está escrito como **ES Modules** (`"type": "module"`), por lo que los ejemplos usan `import`.

---

## 📌 Índice

- [Qué incluye](#-qué-incluye)
- [Instalación](#-instalación)
- [Crear un proyecto (CLI)](#-crear-un-proyecto-cli)
- [Levantar el servidor (dev)](#-levantar-el-servidor-dev)
- [Quickstart (manual)](#-quickstart-manual)
- [Guía del Router](#-guía-del-router)
- [Request/Response (lo que hay)](#-requestresponse-lo-que-hay)
- [Manejo de errores](#-manejo-de-errores)
- [Middlewares](#-middlewares)
- [Seguridad (Regulator + JWT)](#-seguridad-regulator--jwt)
- [Dynamo ORM (Postgres)](#-dynamo-orm-postgres)
- [Variables de entorno](#-variables-de-entorno)
- [Tests](#-tests)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Qué incluye

Esta lista está alineada con el **código actual** del repositorio:

- **Core/Router**: `Nicola` (default) extiende `Remote`.
- **Body parsing**: JSON si `Content-Type` incluye `application/json` (límite ~2MB). Si no, `req.body = {}`.
- **Helpers de response**: `res.json(data)` y `res.send(text)`.
  - Nota: no existe `res.status()`; usa `res.statusCode`.
- **CORS**: `EasyCors()` permite `*` y responde `OPTIONS` con `204`.
- **Security headers**: `Teleforce` aplica headers básicos (no-sniff, frame deny, etc.).
- **Logger**: `Shadowgraph` loggea al terminar la respuesta.
- **Errores**: si un handler lanza error o llama `next(err)`, se responde HTML via `BlackBox`.
  - En `NODE_ENV=production` se ocultan mensaje/stack al cliente.
- **JWT**: `Coherer` (HS256) via métodos **estáticos** y requiere `NICOLA_SECRET`.
- **ORM**: `Dynamo` soporta **Postgres** (driver `postgres`). `pg` es dependencia opcional.
- **Hot reload**: `LiveCurrent` reinicia el proceso Node al detectar cambios (en `process.cwd()`).

---

## 📦 Instalación

Requisitos:

- Node.js >= 16
- Proyecto ESM (Nicola es ESM)

Instalar como dependencia del proyecto:

```bash
npm install nicola-framework
```

### (Opcional) Postgres

El dialecto Postgres usa `pg` por import dinámico. Si vas a usar Dynamo con Postgres:

```bash
npm install pg
```

---

## 🧰 Crear un proyecto (CLI)

Nicola incluye un CLI con dos comandos:

- `init <nombre>`: crea una estructura mínima.
- `start`: ejecuta `app.js` con hot reload (LiveCurrent).

### Opción A: sin instalar global (recomendado)

```bash
npx nicola init mi-api
cd mi-api
npm install
npm start
```

### Opción B: instalando global

```bash
npm install -g nicola-framework
nicola init mi-api
cd mi-api
npm install
nicola start
```

### Qué genera `nicola init`

La CLI crea:

- `app.js`
- `src/controllers/user.controller.js`
- `src/routes/user.Routes.js`
- `package.json` con `"type": "module"` y script `start`.

El `app.js` generado monta las rutas así:

```js
import Nicola, { Regulator } from "nicola-framework";
import UserRoute from "./src/routes/user.Routes.js";

Regulator.load();

const app = new Nicola();

app.use("/user", UserRoute);

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a tu proyecto en Nicola" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
```

---

## 🚀 Levantar el servidor (dev)

Si tu entrypoint es `app.js` (como genera la CLI), tienes dos opciones:

- `npm start` (en proyecto generado)
- `nicola start` / `npx nicola start`

`start` usa LiveCurrent, que:

- observa cambios en el directorio actual (recursivo)
- ignora `node_modules`
- reinicia el proceso cuando detecta un cambio

---

## ⚡ Quickstart (manual)

Servidor HTTP básico:

```js
import Nicola from "nicola-framework";

const app = new Nicola();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Hello from Nicola!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

Opcional: timeouts del server (en ms). Nicola lee estas variables al llamar `listen()`:

```env
NICOLA_REQUEST_TIMEOUT=30000
NICOLA_HEADERS_TIMEOUT=10000
NICOLA_KEEP_ALIVE_TIMEOUT=65000
```

---

## 🧭 Guía del Router

### 1) Rutas básicas

`Nicola` y `Remote` soportan:

- `get`, `post`, `put`, `patch`, `delete`

```js
import Nicola from "nicola-framework";

const app = new Nicola();

app.get("/ping", (req, res) => {
  res.statusCode = 200;
  res.end("pong");
});

app.listen(3000);
```

### 2) Params (`/users/:id`)

Cuando la ruta tiene `:param`, Nicola crea:

- `req.params` (objeto con strings)

```js
app.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id });
});
```

### 3) Routers anidados (`use`)

Puedes montar un router dentro de otro:

```js
import { Nicola, Remote } from "nicola-framework";

const app = new Nicola();
const api = new Remote();

api.get("/ping", (req, res) => {
  res.end("pong");
});

app.use("/api", api);
app.listen(3000);
```

Importante: el mount path es estricto. `/api` hace match con `/api/...` pero NO con `/apix/...`.

### 4) Middlewares

Un middleware tiene firma `(req, res, next)`:

```js
app.use((req, res, next) => {
  // no existe res.status(); usa res.statusCode
  if (req.url === "/blocked") {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  next();
});
```

Nicola soporta handlers sync y async (Promise). Si un handler async rechaza, el error se propaga a `next(err)`.

---

## 🧾 Request/Response (lo que hay)

### Request (`req`)

Nicola trabaja sobre `http.IncomingMessage` y añade:

- `req.url`: **solo pathname** (sin querystring). Se reescribe internamente.
- `req.query`: objeto creado desde `?a=1&b=hola`.
- `req.params`: solo existe en rutas con `:param`.
- `req.body`: solo se parsea si `Content-Type` incluye `application/json`.
  - inválido => `400 Bad Request: Invalid JSON`
  - > ~2MB => `413 Request Entity Too Large`
  - si no es JSON => `{}`

### Response (`res`)

Nicola trabaja sobre `http.ServerResponse` y añade helpers:

- `res.json(data)` → setea `Content-Type: application/json` y serializa.
- `res.send(text)` → setea `Content-Type: text/plain`.

Para status codes, usa:

```js
res.statusCode = 201;
res.json({ created: true });
```

---

## 💥 Manejo de errores

Si ocurre un error en la cadena de handlers:

- `throw new Error(...)`
- o `next(err)`

Nicola responde con `BlackBox` (HTML):

- en `NODE_ENV=production` el cliente ve `Internal Server Error` sin stack
- en dev, incluye `err.message` y stack

Ejemplo:

```js
app.get("/boom", (req, res) => {
  throw new Error("Boom");
});
```

---

## 🧩 Middlewares

### `Insulator(schema)` (validación de body)

Valida que existan campos y que su tipo coincida con `typeof`.

```js
import { Insulator } from "nicola-framework";

const schema = {
  name: "string",
  age: "number",
};

app.post("/users", Insulator(schema), (req, res) => {
  res.json({ ok: true });
});
```

Respuestas típicas:

- falta campo → `400` y mensaje `Falta campo: name`
- tipo incorrecto → `400` y mensaje `El campo age debe ser number`

### `EasyCors(options)`

Soporta:

- `origin: "*"` (default)
- `origin: ["https://app.com", "http://localhost:5173"]`

```js
import { EasyCors } from "nicola-framework";

app.use(EasyCors({ origin: ["https://mi-front.com"] }));
```

Nota importante sobre `Nicola.listen()`: internamente siempre ejecuta `EasyCors()` **antes** de tu router.

- puedes sobreescribir headers CORS en tus handlers para requests normales
- pero el preflight `OPTIONS` se resuelve ahí mismo (204), antes de que corran tus rutas

### `Teleforce`

Agrega headers de seguridad básicos:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: Deny`
- `X-XSS-Protection: 1`

### `Shadowgraph`

Logger simple al finalizar la respuesta:

`[GET] /ruta - 200 OK - 12ms`

---

## 🔐 Seguridad (Regulator + JWT)

### `Regulator.load()` (.env)

Lee `.env` desde `process.cwd()` y copia valores a `process.env`.

Formato soportado:

- `KEY=value`
- líneas vacías OK
- comentarios con `#` al inicio

Ejemplo:

```env
NICOLA_SECRET=mi-secreto-super-seguro
NODE_ENV=production
```

### `Coherer` (JWT HS256)

`Coherer` es una clase con métodos estáticos:

- `Coherer.sign(payload, { expiresIn })`
- `Coherer.verify(token)`

`expiresIn` soporta formato **número + unidad**:

- `10s`, `15m`, `24h`, `7d`, `1y`

Ejemplo:

```js
import { Regulator, Coherer } from "nicola-framework";

Regulator.load();

const token = Coherer.sign(
  { userId: 123, role: "admin" },
  { expiresIn: "24h" }
);

const payload = Coherer.verify(token);
console.log(payload.userId);
```

Middleware típico para proteger rutas (Bearer token):

```js
import { Coherer } from "nicola-framework";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");
  try {
    req.user = Coherer.verify(token);
    next();
  } catch (err) {
    res.statusCode = 401;
    res.end("Unauthorized");
  }
};
```

---

## 🗃️ Dynamo ORM (Postgres)

### Conexión

`Dynamo.connect()` no recibe config: lee variables de entorno.

```js
import { Regulator, Dynamo } from "nicola-framework";

Regulator.load();
await Dynamo.connect();

// ... usar modelos/queries ...

await Dynamo.disconnect();
```

### Variables soportadas

Mínimo:

```env
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=mydb
```

Alternativa: `DB_URL` (tiene prioridad sobre las variables separadas):

```env
DB_DRIVER=postgres
DB_URL=postgres://user:pass@localhost:5432/mydb
```

SSL opcional via `DB_SSLMODE`:

- `require` → SSL sin verificación estricta
- `verify-ca` / `verify-full` → SSL con verificación
- `disable` / `prefer` → sin SSL

### Modelos

Un modelo es una clase que extiende `Dynamo.Model` y define:

- `static tableName` (requerido)
- `static schema` (opcional, para validar en `create`)

```js
import { Dynamo } from "nicola-framework";

export default class User extends Dynamo.Model {
  static tableName = "users";

  static schema = {
    name: { type: "string", required: true },
    email: { type: "string", required: true },
    age: { type: "number", required: false },
  };
}
```

### Operaciones comunes

```js
// Obtener todo
const users = await User.all();

// Where (si omites operador, asume '=')
const active = await User.where("active", true).get();

// Select (string con comas o array)
const names = await User.select("name,email").get();

// Insert (valida con schema)
const created = await User.create({ name: "Alice", email: "a@a.com", age: 20 });

// Update / Delete (recomendado: siempre con where)
await User.where("id", 1).update({ name: "Alice 2" });
await User.where("id", 1).delete();

// Order + limit + offset
const latest = await User.query().orderBy("id", "DESC").limit(10).offset(0).get();
```

Notas importantes:

- `update()` y `delete()` devuelven `count` (rowCount).
- Evita `User.update({...})` o `User.delete()` sin `where(...)` porque operaría sobre toda la tabla.

---

## 🌱 Variables de entorno

Nicola lee:

- `NODE_ENV` (`production` activa modo seguro en errores)
- `NICOLA_SECRET` (JWT)
- `NICOLA_REQUEST_TIMEOUT`, `NICOLA_HEADERS_TIMEOUT`, `NICOLA_KEEP_ALIVE_TIMEOUT`
- `DB_DRIVER`, `DB_URL` o `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`, `DB_SSLMODE`

---

## 🧪 Tests

Este repo incluye tests con Jest + Supertest.

```bash
npm test
```

---

## 🧯 Troubleshooting

### 1) "Please configure, NICOLA_SECRET..."

- define `NICOLA_SECRET` en tu `.env` y corre `Regulator.load()` antes de usar `Coherer`.

### 2) "Por favor utiliza el comando npm install pg"

- instala `pg` si vas a usar `DB_DRIVER=postgres`.

### 3) El body llega vacío

- Nicola solo parsea JSON cuando `Content-Type` incluye `application/json`.
- `multipart/form-data` y `application/x-www-form-urlencoded` no están soportados (por ahora).

### 4) CORS en preflight no aplica como esperas

- `Nicola.listen()` ejecuta `EasyCors()` y responde `OPTIONS` con `204` antes de tus rutas.
- si necesitas lógica avanzada de preflight, usa `Remote` + `http.createServer(...)` y monta tus middlewares manualmente.

---

## 🤝 Contribuir

1. Fork
2. Rama feature
3. PR

---

## 📝 Licencia

MIT © Erick Mauricio Tiznado Rodriguez
