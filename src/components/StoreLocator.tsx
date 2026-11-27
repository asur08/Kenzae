import React from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const StoreLocator: React.FC = () => {
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Kenzae+Boutique+Mulanthuruthy";

  const handleOpenDirections = () => {
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppVisit = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="store-locator" className="py-16 bg-canvas-subtle border-t border-canvas-border">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-obsidian">
            Experience Kenzae
          </h2>
          <p className="text-xs sm:text-sm text-obsidian-slate font-light leading-relaxed">
            Feel the pure silk weaves, inspect intricate embroidery, and enjoy personalized drape consultations at our boutique.
          </p>
        </div>

        {/* Card Grid with Responsive Embedded Map */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-canvas-line overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Clean Store Visit Card (lg:col-span-6) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              
              {/* Address Block */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-maroon-950 text-brass-light shrink-0 mt-0.5 shadow-sm">
                  <MapPin className="w-5 h-5 text-brass" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-obsidian">
                    {KENZAE_STORE_CONFIG.storeName}
                  </h3>
                  <p className="text-xs sm:text-sm text-obsidian-slate mt-1 leading-relaxed">
                    Main Road, {KENZAE_STORE_CONFIG.locality}, <br />
                    {KENZAE_STORE_CONFIG.district} District, {KENZAE_STORE_CONFIG.state} {KENZAE_STORE_CONFIG.pincode}
                  </p>
                  <p className="text-[11px] text-brass-dark font-medium mt-1">
                    Near Mulanthuruthy Railway Station &amp; Marthoman Cathedral Hub
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-canvas-subtle text-maroon-900 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-obsidian">
                    Boutique Hours
                  </h4>
                  <p className="text-xs text-obsidian-slate mt-0.5 font-medium">
                    Monday to Saturday: 10:00 AM – 7:30 PM
                  </p>
                  <p className="text-xs text-obsidian-muted mt-0.5">
                    Sunday: 1:00 PM – 6:00 PM (or by prior bridal appointment)
                  </p>
                </div>
              </div>

              {/* Phone & Inquiries */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-canvas-subtle text-maroon-900 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-obsidian">
                    Direct Contact &amp; Inquiries
                  </h4>
                  <p className="text-xs text-obsidian-slate mt-0.5 font-medium tabular-nums">
                    {KENZAE_STORE_CONFIG.phoneDisplay}
                  </p>
                  <p className="text-[11px] text-obsidian-muted">
                    We respond promptly to fabric requests and trial bookings
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons: Direct One-Click Get Directions Button */}
            <div className="pt-4 border-t border-canvas-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenDirections}
                className="flex-1 py-3 px-5 rounded-full bg-maroon-950 hover:bg-maroon-900 text-brass-light hover:text-white text-xs font-bold transition-[transform,background-color] duration-150 flex items-center justify-center gap-2 border border-brass/40 active:scale-[0.97]"
              >
                <Navigation className="w-4 h-4 text-brass" />
                <span>Get Directions</span>
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="py-3 px-5 rounded-full bg-canvas-subtle hover:bg-canvas-border text-obsidian text-xs font-semibold active:scale-[0.97] transition-[transform,background-color] duration-150 flex items-center justify-center gap-2 border border-canvas-border"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Book Trial</span>
              </button>
            </div>
          </div>

          {/* Right Column: Responsive Embedded Google Map (lg:col-span-6) */}
          <div className="lg:col-span-6 min-h-[300px] lg:min-h-full relative bg-canvas-subtle border-t lg:border-t-0 lg:border-l border-canvas-border flex flex-col">
            <iframe
              title="Kenzae Store Location"
              src="https://maps.google.com/maps?q=Mulanthuruthy,Ernakulam,Kerala&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[320px] border-0"
              style={{ filter: 'grayscale(15%) contrast(102%) saturate(88%)' }}
              loading="lazy"
              allowFullScreen
            />

            {/* Quick Map Link Bar */}
            <div className="p-3 bg-white border-t border-canvas-border flex items-center justify-between text-xs text-obsidian-slate">
              <span className="text-[11px] font-medium">Mulanthuruthy, Ernakulam, Kerala</span>
              <a
                href={KENZAE_STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brass-dark hover:text-maroon-950 font-semibold"
              >
                <span>View Full Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default StoreLocator;
