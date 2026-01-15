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
- [Estructura recomendada para features](#-estructura-recomendada-para-features)
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

## 🧱 Estructura recomendada para features

Esta sección es **agnóstica** a la lógica de negocio y solo usa patrones compatibles con Nicola.

### 1) Rutas → Controlador

Las rutas deben ser delgadas: reciben request, ejecutan validación simple y delegan al controlador.

```js
import { Insulator } from "nicola-framework";
import { UsersController } from "../controllers/UsersController.js";

const users = new UsersController();

const createUserSchema = {
  email: "string",
  password: "string",
};

export default (app) => {
  app.post("/api/users", Insulator(createUserSchema), (req, res) => {
    users.create(req, res);
  });
};
```

**Nota:** `Insulator` solo valida campos **de primer nivel** (no JSON Schema).

### 2) Controlador → Servicio

El controlador orquesta la lógica. Los servicios encapsulan la integración con APIs/DB.

```js
import { UsersService } from "../services/UsersService.js";

export class UsersController {
  constructor() {
    this.service = new UsersService();
  }

  async create(req, res) {
    try {
      const { email, password } = req.body;

      // Validación extra (si la necesitas)
      if (!email || !password) {
        res.statusCode = 400;
        return res.end("Bad Request");
      }

      const user = await this.service.createUser({ email, password });

      res.statusCode = 201;
      return res.json({ user });
    } catch (err) {
      res.statusCode = 500;
      return res.json({ error: "Internal Server Error" });
    }
  }
}
```

### 3) Servicios / Adapters

Usa servicios para encapsular integración con terceros. Esto facilita cambios futuros.

```js
export class UsersService {
  async createUser({ email, password }) {
    // Aquí puedes integrar DB/SDKs externos
    return { id: 1, email };
  }
}
```

### 4) Consideraciones importantes

- Nicola **solo** parsea JSON si `Content-Type` incluye `application/json`.
- No existe `res.status()`; usa `res.statusCode`.
- Si un handler async falla, el error se propaga vía `next(err)`.
- Para variables de entorno, usa `Regulator.load()` al inicio.

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

`Coherer` es el módulo de JWT del framework. Está implementado con:

- algoritmo fijo `HS256`
- firma HMAC-SHA256
- codificación `base64url`

No depende de librerías externas.

### Requisito: `NICOLA_SECRET`

`Coherer` **siempre** usa el secreto desde `process.env.NICOLA_SECRET`. Si no existe, lanza:

`Please configure, NICOLA_SECRET in the .env file`

La forma típica de cargar variables es:

```js
import { Regulator } from "nicola-framework";

Regulator.load();
```

`.env` mínimo:

```env
NICOLA_SECRET=mi-secreto-super-seguro
```

### API real (según código)

#### `Coherer.sign(payload, options)`

- Firma un token JWT.
- Requiere `options.expiresIn` (si no existe, lanza `Expire time invalid`).
- Siempre agrega `exp` al payload (en segundos desde epoch).

Formato de `expiresIn` (estricto):

- Debe ser `string` y hacer match con: `^(\d+)([smhdy])$`
- Ejemplos válidos: `"10s"`, `"15m"`, `"24h"`, `"7d"`, `"1y"`
- Nota: las unidades son en minúscula. `"1H"` es inválido.

Si el formato no coincide, `getExpTime()` lanza:

`Invalid Format, use for example: 10h, 10s, 10m, 10d`

Ejemplo (firmar):

```js
import { Regulator, Coherer } from "nicola-framework";

Regulator.load();

const token = Coherer.sign(
  { userId: 123, role: "admin" },
  { expiresIn: "24h" }
);

console.log(token); // header.payload.signature
```

#### `Coherer.verify(token)`

- Verifica estructura, header y firma.
- Si el token incluye `exp`, valida expiración.
- Devuelve el payload decodificado como objeto.

Validaciones que hace (tal cual):

- `token` debe ser `string` y tener 3 partes separadas por `.`.
- el header debe ser JSON y contener `alg: "HS256"` y `typ: "JWT"`.
- la firma debe coincidir (usa comparación segura con `crypto.timingSafeEqual`).
- si existe `exp` y el tiempo actual supera `exp`, lanza `Token Expired`.

Errores que puedes esperar (mensajes reales):

- Secret faltante: `Please configure, NICOLA_SECRET in the .env file`
- Token inválido/manipulado/mal formado: `Token Invalido`
- Token expirado: `Token Expired`

Ejemplo (verificar):

```js
import { Regulator, Coherer } from "nicola-framework";

Regulator.load();

try {
  const payload = Coherer.verify("<token>");
  console.log(payload);
} catch (err) {
  // err.message puede ser: "Token Invalido" | "Token Expired" | ...
  console.error(err.message);
}
```

### Ejemplo completo: login + ruta protegida

Este ejemplo usa solo primitives existentes (no hay `res.status()`):

```js
import Nicola, { Regulator, Coherer } from "nicola-framework";

Regulator.load();

const app = new Nicola();

// 1) Endpoint de login (demo)
app.post("/login", (req, res) => {
  // Nicola solo parsea JSON si Content-Type incluye application/json
  const { userId } = req.body;

  if (typeof userId !== "number") {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const token = Coherer.sign({ userId }, { expiresIn: "1h" });
  res.json({ token });
});

// 2) Middleware Bearer token
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

// 3) Ruta protegida
app.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000);
```

---

### Nota importante sobre `expiresIn`

Según tu implementación, `expiresIn` debe ser un `string` válido. Si pasas un tipo distinto, `getExpTime()` devuelve `null` y el token resultante tendrá `exp: null`; al verificarlo, se considerará expirado.

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
