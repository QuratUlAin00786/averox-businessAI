import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { EncryptionTester } from '@/components/security/encryption-tester';
import { DatabaseEncryptionTester } from '@/components/security/database-encryption-tester';
import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Security Testing"
        subheading="Test the Averox CryptoSphere encryption functionality"
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">AES-256 Encryption</h2>
          <p className="mb-6 text-muted-foreground">
            This page allows you to test the encryption functionality implemented using the Averox 
            CryptoSphere SDK. The system uses AES-256 encryption to protect sensitive data across
            the application, ensuring that information is securely stored and transmitted.
          </p>
          
          <div className="bg-muted/40 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Features of the Encryption System:</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>AES-256 encryption for sensitive fields</li>
              <li>Field-specific encryption to maintain performance</li>
              <li>Transparent middleware integration</li>
              <li>Encryption key rotation support</li>
              <li>Performance monitoring for encryption operations</li>
              <li>Support for encrypted database connections</li>
              <li>Pre-database encryption of sensitive data</li>
              <li>Automatic field detection for sensitive information</li>
            </ul>
          </div>
          
          <Tabs defaultValue="middleware" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="middleware">Middleware Encryption</TabsTrigger>
              <TabsTrigger value="database">Database Encryption</TabsTrigger>
            </TabsList>
            <TabsContent value="middleware">
              <div className="p-2">
                <h3 className="text-lg font-medium mb-2">API Middleware Encryption</h3>
                <p className="text-muted-foreground mb-4">
                  Test the API middleware encryption that protects data during transit between client and server.
                  This encryption layer intercepts requests and responses to encrypt/decrypt sensitive fields.
                </p>
                <EncryptionTester />
              </div>
            </TabsContent>
            <TabsContent value="database">
              <div className="p-2">
                <h3 className="text-lg font-medium mb-2">Database-Level Encryption</h3>
                <p className="text-muted-foreground mb-4">
                  Test the database-level encryption that protects sensitive data before it's stored in the database.
                  This provides an additional layer of protection for data at rest.
                </p>
                <DatabaseEncryptionTester />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


