/**
 * @file Users module entry point
 * @description Export all components from the users module
 */

// Export the DTO
export * from './dto/UserDTO';

// Export the entity
export * from './entities/User';

// Export the repository
export { UserRepository } from './repositories/UserRepository';

// Export the service
export { UserService } from './services/UserService';

// Export the controller
export { UserController } from './controllers/UserController';

// Export the routes
export { default as userRoutes } from './routes';