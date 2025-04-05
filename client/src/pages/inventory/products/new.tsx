import ProductForm from "@/components/inventory/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProduct() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}