import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email from Averox CRM');
  const [testMessage, setTestMessage] = useState('This is a test email to verify the email configuration is working correctly.');

  // Test email connection
  const { data: connectionStatus, isLoading: isCheckingConnection } = useQuery({
    queryKey: ['/api/email/test-connection'],
    retry: false,
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; text: string }) => {
      return apiRequest('POST', '/api/email/send', data);
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "The test email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Test Email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive",
      });
    },
  });

  // Send welcome email mutation
  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async (data: { userEmail: string; userName: string }) => {
      return apiRequest('POST', '/api/email/welcome', data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome Email Sent",
        description: "The welcome email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Welcome Email",
        description: error.message || "An error occurred while sending the welcome email.",
        variant: "destructive",
      });
    },
  });

  const handleSendTestEmail = () => {
    if (!testEmail || !testSubject || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending the test email.",
        variant: "destructive",
      });
      return;
    }

    sendTestEmailMutation.mutate({
      to: testEmail,
      subject: testSubject,
      text: testMessage,
    });
  };

  const handleSendWelcomeEmail = () => {
    if (!testEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to send the welcome email.",
        variant: "destructive",
      });
      return;
    }

    sendWelcomeEmailMutation.mutate({
      userEmail: testEmail,
      userName: 'Test User',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Email Settings</h1>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Connection Status
          </CardTitle>
          <CardDescription>
            Check if the email service is properly configured and connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isCheckingConnection ? (
              <Badge variant="secondary">Checking...</Badge>
            ) : connectionStatus?.connected ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">Connected</Badge>
                <span className="text-sm text-muted-foreground">
                  Email service is configured and ready to send emails.
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <Badge variant="destructive">Disconnected</Badge>
                <span className="text-sm text-muted-foreground">
                  Email service is not configured or connection failed.
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Current Email Configuration</CardTitle>
          <CardDescription>
            The system is configured with the following email settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">SMTP Server</Label>
              <p className="text-sm text-muted-foreground">smtp.averox.com</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Port</Label>
              <p className="text-sm text-muted-foreground">465 (SSL)</p>
            </div>
            <div>
              <Label className="text-sm font-medium">From Email</Label>
              <p className="text-sm text-muted-foreground">123@averox.com</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Security</Label>
              <p className="text-sm text-muted-foreground">SSL/TLS Encryption</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify the email configuration is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="Enter email address to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testSubject">Subject</Label>
            <Input
              id="testSubject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testMessage">Message</Label>
            <Textarea
              id="testMessage"
              rows={4}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSendTestEmail}
              disabled={sendTestEmailMutation.isPending}
            >
              {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSendWelcomeEmail}
              disabled={sendWelcomeEmailMutation.isPending}
            >
              {sendWelcomeEmailMutation.isPending ? 'Sending...' : 'Send Welcome Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Email Templates</CardTitle>
          <CardDescription>
            The system includes the following pre-configured email templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Welcome Email</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically sent to new users when their account is created.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Password Reset</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Sent when users request a password reset with secure token.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Notification Email</h4>
              <p className="text-sm text-muted-foreground mt-1">
                General purpose notifications for system alerts and updates.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Admin Notifications</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Sent to administrators for new account registrations and alerts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}