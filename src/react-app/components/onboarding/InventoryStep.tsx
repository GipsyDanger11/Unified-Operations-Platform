
import { useState } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Badge } from "@/react-app/components/ui/badge";

interface InventoryStepProps {
    data: Record<string, any>;
    onNext: (data: Record<string, any>) => void;
    onBack: () => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    title?: string;
}

export default function InventoryStep({ data, onNext, onBack, title }: InventoryStepProps) {
    const [name, setName] = useState(data.inventoryName || "");
    const [quantity, setQuantity] = useState(data.inventoryQuantity || "0");
    const [unit, setUnit] = useState(data.inventoryUnit || "units");
    const [threshold, setThreshold] = useState(data.inventoryThreshold || "5");

    const handleNext = () => {
        onNext({
            inventoryName: name,
            inventoryQuantity: quantity,
            inventoryUnit: unit,
            inventoryThreshold: threshold,
        });
    };

    const isValid = name && quantity;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-purple-950">{title || "Inventory Setup"}</h2>
                <p className="text-purple-700 mt-2">Track your essential items and get low-stock alerts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-950">Add First Item</CardTitle>
                            <CardDescription>Add a key item you need to track</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-purple-900">Item Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Shampoo, Spare Parts, Office Supplies"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-purple-200"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity" className="text-purple-900">Current Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-white border-purple-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit" className="text-purple-900">Unit</Label>
                                    <Select value={unit} onValueChange={setUnit}>
                                        <SelectTrigger id="unit" className="bg-white border-purple-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="units">Units</SelectItem>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="liters">Liters (L)</SelectItem>
                                            <SelectItem value="packs">Packs</SelectItem>
                                            <SelectItem value="boxes">Boxes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="threshold" className="text-purple-900">Low Stock Alert Threshold</Label>
                                <div className="relative">
                                    <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-orange-500" />
                                    <Input
                                        id="threshold"
                                        type="number"
                                        placeholder="5"
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="pl-10 bg-white border-purple-200"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">We'll notify you when stock falls below this level.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview / Context */}
                <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-sm text-purple-900">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-purple-950">{name || "Item Name"}</h3>
                                        <p className="text-xs text-purple-700">{quantity} {unit} in stock</p>
                                    </div>
                                </div>
                                {Number(quantity) <= Number(threshold) ? (
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                        Low Stock
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                        In Stock
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Why Inventory?</h4>
                        <p className="text-xs text-blue-700">
                            Tracking inventory helps prevent stockouts. You can link items to services so they are automatically deducted when a booking is completed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-3 pt-4">
                <Button onClick={onBack} variant="outline">
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isValid}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
