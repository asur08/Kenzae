import React from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const StoreLocator: React.FC = () => {
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Kenzae+Boutique+Mulanthuruthy';

  const handleOpenDirections = () => {
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppVisit = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="store-locator" className="bg-canvas border-b border-canvas-border">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-canvas-border flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-normal text-obsidian leading-[1.15]">
            Experience Kenzae
          </h2>
          <p className="text-[14px] text-obsidian-slate">
            Visit our Mulanthuruthy boutique for fabric trials and personalized drape consultations.
          </p>
        </div>

        {/* 12-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white">
          {/* Left Column: Store Details */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
                <div className="space-y-1">
                  <h3 className="font-serif text-[20px] font-normal text-obsidian">
                    {KENZAE_STORE_CONFIG.storeName}
                  </h3>
                  <p className="text-[14px] text-obsidian-slate leading-relaxed">
                    Main Road, {KENZAE_STORE_CONFIG.locality}, {KENZAE_STORE_CONFIG.district} District,{' '}
                    {KENZAE_STORE_CONFIG.state} — {KENZAE_STORE_CONFIG.pincode}
                  </p>
                  <p className="text-[13px] text-brass-dark font-medium">
                    Near Mulanthuruthy Railway Station &amp; Marthoman Cathedral Hub
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
                <div className="space-y-1">
                  <h4 className="text-[14px] font-medium text-obsidian">
                    Boutique hours
                  </h4>
                  <p className="text-[14px] text-obsidian-slate">
                    Monday to Saturday: 10:00 AM – 7:30 PM
                  </p>
                  <p className="text-[13px] text-obsidian-muted">
                    Sunday: 1:00 PM – 6:00 PM (or by prior bridal appointment)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
                <div className="space-y-1">
                  <h4 className="text-[14px] font-medium text-obsidian">
                    Direct contact
                  </h4>
                  <p className="text-[14px] text-obsidian-slate tabular-nums">
                    {KENZAE_STORE_CONFIG.phoneDisplay}
                  </p>
                  <p className="text-[13px] text-obsidian-muted">
                    For fabric inquiries and private trial bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-canvas-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenDirections}
                className="flex-1 h-11 px-5 rounded-[8px] bg-maroon-900 hover:bg-maroon-850 text-white text-[14px] font-medium active:scale-[0.98] transition-[transform,background-color] duration-150 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-white/85" strokeWidth={1.5} />
                <span>Get directions</span>
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="h-11 px-5 rounded-[8px] bg-white hover:bg-canvas-subtle text-obsidian text-[14px] font-medium active:scale-[0.98] transition-[transform,background-color] duration-150 flex items-center justify-center gap-2 border border-canvas-border"
              >
                <MessageCircle className="w-4 h-4 text-obsidian-muted" strokeWidth={1.5} />
                <span>Book trial</span>
              </button>
            </div>
          </div>

          {/* Right Column: Embedded Map */}
          <div className="lg:col-span-6 min-h-[320px] lg:min-h-full relative bg-canvas-subtle border-t lg:border-t-0 lg:border-l border-canvas-border flex flex-col">
            <iframe
              title="Kenzae Store Location"
              src="https://maps.google.com/maps?q=Mulanthuruthy,Ernakulam,Kerala&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full flex-1 min-h-[320px] border-0"
              style={{ filter: 'grayscale(15%) contrast(102%) saturate(88%)' }}
              loading="lazy"
              allowFullScreen
            />

            <div className="px-4 py-3 bg-white border-t border-canvas-border flex items-center justify-between text-[13px] text-obsidian-slate">
              <span>Mulanthuruthy, Ernakulam, Kerala</span>
              <a
                href={KENZAE_STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-maroon-900 hover:text-maroon-800 font-medium"
              >
                <span>View full map</span>
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreLocator;
