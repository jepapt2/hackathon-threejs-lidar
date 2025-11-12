import { useContext } from 'react';
import { PinContext } from './PinContext';

export const usePins = () => {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error('usePins must be used within PinProvider');
  return ctx;
};

export default usePins;