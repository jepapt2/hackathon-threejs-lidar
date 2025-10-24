import { useContext } from 'react';
import { RulerContext } from './RulerContext';

export const useRuler = () => {
    const ctx = useContext(RulerContext);
    if (!ctx) throw new Error('useRuler must be used within RulerProvider');
    return ctx;
};

export default useRuler;