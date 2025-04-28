import CategoryForm from "@/components/inventory/CategoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCategory() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}