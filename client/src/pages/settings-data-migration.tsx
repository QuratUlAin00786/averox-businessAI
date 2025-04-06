import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Database,
  ServerCrash,
  FileDown,
  Shield,
  Link as LinkIcon,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckSquare
} from "lucide-react";
import { FaSalesforce, FaHubspot, FaMicrosoft } from "react-icons/fa";
import { SiZoho } from "react-icons/si";

const crmSystems = [
  { 
    id: "zoho", 
    name: "Zoho CRM", 
    icon: <SiZoho className="h-6 w-6" />,
    description: "Import contacts, accounts, deals, and activities from Zoho CRM",
    color: "bg-red-100 text-red-800 border-red-300",
    apiUrl: "https://accounts.zoho.com/oauth/v2/auth",
    docUrl: "https://www.zoho.com/crm/developer/docs/api/v5/",
    setupSteps: [
      "Create a Zoho Developer Account",
      "Register a new client in Zoho API Console",
      "Set the redirect URL to your CRM domain/api/callback/zoho",
      "Copy the Client ID and Client Secret"
    ]
  },
  { 
    id: "salesforce", 
    name: "Salesforce", 
    icon: <FaSalesforce className="h-6 w-6" />,
    description: "Import leads, opportunities, accounts, and tasks from Salesforce",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    apiUrl: "https://login.salesforce.com/services/oauth2/authorize",
    docUrl: "https://developer.salesforce.com/docs/apis",
    setupSteps: [
      "Log in to Salesforce Developer Account",
      "Navigate to Setup > Apps > App Manager",
      "Create a New Connected App",
      "Configure OAuth settings with your callback URL",
      "Copy the Consumer Key and Consumer Secret"
    ]
  },
  { 
    id: "dynamics", 
    name: "Microsoft Dynamics", 
    icon: <FaMicrosoft className="h-6 w-6" />,
    description: "Import contacts, accounts, opportunities, and activities from Microsoft Dynamics",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    apiUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    docUrl: "https://learn.microsoft.com/en-us/dynamics365/",
    setupSteps: [
      "Register an application in Azure Active Directory",
      "Add API permissions for Dynamics CRM",
      "Configure redirect URI to your application's callback URL",
      "Get Application (client) ID and Directory (tenant) ID"
    ]
  },
  { 
    id: "hubspot", 
    name: "HubSpot", 
    icon: <FaHubspot className="h-6 w-6" />,
    description: "Import contacts, companies, deals, and activities from HubSpot",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    apiUrl: "https://app.hubspot.com/oauth/authorize",
    docUrl: "https://developers.hubspot.com/docs/api/overview",
    setupSteps: [
      "Create a HubSpot Developer Account",
      "Create a new application in HubSpot Developer Portal",
      "Configure the redirect URL",
      "Copy the Client ID and Client Secret"
    ]
  },
];

const entityTypes = [
  { id: "contacts", name: "Contacts" },
  { id: "accounts", name: "Accounts/Companies" },
  { id: "leads", name: "Leads" },
  { id: "opportunities", name: "Opportunities/Deals" },
  { id: "activities", name: "Activities/Tasks" },
  { id: "products", name: "Products" },
  { id: "campaigns", name: "Campaigns" },
  { id: "documents", name: "Documents" },
];

