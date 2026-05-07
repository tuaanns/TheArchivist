import React from 'react';
import { useNotify } from '../../../hooks/useNotify';
import { UsersPage } from './UsersPage';

export const UsersPageWrapper = () => {
  const { notify } = useNotify();
  return <UsersPage notify={notify} />;
};

export default UsersPageWrapper;
