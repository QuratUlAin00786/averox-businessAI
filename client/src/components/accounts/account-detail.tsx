import { EntityReminders } from "@/components/shared/entity-reminders";
import { useState, useEffect } from "react";
import { Account } from "@shared/schema";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  User, 
  RefreshCw, 
  Pencil, 
  X,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { FaWhatsapp, FaSms } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommunicationPanel } from "@/components/communications/communication-panel";
import { AccountCommunications } from "@/components/accounts/account-communications";
import AssignmentManager from "@/components/assignment/assignment-manager";

interface AccountDetailProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (account: Account) => void;
}

export function AccountDetail({
  account,
  isOpen,
  onClose,
  onEdit
}: AccountDetailProps) {
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen && !!account} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {account ? (
          <div className="flex flex-col h-[80vh]">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl">{account.name}</DialogTitle>
                <Badge 
                  variant={account.isActive ? "default" : "secondary"}
                >
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Account Information</h3>
                  <div className="space-y-4">
                    {account.industry && (
                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Industry</p>
                          <p className="text-sm text-neutral-600">{account.industry}</p>
                        </div>
                      </div>
                    )}
                    {account.website && (
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Website</p>
                          <a 
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {account.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {account.phone && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Phone</p>
                          <p className="text-sm text-neutral-600">{account.phone}</p>
                        </div>
                      </div>
                    )}
                    {account.email && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Email</p>
                          <a 
                            href={`mailto:${account.email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {account.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {(account.billingAddress || account.billingCity || account.billingState || account.billingCountry) && (
                      <div className="flex items-start">
                        <CreditCard className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Billing Address</p>
                          <p className="text-sm text-neutral-600">
                            {account.billingAddress && <>{account.billingAddress}<br /></>}
                            {account.billingCity && account.billingCity}
                            {account.billingState && `, ${account.billingState}`} 
                            {account.billingZip && ` ${account.billingZip}`}
                            {account.billingCountry && <><br />{account.billingCountry}</>}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(account.address || account.city || account.state || account.country) && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Physical Location</p>
                          <p className="text-sm text-neutral-600">
                            {account.address && <>{account.address}<br /></>}
                            {account.city && account.city}
                            {account.state && `, ${account.state}`} 
                            {account.zip && ` ${account.zip}`}
                            {account.country && <><br />{account.country}</>}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Created On</p>
                        <p className="text-sm text-neutral-600">{formatDate(account.createdAt)}</p>
                      </div>
                    </div>
                    {account.annualRevenue && (
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Annual Revenue</p>
                          <p className="text-sm text-neutral-600">
                            {typeof account.annualRevenue === 'number' 
                              ? new Intl.NumberFormat('en-US', { 
                                  style: 'currency', 
                                  currency: 'USD',
                                  maximumFractionDigits: 0 
                                }).format(account.annualRevenue)
                              : account.annualRevenue
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">Additional Information</h3>
                  <div className="space-y-4">
                    {account.type && (
                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Account Type</p>
                          <p className="text-sm text-neutral-600">{account.type}</p>
                        </div>
                      </div>
                    )}
                    {account.ownerId && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Account Owner</p>
                          <p className="text-sm text-neutral-600">ID: {account.ownerId}</p>
                        </div>
                      </div>
                    )}
                    {account.numberOfEmployees && (
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-neutral-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Employees</p>
                          <p className="text-sm text-neutral-600">{account.numberOfEmployees}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Tabs defaultValue="communications" className="mt-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="reminders">Reminders</TabsTrigger>
                    <TabsTrigger value="communications" title="Click to view all communication channels and history, including phone, SMS, WhatsApp">
                      Communications
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                      Assignments
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 text-sm min-h-[100px]">
                        {account.notes || "No notes available for this account."}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reminders">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Reminders</CardTitle>
                        <CardDescription>Set reminders for follow-ups and important dates</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <EntityReminders
                          entityId={account.id}
                          entityType="account"
                          entityName={account.name}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="communications">
                    <div className="space-y-4">
                      {/* Account communications component */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">Communications</CardTitle>
                          <CardDescription>
                            Message history related to this account
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AccountCommunications 
                            accountId={account.id}
                            accountName={account.name || ""}
                            email={account.email || ""}
                            phone={String(account.phone || "")}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assignments">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Assignment Management</CardTitle>
                        <CardDescription>Assign this account to users or teams</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <AssignmentManager 
                          entityType="account" 
                          entityId={account.id} 
                          entityName={account.name}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 flex justify-end gap-2 border-t flex-shrink-0">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="outline" onClick={() => onEdit(account)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
            <p className="ml-2">Loading account information...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}