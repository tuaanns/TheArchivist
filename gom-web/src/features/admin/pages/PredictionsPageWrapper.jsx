import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { PredictionsPage } from './PredictionsPage';

export const PredictionsPageWrapper = () => {
  const { notify } = useNotify();
  return <PredictionsPage notify={notify} />;
};

export default PredictionsPageWrapper;
