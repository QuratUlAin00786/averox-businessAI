/**
 * @file User service
 * @description Business logic for user management
 */

import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { User, InsertUser, UpdateUser } from '../entities/User';
import { CreateUserDTO, UpdateUserDTO, LoginUserDTO, ChangePasswordDTO } from '../dto/UserDTO';

/**
 * Service for handling user-related business logic
 */
export class UserService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  /**
   * Hash a password
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  
  /**
   * Compare a password with a hashed password
   * @param password Plain text password
   * @param hashedPassword Hashed password to compare against
   * @returns Boolean indicating if passwords match
   */
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  /**
   * Get all users
   * @returns Array of users with sensitive data removed
   */
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.findAll();
    
    // Remove sensitive data before returning
    return users.map(({ password, ...rest }) => rest);
  }
  
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User with sensitive data removed or null if not found
   */
  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return null;
    }
    
    // Remove sensitive data before returning
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Authenticate a user
   * @param loginData Login credentials
   * @returns User if authentication successful, null otherwise
   */
  async authenticateUser(loginData: LoginUserDTO): Promise<User | null> {
    const user = await this.userRepository.findByUsername(loginData.username);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await this.comparePasswords(loginData.password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Update last login time
    await this.userRepository.updateLastLogin(user.id);
    
    return user;
  }
  
  /**
   * Create a new user
   * @param userData User data
   * @returns Created user with sensitive data removed
   */
  async createUser(userData: CreateUserDTO): Promise<Omit<User, 'password'>> {
    // Check if username already exists
    const existingUserByUsername = await this.userRepository.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }
    
    // Hash the password
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Create user with hashed password
    const { confirmPassword, ...userDataWithoutConfirm } = userData;
    const insertData: InsertUser = {
      ...userDataWithoutConfirm,
      password: hashedPassword,
    };
    
    const newUser = await this.userRepository.create(insertData);
    
    // Remove sensitive data before returning
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  /**
   * Update an existing user
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user with sensitive data removed or null if not found
   */
  async updateUser(id: number, userData: UpdateUserDTO): Promise<Omit<User, 'password'> | null> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return null;
    }
    
    // Check if username is being changed and is already taken
    if (userData.username && userData.username !== existingUser.username) {
      const existingUserByUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUserByUsername) {
        throw new Error('Username already exists');
      }
    }
    
    // Check if email is being changed and is already taken
    if (userData.email && userData.email !== existingUser.email) {
      const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('Email already exists');
      }
    }
    
    // Update user
    const updatedUser = await this.userRepository.update(id, userData);
    
    if (!updatedUser) {
      return null;
    }
    
    // Remove sensitive data before returning
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  
  /**
   * Change a user's password
   * @param id User ID
   * @param passwordData Password change data
   * @returns Boolean indicating success
   */
  async changePassword(id: number, passwordData: ChangePasswordDTO): Promise<boolean> {
    // Get the user
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await this.comparePasswords(
      passwordData.currentPassword,
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash the new password
    const hashedPassword = await this.hashPassword(passwordData.newPassword);
    
    // Update the password
    const updatedUser = await this.userRepository.update(id, {
      password: hashedPassword,
    });
    
    return !!updatedUser;
  }
  
  /**
   * Delete a user
   * @param id User ID
   * @returns Boolean indicating success
   */
  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}