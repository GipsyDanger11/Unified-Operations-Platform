import { Card, CardHeader, CardTitle } from "@/react-app/components/ui/card";

export default function BookingsPage() {
  return (
    <div className="p-6">
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-950">Bookings</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
