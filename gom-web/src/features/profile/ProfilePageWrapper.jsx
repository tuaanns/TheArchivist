import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotify } from '../../hooks/useNotify';
import { ProfilePage } from './ProfilePage';

export const ProfilePageWrapper = () => {
  const { user, fetchUser } = useAuth();
  const { notify } = useNotify();

  return <ProfilePage user={user} fetchUser={fetchUser} notify={notify} />;
};

