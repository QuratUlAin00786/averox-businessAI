import InvoiceForm from "@/components/accounting/InvoiceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInvoice() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm />
        </CardContent>
      </Card>
    </div>
  );
}