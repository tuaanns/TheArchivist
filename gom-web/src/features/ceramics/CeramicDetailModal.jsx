import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Box } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import ModelViewer from '../../components/3d/ModelViewer';
import { cn } from '../../lib/utils';

export const CeramicDetailModal = ({ item, onClose }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('image');

  if (!item) return null;

  // Check if item has 3D model URL
  const has3DModel = item.model_url || item.model_3d_url;

  return (
    <Modal open={!!item} onClose={onClose} size="xl" title={item.name}>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Left side: Image or 3D viewer */}
        <div className="space-y-4">
          {/* View mode toggle */}
          {has3DModel && (
            <div className="flex gap-2 rounded-xl bg-surface-alt p-1 dark:bg-dark-surface-alt">
              <button
                onClick={() => setViewMode('image')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                  viewMode === 'image'
                    ? 'bg-navy text-white shadow-sm dark:bg-ceramic dark:text-navy-dark'
                    : 'text-muted hover:text-navy dark:text-dark-text-muted dark:hover:text-ivory'
                )}
              >
                <Image size={16} />
                <span>{t('ceramics.detail.imageView') || 'Image'}</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                  viewMode === '3d'
                    ? 'bg-navy text-white shadow-sm dark:bg-ceramic dark:text-navy-dark'
                    : 'text-muted hover:text-navy dark:text-dark-text-muted dark:hover:text-ivory'
                )}
              >
                <Box size={16} />
                <span>{t('ceramics.detail.3dView') || '3D View'}</span>
              </button>
            </div>
          )}

          {/* Content area */}
          <div className="overflow-hidden rounded-2xl bg-surface-alt dark:bg-dark-surface-alt">
            {viewMode === 'image' ? (
              // Image view
              item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-muted">
                  No image
                </div>
              )
            ) : (
              // 3D view - only show if model URL exists
              <div className="flex items-center justify-center p-4">
                <ModelViewer
                  url={item.model_url || item.model_3d_url}
                  width="100%"
                  height={500}
                  modelXOffset={0}
                  modelYOffset={0}
                  enableMouseParallax
                  enableHoverRotation
                  environmentPreset="sunset"
                  fadeIn={true}
                  autoRotate={false}
                  autoRotateSpeed={0.35}
                  showScreenshotButton
                />
              </div>
            )}
          </div>
        </div>

        {/* Right side: Details */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {item.is_featured && <Badge variant="gold">{t('ceramics.featured')}</Badge>}
            {item.country && <Badge variant="navy">{item.country}</Badge>}
            {item.era && <Badge variant="info">{item.era}</Badge>}
          </div>

          <h2 className="font-heading text-3xl font-bold text-navy dark:text-ivory">{item.name}</h2>

          <div className="grid gap-3 text-sm">
            {item.origin && (
              <DetailRow label={t('ceramics.detail.origin')} value={item.origin} />
            )}
            {item.country && (
              <DetailRow label={t('ceramics.detail.country')} value={item.country} />
            )}
            {item.era && <DetailRow label={t('ceramics.detail.era')} value={item.era} />}
            {item.style && <DetailRow label={t('ceramics.detail.style')} value={item.style} />}
          </div>

          {item.description && (
            <Section title={t('ceramics.detail.history')}>
              <p>{item.description}</p>
            </Section>
          )}
          {item.characteristics && (
            <Section title={t('ceramics.detail.characteristics')}>
              <p>{item.characteristics}</p>
            </Section>
          )}
          {item.techniques && (
            <Section title={t('ceramics.detail.techniques')}>
              <p>{item.techniques}</p>
            </Section>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-xl border border-stroke px-4 py-2.5 dark:border-dark-stroke">
    <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-text-muted">
      {label}
    </span>
    <span className="text-right text-sm font-semibold text-navy dark:text-ivory">{value}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h4 className="mb-2 font-heading text-base font-bold text-navy dark:text-ivory">{title}</h4>
    <div className="text-sm leading-relaxed text-muted dark:text-dark-text-muted">{children}</div>
  </div>
);

export default CeramicDetailModal;

