import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { CeramicsPage } from './CeramicsPage';

export const CeramicsPageWrapper = () => {
  const { notify } = useNotify();
  return <CeramicsPage notify={notify} />;
};

export default CeramicsPageWrapper;
