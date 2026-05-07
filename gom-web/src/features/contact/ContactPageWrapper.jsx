import React from 'react';
import { useNotify } from '../../hooks/useNotify';
import { ContactPage } from './ContactPage';

export const ContactPageWrapper = () => {
  const { notify } = useNotify();

  return <ContactPage notify={notify} />;
};

