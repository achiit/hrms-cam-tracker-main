import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Camera } from 'lucide-react';
import { sendLoginNotification } from '@/utils/telegramBot';
import { supabase } from '@/integrations/supabase/client';
import CameraCapture from '@/components/employee/CameraCapture';
import AttendanceDetails from '@/components/employee/AttendanceDetails';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAttendanceRecorded, setIsAttendanceRecorded] = useState(false);

  useEffect(() => {
    // Fetch location and IP address
    const fetchLocationAndIP = async () => {
      try {
        // Get geolocation
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);

        // Get IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Error fetching location or IP:', error);
        
        // Fallback for location
        setLocation('Location not available');
        
        // Fallback for IP
        setIpAddress('IP not available');

        toast({
          title: "Location/IP Error",
          description: "Could not retrieve location or IP address.",
          variant: "destructive"
        });
      }
    };

    fetchLocationAndIP();
  }, []);

  const handlePhotoCapture = async (blob: Blob) => {
    // Validate user exists
    if (!user?.id || !user?.name) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    setIsCapturing(true);
    try {
      // Validate location and IP
      if (location === 'Location not available' || ipAddress === 'IP not available') {
        throw new Error('Location or IP not available');
      }

      // Upload to Supabase Storage with error handling
      const fileName = `login-${user.id}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('login-photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload photo');
      }

      // Get public URL safely
      const { data: { publicUrl } } = supabase.storage
        .from('login-photos')
        .getPublicUrl(fileName);

      // Create login log entry
      const { error: logError } = await supabase
        .from('login_logs')
        .insert({
          name: user.name,
          login_time: new Date().toISOString(),
          location,
          ip_address: ipAddress,
          photo_url: publicUrl
        });

      if (logError) {
        console.error('Log error:', logError);
        throw new Error('Failed to record attendance');
      }

      // Send notification to Telegram
      await sendLoginNotification({
        id: user.id,
        name: user.name,
        loginTime: new Date().toISOString(),
        location,
        ipAddress,
        photoUrl: publicUrl,
      });

      setIsAttendanceRecorded(true);
      
      toast({
        title: "Success",
        description: "Your attendance has been successfully recorded",
      });
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast({
        title: "Attendance Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {!isAttendanceRecorded ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2" />
                Attendance Camera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraCapture 
                onPhotoCapture={handlePhotoCapture}
                isCapturing={isCapturing}
              />
            </CardContent>
          </Card>
        ) : (
          <AttendanceDetails
            userName={user?.name}
            location={location}
            ipAddress={ipAddress}
            onLogout={logout}
          />
        )}
      </div>
    </div>
  );
}