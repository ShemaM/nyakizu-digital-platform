'use client';

import { useState } from 'react';
import { LOCATIONS } from '@/lib/constants';

type LocationSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function LocationSelector({ value, onValueChange }: LocationSelectorProps) {
  const isOtherSelected = value !== '' && !LOCATIONS.includes(value);
  const [showOtherInput, setShowOtherInput] = useState(isOtherSelected);

  const handleSelect = (location: string) => {
    setShowOtherInput(false);
    onValueChange(location);
  };

  const handleOtherClick = () => {
    setShowOtherInput(true);
    onValueChange(''); // Clear selection to allow typing
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((location) => (
          <button
            key={location}
            type="button"
            onClick={() => handleSelect(location)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              value === location ? 'bg-green-600 text-white ring-2 ring-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >{location}</button>
        ))}
        <button type="button" onClick={handleOtherClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            showOtherInput ? 'bg-green-600 text-white ring-2 ring-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}>Other</button>
      </div>
      {showOtherInput && (
        <div className="mt-4">
          <input type="text" placeholder="Please specify your location" value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
      )}
    </div>
  );
}