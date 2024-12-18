import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginLog {
  id: string;
  name: string;
  login_time: string;
  location: string | null;
  ip_address: string | null;
  photo_url: string | null;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);

  useEffect(() => {
    const fetchLoginLogs = async () => {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .order('login_time', { ascending: false });

      if (error) {
        console.error('Error fetching login logs:', error);
        return;
      }

      setLoginLogs(data || []);
    };

    fetchLoginLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" />
                Today's Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loginLogs.filter(log => 
                  new Date(log.login_time).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loginLogs.filter(log => 
                  new Date(log.login_time).getTime() > Date.now() - 30 * 60 * 1000
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Employee ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Login Time</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="p-2">{log.id}</td>
                      <td className="p-2">{log.name}</td>
                      <td className="p-2">{new Date(log.login_time).toLocaleString()}</td>
                      <td className="p-2">{log.location}</td>
                      <td className="p-2">{log.ip_address}</td>
                      <td className="p-2">
                        {log.photo_url && (
                          <img 
                            src={log.photo_url} 
                            alt="Login photo" 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}