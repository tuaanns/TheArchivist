import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../../hooks/useNotify';
import { HistoryPage } from './HistoryPage';

export const HistoryPageWrapper = () => {
  const { notify } = useNotify();
  const navigate = useNavigate();

  const setView = (view) => {
    const viewMap = {
      'payment': '/payment',
      'lines': '/ceramics',
      'profile': '/profile',
    };
    const path = viewMap[view] || '/';
    navigate(path);
  };

  return <HistoryPage setView={setView} notify={notify} />;
};

