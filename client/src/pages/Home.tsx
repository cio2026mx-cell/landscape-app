import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Leaf, Package, Eraser, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    location: "",
    wateringFrequency: "",
    notes: "",
  });

  // Fetch plants
  const { data: plants = [], isLoading: plantsLoading, refetch } = trpc.plants.list.useQuery();

  // Create plant mutation
  const createPlant = trpc.plants.create.useMutation({
    onSuccess: () => {
      toast.success("Plant added successfully!");
      setFormData({ name: "", species: "", location: "", wateringFrequency: "", notes: "" });
      setFormOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("[Home] Create error:", error);
      toast.error(error.message || "Failed to add plant");
    },
  });

  // Delete plant mutation
  const deletePlant = trpc.plants.delete.useMutation({
    onSuccess: () => {
      toast.success("Plant deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.error("[Home] Delete error:", error);
      toast.error(error.message || "Failed to delete plant");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plant name is required");
      return;
    }
    await createPlant.mutateAsync(formData);
  };

  const handleDelete = async (plantId: number) => {
    if (confirm("Are you sure you want to delete this plant?")) {
      await deletePlant.mutateAsync({ id: plantId });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Landscape Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your landscape management assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setLocation("/plants")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plants.length}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setLocation("/inventory")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setLocation("/design")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Design Tools</CardTitle>
            <Eraser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Try Now</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quick Plant Management</h2>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Plant
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Plant</CardTitle>
            <CardDescription>Enter details about your new plant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plant Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monstera Deliciosa"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    placeholder="e.g., Monstera deliciosa"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Living Room"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="watering">Watering Frequency</Label>
                  <Input
                    id="watering"
                    placeholder="e.g., Weekly"
                    value={formData.wateringFrequency}
                    onChange={(e) => setFormData({ ...formData, wateringFrequency: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about your plant..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createPlant.isPending}>
                  {createPlant.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Plant
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {plantsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : plants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No plants yet. Add your first plant to get started!</p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Plant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <Card key={plant.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{plant.name}</CardTitle>
                {plant.species && <CardDescription>{plant.species}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  {plant.location && (
                    <div>
                      <span className="font-semibold">Location:</span> {plant.location}
                    </div>
                  )}
                  {plant.wateringFrequency && (
                    <div>
                      <span className="font-semibold">Watering:</span> {plant.wateringFrequency}
                    </div>
                  )}
                  {plant.notes && <div className="text-muted-foreground">{plant.notes}</div>}
                </div>
              </CardContent>
              <div className="px-6 py-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleDelete(plant.id)}
                  disabled={deletePlant.isPending}
                >
                  {deletePlant.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
