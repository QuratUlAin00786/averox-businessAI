import { MigrationHandler, MigrationEntityMap, MigrationFieldMap } from './migration-types';

/**
 * Handler for Oracle CRM On Demand migrations
 * Implements methods for connecting to Oracle CRM API and extracting data
 */
export class OracleCRMMigrationHandler implements MigrationHandler {
  private instanceUrl: string;
  private apiKey: string;
  private username: string;
  private password: string;

  constructor(config: { instanceUrl?: string, apiKey?: string, username?: string, password?: string } = {}) {
    this.instanceUrl = config.instanceUrl || '';
    this.apiKey = config.apiKey || '';
    this.username = config.username || '';
    this.password = config.password || '';
  }

  /**
   * Initialize the handler with authentication details
   */
  async initialize(config: { instanceUrl: string, apiKey: string, username: string, password: string }): Promise<boolean> {
    this.instanceUrl = config.instanceUrl;
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.password = config.password;
    
    return true;
  }

  /**
   * Test the connection to Oracle CRM API
   */
  async testConnection(): Promise<{ success: boolean, message: string }> {
    try {
      // In a real implementation, we would make an actual API call to Oracle CRM
      if (!this.instanceUrl || !this.username || !this.password) {
        return { success: false, message: 'Missing required connection parameters' };
      }
      
      // Simulate successful connection
      return { success: true, message: 'Successfully connected to Oracle CRM API' };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to connect to Oracle CRM API: ${error.message}` 
      };
    }
  }

  /**
   * Get available entity types from Oracle CRM
   */
  async getAvailableEntities(): Promise<MigrationEntityMap[]> {
    const entities: MigrationEntityMap[] = [
      { id: 'Contact', name: 'Contacts', count: '~2800', targetEntity: 'contacts' },
      { id: 'Account', name: 'Accounts', count: '~1200', targetEntity: 'accounts' },
      { id: 'Lead', name: 'Leads', count: '~3500', targetEntity: 'leads' },
      { id: 'Opportunity', name: 'Opportunities', count: '~900', targetEntity: 'opportunities' },
      { id: 'Campaign', name: 'Campaigns', count: '~120', targetEntity: 'campaigns' },
      { id: 'Task', name: 'Tasks', count: '~4500', targetEntity: 'tasks' },
      { id: 'Activity', name: 'Activities', count: '~6200', targetEntity: 'activities' },
      { id: 'Product', name: 'Products', count: '~450', targetEntity: 'products' },
    ];
    
    return entities;
  }

  /**
   * Get field mappings for Oracle CRM entity types
   */
  async getFieldMappings(entityType: string): Promise<MigrationFieldMap> {
    // Map of Oracle CRM entity types to their field definitions
    const fieldMappings: Record<string, MigrationFieldMap> = {
      'Contact': {
        sourceFields: [
          { id: 'FirstName', name: 'First Name', type: 'string' },
          { id: 'LastName', name: 'Last Name', type: 'string' },
          { id: 'EmailAddress', name: 'Email Address', type: 'string' },
          { id: 'WorkPhone', name: 'Work Phone', type: 'string' },
          { id: 'MobilePhone', name: 'Mobile Phone', type: 'string' },
          { id: 'JobTitle', name: 'Job Title', type: 'string' },
          { id: 'Department', name: 'Department', type: 'string' },
          { id: 'PrimaryAccountId', name: 'Primary Account', type: 'reference' },
          { id: 'Address1', name: 'Primary Address', type: 'string' },
          { id: 'City', name: 'City', type: 'string' },
          { id: 'StateProvince', name: 'State/Province', type: 'string' },
          { id: 'PostalCode', name: 'Postal Code', type: 'string' },
          { id: 'Country', name: 'Country', type: 'string' },
        ],
        targetFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'mobile', name: 'Mobile', type: 'string' },
          { id: 'title', name: 'Title', type: 'string' },
          { id: 'department', name: 'Department', type: 'string' },
          { id: 'accountId', name: 'Account', type: 'reference' },
          { id: 'address', name: 'Address', type: 'string' },
          { id: 'city', name: 'City', type: 'string' },
          { id: 'state', name: 'State', type: 'string' },
          { id: 'zipCode', name: 'ZIP Code', type: 'string' },
          { id: 'country', name: 'Country', type: 'string' },
        ],
        defaultMapping: {
          'firstName': 'FirstName',
          'lastName': 'LastName',
          'email': 'EmailAddress',
          'phone': 'WorkPhone',
          'mobile': 'MobilePhone',
          'title': 'JobTitle',
          'department': 'Department',
          'accountId': 'PrimaryAccountId',
          'address': 'Address1',
          'city': 'City',
          'state': 'StateProvince',
          'zipCode': 'PostalCode',
          'country': 'Country',
        }
      },
      'Account': {
        sourceFields: [
          { id: 'Name', name: 'Account Name', type: 'string' },
          { id: 'MainPhone', name: 'Main Phone', type: 'string' },
          { id: 'WebSite', name: 'Website', type: 'string' },
          { id: 'Industry', name: 'Industry', type: 'string' },
          { id: 'Type', name: 'Account Type', type: 'string' },
          { id: 'Employees', name: 'Employees', type: 'integer' },
          { id: 'AnnualRevenue', name: 'Annual Revenue', type: 'currency' },
          { id: 'BillingAddress', name: 'Billing Address', type: 'string' },
          { id: 'BillingCity', name: 'Billing City', type: 'string' },
          { id: 'BillingState', name: 'Billing State', type: 'string' },
          { id: 'BillingZip', name: 'Billing ZIP', type: 'string' },
          { id: 'BillingCountry', name: 'Billing Country', type: 'string' },
          { id: 'Description', name: 'Description', type: 'text' },
        ],
        targetFields: [
          { id: 'name', name: 'Account Name', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'website', name: 'Website', type: 'string' },
          { id: 'industry', name: 'Industry', type: 'string' },
          { id: 'type', name: 'Type', type: 'string' },
          { id: 'employeeCount', name: 'Employees', type: 'integer' },
          { id: 'annualRevenue', name: 'Annual Revenue', type: 'currency' },
          { id: 'address', name: 'Address', type: 'string' },
          { id: 'city', name: 'City', type: 'string' },
          { id: 'state', name: 'State', type: 'string' },
          { id: 'zipCode', name: 'ZIP Code', type: 'string' },
          { id: 'country', name: 'Country', type: 'string' },
          { id: 'description', name: 'Description', type: 'text' },
        ],
        defaultMapping: {
          'name': 'Name',
          'phone': 'MainPhone',
          'website': 'WebSite',
          'industry': 'Industry',
          'type': 'Type',
          'employeeCount': 'Employees',
          'annualRevenue': 'AnnualRevenue',
          'address': 'BillingAddress',
          'city': 'BillingCity',
          'state': 'BillingState',
          'zipCode': 'BillingZip',
          'country': 'BillingCountry',
          'description': 'Description',
        }
      },
      'Opportunity': {
        sourceFields: [
          { id: 'Name', name: 'Opportunity Name', type: 'string' },
          { id: 'AccountId', name: 'Account', type: 'reference' },
          { id: 'PrimaryContactId', name: 'Primary Contact', type: 'reference' },
          { id: 'SalesStage', name: 'Sales Stage', type: 'string' },
          { id: 'Revenue', name: 'Revenue', type: 'currency' },
          { id: 'CloseDate', name: 'Close Date', type: 'date' },
          { id: 'Probability', name: 'Probability', type: 'percent' },
          { id: 'LeadSource', name: 'Lead Source', type: 'string' },
          { id: 'Description', name: 'Description', type: 'text' },
          { id: 'OwnerId', name: 'Owner', type: 'reference' },
        ],
        targetFields: [
          { id: 'name', name: 'Opportunity Name', type: 'string' },
          { id: 'accountId', name: 'Account', type: 'reference' },
          { id: 'contactId', name: 'Contact', type: 'reference' },
          { id: 'stage', name: 'Stage', type: 'string' },
          { id: 'amount', name: 'Amount', type: 'currency' },
          { id: 'closeDate', name: 'Close Date', type: 'date' },
          { id: 'probability', name: 'Probability', type: 'float' },
          { id: 'leadSource', name: 'Lead Source', type: 'string' },
          { id: 'notes', name: 'Notes', type: 'text' },
          { id: 'assignedUserId', name: 'Assigned To', type: 'reference' },
        ],
        defaultMapping: {
          'name': 'Name',
          'accountId': 'AccountId',
          'contactId': 'PrimaryContactId',
          'stage': 'SalesStage',
          'amount': 'Revenue',
          'closeDate': 'CloseDate',
          'probability': 'Probability',
          'leadSource': 'LeadSource',
          'notes': 'Description',
          'assignedUserId': 'OwnerId',
        }
      },
      'Lead': {
        sourceFields: [
          { id: 'FirstName', name: 'First Name', type: 'string' },
          { id: 'LastName', name: 'Last Name', type: 'string' },
          { id: 'EmailAddress', name: 'Email Address', type: 'string' },
          { id: 'WorkPhone', name: 'Work Phone', type: 'string' },
          { id: 'MobilePhone', name: 'Mobile Phone', type: 'string' },
          { id: 'Company', name: 'Company', type: 'string' },
          { id: 'JobTitle', name: 'Job Title', type: 'string' },
          { id: 'LeadSource', name: 'Lead Source', type: 'string' },
          { id: 'Status', name: 'Status', type: 'string' },
          { id: 'Address', name: 'Address', type: 'string' },
          { id: 'City', name: 'City', type: 'string' },
          { id: 'State', name: 'State', type: 'string' },
          { id: 'PostalCode', name: 'Postal Code', type: 'string' },
          { id: 'Country', name: 'Country', type: 'string' },
          { id: 'Description', name: 'Description', type: 'text' },
          { id: 'OwnerId', name: 'Owner', type: 'reference' },
        ],
        targetFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'company', name: 'Company', type: 'string' },
          { id: 'title', name: 'Title', type: 'string' },
          { id: 'source', name: 'Source', type: 'string' },
          { id: 'status', name: 'Status', type: 'string' },
          { id: 'address', name: 'Address', type: 'string' },
          { id: 'city', name: 'City', type: 'string' },
          { id: 'state', name: 'State', type: 'string' },
          { id: 'zipCode', name: 'ZIP Code', type: 'string' },
          { id: 'country', name: 'Country', type: 'string' },
          { id: 'notes', name: 'Notes', type: 'text' },
          { id: 'assignedUserId', name: 'Assigned To', type: 'reference' },
        ],
        defaultMapping: {
          'firstName': 'FirstName',
          'lastName': 'LastName',
          'email': 'EmailAddress',
          'phone': 'WorkPhone',
          'company': 'Company',
          'title': 'JobTitle',
          'source': 'LeadSource',
          'status': 'Status',
          'address': 'Address',
          'city': 'City',
          'state': 'State',
          'zipCode': 'PostalCode',
          'country': 'Country',
          'notes': 'Description',
          'assignedUserId': 'OwnerId',
        }
      },
    };
    
    return fieldMappings[entityType] || {
      sourceFields: [],
      targetFields: [],
      defaultMapping: {}
    };
  }

  /**
   * Fetch data for a specific entity type from Oracle CRM
   */
  async fetchData(entityType: string, options: Record<string, any> = {}): Promise<any[]> {
    // In a real implementation, this would make API calls to Oracle CRM REST API
    // For this example, we'll return sample data
    
    const sampleData: Record<string, any[]> = {
      'Contact': [
        { ContactId: 1, FirstName: 'John', LastName: 'Smith', EmailAddress: 'john.smith@example.com', WorkPhone: '(555) 123-4567', MobilePhone: '(555) 987-6543', JobTitle: 'CEO', Department: 'Executive', PrimaryAccountId: 1, Address1: '123 Main St', City: 'San Francisco', StateProvince: 'CA', PostalCode: '94105', Country: 'USA' },
        { ContactId: 2, FirstName: 'Emily', LastName: 'Johnson', EmailAddress: 'emily.johnson@example.com', WorkPhone: '(555) 234-5678', MobilePhone: '(555) 876-5432', JobTitle: 'Marketing Director', Department: 'Marketing', PrimaryAccountId: 2, Address1: '456 Market St', City: 'Chicago', StateProvince: 'IL', PostalCode: '60601', Country: 'USA' },
      ],
      'Account': [
        { AccountId: 1, Name: 'Acme Corporation', MainPhone: '(555) 111-2222', WebSite: 'www.acme.example.com', Industry: 'Technology', Type: 'Customer', Employees: 5000, AnnualRevenue: 25000000, BillingAddress: '100 Acme Way', BillingCity: 'San Francisco', BillingState: 'CA', BillingZip: '94105', BillingCountry: 'USA', Description: 'Global technology leader' },
        { AccountId: 2, Name: 'Globex Industries', MainPhone: '(555) 333-4444', WebSite: 'www.globex.example.com', Industry: 'Manufacturing', Type: 'Customer', Employees: 10000, AnnualRevenue: 75000000, BillingAddress: '200 Globex Plaza', BillingCity: 'Chicago', BillingState: 'IL', BillingZip: '60601', BillingCountry: 'USA', Description: 'International manufacturing company' },
      ],
      'Opportunity': [
        { OpportunityId: 1, Name: 'Enterprise Software Implementation', AccountId: 1, PrimaryContactId: 1, SalesStage: 'Proposal', Revenue: 250000, CloseDate: '2023-08-31', Probability: 75, LeadSource: 'Website', Description: 'Implementation of ERP software', OwnerId: 1 },
        { OpportunityId: 2, Name: 'Hardware Upgrade Project', AccountId: 2, PrimaryContactId: 2, SalesStage: 'Negotiation', Revenue: 120000, CloseDate: '2023-07-15', Probability: 90, LeadSource: 'Partner Referral', Description: 'Server and network upgrade', OwnerId: 2 },
      ],
      'Lead': [
        { LeadId: 1, FirstName: 'Michael', LastName: 'Davis', EmailAddress: 'michael.davis@example.com', WorkPhone: '(555) 444-5555', MobilePhone: '(555) 666-7777', Company: 'Future Tech', JobTitle: 'CTO', LeadSource: 'Trade Show', Status: 'Qualified', Address: '789 Tech Blvd', City: 'Austin', State: 'TX', PostalCode: '78701', Country: 'USA', Description: 'Interested in cloud solutions', OwnerId: 1 },
        { LeadId: 2, FirstName: 'Sarah', LastName: 'Wilson', EmailAddress: 'sarah.wilson@example.com', WorkPhone: '(555) 888-9999', MobilePhone: '(555) 111-3333', Company: 'Innovate Inc', JobTitle: 'VP Sales', LeadSource: 'Webinar', Status: 'New', Address: '321 Innovation Way', City: 'Seattle', State: 'WA', PostalCode: '98101', Country: 'USA', Description: 'Requested product demo', OwnerId: 2 },
      ],
    };
    
    return sampleData[entityType] || [];
  }

  /**
   * Transform data from Oracle CRM format to AVEROX format
   */
  transformData(entityType: string, sourceData: any[], fieldMapping: MigrationFieldMap): any[] {
    return sourceData.map(item => {
      const result: Record<string, any> = {};
      
      for (const [targetField, sourceField] of Object.entries(fieldMapping.defaultMapping)) {
        if (item[sourceField] !== undefined) {
          result[targetField] = item[sourceField];
        }
      }
      
      return result;
    });
  }
}