import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Vehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditVehicleForm } from "@/components/edit-vehicle-form";

export default function Inventory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const { data, isLoading } = useQuery<{
    user: { id: string; email: string; dealershipId: string };
    dealership: { id: string; name: string } | null;
  }>({
    queryKey: ["/api/auth/me"],
  });

  const dealership = data?.dealership;

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/dealerships", dealership?.id, "vehicles"],
    enabled: !!dealership?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealerships"] });
      toast({
        title: "Vehicle deleted",
        description: "Your vehicle has been deleted successfully.",
      });
      setDeleteVehicleId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isLoadingVehicles) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Inventory Management</h2>
          <p className="text-muted-foreground">
            Add and manage your vehicle inventory
          </p>
        </div>
        <Button
          onClick={() => setLocation("/add-vehicle")}
          data-testid="button-add-vehicle"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="bg-gradient-to-br from-primary/10 to-primary-purple/10">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              <div className="bg-background rounded-full p-4 inline-block">
                <Car className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">No Vehicles Yet</CardTitle>
            <CardDescription className="text-base">
              Start building your inventory by adding your first vehicle
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => setLocation("/add-vehicle")}
              size="lg"
              data-testid="button-add-first-vehicle"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} data-testid={`card-vehicle-${vehicle.id}`}>
              {vehicle.imageUrl && (
                <div className="w-full h-48 bg-muted flex items-center justify-center overflow-hidden rounded-t-lg">
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                    data-testid={`img-vehicle-${vehicle.id}`}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl" data-testid={`text-vehicle-title-${vehicle.id}`}>
                  {vehicle.title}
                </CardTitle>
                <CardDescription>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary" data-testid={`text-vehicle-price-${vehicle.id}`}>
                    {vehicle.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditVehicle(vehicle)}
                    data-testid={`button-edit-${vehicle.id}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteVehicleId(vehicle.id)}
                    data-testid={`button-delete-${vehicle.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Vehicle Dialog */}
      <Dialog open={!!editVehicle} onOpenChange={(open) => !open && setEditVehicle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle details and image
            </DialogDescription>
          </DialogHeader>
          {editVehicle && (
            <EditVehicleForm
              vehicle={editVehicle}
              onSuccess={() => setEditVehicle(null)}
              onCancel={() => setEditVehicle(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVehicleId} onOpenChange={(open) => !open && setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete" disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteVehicleId) return;
                await deleteMutation.mutateAsync(deleteVehicleId);
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
