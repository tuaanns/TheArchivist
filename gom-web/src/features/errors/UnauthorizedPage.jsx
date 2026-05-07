import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-danger/10 text-danger">
          <ShieldAlert size={48} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-navy dark:text-ivory">
          {t('errors.forbidden') || 'Không có quyền truy cập'}
        </h2>
        <p className="mt-3 text-muted dark:text-dark-text-muted">
          {t('errors.forbiddenDesc') || 'Bạn không có quyền truy cập vào khu vực này.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            {t('common.back') || 'Quay lại'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            <Home size={16} />
            {t('nav.home') || 'Trang chủ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

