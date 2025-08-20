import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Car, Zap, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PetrolReading {
  id: string;
  start_kms: number;
  end_kms: number;
  kms_run: number;
  petrol_amount: number;
  cost_per_liter: number;
  total_cost: number;
  reading_date: string;
  notes?: string;
}

interface EBReading {
  id: string;
  start_units: number;
  end_units: number;
  units_consumed: number;
  total_cost: number;
  period: string;
  reading_date: string;
  notes?: string;
}

const calculateEBCost = (units: number): number => {
  let totalCost = 0;
  let remainingUnits = units;

  // First 100 units free
  if (remainingUnits > 100) {
    remainingUnits -= 100;
  } else {
    return 0;
  }

  // Next 100 units (101-200) at ₹4.95 per kWh
  if (remainingUnits > 100) {
    totalCost += 100 * 4.95;
    remainingUnits -= 100;
  } else {
    totalCost += remainingUnits * 4.95;
    return totalCost;
  }

  // Next 50 units (201-250) at ₹6.65 per kWh
  if (remainingUnits > 50) {
    totalCost += 50 * 6.65;
    remainingUnits -= 50;
  } else {
    totalCost += remainingUnits * 6.65;
    return totalCost;
  }

  // Next 50 units (251-300) at ₹8.80 per kWh
  if (remainingUnits > 50) {
    totalCost += 50 * 8.80;
    remainingUnits -= 50;
  } else {
    totalCost += remainingUnits * 8.80;
    return totalCost;
  }

  // Next 100 units (301-400) at ₹9.95 per kWh
  if (remainingUnits > 100) {
    totalCost += 100 * 9.95;
    remainingUnits -= 100;
  } else {
    totalCost += remainingUnits * 9.95;
    return totalCost;
  }

  // Next 100 units (401-500) at ₹11.05 per kWh
  if (remainingUnits > 100) {
    totalCost += 100 * 11.05;
    remainingUnits -= 100;
  } else {
    totalCost += remainingUnits * 11.05;
    return totalCost;
  }

  // Above 500 units at ₹12.15 per kWh
  totalCost += remainingUnits * 12.15;
  return totalCost;
};

const biMonthlyPeriods = [
  'January-February',
  'March-April',
  'May-June',
  'July-August',
  'September-October',
  'November-December'
];

