import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stroke bg-navy dark:border-dark-stroke dark:bg-navy-dark">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="The Archivist" className="h-10 w-10 object-contain" />
              <h3 className="font-heading text-xl font-bold text-ivory">
                The Archivist
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ivory/80">
              {t('app.tagline')}
            </p>
            <div className="mt-4 flex gap-3">
              <SocialLink href="https://facebook.com" icon={<Facebook size={16} />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={16} />} />
              <SocialLink href="https://github.com" icon={<Github size={16} />} />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-ivory/70">
              {t('footer.product')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/" label={t('nav.home')} />
              </li>
              <li>
                <FooterLink to="/ceramics" label={t('nav.lines')} />
              </li>
              <li>
                <FooterLink to="/history" label={t('nav.history')} />
              </li>
              <li>
                <FooterLink to="/payment" label={t('nav.payment')} />
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-ivory/70">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <FooterLink to="/contact" label={t('nav.contact')} />
              </li>
              <li>
                <FooterLink to="/about" label={t('nav.about')} />
              </li>
              <li>
                <FooterLink to="/terms" label={t('nav.terms')} />
              </li>
              <li>
                <FooterLink to="/privacy" label={t('nav.privacy')} />
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-ivory/70">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-ivory/80">
                <Mail size={16} className="mt-0.5 shrink-0 text-ceramic" />
                <a href="mailto:dongnguyenkh123@gmail.com" className="hover:text-ivory transition-colors">
                  dongnguyenkh123@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-ivory/80">
                <Phone size={16} className="mt-0.5 shrink-0 text-ceramic" />
                <a href="tel:0949085842" className="hover:text-ivory transition-colors">
                  0949 085 842
                </a>
              </li>
              <li className="flex items-start gap-2 text-ivory/80">
                <MapPin size={16} className="mt-0.5 shrink-0 text-ceramic" />
                <span>Cần Thơ, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ivory/20 pt-6">
          <p className="text-center text-xs text-ivory/70">
            {t('footer.rights', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <Link
    to={to}
    className="text-ivory/80 transition-colors hover:text-ivory"
  >
    {label}
  </Link>
);

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/30 text-ivory/80 transition-colors hover:border-ceramic hover:bg-ceramic/10 hover:text-ceramic"
  >
    {icon}
  </a>
);

export default Footer;

