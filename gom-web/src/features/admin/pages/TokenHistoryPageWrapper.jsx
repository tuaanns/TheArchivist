import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { TokenHistoryPage } from './TokenHistoryPage';

export const TokenHistoryPageWrapper = () => {
  const { notify } = useNotify();
  return <TokenHistoryPage notify={notify} />;
};

export default TokenHistoryPageWrapper;