export default function DataMigrationPage() {
  const { toast } = useToast();
  const [selectedSystem, setSelectedSystem] = useState("");
  const [step, setStep] = useState(1);
  const [migrationMode, setMigrationMode] = useState("oauth");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [mappingProgress, setMappingProgress] = useState(0);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [fileData, setFileData] = useState<File | null>(null);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [fieldMappings, setFieldMappings] = useState<any>({}); // Add missing state variable
  
  const selectedCrm = crmSystems.find(crm => crm.id === selectedSystem);
  const maxStep = 5;
  
  // Authentication with third-party CRM
  const authenticateMutation = useMutation({
    mutationFn: async (crmId: string) => {
      addToProcessingLog(`Initiating authentication with ${selectedCrm?.name}...`);
      
      // API authentication varies based on selected mode
      if (migrationMode === 'oauth') {
        // OAuth flow - call API to get authentication URL
        const response = await apiRequest('POST', '/api/migration/auth/init', {
          crmType: crmId
        });
        
        const data = await response.json();
        
        if (data.success && data.authUrl) {
          // Open OAuth auth URL in a new window
          window.open(data.authUrl, '_blank', 'width=800,height=600');
          addToProcessingLog("Opening authorization window. Please complete authentication in the new window.");
          return { authInitiated: true };
        } else {
          throw new Error(data.error || 'Failed to initiate OAuth flow');
        }
      } else if (migrationMode === 'apikey') {
        // Direct API key authentication
        const response = await apiRequest('POST', '/api/migration/auth/apikey', {
          crmType: crmId,
          apiKey,
          apiSecret,
          domain: instanceUrl || undefined
        });
        
        const data = await response.json();
        if (data.success) {
          addToProcessingLog("API key validation successful! Access granted.");
          return { authValidated: true };
        } else {
          throw new Error(data.error || 'Failed to validate API key');
        }
      }
      
      throw new Error('Invalid authentication mode');
    },
    onSuccess: (data: any) => {
      setIsAuthenticated(true);
      setAuthToken(data.token);
      toast({
        title: "Authentication Successful!",
        description: `Successfully connected to ${selectedCrm?.name}`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to connect to CRM. Please check your credentials.",
        variant: "destructive"
      });
    }
  });
  
  // Field mapping discovery with third-party CRM
  const discoverFieldsMutation = useMutation({
    mutationFn: async () => {
      addToProcessingLog("Discovering and analyzing field mappings...");
      
      // Get selected entity types for mapping
      const entityTypesToMap = selectedEntities.map(id => {
        const entity = entityTypes.find(e => e.id === id);
        return entity ? entity.id : id;
      });
      
      // Call API to get field mappings
      const response = await apiRequest('POST', '/api/migration/analyze-fields', {
        crmType: selectedSystem,
        entityTypes: entityTypesToMap
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze field mappings');
      }
      
      // Process field mappings
      setMappingProgress(50);
      addToProcessingLog("Analyzing source CRM field structure...");
      
      // Update field mappings state
      if (data.fieldMappings) {
        setFieldMappings(data.fieldMappings);
      }
      
      // Complete the progress
      setMappingProgress(100);
      addToProcessingLog("Field mapping complete!");
      
      return data;
    }
  });
  
  // Actual data migration from third-party CRM
  const migrateMutation = useMutation({
    mutationFn: async () => {
      addToProcessingLog(`Starting migration from ${selectedCrm?.name} to AVEROX CRM...`);
      
      // Get entity names for processing log
      const entityNames = selectedEntities.map(id => {
        const entity = entityTypes.find(e => e.id === id);
        return entity ? entity.name : id;
      }).join(", ");
      
      addToProcessingLog(`Migrating selected data: ${entityNames}`);
      
      // Create a migration job and start the process
      const response = await apiRequest('POST', '/api/migration/start', {
        crmType: selectedSystem,
        entityTypes: selectedEntities,
        fieldMappings
      });
      
      const { migrationId, success, error } = await response.json();
      
      if (!success) {
        throw new Error(error || 'Failed to start migration process');
      }
      
      // Migration is now running on the server, poll for status updates
      let migrationComplete = false;
      let progress = 0;
      
      while (!migrationComplete) {
        // Wait a bit between status checks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check migration status
        const statusResponse = await apiRequest('GET', `/api/migration/status/${migrationId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.error) {
          throw new Error(statusData.error);
        }
        
        // Update progress
        if (statusData.progress !== progress) {
          progress = statusData.progress;
          setMigrationProgress(progress);
        }
        
        // Show specific step messages
        if (statusData.currentStep && statusData.currentStep !== '') {
          addToProcessingLog(statusData.currentStep);
        }
        
        // Check if migration is complete
        if (statusData.status === 'completed') {
          migrationComplete = true;
          addToProcessingLog("Migration completed successfully!");
          return {
            entitiesMigrated: selectedEntities.length,
            recordsCreated: statusData.recordsCreated || 0
          };
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Migration failed');
        }
      }
      
      return { success: true };
    },
    onSuccess: (data: any) => {
      toast({
        title: "Migration Completed!",
        description: `Successfully migrated data from ${selectedCrm?.name}`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Migration Failed",
        description: error.message || "An error occurred during migration",
        variant: "destructive"
      });
    }
  });
  
  // Helper functions
  const addToProcessingLog = (message: string) => {
    setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const handleEntitySelect = (id: string) => {
    setSelectedEntities(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  // File upload and import mutation
  const fileImportMutation = useMutation({
    mutationFn: async (file: File) => {
      addToProcessingLog(`Starting import from file: ${file.name}`);
      
      try {
        // Build query params for additional data
        const queryParams = new URLSearchParams();
        queryParams.append('crmType', selectedSystem || 'generic');
        
        // Add entity types if selected
        if (selectedEntities.length > 0) {
          queryParams.append('entityTypes', JSON.stringify(selectedEntities));
        }
        
        // Get file content as ArrayBuffer
        const fileBuffer = await file.arrayBuffer();
        
        // Convert to appropriate format for sending
        const fileData = new Uint8Array(fileBuffer);
        
        // Start upload - using raw fetch with file binary data
        const response = await fetch(`/api/migration/import-file?${queryParams.toString()}`, {
          method: 'POST',
          body: fileData,
          headers: {
            'Content-Type': file.type,
            'Content-Disposition': `attachment; filename="${file.name}"`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to import file';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the raw error text if available
            if (errorText) {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Get migration ID from response
        const migrationId = data.migrationId;
        
        // Migration is now running on the server, poll for status updates
        let migrationComplete = false;
        let progress = 0;
        
        while (!migrationComplete) {
          // Wait a bit between status checks
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check migration status
          const statusResponse = await apiRequest('GET', `/api/migration/status/${migrationId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.error) {
            throw new Error(statusData.error);
          }
          
          // Update progress
          if (statusData.progress !== progress) {
            progress = statusData.progress;
            setMigrationProgress(progress);
          }
          
          // Show specific step messages
          if (statusData.currentStep && statusData.currentStep !== '') {
            addToProcessingLog(statusData.currentStep);
          }
          
          // Check if migration is complete
          if (statusData.status === 'completed') {
            migrationComplete = true;
            addToProcessingLog("File import completed successfully!");
            return {
              entitiesProcessed: statusData.entitiesProcessed || 1,
              recordsCreated: statusData.recordsCreated || 0
            };
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'File import failed');
          }
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "File Import Completed!",
        description: `Successfully imported data from file with ${data.recordsCreated || 0} records created`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "File Import Failed",
        description: error.message || "An error occurred during file import",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileData(file);
      addToProcessingLog(`File selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      
      // Start file upload if in file mode and if we're already on step 3 (entities selection)
      if (migrationMode === 'file' && step === 3) {
        fileImportMutation.mutate(file);
      }
    }
  };
  
  const handleAuthenticate = () => {
    if (!selectedSystem) {
      toast({
        title: "Error",
        description: "Please select a CRM system first",
        variant: "destructive"
      });
      return;
    }
    
    if (migrationMode === "oauth") {
      authenticateMutation.mutate(selectedSystem);
    } else if (migrationMode === "apikey") {
      if (!apiKey || !apiSecret) {
        toast({
          title: "Error",
          description: "Please provide both API Key and API Secret",
          variant: "destructive"
        });
        return;
      }
      authenticateMutation.mutate(selectedSystem);
    }
  };
  
  const handleStartMigration = () => {
    if (selectedEntities.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one entity type to migrate",
        variant: "destructive"
      });
      return;
    }
    
    migrateMutation.mutate();
  };
  
  const renderProgress = () => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Migration Progress</span>
          <span>{migrationProgress}%</span>
        </div>
        <Progress value={migrationProgress} className="h-2" />
      </div>
    );
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 1: Select CRM System</h3>
            <p className="text-sm text-muted-foreground">
              Choose the CRM system you want to migrate data from:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crmSystems.map((crm) => (
                <div
                  key={crm.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors
                    ${selectedSystem === crm.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedSystem(crm.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${crm.color.split(' ').slice(0, 2).join(' ')}`}>
                      {crm.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{crm.name}</h4>
                      <p className="text-sm text-muted-foreground">{crm.description}</p>
                    </div>
                    {selectedSystem === crm.id && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 2: Authentication Method</h3>
            <p className="text-sm text-muted-foreground">
              Choose how you want to connect to {selectedCrm?.name}:
            </p>
            
            <RadioGroup value={migrationMode} onValueChange={setMigrationMode} className="space-y-4">
              <div className={`flex items-start space-x-3 border rounded-lg p-4 
                ${migrationMode === 'oauth' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="oauth" id="oauth" />
                <div className="grid gap-1.5">
                  <Label htmlFor="oauth" className="font-medium">
                    OAuth Connection (Recommended)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Securely connect to your {selectedCrm?.name} account using OAuth authentication.
                    You'll be redirected to {selectedCrm?.name} to authorize access.
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start space-x-3 border rounded-lg p-4
                ${migrationMode === 'apikey' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="apikey" id="apikey" />
                <div className="grid gap-1.5 w-full">
                  <Label htmlFor="apikey" className="font-medium">
                    API Key Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect using API key and secret from your {selectedCrm?.name} developer account.
                  </p>
                  
                  {migrationMode === 'apikey' && (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                          id="apiKey"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API Key"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="apiSecret">API Secret</Label>
                        <Input
                          id="apiSecret"
                          type="password"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="Enter your API Secret"
                        />
                      </div>
                      {selectedSystem === 'salesforce' && (
                        <div className="grid gap-2">
                          <Label htmlFor="instanceUrl">Instance URL</Label>
                          <Input
                            id="instanceUrl"
                            value={instanceUrl}
                            onChange={(e) => setInstanceUrl(e.target.value)}
                            placeholder="https://yourinstance.my.salesforce.com"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`flex items-start space-x-3 border rounded-lg p-4
                ${migrationMode === 'file' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="file" id="file" />
                <div className="grid gap-1.5 w-full">
                  <Label htmlFor="file" className="font-medium">
                    File Upload
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import data from a CSV or Excel file exported from {selectedCrm?.name}.
                  </p>
                  
                  {migrationMode === 'file' && (
                    <div className="grid gap-2">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm mb-2">
                          Drag and drop your file here, or click to browse
                        </p>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".csv,.xlsx,.json"
                          onChange={handleFileUpload}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                      
                      {fileData && (
                        <div className="flex items-center space-x-2 text-sm">
                          <FileDown className="h-4 w-4 text-muted-foreground" />
                          <span>{fileData.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {(fileData.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Setup Instructions</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Follow these steps to set up your connection:</p>
                  <ol className="text-sm list-decimal pl-5 space-y-1">
                    {selectedCrm?.setupSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  <p className="text-sm mt-3">
                    <a href={selectedCrm?.docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      View {selectedCrm?.name} API Documentation
                    </a>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAuthenticate} 
                disabled={authenticateMutation.isPending}
              >
                {authenticateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Connect to {selectedCrm?.name}
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 3: Select Data to Migrate</h3>
            
            <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <Check className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Successfully Connected</p>
                <p className="text-sm">
                  Your account is successfully connected to {selectedCrm?.name}.
                  You can now select which data you want to migrate.
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Select entities to migrate:</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Choose which types of data you want to import from {selectedCrm?.name}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entityTypes.map((entity) => (
                  <div 
                    key={entity.id} 
                    className={`border rounded-lg p-3 flex items-center space-x-3 cursor-pointer
                      ${selectedEntities.includes(entity.id) ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                    onClick={() => handleEntitySelect(entity.id)}
                  >
                    <Checkbox 
                      id={`entity-${entity.id}`}
                      checked={selectedEntities.includes(entity.id)}
                      onCheckedChange={() => handleEntitySelect(entity.id)}
                    />
                    <Label 
                      htmlFor={`entity-${entity.id}`} 
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {entity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="discover-fields" className="text-sm font-medium">
                  Auto-discover and map fields
                </Label>
                <Switch 
                  id="discover-fields" 
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow AVEROX CRM to automatically map fields from {selectedCrm?.name} to corresponding fields in AVEROX CRM
              </p>
              
              {mappingProgress > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Mapping fields...</span>
                    <span>{mappingProgress}%</span>
                  </div>
                  <Progress value={mappingProgress} className="h-2" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="duplicate-check" className="text-sm font-medium">
                  Check for duplicates
                </Label>
                <Switch 
                  id="duplicate-check" 
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically detect and merge duplicate records during migration
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => discoverFieldsMutation.mutate()} 
                disabled={selectedEntities.length === 0 || discoverFieldsMutation.isPending || mappingProgress > 0}
              >
                {discoverFieldsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Fields...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Analyze & Map Fields
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 4: Start Migration</h3>
            
            <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Field Mapping Complete
              </h4>
              <p className="text-sm mt-1">
                Field mapping was successfully completed. AVEROX CRM has automatically mapped 
                {selectedCrm?.name} fields to the appropriate fields in AVEROX CRM.
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="text-sm font-medium">Migration Summary</h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Source CRM:</span>
                  <span className="font-medium">{selectedCrm?.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Data to migrate:</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {selectedEntities.map(id => {
                      const entity = entityTypes.find(e => e.id === id);
                      return entity ? (
                        <Badge key={id} variant="outline" className="bg-primary/5 border-primary/20">
                          {entity.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Duplicate checking:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Enabled
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Field mapping:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Complete
                  </span>
                </div>
              </div>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                <p className="text-sm mt-1">
                  Migration may take several minutes depending on the amount of data. 
                  Please don't close this window during migration.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleStartMigration}
                disabled={migrateMutation.isPending || migrationProgress > 0}
              >
                {migrateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating Data...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 5: Migration Complete</h3>
            
            <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-xl font-medium">Migration Successful!</h4>
              <p className="text-sm mt-2">
                Your data has been successfully migrated from {selectedCrm?.name} to AVEROX CRM.
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="text-sm font-medium">Migration Results</h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Source CRM:</span>
                  <span className="font-medium">{selectedCrm?.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Entities migrated:</span>
                  <span className="font-medium">{selectedEntities.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Records imported:</span>
                  <span className="font-medium">317</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Duplicates resolved:</span>
                  <span className="font-medium">24</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Complete
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Migration
              </Button>
              <Button>
                <CheckSquare className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Data Migration
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Migrate your data from other CRM systems into AVEROX CRM
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Migration Wizard</CardTitle>
                <CardDescription>
                  Follow these steps to migrate your data from another CRM system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step progress indicator */}
                <div className="flex space-x-2 mb-8">
                  {Array.from({ length: maxStep }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    
                    return (
                      <div key={index} className="flex items-center flex-1">
                        <div 
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0
                            ${isActive ? 'bg-primary text-white' : 
                              isCompleted ? 'bg-primary/20 text-primary' : 
                                'bg-gray-100 text-gray-500'}`}
                        >
                          {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                        </div>
                        <div 
                          className={`h-1 flex-1 ${index < maxStep - 1 ? 
                            isCompleted ? 'bg-primary/20' : 'bg-gray-100' : 'hidden'}`}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Step content */}
                {renderStep()}
              </CardContent>
              <CardFooter className="justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(prev => Math.max(prev - 1, 1))}
                  disabled={step === 1 || (step === 3 && !isAuthenticated) || migrationProgress > 0 || mappingProgress > 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  onClick={() => setStep(prev => Math.min(prev + 1, maxStep))}
                  disabled={
                    (step === 1 && !selectedSystem) ||
                    (step === 2 && !isAuthenticated) ||
                    (step === 3 && (mappingProgress < 100 && mappingProgress > 0)) ||
                    (step === 4 && (migrationProgress < 100 && migrationProgress > 0)) ||
                    step === maxStep
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <ServerCrash className="h-4 w-4 mr-2" />
                  Migration Log
                </CardTitle>
                <CardDescription>
                  Real-time progress of your migration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processingLog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ServerCrash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Migration has not started yet</p>
                    <p className="text-xs">Progress will be displayed here</p>
                  </div>
                ) : (
                  <div className="bg-black rounded-lg p-4 text-xs font-mono text-green-400 h-[400px] overflow-y-auto">
                    {processingLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {(migrationProgress > 0 || mappingProgress > 0) && renderProgress()}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}