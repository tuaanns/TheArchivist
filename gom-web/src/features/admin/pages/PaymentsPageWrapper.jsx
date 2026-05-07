import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { PaymentsPage } from './PaymentsPage';

export const PaymentsPageWrapper = () => {
  const { notify } = useNotify();
  return <PaymentsPage notify={notify} />;
};

export default PaymentsPageWrapper;
