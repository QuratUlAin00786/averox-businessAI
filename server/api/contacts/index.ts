/**
 * @file Contacts module entry point
 * @description Export all components from the contacts module
 */

// Export the DTO
export * from './dto/ContactDTO';

// Export the entity
export * from './entities/Contact';

// Export the repository
export { ContactRepository } from './repositories/ContactRepository';

// Export the service
export { ContactService } from './services/ContactService';

// Export the controller
export { ContactController } from './controllers/ContactController';

// Export the routes
export { default as contactRoutes } from './routes';