import { useState, useEffect } from "react";
import { Plus, Gauge, Edit2, Trash2, Calendar, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { format } from "date-fns";

interface Reading {
  id: string;
  reading_type: string;
  meter_number?: string;
  current_reading: number;
  previous_reading: number;
  consumption: number;
  reading_date: string;
  cost_per_unit: number;
  total_cost: number;
  notes?: string;
  created_at: string;
}

const READING_TYPES = [
  { value: "electricity", label: "Electricity", icon: "⚡", unit: "kWh" },
  { value: "water", label: "Water", icon: "💧", unit: "liters" },
  { value: "gas", label: "Gas", icon: "🔥", unit: "cubic meters" },
  { value: "internet", label: "Internet", icon: "🌐", unit: "GB" },
];

export default function Readings() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [formData, setFormData] = useState({
    reading_type: "",
    meter_number: "",
    current_reading: "",
    previous_reading: "",
    reading_date: new Date().toISOString().split('T')[0],
    cost_per_unit: "",
    notes: ""
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchReadings();
  }, [user, navigate]);

  const fetchReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .order('reading_date', { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching readings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch readings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateValues = (current: number, previous: number, costPerUnit: number) => {
    const consumption = Math.max(0, current - previous);
    const totalCost = consumption * costPerUnit;
    return { consumption, totalCost };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const currentReading = parseFloat(formData.current_reading);
    const previousReading = parseFloat(formData.previous_reading || "0");
    const costPerUnit = parseFloat(formData.cost_per_unit || "0");
    
    const { consumption, totalCost } = calculateValues(currentReading, previousReading, costPerUnit);

    try {
      const readingData = {
        user_id: user.id,
        reading_type: formData.reading_type,
        meter_number: formData.meter_number || null,
        current_reading: currentReading,
        previous_reading: previousReading,
        consumption: consumption,
        reading_date: formData.reading_date,
        cost_per_unit: costPerUnit,
        total_cost: totalCost,
        notes: formData.notes || null,
      };

      if (editingReading) {
        const { error } = await supabase
          .from('readings')
          .update(readingData)
          .eq('id', editingReading.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Reading updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('readings')
          .insert([readingData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Reading added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingReading(null);
      resetForm();
      fetchReadings();
    } catch (error) {
      console.error('Error saving reading:', error);
      toast({
        title: "Error",
        description: "Failed to save reading",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setFormData({
      reading_type: reading.reading_type,
      meter_number: reading.meter_number || "",
      current_reading: reading.current_reading.toString(),
      previous_reading: reading.previous_reading.toString(),
      reading_date: reading.reading_date,
      cost_per_unit: reading.cost_per_unit.toString(),
      notes: reading.notes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('readings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reading deleted successfully",
      });
      fetchReadings();
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast({
        title: "Error",
        description: "Failed to delete reading",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      reading_type: "",
      meter_number: "",
      current_reading: "",
      previous_reading: "",
      reading_date: new Date().toISOString().split('T')[0],
      cost_per_unit: "",
      notes: ""
    });
  };

  const getReadingTypeInfo = (type: string) => {
    return READING_TYPES.find(rt => rt.value === type) || { label: type, icon: "📊", unit: "units" };
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meter Readings</h1>
            <p className="text-muted-foreground">Track your utility meter readings and consumption</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingReading(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingReading ? "Edit Reading" : "Add New Reading"}</DialogTitle>
                <DialogDescription>
                  Enter your meter reading details to track consumption and costs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reading_type">Reading Type</Label>
                  <Select 
                    value={formData.reading_type} 
                    onValueChange={(value) => setFormData({...formData, reading_type: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reading type" />
                    </SelectTrigger>
                    <SelectContent>
                      {READING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meter_number">Meter Number (Optional)</Label>
                  <Input
                    id="meter_number"
                    value={formData.meter_number}
                    onChange={(e) => setFormData({...formData, meter_number: e.target.value})}
                    placeholder="Enter meter number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_reading">Current Reading</Label>
                    <Input
                      id="current_reading"
                      type="number"
                      step="0.01"
                      value={formData.current_reading}
                      onChange={(e) => setFormData({...formData, current_reading: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_reading">Previous Reading</Label>
                    <Input
                      id="previous_reading"
                      type="number"
                      step="0.01"
                      value={formData.previous_reading}
                      onChange={(e) => setFormData({...formData, previous_reading: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reading_date">Reading Date</Label>
                    <Input
                      id="reading_date"
                      type="date"
                      value={formData.reading_date}
                      onChange={(e) => setFormData({...formData, reading_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                    <Input
                      id="cost_per_unit"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) => setFormData({...formData, cost_per_unit: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingReading ? "Update Reading" : "Add Reading"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : readings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Gauge className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No readings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start tracking your utility consumption by adding your first meter reading.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Reading
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {readings.map((reading) => {
              const typeInfo = getReadingTypeInfo(reading.reading_type);
              return (
                <Card key={reading.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{typeInfo.label}</CardTitle>
                        <CardDescription>
                          {reading.meter_number && `Meter: ${reading.meter_number}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reading)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Reading</p>
                        <p className="text-lg font-semibold">{reading.current_reading} {typeInfo.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Consumption</p>
                        <p className="text-lg font-semibold text-primary">{reading.consumption} {typeInfo.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-semibold text-green-600">₹{reading.total_cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reading Date</p>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <p className="text-sm">{format(new Date(reading.reading_date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    {reading.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{reading.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}