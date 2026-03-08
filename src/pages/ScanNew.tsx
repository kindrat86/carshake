import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import VehicleOnboarding from '@/components/scan/VehicleOnboarding';
import GeneratingAnimation from '@/components/scan/GeneratingAnimation';
import GuidedCapture from '@/components/scan/GuidedCapture';
import ScanReview from '@/components/scan/ScanReview';
import { track } from '@/lib/posthog';

type Screen = 'onboarding' | 'generating' | 'capture' | 'review';

const ScanNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [scanId, setScanId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(new Array(8).fill(null));
  const [vehicleData, setVehicleData] = useState({ plate: '', model: '', colorHex: '', colorName: '' });

  const handleOnboardingComplete = async (data: { plate: string; model: string; colorHex: string; colorName: string }) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setVehicleData(data);

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {}
      );
    }

    // Create scan record with vehicle info
    const { data: scanData } = await supabase.from('scans').insert({
      user_id: user.id,
      type: 'dropoff' as const,
      gps_lat: location?.lat,
      gps_lon: location?.lon,
      vehicle_plate: data.plate,
      vehicle_model: data.model,
      vehicle_color_hex: data.colorHex,
      vehicle_color_name: data.colorName,
    } as any).select().single();

    if (scanData) {
      setScanId(scanData.id);
      setScreen('generating');
      track('scan_started', { scan_type: 'dropoff', vehicle_model: data.model });
    }
  };

  const handleGeneratingComplete = () => {
    setScreen('capture');
  };

  const handleCaptureComplete = (capturedPhotos: (string | null)[]) => {
    setPhotos(capturedPhotos);
    setScreen('review');
    track('scan_completed', { scan_type: 'dropoff', photo_count: 8, gps_captured: !!location });
  };

  return (
    <>
      {screen === 'onboarding' && (
        <VehicleOnboarding onComplete={handleOnboardingComplete} />
      )}

      {screen === 'generating' && (
        <GeneratingAnimation
          model={vehicleData.model}
          plate={vehicleData.plate}
          colorHex={vehicleData.colorHex}
          colorName={vehicleData.colorName}
          onComplete={handleGeneratingComplete}
        />
      )}

      {screen === 'capture' && scanId && user && (
        <GuidedCapture
          scanId={scanId}
          userId={user.id}
          colorHex={vehicleData.colorHex}
          onComplete={handleCaptureComplete}
        />
      )}

      {screen === 'review' && scanId && (
        <ScanReview
          scanId={scanId}
          photos={photos}
          plate={vehicleData.plate}
          model={vehicleData.model}
          colorHex={vehicleData.colorHex}
          location={location}
        />
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default ScanNew;
