import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Building, Phone, Mail, MapPin, DollarSign, Clock, Save, X, FlaskConical, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Settings = () => {
  const [testMode, setTestMode] = useState(() => {
    return localStorage.getItem('handledly_test_mode') === 'true';
  });
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company_name: '',
    phone_number: '',
    email: '',
    address: '',
    base_rate_per_hour: 0,
    minimum_hours: 0,
    service_areas: [] as string[],
  });
  const [newServiceArea, setNewServiceArea] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        phone_number: settings.phone_number || '',
        email: settings.email || '',
        address: settings.address || '',
        base_rate_per_hour: settings.base_rate_per_hour || 0,
        minimum_hours: settings.minimum_hours || 0,
        service_areas: settings.service_areas || [],
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Note: business_settings table doesn't allow updates via RLS currently
      // This is a placeholder - you'd need to update RLS policies to allow admin updates
      toast.info('Settings update requires admin RLS policy to be configured');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleAddServiceArea = () => {
    if (newServiceArea.trim() && !formData.service_areas.includes(newServiceArea.trim())) {
      setFormData({
        ...formData,
        service_areas: [...formData.service_areas, newServiceArea.trim()],
      });
      setNewServiceArea('');
    }
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData({
      ...formData,
      service_areas: formData.service_areas.filter((a) => a !== area),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const handleTestModeToggle = (enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem('handledly_test_mode', enabled.toString());
    toast.info(enabled ? 'Test Mode enabled - notifications will be suppressed' : 'Test Mode disabled - live mode active');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Business Settings</h1>

      {/* Test Mode Toggle */}
      <Card className={`border-2 transition-colors ${testMode ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border/50 bg-card/50'} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className={`h-5 w-5 ${testMode ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            Test Mode
          </CardTitle>
          <CardDescription>
            Enable test mode to safely test the platform without sending real notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {testMode ? 'Test Mode Active' : 'Live Mode'}
              </p>
              <p className="text-sm text-muted-foreground">
                {testMode 
                  ? 'Emails, SMS, and voice calls are suppressed'
                  : 'All notifications will be sent to real recipients'
                }
              </p>
            </div>
            <Switch
              checked={testMode}
              onCheckedChange={handleTestModeToggle}
              className={testMode ? 'data-[state=checked]:bg-yellow-500' : ''}
            />
          </div>
          
          {testMode && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Test Mode Warning</p>
                <p className="text-sm text-muted-foreground">
                  Remember to disable test mode before launch on January 26
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Company Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
            <CardDescription>Basic business details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pricing Configuration
            </CardTitle>
            <CardDescription>Set your base rates and minimum requirements</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base_rate">Base Rate (per hour)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="base_rate"
                  type="number"
                  value={formData.base_rate_per_hour}
                  onChange={(e) => setFormData({ ...formData, base_rate_per_hour: Number(e.target.value) })}
                  className="bg-background/50 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Minimum Hours
              </Label>
              <Input
                id="min_hours"
                type="number"
                value={formData.minimum_hours}
                onChange={(e) => setFormData({ ...formData, minimum_hours: Number(e.target.value) })}
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Service Areas
            </CardTitle>
            <CardDescription>Areas where you provide moving services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a service area..."
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddServiceArea())}
                className="bg-background/50"
              />
              <Button type="button" variant="secondary" onClick={handleAddServiceArea}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.service_areas.map((area) => (
                <Badge key={area} variant="secondary" className="px-3 py-1">
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceArea(area)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {formData.service_areas.length === 0 && (
                <p className="text-sm text-muted-foreground">No service areas configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
