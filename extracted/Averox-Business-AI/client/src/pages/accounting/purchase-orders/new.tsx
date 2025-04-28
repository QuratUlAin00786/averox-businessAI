import PurchaseOrderForm from "@/components/accounting/PurchaseOrderForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPurchaseOrder() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderForm />
        </CardContent>
      </Card>
    </div>
  );
}