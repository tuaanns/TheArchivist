import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { DashboardPage } from './DashboardPage';

export const DashboardPageWrapper = () => {
  const { notify } = useNotify();
  return <DashboardPage notify={notify} />;
};

export default DashboardPageWrapper;
