import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../../hooks/useNotify';
import { TransactionsPage } from './TransactionsPage';

export const TransactionsPageWrapper = () => {
  const { notify } = useNotify();
  const navigate = useNavigate();

  const setView = (view) => {
    const viewMap = {
      'payment': '/payment',
      'profile': '/profile',
    };
    const path = viewMap[view] || '/';
    navigate(path);
  };

  return <TransactionsPage setView={setView} notify={notify} />;
};

