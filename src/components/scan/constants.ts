export const ANGLES = [
  { angle: 1, name: 'Front-Left (10:30)', tip: 'Include headlight + left fender', clock: '10:30', rotation: -135 },
  { angle: 2, name: 'Front (12:00)', tip: 'Center, full bumper + plate visible', clock: '12:00', rotation: -180 },
  { angle: 3, name: 'Front-Right (1:30)', tip: 'Include mirror + right fender', clock: '1:30', rotation: -225 },
  { angle: 4, name: 'Right Side (3:00)', tip: 'Full profile, both doors + wheels', clock: '3:00', rotation: -270 },
  { angle: 5, name: 'Rear-Right (4:30)', tip: 'Include taillight + quarter panel', clock: '4:30', rotation: -315 },
  { angle: 6, name: 'Rear (6:00)', tip: 'Full rear + plate visible', clock: '6:00', rotation: -360 },
  { angle: 7, name: 'Rear-Left (7:30)', tip: 'Include taillight + quarter panel', clock: '7:30', rotation: -405 },
  { angle: 8, name: 'Left Side (9:00)', tip: 'Full profile, both doors + wheels', clock: '9:00', rotation: -450 },
];

export const COLOR_SWATCHES = [
  { name: 'Midnight Black', hex: '#1a1a1a' },
  { name: 'Pearl White', hex: '#E8E6E0' },
  { name: 'Silver', hex: '#A8A9AD' },
  { name: 'Space Grey', hex: '#5C5D60' },
  { name: 'Deep Blue', hex: '#1B3A5C' },
  { name: 'Racing Red', hex: '#B91C1C' },
  { name: 'British Green', hex: '#1D4B35' },
  { name: 'Champagne Gold', hex: '#C9A237' },
  { name: 'Burgundy', hex: '#6B1D2A' },
  { name: 'Navy', hex: '#1E2A4A' },
  { name: 'Sand', hex: '#C4A87C' },
  { name: 'Electric Blue', hex: '#2563EB' },
];

export const resizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1500;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = (height / width) * maxDim; width = maxDim; }
        else { width = (width / height) * maxDim; height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
};
