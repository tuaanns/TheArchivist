import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn, formatNumber } from '../../lib/utils';

export const MethodList = ({ pkg, purchasing, onBack, onPick }) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const methods = [
    {
      id: 'vietqr',
      name: t('payment.method.vietqr'),
      sub: t('payment.method.vietqrSub'),
      iconType: 'icon',
    },
    {
      id: 'momo',
      name: t('payment.method.momo'),
      sub: t('payment.method.momoSub'),
      iconType: 'image',
      iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png',
    },
    {
      id: 'zalopay',
      name: t('payment.method.zalopay'),
      sub: t('payment.method.zalopaySub'),
      iconType: 'image',
      iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="mx-auto max-w-2xl rounded-[30px] border-ceramic-border/75 bg-[#FFFCF7] shadow-[0_24px_54px_-34px_rgba(16,42,86,0.7)] dark:border-ceramic/30 dark:bg-[#101B35]">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-alt text-navy hover:bg-stroke dark:bg-dark-surface-alt dark:text-dark-text dark:hover:bg-dark-stroke"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="font-heading text-xl font-extrabold text-navy dark:text-ivory">
            {t('payment.method.title')}
          </h3>
          <p className="text-xs text-muted dark:text-dark-text-muted">
            {pkg?.name} — {formatNumber(pkg?.credits ?? pkg?.credit_amount)} {t('payment.credits')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {methods.map((m) => (
          <motion.button
            key={m.id}
            type="button"
            disabled={purchasing}
            onClick={() => onPick(m.id)}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -8,
                    scale: 1.018,
                  }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.992 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className={cn(
              'group relative flex items-center justify-between overflow-hidden rounded-2xl border border-ceramic-border/70 bg-white/95 p-5 text-left transition-all dark:border-ceramic/22 dark:bg-[#13203E]',
              'hover:border-ceramic-hover hover:shadow-[0_20px_48px_-32px_rgba(16,42,86,0.6)]',
              purchasing && 'pointer-events-none opacity-60'
            )}
          >
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(140deg, rgba(201,216,230,0.35), transparent 45%)' }} />
            <div className="flex items-center gap-4">
              <div className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-xl bg-surface-alt shadow-sm dark:bg-dark-surface-alt">
                {m.iconType === 'image' ? (
                  <img src={m.iconUrl} alt={m.name} className="h-8 w-8 rounded-md object-contain" />
                ) : (
                  <Building2 className="text-navy dark:text-ceramic" size={22} />
                )}
              </div>
              <div className="relative z-[1]">
                <div className="text-sm font-extrabold text-navy dark:text-ivory">{m.name}</div>
                <div className="text-xs text-muted dark:text-dark-text-muted">{m.sub}</div>
              </div>
            </div>
            {purchasing ? (
              <Loader2 className="relative z-[1] animate-spin text-navy dark:text-ceramic" size={18} />
            ) : (
              <ArrowRight className="relative z-[1] text-muted transition-transform duration-300 group-hover:translate-x-1 dark:text-dark-text-muted" size={18} />
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 border-t border-stroke pt-6 text-center dark:border-dark-stroke">
        <p className="text-xs text-muted dark:text-dark-text-muted">{t('payment.total')}</p>
        <p className="font-heading text-3xl font-black text-navy dark:text-ivory">
          {formatNumber(pkg?.price ?? pkg?.amount ?? 0)} đ
        </p>
      </div>
      </Card>
    </motion.div>
  );
};

export default MethodList;

