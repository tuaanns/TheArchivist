import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotify } from '../../hooks/useNotify';
import { PaymentPage } from './PaymentPage';

export const PaymentPageWrapper = () => {
  const { fetchUser } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();

  const setView = (view) => {
    const viewMap = {
      'transaction_history': '/transactions',
      'profile': '/profile',
    };
    const path = viewMap[view] || '/';
    navigate(path);
  };

  return <PaymentPage fetchUser={fetchUser} notify={notify} setView={setView} />;
};

