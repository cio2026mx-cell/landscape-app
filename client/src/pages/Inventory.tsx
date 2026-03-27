import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Inventory() {
  const { user, loading: authLoading } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: 0,
    category: "",
  });

  // Fetch inventory
  const { data: inventory = [], isLoading: inventoryLoading, refetch } = trpc.inventory.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Create inventory item mutation
  const createItem = trpc.inventory.create.useMutation({
    onSuccess: () => {
      toast.success("Item added to inventory!");
      setFormData({ itemName: "", quantity: 0, category: "" });
      setFormOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("[Inventory] Create error:", error);
      toast.error(error.message || "Failed to add item");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim()) {
      toast.error("Item name is required");
      return;
    }
    await createItem.mutateAsync(formData);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view your inventory.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-2">Manage your gardening supplies</p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Add Item Form */}
      {formOpen && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Inventory Item</CardTitle>
            <CardDescription>Add a new item to your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Potting Soil"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Soil, Nutrients, Tools"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createItem.isPending}>
                  {createItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Item
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      {inventoryLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : inventory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No inventory items yet. Add your first item!</p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Item Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium">{item.itemName}</td>
                      <td className="px-6 py-4 text-sm">{item.category || "-"}</td>
                      <td className="px-6 py-4 text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
