import { useState, useEffect } from "react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/react-app/components/ui/table";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/react-app/lib/api";

interface Booking {
  _id: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  serviceType: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  customerNotes?: string;
  staffNotes?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // API supports status filtering
      const params = filter !== "all" ? { status: filter } : {};
      const data = await api.getBookings(params);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.updateBookingStatus(id, newStatus);
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    "no-show": "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-950">Bookings</h1>
          <p className="text-purple-700 mt-1">Manage your appointments and schedule.</p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "completed"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center p-12 text-purple-600">
              No bookings found for this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div className="font-medium">{booking.contact.firstName} {booking.contact.lastName}</div>
                      <div className="text-xs text-gray-500">{booking.contact.email}</div>
                    </TableCell>
                    <TableCell className="capitalize">{booking.serviceType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.dateTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 ${statusColors[booking.status] || "bg-gray-100"}`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => handleStatusUpdate(booking._id, 'confirmed')}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-purple-200" onClick={() => handleStatusUpdate(booking._id, 'completed')}>
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
