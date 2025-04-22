/**
 * Type definitions for migration system
 */

/**
 * Entity mapping between source CRM and AVEROX CRM
 */
export interface MigrationEntityMap {
  id: string;         // Source CRM entity ID/name
  name: string;       // Human-readable name
  count?: string;     // Approximate count of records (shown to user)
  targetEntity: string; // Target entity type in AVEROX CRM
}

/**
 * Field definition for mapping
 */
export interface MigrationField {
  id: string;         // Field ID/name
  name: string;       // Human-readable name
  type: string;       // Field data type
  required?: boolean; // Whether field is required
}

/**
 * Mapping between source CRM fields and AVEROX CRM fields
 */
export interface MigrationFieldMap {
  sourceFields: MigrationField[];
  targetFields: MigrationField[];
  defaultMapping: Record<string, string>; // target field -> source field
}

/**
 * Base interface for CRM migration handlers
 */
export interface MigrationHandler {
  initialize(config: Record<string, string>): Promise<boolean>;
  testConnection(): Promise<{ success: boolean, message: string }>;
  getAvailableEntities(): Promise<MigrationEntityMap[]>;
  getFieldMappings(entityType: string): Promise<MigrationFieldMap>;
  fetchData(entityType: string, options?: Record<string, any>): Promise<any[]>;
  transformData(entityType: string, sourceData: any[], fieldMapping: MigrationFieldMap): any[];
}

/**
 * Migration job status
 */
export interface MigrationJob {
  id: string;
  status: 'initializing' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  progress: number;   // 0 to 1
  currentStep?: string;
  entitiesProcessed?: number;
  recordsCreated?: number;
  errors: Array<{
    entity?: string,
    message: string,
    time: Date
  }>;
  startTime: Date;
  updatedTime?: Date;
  endTime?: Date;
  fileDetails?: {
    name: string,
    size: number,
    type: string
  };
  completed?: {
    total: number,
    byEntity: Record<string, number>
  };
}

/**
 * Migration config for AVEROX CRM
 */
export interface MigrationConfig {
  crmType: string;
  connectionDetails: Record<string, string>;
  entityTypes: string[];
  fieldMappings?: Record<string, MigrationFieldMap>;
}