import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/react-app/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/react-app/components/ui/table";
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
import { api } from "@/react-app/lib/api";

interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  currentQuantity: number;
  unit: string;
  lowStockThreshold: number;
  category?: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventory = async () => {
    try {
      const data = await api.getInventory();
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch inventory:", error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem?.name || currentItem.currentQuantity === undefined) return;

    setSaving(true);
    try {
      if (currentItem._id) {
        await api.updateInventoryItem(currentItem._id, currentItem);
      } else {
        await api.createInventoryItem(currentItem);
      }
      setIsDialogOpen(false);
      fetchInventory();
    } catch (error) {
      console.error("Failed to save item:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.deleteInventoryItem(id);
      fetchInventory();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const openEdit = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setCurrentItem({
      name: "",
      currentQuantity: 0,
      unit: "units",
      lowStockThreshold: 5,
      category: "General"
    });
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-950">Inventory</h1>
          <p className="text-purple-700 mt-1">Track resources, stock levels, and automated alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentItem?._id ? "Edit Item" : "Add New Item"}</DialogTitle>
                <DialogDescription>
                  Configure inventory details and low stock thresholds.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Item Name</label>
                    <Input
                      value={currentItem?.name || ""}
                      onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                      placeholder="e.g. Shampoo Bottles, Towels"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={currentItem?.category || ""}
                      onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}
                      placeholder="Supplies"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Type</label>
                    <Input
                      value={currentItem?.unit || ""}
                      onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}
                      placeholder="pcs, kg, liters"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Quantity</label>
                    <Input
                      type="number"
                      value={currentItem?.currentQuantity || 0}
                      onChange={e => setCurrentItem({ ...currentItem, currentQuantity: parseInt(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Low Stock Threshold</label>
                    <Input
                      type="number"
                      value={currentItem?.lowStockThreshold || 0}
                      onChange={e => setCurrentItem({ ...currentItem, lowStockThreshold: parseInt(e.target.value) })}
                      min="0"
                    />
                    <p className="text-[10px] text-gray-500">Alerts sent when stock drops below this.</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input
                      value={currentItem?.description || ""}
                      onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-purple-600">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 border-none bg-transparent focus-visible:ring-0 pl-0 placeholder:text-gray-400"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredItems.length} items found
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-purple-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{item.name}</div>
                          {item.description && <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.description}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category || "General"}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.currentQuantity} <span className="text-gray-500 text-xs font-normal">{item.unit}</span></div>
                    </TableCell>
                    <TableCell>
                      {item.currentQuantity <= item.lowStockThreshold ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-gray-500 hover:text-purple-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No inventory items</h3>
              <p className="mb-4">Get started by adding your first resource or product.</p>
              <Button onClick={openNew} variant="outline">Add Item</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
