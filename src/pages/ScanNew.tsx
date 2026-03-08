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

const getDeviceInfo = (): string => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] || ''}`;
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = `Safari ${ua.match(/Version\/(\d+)/)?.[1] || ''}`;
  else if (ua.includes('Firefox')) browser = `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] || ''}`;
  else if (ua.includes('Edg')) browser = `Edge ${ua.match(/Edg\/(\d+)/)?.[1] || ''}`;

  if (ua.includes('iPhone') || ua.includes('iPad')) os = `iOS ${ua.match(/OS (\d+[_\d]*)/)?.[1]?.replace(/_/g, '.') || ''}`;
  else if (ua.includes('Android')) os = `Android ${ua.match(/Android (\d+[\.\d]*)/)?.[1] || ''}`;
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser.trim()} · ${os.trim()}`;
};

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16`);
    const data = await res.json();
    if (data?.address) {
      const { road, suburb, city, town, village, state, country } = data.address;
      const parts = [road, suburb || city || town || village, country].filter(Boolean);
      return parts.join(', ');
    }
    return data?.display_name?.split(',').slice(0, 3).join(',') || null;
  } catch {
    return null;
  }
};

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

    // Get location BEFORE creating scan (await the result)
    let gpsLat: number | undefined;
    let gpsLon: number | undefined;
    let address: string | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      gpsLat = pos.coords.latitude;
      gpsLon = pos.coords.longitude;
      setLocation({ lat: gpsLat, lon: gpsLon });
      address = await reverseGeocode(gpsLat, gpsLon);
    } catch {
      // GPS unavailable — proceed without
    }

    const deviceInfo = getDeviceInfo();

    // Create scan record with all evidence data
    const { data: scanData } = await supabase.from('scans').insert({
      user_id: user.id,
      type: 'dropoff' as const,
      gps_lat: gpsLat,
      gps_lon: gpsLon,
      address,
      device_info: deviceInfo,
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
