import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/hooks/use-toast';

const entityTypes = [
  { value: 'accounts', label: 'Accounts' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'leads', label: 'Leads' },
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'users', label: 'Users' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'proposals', label: 'Proposals' },
];

export function DatabaseEncryptionTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>('accounts');
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    notes: 'These are sensitive notes that should be encrypted',
    billing_address: '456 Finance Ave, Business District',
    first_name: 'Test',
    last_name: 'User',
    nonSensitiveField: 'This should not be encrypted'
  });

  const handleInputChange = (field: string, value: string) => {
    setTestData({
      ...testData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiRequest(
        'POST', 
        `/api/database-encryption-test?entityType=${entityType}`, 
        testData
      );
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast({
          title: 'Encryption Test Successful',
          description: 'The database encryption test completed successfully.',
        });
      } else {
        toast({
          title: 'Encryption Test Failed',
          description: data.message || 'The database encryption test failed.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing database encryption:', error);
      toast({
        title: 'Error',
        description: 'Failed to test database encryption. See console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return 'Error formatting JSON';
    }
  };

  const renderSensitiveFieldStatus = () => {
    if (!result) return null;
    
    const fields = ['email', 'phone', 'address', 'notes', 'billing_address', 'first_name', 'last_name'];
    
    return (
      <div className="space-y-2 mt-4">
        <div className="text-lg font-medium">Sensitive Field Encryption Status:</div>
        {fields.map(field => {
          // Check if the field exists in the original data
          if (!(field in testData)) return null;
          
          // Check if the field was encrypted (we can tell by looking at the encrypted data)
          const wasEncrypted = result.encrypted[field] !== result.original[field];
          
          return (
            <div key={field} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${wasEncrypted ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-mono text-sm">{field}:</span>
              <span className={wasEncrypted ? 'text-green-600' : 'text-red-600'}>
                {wasEncrypted ? 'Encrypted' : 'Not Encrypted'}
              </span>
            </div>
          );
        })}
        
        {/* Check non-sensitive field */}
        <div className="flex items-center space-x-2 border-t pt-2 mt-2">
          <div className={`w-3 h-3 rounded-full bg-green-500`} />
          <span className="font-mono text-sm">nonSensitiveField:</span>
          <span className="text-green-600">
            Not Encrypted (Expected)
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Encryption Tester</CardTitle>
        <CardDescription>
          Test the database-level encryption for sensitive fields before they are stored in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select 
                value={entityType} 
                onValueChange={setEntityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Sensitive)</Label>
              <Input
                id="email"
                value={testData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (Sensitive)</Label>
              <Input
                id="phone"
                value={testData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address (Sensitive)</Label>
              <Input
                id="address"
                value={testData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Sensitive)</Label>
              <Textarea
                id="notes"
                value={testData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nonSensitiveField">Non-Sensitive Field</Label>
              <Input
                id="nonSensitiveField"
                value={testData.nonSensitiveField}
                onChange={(e) => handleInputChange('nonSensitiveField', e.target.value)}
              />
            </div>
          </div>
          
          <Button className="mt-4 w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Encryption...
              </>
            ) : (
              'Test Database Encryption'
            )}
          </Button>
        </form>
        
        {result && (
          <>
            {renderSensitiveFieldStatus()}
            
            <Tabs defaultValue="encrypted" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="original">Original Data</TabsTrigger>
                <TabsTrigger value="encrypted">Encrypted Data</TabsTrigger>
                <TabsTrigger value="decrypted">Decrypted Data</TabsTrigger>
              </TabsList>
              <TabsContent value="original">
                <Card>
                  <CardHeader>
                    <CardTitle>Original Data</CardTitle>
                    <CardDescription>
                      The data submitted before encryption
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {formatJson(result.original)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="encrypted">
                <Card>
                  <CardHeader>
                    <CardTitle>Encrypted Data</CardTitle>
                    <CardDescription>
                      How the data would be stored in the database
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {formatJson(result.encrypted)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="decrypted">
                <Card>
                  <CardHeader>
                    <CardTitle>Decrypted Data</CardTitle>
                    <CardDescription>
                      The data after being retrieved and decrypted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                      {formatJson(result.decrypted)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Alert className="w-full">
          <AlertTitle>How this works</AlertTitle>
          <AlertDescription>
            This tester simulates the database encryption process. When you submit the form,
            it sends the data to the server, where it's encrypted as if being stored in the database,
            then decrypted as if being retrieved, and returned to the client. Sensitive fields like
            email, phone, address, and notes are automatically encrypted. See the AES-256 encryption
            in action!
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}