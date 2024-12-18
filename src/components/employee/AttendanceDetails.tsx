import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

interface AttendanceDetailsProps {
  userName?: string;
  location: string;
  ipAddress: string;
  onLogout: () => void;
}

export default function AttendanceDetails({ 
  userName, 
  location, 
  ipAddress, 
  onLogout 
}: AttendanceDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Location:</strong> {location}</p>
            <p><strong>IP Address:</strong> {ipAddress}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}