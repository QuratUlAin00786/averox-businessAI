import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ShieldAlert, AlertCircle, Key } from "lucide-react";

/**
 * Component for testing encryption functionality
 * This allows sending sensitive data to the encryption-test endpoint
 * and verifying that encryption/decryption is working
 */
export function EncryptionTester() {
  const [inputData, setInputData] = useState<string>('');
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert input to JSON if in JSON mode
      let parsedData: any;
      
      if (jsonMode) {
        try {
          parsedData = JSON.parse(inputData);
        } catch (err) {
          setError("Invalid JSON format. Please check your input.");
          setLoading(false);
          return;
        }
      } else {
        parsedData = { text: inputData };
      }
      
      // Make the API call to test encryption
      const response = await apiRequest(
        'POST',
        '/api/encryption-test',
        parsedData
      );
      
      const responseData = await response.json();
      setResult(responseData);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6 mx-auto max-w-3xl">
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Averox CryptoSphere Encryption Tester
          </CardTitle>
          <CardDescription>
            Test the AES-256 encryption functionality by submitting data to be encrypted and decrypted
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="inputMode" className="block mb-2">Input Format</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="textMode"
                    name="inputMode"
                    checked={!jsonMode}
                    onChange={() => setJsonMode(false)}
                    className="mr-2"
                  />
                  <Label htmlFor="textMode">Plain Text</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="jsonMode"
                    name="inputMode"
                    checked={jsonMode}
                    onChange={() => setJsonMode(true)}
                    className="mr-2"
                  />
                  <Label htmlFor="jsonMode">JSON</Label>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="inputData" className="block mb-2">
                {jsonMode ? 'JSON Data (with sensitive fields)' : 'Text to Encrypt'}
              </Label>
              
              {jsonMode ? (
                <Textarea
                  id="inputData"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder={`{\n  "email": "jane.doe@example.com",\n  "firstName": "Jane",\n  "lastName": "Doe",\n  "phone": "+1-555-123-4567",\n  "notes": "Sensitive customer information"\n}`}
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  id="inputData"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Enter sensitive text to encrypt"
                  className="mb-4"
                />
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                {jsonMode 
                  ? 'Enter a JSON object with fields that should be encrypted. Fields like "email", "phone", and "notes" will be encrypted.'
                  : 'Enter plain text that will be encrypted and decrypted by the server.'}
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !inputData}
              className="w-full"
            >
              {loading ? 'Testing Encryption...' : 'Test Encryption'}
            </Button>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="mt-6">
              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.success ? 'Encryption Test Successful' : 'Encryption Test Failed'}
                </AlertTitle>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Response Details:</h4>
                <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  Encryption Status: <span className="font-semibold">{result.encryption_enabled ? 'Enabled' : 'Disabled'}</span>
                </p>
                <p>
                  Timestamp: {result.timestamp}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 text-xs text-muted-foreground">
          Averox CryptoSphere uses AES-256 encryption to protect sensitive data
        </CardFooter>
      </Card>
    </div>
  );
}