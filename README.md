# ⚡ Nicola Framework

[![npm version](https://img.shields.io/npm/v/nicola-framework.svg)](https://www.npmjs.com/package/nicola-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/nicola-framework)

> **Performance de bajo nivel con DX de alto nivel.**

Nicola es un framework web moderno para Node.js con arquitectura **Zero-Dependency**. Diseñado para ser ligero, seguro por defecto y con todas las herramientas que necesitas integradas.

---

## 🚀 ¿Por qué Nicola?

- **🎯 Zero Dependencies** - Sin librerías externas, 100% código nativo
- **⚡ Alto Rendimiento** - Servidor HTTP nativo sin overhead
- **🔐 Seguro por Defecto** - JWT nativo, validación de schemas, headers de seguridad
- **🗃️ ORM Incluido** - Dynamo ORM con soporte MySQL y PostgreSQL
- **🔥 Hot Reload Nativo** - Recarga automática sin nodemon
- **🎨 Error Handler Visual** - Interfaz elegante para debugging
- **📦 Todo Incluido** - Router, middlewares, ORM, seguridad, logging

---

## 📦 Instalación

```bash
npm install nicola-framework
```

---

## ⚡ Quickstart

### Servidor HTTP Básico

```javascript
import Nicola from 'nicola-framework';

const app = new Nicola();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Nicola!' });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
```

### Con Router y Middlewares

```javascript
import { Nicola, Remote, Shadowgraph, Teleforce } from 'nicola-framework';

const app = new Nicola();
const router = new Remote();

// Middlewares globales
app.use(Shadowgraph);  // Logger HTTP
app.use(Teleforce);    // Security headers

// Router con rutas anidadas
router.get('/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob'] });
});

router.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

app.use('/api', router);

app.listen(3000);
```

### Con ORM (Dynamo)

```javascript
import { Nicola, Dynamo } from 'nicola-framework';
import User from './models/User.js';

// Configurar base de datos
await Dynamo.connect({
  dialect: 'mysql',
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

const app = new Nicola();

// Crear usuario
app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// Buscar usuarios
app.get('/users', async (req, res) => {
  const users = await User.where('active', true).get();
  res.json(users);
});

app.listen(3000);
```

---

## 🏗️ Arquitectura Modular

Nicola está compuesto por módulos independientes que trabajan en armonía:

| Módulo | Función | Descripción |
|--------|---------|-------------|
| **Core** | El Motor | Servidor HTTP nativo con body parsing y middleware system |
| **Remote** | El Cerebro | Router avanzado con soporte MVC, regex y rutas dinámicas |
| **Dynamo** | La Base | ORM completo con QueryBuilder y Active Record |
| **Coherer** | El Notario | Sistema JWT nativo (HMAC SHA256) |
| **Shadowgraph** | El Observador | Logger HTTP de alto rendimiento |
| **Teleforce** | El Escudo | Suite de seguridad (XSS, NoSniff, CORS) |
| **BlackBox** | El Forense | Error handler visual estilo terminal |
| **Insulator** | El Portero | Validador de schemas |
| **Regulator** | El Gestor | Parser de variables .env |
| **LiveCurrent** | El Fénix | Hot reload automático |

---

## 📚 Documentación Completa

### 1. Core (Servidor HTTP)

El servidor HTTP principal con soporte de middlewares.

```javascript
import Nicola from 'nicola-framework';

const app = new Nicola();

// Métodos HTTP
app.get('/users', handler);
app.post('/users', handler);
app.put('/users/:id', handler);
app.delete('/users/:id', handler);
app.patch('/users/:id', handler);

// Middleware global
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Prefijo de ruta
app.use('/api', router);

app.listen(3000);
```

### 2. Remote (Router)

Sistema de routing recursivo con soporte de rutas dinámicas.

```javascript
import { Remote } from 'nicola-framework';

const router = new Remote();

// Rutas básicas
router.get('/users', getUsers);
router.post('/users', createUser);

// Parámetros dinámicos
router.get('/users/:id', getUser);           // req.params.id
router.get('/posts/:slug/comments/:id', getComment);

// Routers anidados
const adminRouter = new Remote();
adminRouter.get('/dashboard', adminDashboard);
router.use('/admin', adminRouter);  // /admin/dashboard
```

### 3. Dynamo ORM

ORM completo con Active Record pattern.

#### Configuración

```javascript
import { Dynamo } from 'nicola-framework';

await Dynamo.connect({
  dialect: 'mysql',    // o 'postgres'
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'secret',
  database: 'mydb'
});
```

#### Definir Modelos

```javascript
import { Dynamo } from 'nicola-framework';

class User extends Dynamo.Model {
  static table = 'users';
  
  static schema = {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    age: { type: 'number' }
  };
}

export default User;
```

#### Query Builder

```javascript
// Seleccionar todos
const users = await User.all();

// Buscar por ID
const user = await User.find(1);

// Condiciones
const activeUsers = await User.where('active', true).get();
const adults = await User.where('age', '>', 18).get();

// Múltiples condiciones
const results = await User
  .where('country', 'US')
  .where('age', '>=', 21)
  .get();

// Crear
const newUser = await User.create({
  name: 'Alice',
  email: 'alice@example.com'
});

// Actualizar
await User.where('id', 5).update({ name: 'Bob' });

// Eliminar
await User.where('id', 5).delete();

// Select específico
const names = await User.select('name', 'email').get();

// Límite
const first10 = await User.limit(10).get();
```

### 4. Coherer (JWT Nativo)

Sistema de autenticación JWT sin dependencias externas.

```javascript
import { Coherer } from 'nicola-framework';

const jwt = new Coherer('mi-secreto-super-seguro');

// Generar token
const token = jwt.sign({ 
  userId: 123, 
  role: 'admin' 
}, '24h');  // Expira en 24 horas

// Verificar token
const payload = jwt.verify(token);
if (payload) {
  console.log('Token válido:', payload);
} else {
  console.log('Token inválido o expirado');
}

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  const payload = jwt.verify(token);
  if (!payload) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  req.user = payload;
  next();
}

app.use('/protected', authMiddleware);
```

### 5. Regulator (Variables de Entorno)

Parser seguro de archivos .env

```javascript
import { Regulator } from 'nicola-framework';

// Cargar .env
Regulator.load();

// Acceder a variables
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.JWT_SECRET;
```

**.env example:**
```env
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/mydb
JWT_SECRET=mi-super-secreto-jwt
NODE_ENV=development
```

### 6. Middlewares Incluidos

#### Shadowgraph (Logger HTTP)

```javascript
import { Shadowgraph } from 'nicola-framework';

app.use(Shadowgraph);
// Output: GET /users → 200 (15ms)
```

#### Teleforce (Security Headers)

```javascript
import { Teleforce } from 'nicola-framework';

app.use(Teleforce);
// Añade: X-XSS-Protection, X-Content-Type-Options, etc.
```

#### EasyCors (CORS Management)

```javascript
import { EasyCors } from 'nicola-framework';

app.use(EasyCors({
  origin: 'https://mi-frontend.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

#### BlackBox (Error Handler)

```javascript
import { BlackBox } from 'nicola-framework';

app.use(BlackBox);  // Debe ser el último middleware
// Captura errores y muestra interfaz visual
```

#### Insulator (Schema Validation)

```javascript
import { Insulator } from 'nicola-framework';

const userSchema = {
  name: { type: 'string', required: true, min: 3 },
  email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  age: { type: 'number', min: 18 }
};

app.post('/users', Insulator(userSchema), (req, res) => {
  // req.body ya está validado
  res.json({ message: 'Usuario válido' });
});
```

### 7. LiveCurrent (Hot Reload)

Para desarrollo con recarga automática:

```javascript
import { DevRunner } from 'nicola-framework';

// dev.js
DevRunner.start('./app.js', {
  watch: ['src/', 'config/'],
  ignore: ['node_modules/', 'logs/']
});
```

```bash
node dev.js
# El servidor se recarga automáticamente al editar archivos
```

---

## 🎯 Ejemplos Completos

### API REST con Autenticación

```javascript
import { Nicola, Remote, Coherer, Regulator } from 'nicola-framework';
import User from './models/User.js';

Regulator.load();

const app = new Nicola();
const router = new Remote();
const jwt = new Coherer(process.env.JWT_SECRET);

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  req.user = payload;
  next();
};

// Rutas públicas
router.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  const token = jwt.sign({ userId: user.id }, '7d');
  
  res.json({ user, token });
});

