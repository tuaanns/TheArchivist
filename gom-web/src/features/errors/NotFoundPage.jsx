import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-9xl font-black text-navy/10 dark:text-ivory/10">404</h1>
        <h2 className="mt-4 font-heading text-3xl font-bold text-navy dark:text-ivory">
          {t('errors.notFound') || 'Không tìm thấy trang'}
        </h2>
        <p className="mt-3 text-muted dark:text-dark-text-muted">
          {t('errors.notFoundDesc') || 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'}
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

