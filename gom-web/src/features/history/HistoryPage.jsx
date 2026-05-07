import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { History as HistoryIcon, RefreshCw } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/states';
import { AnimatedEmptyState } from '../../components/motion';
import { historyApi } from './api';
import { HistoryDetailModal } from './HistoryDetailModal';
import { formatDate, getErrorMessage } from '../../lib/utils';
import { VIEWS } from '../../lib/constants';
import ShinyText from '../../components/ui/ShinyText';

export const HistoryPage = ({ setView, notify }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyApi.list();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setList(data);
      
      // Check if there's a prediction ID to open from URL
      const openId = searchParams.get('openId');
      if (openId) {
        const item = data.find(d => d.id === parseInt(openId));
        if (item) {
          setSelected(item);
        }
        // Clear the URL param after opening
        setSearchParams({});
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notify?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [notify, searchParams, setSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer>
      <PageHeader
        title={
          <ShinyText
            text={t('history.title')}
            speed={3}
            delay={0}
            color="#0A1A42"
            shineColor="#9FB7C9"
            darkColor="#9CA3AF"
            darkShineColor="#FFFFFF"
            spread={80}
            direction="right"
            yoyo={false}
          />
        }
        subtitle={t('history.subtitle')}
        actions={
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={fetchData}>
            {t('common.retry')}
          </Button>
        }
      />

      {loading && <LoadingState message={t('common.loading')} />}
      {!loading && error && <ErrorState message={error} onRetry={fetchData} />}
      {!loading && !error && list.length === 0 && (
        <AnimatedEmptyState
          icon={HistoryIcon}
          title={t('history.empty')}
          description={t('history.subtitle')}
          action={
            <Button variant="primary" onClick={() => setView?.(VIEWS.DEBATE)}>
              {t('history.startNow')}
            </Button>
          }
        />
      )}

      {!loading && !error && list.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => {
            const rawConfidence = item.confidence ?? item.certainty ?? 0;
            const confidence = rawConfidence > 1 
              ? Math.round(rawConfidence) 
              : Math.round(rawConfidence * 100);
            const imgSrc = item.image_url || (item.image_path ? `/storage/${item.image_path}` : null);
            return (
              <Card
                key={item.id}
                hoverable
                padded={false}
                className="cursor-pointer overflow-hidden"
                onClick={() => setSelected(item)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-alt dark:bg-dark-surface-alt">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.predicted_label || 'Artifact'}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <HistoryIcon size={36} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted dark:text-dark-text-muted">
                      {formatDate(item.created_at)}
                    </span>
                    {confidence > 0 && <Badge variant="gold">{confidence}%</Badge>}
                  </div>
                  <h3 className="line-clamp-1 font-heading text-lg font-bold text-navy dark:text-ivory">
                    {item.predicted_label || item.name || '—'}
                  </h3>
                  {item.era && (
                    <p className="mt-1 text-xs text-muted dark:text-dark-text-muted">
                      {item.era}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <HistoryDetailModal item={selected} onClose={() => setSelected(null)} />
    </PageContainer>
  );
};

export default HistoryPage;

