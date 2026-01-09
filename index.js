/**
 * Nicola Framework - Main Export
 * 
 * Punto de entrada principal del framework
 */

// Core
export { default as Nicola } from './core/Core.js';
export { default as Remote } from './core/Remote.js';

// Middlewares
export { default as Shadowgraph } from './middlewares/Shadowgraph.js';
export { default as Teleforce } from './middlewares/Teleforce.js';
export { default as BlackBox } from './middlewares/BlackBox.js';
export { default as EasyCors } from './middlewares/EasyCors.js';
export { default as Insulator } from './middlewares/Insulator.js';

// Security
export { default as Coherer } from './security/Coherer.js';
export { default as Regulator } from './security/Regulator.js';

// Dev Tools
export { default as LiveCurrent } from './dev-tools/LiveCurrent.js';

// Database (Dynamo ORM)
export { default as Dynamo } from './database/index.js';

// Default export (Nicola Core)
import Nicola from './core/Core.js';
export default Nicola;
