import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, MapPin, Map as MapIcon, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { LocationMapPicker } from '@/components/LocationMapPicker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface Item {
    item_name: string;
    item_code: string;
    item_description: string;
    quantity: number;
    uom: string;
    weight: number;
    dimension: string;
    fragile: boolean;
    hazardous: boolean;
}

const transportationSchema = z.object({
    pickup_location: z.string().optional(),
    delivery_location: z.string().optional(),
    cargo_type: z.string().optional(),
    weight: z.number().optional(),
    pickup_date: z.string().optional(),
    special_instructions: z.string().optional(),
});

type TransportationFormData = z.infer<typeof transportationSchema>;

export default function TransportationRequest() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);
    const [showMapView, setShowMapView] = useState(false);
    const [showPickupMapView, setShowPickupMapView] = useState(false);

    const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const [estimatedDistance, setEstimatedDistance] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');

    const {
        register,
        setValue,
        formState: { errors },
    } = useForm<TransportationFormData>({
        resolver: zodResolver(transportationSchema),
    });

    const [formData, setFormData] = useState({
        provider_id: '',
        mode: 'Road',
        transport_date: '',
        source_street1: '',
        source_street2: '',
        source_city: '',
        source_zip: '',
        source_country: '',
        source_state: '',
        destination_street1: '',
        destination_street2: '',
        destination_city: '',
        destination_zip: '',
        destination_country: '',
        destination_state: '',
        insurance_coverage: false,
        remarks: '',
        vehicle_mode: 'vendor',
        pickup_contact_name: '',
        pickup_contact_mobile: '',
        pickup_contact_email: '',
        receiver_contact_name: '',
        receiver_contact_mobile: '',
        receiver_contact_email: '',
    });

    const [items, setItems] = useState<Item[]>([
        { item_name: '', item_code: '', item_description: '', quantity: 0, uom: 'Carton', weight: 0, dimension: '', fragile: false, hazardous: false },
    ]);

    useEffect(() => {
        document.title = 'Transportation Request';
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const { data } = await supabase.from('companies').select('*');
            if (data) setProviders(data);
        } catch (err) {
            console.warn('Failed to fetch providers', err);
        }
    };

    // ----- Location select handlers -----
    // Expecting LocationMapPicker to call onLocationSelect(locationObj)
    // locationObj must be: { address, lat, lng, street, city, state, country, postalCode }
    const handlePickupLocationSelect = (location: any) => {
        setFormData((prev) => ({
            ...prev,
            source_street1: location.street || location.address || '',
            // keep destination_street2 empty; user can edit
            source_street2: prev.source_street2 || '',
            source_city: location.city || '',
            source_state: location.state || '',
            source_zip: location.postalCode || '',
            source_country: location.country || '',
        }));
        setPickupCoordinates({ lat: location.lat, lng: location.lng });
    };

    const handleLocationSelect = (location: any) => {
        setFormData((prev) => ({
            ...prev,
            destination_street1: location.street || location.address || '',
            destination_street2: prev.destination_street2 || '',
            destination_city: location.city || '',
            destination_state: location.state || '',
            destination_zip: location.postalCode || '',
            destination_country: location.country || '',
        }));
        setDeliveryCoordinates({ lat: location.lat, lng: location.lng });
    };

    // ----- Distance Matrix calculation -----
    useEffect(() => {
        // reset if we lost one coord
        if (!pickupCoordinates || !deliveryCoordinates) {
            setEstimatedDistance('');
            setEstimatedTime('');
            return;
        }

        // Use DistanceMatrixService
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [new google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng)],
                destinations: [new google.maps.LatLng(deliveryCoordinates.lat, deliveryCoordinates.lng)],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                // avoidTolls: false, // optionally
            },
            (response, status) => {
                if (status === 'OK') {
                    try {
                        const element = response.rows[0].elements[0];
                        if (element && element.status === 'OK') {
                            setEstimatedDistance(element.distance?.text || '');
                            setEstimatedTime(element.duration?.text || '');
                        } else {
                            setEstimatedDistance('N/A');
                            setEstimatedTime('N/A');
                        }
                    } catch (err) {
                        console.warn('DistanceMatrix parse error', err);
                        setEstimatedDistance('N/A');
                        setEstimatedTime('N/A');
                    }
                } else {
                    console.warn('DistanceMatrix error', status);
                    setEstimatedDistance('N/A');
                    setEstimatedTime('N/A');
                }
            }
        );
    }, [pickupCoordinates, deliveryCoordinates]);

    // ----- Items management -----
    const addItem = () => {
        setItems([...items, { item_name: '', item_code: '', item_description: '', quantity: 0, uom: 'Carton', weight: 0, dimension: '', fragile: false, hazardous: false }]);
    };


    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof Item, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = totalQuantity * 10; // example
    const totalValue = totalQuantity * 25; // example

    // ----- Submit -----
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const reference = `TR-${Date.now()}`;

            const { data: request, error: requestError } = await supabase
                .from('transportation_requests')
                .insert({
                    reference,
                    customer_id: user.id,
                    ...formData,
                    provider_id: formData.provider_id || null,
                    source_lat: pickupCoordinates?.lat,
                    source_lng: pickupCoordinates?.lng,
                    destination_lat: deliveryCoordinates?.lat,
                    destination_lng: deliveryCoordinates?.lng,
                    status: 'submitted',
                })
                .select()
                .single();

            if (requestError) throw requestError;

            const itemsData = items.map((item) => ({
                transportation_request_id: request.id,
                item_name: item.item_name,
                item_code: item.item_code,
                item_description: item.item_description,
                quantity: item.quantity,
                uom: item.uom,
                weight: item.weight,
                dimension: item.dimension,
                fragile: item.fragile,
                hazardous: item.hazardous,
            }));


            const { error: itemsError } = await supabase
                .from('transportation_request_items')
                .insert(itemsData);
            if (itemsError) throw itemsError;

            // optionally send email via function as before...
            toast.success('Transportation request created successfully!');
            navigate('/track-requests');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Information card (kept simple; you can expand as needed) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="mode">Transport Mode</Label>
                                    <Select
                                        value={formData.mode}
                                        onValueChange={(value) => setFormData({ ...formData, mode: value })}
                                    >
                                        <SelectTrigger id="mode">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Air">Air</SelectItem>
                                            <SelectItem value="Road">Road</SelectItem>
                                            <SelectItem value="Water">Water</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="transport_date">Transport Date</Label>
                                    <Input
                                        id="transport_date"
                                        type="date"
                                        value={formData.transport_date}
                                        onChange={(e) => setFormData({ ...formData, transport_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Service Type</Label>
                                    <Select
                                        value={formData.provider_id}
                                        onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select provider (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map((provider) => (
                                                <SelectItem key={provider.id} value={provider.id}>
                                                    {provider.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_mode">Vehicle Mode</Label>
                                    <Select
                                        value={formData.vehicle_mode}
                                        onValueChange={(value) => setFormData({ ...formData, vehicle_mode: value })}
                                    >
                                        <SelectTrigger id="vehicle_mode">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="own">Own</SelectItem>
                                            <SelectItem value="vendor">Vendor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 flex items-center gap-2">
                                    <Checkbox
                                        id="insurance_coverage"
                                        checked={formData.insurance_coverage}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, insurance_coverage: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="insurance_coverage" className="flex items-center gap-2 cursor-pointer">
                                        <ShieldCheck className="h-4 w-4" />
                                        Insurance Coverage
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>


                        {/* === PICKUP (SOURCE) === */}
                        <Card style={{ backgroundColor: '#eff6ff' }}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-blue-800 flex items-center gap-2">
                                        <MapPin className="h-5 w-5" /> Pickup Location (Source)
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant={showPickupMapView ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setShowPickupMapView(!showPickupMapView)}
                                        className="gap-2"
                                    >
                                        <MapIcon className="h-4 w-4" />
                                        {showPickupMapView ? 'Hide Map' : 'Map'}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {showPickupMapView ? (
                                    <LocationMapPicker
                                        onLocationSelect={handlePickupLocationSelect}
                                        initialAddress={formData.source_street1 || ''}
                                    />
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Street Address 1 <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="Enter pickup street address"
                                                    value={formData.source_street1}
                                                    onChange={(e) => setFormData({ ...formData, source_street1: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Street Address 2</Label>
                                                <Input
                                                    placeholder="Apartment, suite, floor (optional)"
                                                    value={formData.source_street2}
                                                    onChange={(e) => setFormData({ ...formData, source_street2: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label>City <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="City"
                                                    value={formData.source_city}
                                                    onChange={(e) => setFormData({ ...formData, source_city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>ZIP Code <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="ZIP"
                                                    value={formData.source_zip}
                                                    onChange={(e) => setFormData({ ...formData, source_zip: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>State <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="State"
                                                    value={formData.source_state}
                                                    onChange={(e) => setFormData({ ...formData, source_state: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Country <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="Country"
                                                    value={formData.source_country}
                                                    onChange={(e) => setFormData({ ...formData, source_country: e.target.value })}
                                                    required
                                                />
                                             </div>
                                         </div>

                                         {/* Pickup Contact Fields */}
                                         <div className="border-t pt-4 mt-4">
                                             <h4 className="text-sm font-semibold text-blue-800 mb-3">Pickup Contact Information</h4>
                                             <div className="grid gap-4 md:grid-cols-3">
                                                 <div className="space-y-2">
                                                     <Label>Contact Name</Label>
                                                     <Input
                                                         placeholder="Contact person name"
                                                         value={formData.pickup_contact_name}
                                                         onChange={(e) => setFormData({ ...formData, pickup_contact_name: e.target.value })}
                                                     />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Mobile Number</Label>
                                                     <Input
                                                         placeholder="Contact mobile number"
                                                         value={formData.pickup_contact_mobile}
                                                         onChange={(e) => setFormData({ ...formData, pickup_contact_mobile: e.target.value })}
                                                     />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Email ID</Label>
                                                     <Input
                                                         type="email"
                                                         placeholder="Contact email"
                                                         value={formData.pickup_contact_email}
                                                         onChange={(e) => setFormData({ ...formData, pickup_contact_email: e.target.value })}
                                                     />
                                                 </div>
                                             </div>
                                         </div>
                                     </>
                                 )}
                            </CardContent>
                        </Card>

                        {/* === DELIVERY (DESTINATION) === */}
                        <Card style={{ backgroundColor: '#f0fdf4' }}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" /> Delivery Location (Destination)
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant={showMapView ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setShowMapView(!showMapView)}
                                        className="gap-2"
                                    >
                                        <MapIcon className="h-4 w-4" />
                                        {showMapView ? 'Hide Map' : 'Map'}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {showMapView ? (
                                    <LocationMapPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialAddress={formData.destination_street1 || ''}
                                    />
                                ) : (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>Street Address 1 <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="Enter delivery street address"
                                                    value={formData.destination_street1}
                                                    onChange={(e) => setFormData({ ...formData, destination_street1: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Street Address 2</Label>
                                                <Input
                                                    placeholder="Apartment, suite, floor (optional)"
                                                    value={formData.destination_street2}
                                                    onChange={(e) => setFormData({ ...formData, destination_street2: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label>City <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="City"
                                                    value={formData.destination_city}
                                                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>State <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="State"
                                                    value={formData.destination_state}
                                                    onChange={(e) => setFormData({ ...formData, destination_state: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>ZIP Code <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="ZIP"
                                                    value={formData.destination_zip}
                                                    onChange={(e) => setFormData({ ...formData, destination_zip: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Country <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="Country"
                                                    value={formData.destination_country}
                                                    onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                                                    required
                                                />
                                             </div>
                                         </div>

                                         {/* Receiver Contact Fields */}
                                         <div className="border-t pt-4 mt-4">
                                             <h4 className="text-sm font-semibold text-green-800 mb-3">Receiver Contact Information</h4>
                                             <div className="grid gap-4 md:grid-cols-3">
                                                 <div className="space-y-2">
                                                     <Label>Contact Name</Label>
                                                     <Input
                                                         placeholder="Receiver name"
                                                         value={formData.receiver_contact_name}
                                                         onChange={(e) => setFormData({ ...formData, receiver_contact_name: e.target.value })}
                                                     />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Mobile Number</Label>
                                                     <Input
                                                         placeholder="Receiver mobile number"
                                                         value={formData.receiver_contact_mobile}
                                                         onChange={(e) => setFormData({ ...formData, receiver_contact_mobile: e.target.value })}
                                                     />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label>Email ID</Label>
                                                     <Input
                                                         type="email"
                                                         placeholder="Receiver email"
                                                         value={formData.receiver_contact_email}
                                                         onChange={(e) => setFormData({ ...formData, receiver_contact_email: e.target.value })}
                                                     />
                                                 </div>
                                             </div>
                                         </div>
                                     </>
                                 )}
                            </CardContent>
                        </Card>

                        {/* === ROUTE INFO === */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">Route Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Estimated Distance:</span>
                                    <p>{estimatedDistance || 'Select pickup and delivery locations'}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Estimated Transit Time:</span>
                                    <p>{estimatedTime || 'Awaiting route data'}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Route Optimization:</span>
                                    <p>Available for multi-stop deliveries</p>
                                </div>
                            </div>
                        </div>

                        {/* === ITEMS & CARGO === */}
                        <Card style={{
                            backgroundColor: '#fff7ed',
                            padding: '1rem',
                            borderRadius: '12px',
                        }}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Items & Cargo Details</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem' }}>
                                <div className="border rounded-lg overflow-x-auto">
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-4 space-y-4 bg-white">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-semibold">Item #{index + 1}</h4>
                                                    {items.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label>Item Name <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            placeholder="Item name"
                                                            value={item.item_name}
                                                            onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Item Code <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            placeholder="Item Code"
                                                            value={item.item_code}
                                                            onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Quantity <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={item.quantity || ''}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-4">
                                                    <div className="space-y-2">
                                                        <Label>UOM <span className="text-red-500">*</span></Label>
                                                        <Select
                                                            value={item.uom}
                                                            onValueChange={(value) => updateItem(index, 'uom', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Carton">Carton</SelectItem>
                                                                <SelectItem value="Pallet">Pallet</SelectItem>
                                                                <SelectItem value="Container">Container</SelectItem>
                                                                <SelectItem value="Piece">Piece</SelectItem>
                                                                <SelectItem value="Box">Box</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Weight (Kg)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={item.weight || ''}
                                                            onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Dimension (L×W×H)</Label>
                                                        <Input
                                                            placeholder="e.g. 10x20x30 cm"
                                                            value={item.dimension}
                                                            onChange={(e) => updateItem(index, 'dimension', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Flags</Label>
                                                        <div className="flex items-center gap-4 pt-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.fragile}
                                                                    onChange={(e) => updateItem(index, 'fragile', e.target.checked)}
                                                                    className="h-4 w-4"
                                                                />
                                                                <span className="text-sm">Fragile</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.hazardous}
                                                                    onChange={(e) => updateItem(index, 'hazardous', e.target.checked)}
                                                                    className="h-4 w-4"
                                                                />
                                                                <span className="text-sm">Hazardous</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Item Description</Label>
                                                    <Textarea
                                                        placeholder="Enter detailed description of the item..."
                                                        value={item.item_description}
                                                        onChange={(e) => updateItem(index, 'item_description', e.target.value)}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks/Instructions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Remarks / Special Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Additional Information</Label>
                                    <Textarea
                                        id="remarks"
                                        placeholder="Enter any special instructions or remarks..."
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* === SUMMARY === */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Items:</p>
                                        <p className="text-orange-600 font-semibold text-lg">{totalItems}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Weight:</p>
                                        <p className="text-orange-600 font-semibold text-lg">{totalWeight} lbs</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Value:</p>
                                        <p className="text-orange-600 font-semibold text-lg">${totalValue}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Special Handling:</p>
                                        <p className="font-medium">Standard</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-yellow-200 mt-6">
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-gray-800 mb-2">Important Notes:</p>
                                        <ul className="space-y-1">
                                            <li>• Pricing is estimated and may vary based on actual route and conditions</li>
                                            <li>• Final pricing will be confirmed by the provider</li>
                                            <li>• Additional charges may apply for special requirements or route changes</li>
                                            <li>• Real-time tracking is included at no extra cost</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4 border border-green-200 mt-6">
                                    <div className="flex items-center space-x-2 text-green-700">
                                        <span className="font-medium">Ready to Submit</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-2">
                                        Your request is complete and ready for submission. Click "Submit Request" to proceed.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/services')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>

                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