export default function Readings() {
  const [petrolReadings, setPetrolReadings] = useState<PetrolReading[]>([]);
  const [ebReadings, setEBReadings] = useState<EBReading[]>([]);
  const [isPetrolDialogOpen, setIsPetrolDialogOpen] = useState(false);
  const [isEBDialogOpen, setIsEBDialogOpen] = useState(false);
  const { toast } = useToast();

  // Petrol form state
  const [petrolForm, setPetrolForm] = useState({
    start_kms: '',
    end_kms: '',
    petrol_amount: '',
    cost_per_liter: '',
    notes: ''
  });

  // EB form state
  const [ebForm, setEBForm] = useState({
    start_units: '',
    end_units: '',
    period: '',
    notes: ''
  });

  useEffect(() => {
    fetchPetrolReadings();
    fetchEBReadings();
    setInitialPetrolKms();
    setInitialEBUnits();
  }, []);

  const fetchPetrolReadings = async () => {
    const { data, error } = await supabase
      .from('petrol_readings')
      .select('*')
      .order('reading_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch petrol readings",
        variant: "destructive",
      });
    } else {
      setPetrolReadings(data || []);
    }
  };

  const fetchEBReadings = async () => {
    const { data, error } = await supabase
      .from('eb_readings')
      .select('*')
      .order('reading_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch EB readings",
        variant: "destructive",
      });
    } else {
      setEBReadings(data || []);
    }
  };

  const setInitialPetrolKms = async () => {
    const { data } = await supabase
      .from('petrol_readings')
      .select('end_kms')
      .order('reading_date', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setPetrolForm(prev => ({ ...prev, start_kms: data[0].end_kms.toString() }));
    }
  };

  const setInitialEBUnits = async () => {
    const { data } = await supabase
      .from('eb_readings')
      .select('end_units')
      .order('reading_date', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setEBForm(prev => ({ ...prev, start_units: data[0].end_units.toString() }));
    }
  };

  const handlePetrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('petrol_readings')
      .insert({
        user_id: user.id,
        start_kms: parseFloat(petrolForm.start_kms),
        end_kms: parseFloat(petrolForm.end_kms),
        petrol_amount: parseFloat(petrolForm.petrol_amount),
        cost_per_liter: parseFloat(petrolForm.cost_per_liter),
        notes: petrolForm.notes
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add petrol reading",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Petrol reading added successfully",
      });
      setPetrolForm({ start_kms: '', end_kms: '', petrol_amount: '', cost_per_liter: '', notes: '' });
      setIsPetrolDialogOpen(false);
      fetchPetrolReadings();
      setInitialPetrolKms();
    }
  };

  const handleEBSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const unitsConsumed = parseFloat(ebForm.end_units) - parseFloat(ebForm.start_units);
    const totalCost = calculateEBCost(unitsConsumed);

    const { error } = await supabase
      .from('eb_readings')
      .insert({
        user_id: user.id,
        start_units: parseFloat(ebForm.start_units),
        end_units: parseFloat(ebForm.end_units),
        period: ebForm.period,
        total_cost: totalCost,
        notes: ebForm.notes
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add EB reading",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "EB reading added successfully",
      });
      setEBForm({ start_units: '', end_units: '', period: '', notes: '' });
      setIsEBDialogOpen(false);
      fetchEBReadings();
      setInitialEBUnits();
    }
  };

  const deletePetrolReading = async (id: string) => {
    const { error } = await supabase
      .from('petrol_readings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete petrol reading",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Petrol reading deleted successfully",
      });
      fetchPetrolReadings();
    }
  };

  const deleteEBReading = async (id: string) => {
    const { error } = await supabase
      .from('eb_readings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete EB reading",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "EB reading deleted successfully",
      });
      fetchEBReadings();
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Readings</h1>
        </div>

        <Tabs defaultValue="petrol" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="petrol" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Petrol Readings
            </TabsTrigger>
            <TabsTrigger value="eb" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              EB Readings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="petrol" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Petrol Readings</h2>
              <Dialog open={isPetrolDialogOpen} onOpenChange={setIsPetrolDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reading
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Petrol Reading</DialogTitle>
                    <DialogDescription>
                      Record your petrol consumption and mileage
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePetrolSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_kms">Start KMs</Label>
                        <Input
                          id="start_kms"
                          type="number"
                          step="0.01"
                          value={petrolForm.start_kms}
                          onChange={(e) => setPetrolForm({ ...petrolForm, start_kms: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_kms">End KMs</Label>
                        <Input
                          id="end_kms"
                          type="number"
                          step="0.01"
                          value={petrolForm.end_kms}
                          onChange={(e) => setPetrolForm({ ...petrolForm, end_kms: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="petrol_amount">Petrol Amount (Liters)</Label>
                        <Input
                          id="petrol_amount"
                          type="number"
                          step="0.01"
                          value={petrolForm.petrol_amount}
                          onChange={(e) => setPetrolForm({ ...petrolForm, petrol_amount: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cost_per_liter">Cost per Liter (₹)</Label>
                        <Input
                          id="cost_per_liter"
                          type="number"
                          step="0.01"
                          value={petrolForm.cost_per_liter}
                          onChange={(e) => setPetrolForm({ ...petrolForm, cost_per_liter: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={petrolForm.notes}
                        onChange={(e) => setPetrolForm({ ...petrolForm, notes: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Reading</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {petrolReadings.map((reading) => (
                <Card key={reading.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{new Date(reading.reading_date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">₹{reading.total_cost.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePetrolReading(reading.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {reading.start_kms} - {reading.end_kms} KMs | {reading.kms_run} KMs Run
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Petrol: </span>
                        {reading.petrol_amount}L @ ₹{reading.cost_per_liter}/L
                      </div>
                      <div>
                        <span className="font-medium">Mileage: </span>
                        {(reading.kms_run / reading.petrol_amount).toFixed(2)} km/L
                      </div>
                    </div>
                    {reading.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{reading.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="eb" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">EB Readings (Bi-Monthly)</h2>
              <Dialog open={isEBDialogOpen} onOpenChange={setIsEBDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reading
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add EB Reading</DialogTitle>
                    <DialogDescription>
                      Record your bi-monthly electricity consumption
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEBSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="period">Billing Period</Label>
                      <Select onValueChange={(value) => setEBForm({ ...ebForm, period: value })} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing period" />
                        </SelectTrigger>
                        <SelectContent>
                          {biMonthlyPeriods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_units">Start Units</Label>
                        <Input
                          id="start_units"
                          type="number"
                          step="0.01"
                          value={ebForm.start_units}
                          onChange={(e) => setEBForm({ ...ebForm, start_units: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_units">End Units</Label>
                        <Input
                          id="end_units"
                          type="number"
                          step="0.01"
                          value={ebForm.end_units}
                          onChange={(e) => setEBForm({ ...ebForm, end_units: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    {ebForm.start_units && ebForm.end_units && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm space-y-1">
                          <div>Units Consumed: {(parseFloat(ebForm.end_units) - parseFloat(ebForm.start_units)).toFixed(2)}</div>
                          <div className="font-bold">Estimated Cost: ₹{calculateEBCost(parseFloat(ebForm.end_units) - parseFloat(ebForm.start_units)).toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="eb_notes">Notes</Label>
                      <Textarea
                        id="eb_notes"
                        value={ebForm.notes}
                        onChange={(e) => setEBForm({ ...ebForm, notes: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Reading</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {ebReadings.map((reading) => (
                <Card key={reading.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div>
                        <div>{new Date(reading.reading_date).toLocaleDateString()}</div>
                        <div className="text-sm font-normal text-muted-foreground">{reading.period}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">₹{reading.total_cost.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEBReading(reading.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {reading.start_units} - {reading.end_units} Units | {reading.units_consumed} Units Consumed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="font-medium">Average Rate: </span>
                      ₹{(reading.total_cost / reading.units_consumed).toFixed(2)}/unit
                    </div>
                    {reading.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{reading.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}