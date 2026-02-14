import { useState, useEffect } from "react";
import {
    Plus,
    Clock,
    DollarSign,
    MoreVertical,
    Loader2,
    Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Badge } from "@/react-app/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/react-app/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/react-app/components/ui/dropdown-menu";
import { api } from "@/react-app/lib/api";
import { toast } from "react-toastify";

interface Service {
    _id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    isActive: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        duration: 60,
        price: 0,
        description: "",
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await api.getServices();
            setServices(data.services || []);
        } catch (error) {
            toast.error("Failed to load services");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                duration: service.duration,
                price: service.price,
                description: service.description || "",
            });
        } else {
            setEditingService(null);
            setFormData({
                name: "",
                duration: 60,
                price: 0,
                description: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingService) {
                await api.updateService(editingService._id, { ...formData, isActive: editingService.isActive });
                toast.success("Service updated successfully");
            } else {
                await api.createService(formData);
                toast.success("Service created successfully");
            }
            setIsDialogOpen(false);
            fetchServices();
        } catch (error) {
            toast.error(editingService ? "Failed to update service" : "Failed to create service");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (service: Service) => {
        try {
            await api.updateService(service._id, { isActive: !service.isActive });
            toast.success(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
            fetchServices();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await api.deleteService(id);
            toast.success("Service deleted");
            fetchServices();
        } catch (error) {
            toast.error("Failed to delete service");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-950">Services</h1>
                    <p className="text-purple-700">Manage the services your business offers for booking.</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    </div>
                ) : services.length === 0 ? (
                    <Card className="col-span-full py-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                            <Wrench className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-purple-900">No services yet</h3>
                        <p className="text-purple-600 max-w-sm mt-2 mb-6">
                            Create your first service to start accepting bookings from your customers.
                        </p>
                        <Button onClick={() => handleOpenDialog()} variant="outline">
                            Create your first service
                        </Button>
                    </Card>
                ) : (
                    services.map((service) => (
                        <Card key={service._id} className="group hover:shadow-xl hover:shadow-purple-500/5 transition-all border-purple-100 overflow-hidden">
                            <CardHeader className="pb-3 border-b border-purple-50">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl text-purple-900 font-bold group-hover:text-purple-600 transition-colors">
                                            {service.name}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}>
                                                {service.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-400 hover:text-purple-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(service)}>
                                                Edit Service
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toggleStatus(service)}>
                                                {service.isActive ? "Deactivate" : "Activate"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(service._id)} className="text-red-600">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-purple-700">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <span>{service.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-purple-700">
                                        <DollarSign className="w-4 h-4 text-purple-400" />
                                        <span>{service.price > 0 ? `$${service.price}` : "Free"}</span>
                                    </div>
                                </div>
                                {service.description && (
                                    <p className="text-sm text-purple-600 line-clamp-2">
                                        {service.description}
                                    </p>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                                    onClick={() => handleOpenDialog(service)}
                                >
                                    Edit Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-purple-950">
                            {editingService ? "Edit Service" : "Add New Service"}
                        </DialogTitle>
                        <DialogDescription className="text-purple-700">
                            {editingService
                                ? "Update the details of your service offering."
                                : "Enter the details for your new service offering."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-purple-900">Service Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Haircut, Consultation"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="border-purple-100 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-purple-900">Duration (mins)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    required
                                    className="border-purple-100 focus:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-purple-900">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="border-purple-100 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-purple-900">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what's included in this service..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border-purple-100 focus:ring-purple-500 min-h-[100px]"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingService ? "Update Service" : "Create Service"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