router.post('/login', async (req, res) => {
  const user = await User.where('email', req.body.email).first();
  
  if (!user || user.password !== req.body.password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  
  const token = jwt.sign({ userId: user.id }, '7d');
  res.json({ user, token });
});

// Rutas protegidas
router.get('/profile', authenticate, async (req, res) => {
  const user = await User.find(req.user.userId);
  res.json(user);
});

router.put('/profile', authenticate, async (req, res) => {
  await User.where('id', req.user.userId).update(req.body);
  res.json({ message: 'Perfil actualizado' });
});

app.use('/api', router);
app.listen(3000);
```

### CRUD Completo

```javascript
import { Nicola, Remote, Dynamo, Insulator, Shadowgraph, BlackBox } from 'nicola-framework';
import Post from './models/Post.js';

await Dynamo.connect({
  dialect: 'mysql',
  host: 'localhost',
  database: 'blog'
});

const app = new Nicola();
const router = new Remote();

app.use(Shadowgraph);  // Logger

const postSchema = {
  title: { type: 'string', required: true, min: 5 },
  content: { type: 'string', required: true },
  published: { type: 'boolean' }
};

// List posts
router.get('/', async (req, res) => {
  const posts = await Post.where('published', true).get();
  res.json(posts);
});

// Get single post
router.get('/:id', async (req, res) => {
  const post = await Post.find(req.params.id);
  
  if (!post) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }
  
  res.json(post);
});

