import { useState } from "react";
import { Clock, MapPin, Users, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
// Switch removed as it was unused
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Badge } from "@/react-app/components/ui/badge";

interface BookingStepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  title?: string;
}

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BookingStep({ data, onNext, onBack, title }: BookingStepProps) {
  const [serviceName, setServiceName] = useState(data.serviceName || "");
  const [duration, setDuration] = useState(data.duration || "60");
  const [location, setLocation] = useState(data.location || "");
  const [capacity, setCapacity] = useState(data.capacity || "1");
  const [availableDays, setAvailableDays] = useState<string[]>(
    data.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  );
  const [startTime, setStartTime] = useState(data.startTime || "9:00 AM");
  const [endTime, setEndTime] = useState(data.endTime || "5:00 PM");
  const [conflictCheck, setConflictCheck] = useState(false);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const validateBooking = () => {
    setConflictCheck(true);
    setTimeout(() => setConflictCheck(false), 1000);
  };

  const handleNext = () => {
    onNext({
      serviceName,
      duration,
      location,
      capacity,
      availableDays,
      startTime,
      endTime,
    });
  };

  const isValid = serviceName && availableDays.length > 0;
  const publicUrl = "https://book.unifiedops.app/acme-services";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-purple-950">{title || "Booking Setup"}</h2>
        <p className="text-purple-700 mt-2">Configure your {title ? title.toLowerCase() : "service"} and details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Service Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Service Details</CardTitle>
              <CardDescription>Define what customers will book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName" className="text-purple-900">Service Name</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Consultation, Cleaning Service, Installation"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="bg-white border-purple-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-purple-900">Duration (minutes)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-white border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-purple-900">Capacity</Label>
                  <Select value={capacity} onValueChange={setCapacity}>
                    <SelectTrigger className="bg-white border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 booking at a time</SelectItem>
                      <SelectItem value="2">2 bookings at a time</SelectItem>
                      <SelectItem value="3">3 bookings at a time</SelectItem>
                      <SelectItem value="5">5 bookings at a time</SelectItem>
                      <SelectItem value="10">10 bookings at a time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-purple-900">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                  <Input
                    id="location"
                    placeholder="Service location or 'Remote'"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 bg-white border-purple-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-950">Availability</CardTitle>
              <CardDescription>Set your working hours and days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-purple-900 mb-3 block">Available Days</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${availableDays.includes(day)
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : "bg-white border-2 border-purple-200 text-purple-700 hover:border-purple-300"
                        }
                      `}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-900">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="bg-white border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-900">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger className="bg-white border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Real-time conflict validation</p>
                    <p className="text-xs text-blue-700 mt-1">
                      System will automatically check for booking conflicts and double-bookings
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={validateBooking} variant="outline" className="w-full" disabled={conflictCheck}>
                {conflictCheck ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Check for Conflicts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm text-purple-900">Booking Page Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-purple-950">
                      {serviceName || "Your Service"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-purple-700 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{duration} minutes</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                </div>

                {location && (
                  <div className="flex items-center gap-2 text-xs text-purple-700 pt-2 border-t border-purple-200">
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-purple-700">
                  <Users className="w-3 h-3" />
                  <span>Up to {capacity} {parseInt(capacity) === 1 ? "booking" : "bookings"} at a time</span>
                </div>

                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs font-medium text-purple-900 mb-2">Available:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableDays.length > 0 ? (
                      availableDays.map((day) => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {day.slice(0, 3)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-purple-600">No days selected</span>
                    )}
                  </div>
                  {availableDays.length > 0 && (
                    <p className="text-xs text-purple-600 mt-2">
                      {startTime} - {endTime}
                    </p>
                  )}
                </div>

                <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-purple-500 to-purple-600">
                  Select Time
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm text-purple-900">Public Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-xs font-mono text-purple-700 break-all">{publicUrl}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Open Preview
                </Button>
              </div>
            </CardContent>
          </Card>
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