// Create post
router.post('/', Insulator(postSchema), async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});

// Update post
router.put('/:id', Insulator(postSchema), async (req, res) => {
  await Post.where('id', req.params.id).update(req.body);
  res.json({ message: 'Post actualizado' });
});

// Delete post
router.delete('/:id', async (req, res) => {
  await Post.where('id', req.params.id).delete();
  res.status(204).send();
});

app.use('/api/posts', router);
app.use(BlackBox);  // Error handler (último)

app.listen(3000);
```

---

## 🔧 Estructura de Proyecto Recomendada

```
/mi-proyecto
├── /src
│   ├── /controllers     # Lógica de negocio
│   ├── /models         # Modelos Dynamo
│   ├── /routes         # Definición de rutas
│   ├── /middlewares    # Middlewares custom
│   └── /config         # Configuraciones
├── app.js              # Entry point
├── dev.js              # Script desarrollo
├── .env                # Variables de entorno
├── .env.example        # Template de .env
└── package.json
```

---

## 🚀 Scripts NPM Recomendados

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node dev.js",
    "test": "node --test"
  }
}
```

---

## 🌟 Características Destacadas

### Zero Dependencies
A diferencia de Express o Fastify, Nicola no tiene dependencias externas (excepto chalk para logs en desarrollo). Todo está construido con módulos nativos de Node.js.

### JWT Nativo
Implementación propia de JWT usando el módulo `crypto` nativo, sin necesidad de jsonwebtoken.

### ORM Incluido
No necesitas instalar Sequelize, TypeORM o Prisma. Dynamo viene integrado con soporte para MySQL y PostgreSQL.

### Hot Reload Nativo
LiveCurrent detecta cambios en archivos y reinicia el servidor sin necesidad de nodemon o pm2.

### Error Handler Visual
BlackBox captura errores y los muestra en una interfaz web elegante con stack trace completo.

---

## 📊 Comparación con Otros Frameworks

| Feature | Nicola | Express | Fastify |
|---------|--------|---------|---------|
| Dependencies | 0 | ~50 | ~20 |
| Router | ✅ Incluido | ✅ | ✅ |
| ORM | ✅ Incluido | ❌ | ❌ |
| JWT | ✅ Nativo | ❌ | ❌ |
| Hot Reload | ✅ Nativo | ❌ | ❌ |
| Error UI | ✅ Visual | ❌ | ❌ |
| Validation | ✅ Incluido | ❌ | ✅ |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT © [Erick Mauricio Tiznado Rodriguez](https://github.com/yourusername)

---

## 🙏 Agradecimientos

Inspirado en la filosofía de Nikola Nicola: *"Si quieres encontrar los secretos del universo, piensa en términos de energía, frecuencia y vibración."*

---

## 📬 Contacto

- **NPM**: [nicola-framework](https://www.npmjs.com/package/nicola-framework)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nicola-framework/issues)

---

<div align="center">

⚡ **Built with electricity and zero dependencies** ⚡

</div>
