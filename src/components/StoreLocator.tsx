import React from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const StoreLocator: React.FC = () => {
  const handleOpenMaps = () => {
    window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppVisit = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="store-locator" className="py-16 bg-canvas-subtle border-t border-canvas-dark/60">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/10 text-emerald-900 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Visit Our Boutique</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
            Experience Kenzae in Mulanthuruthy
          </h2>
          <p className="text-xs sm:text-sm text-obsidian-muted font-light leading-relaxed">
            Feel the pure silk weaves, inspect intricate embroidery, and enjoy personalized drape consultations at our flagship boutique in Ernakulam, Kerala.
          </p>
        </div>

        {/* Card Grid */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-canvas-dark overflow-hidden shadow-luxury grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Store Details (md:col-span-7) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              
              {/* Address Block */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-emerald-950 text-gold-400 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-emerald-950">
                    {KENZAE_STORE_CONFIG.storeName}
                  </h3>
                  <p className="text-xs sm:text-sm text-obsidian/80 mt-1 leading-relaxed">
                    Main Road, {KENZAE_STORE_CONFIG.locality}, <br />
                    {KENZAE_STORE_CONFIG.district} District, {KENZAE_STORE_CONFIG.state} — {KENZAE_STORE_CONFIG.pincode}
                  </p>
                  <p className="text-[11px] text-emerald-850 font-medium mt-1">
                    Near Mulanthuruthy Railway Station & Town Centre
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-canvas-subtle text-emerald-900 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Boutique Hours
                  </h4>
                  <p className="text-xs text-obsidian/80 mt-0.5">
                    Monday to Saturday: 10:00 AM – 7:30 PM
                  </p>
                  <p className="text-xs text-obsidian-muted mt-0.5">
                    Sunday: 1:00 PM – 6:00 PM (or by prior bridal appointment)
                  </p>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-canvas-subtle text-emerald-900 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Direct Contact & WhatsApp
                  </h4>
                  <p className="text-xs text-obsidian/80 mt-0.5 font-medium">
                    {KENZAE_STORE_CONFIG.phoneDisplay}
                  </p>
                  <p className="text-[11px] text-obsidian-muted">
                    We respond promptly to fabric requests and trial bookings
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-canvas-dark flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenMaps}
                className="flex-1 py-3 px-5 rounded-full bg-emerald-950 hover:bg-emerald-850 text-gold-300 hover:text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-gold-500/40"
              >
                <Navigation className="w-4 h-4 text-gold-400" />
                <span>Get Google Maps Directions</span>
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="py-3 px-5 rounded-full bg-canvas-subtle hover:bg-canvas-muted text-emerald-950 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-canvas-dark"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Book Trial</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Map Representation (md:col-span-5) */}
          <div className="md:col-span-5 bg-emerald-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs text-gold-400">
                <span className="uppercase tracking-widest font-mono text-[10px]">Location Pin</span>
                <span>Ernakulam Hub</span>
              </div>

              <div className="border border-gold-500/30 rounded-xl p-4 bg-emerald-900/60 backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2 text-gold-300 font-serif text-lg">
                  <MapPin className="w-5 h-5 text-gold-400 animate-bounce" />
                  <span>Kenzae Boutique</span>
                </div>
                <p className="text-xs text-canvas/80 leading-relaxed font-light">
                  Conveniently situated in Mulanthuruthy, easily reachable from Kochi, Tripunithura, Piravom, and Kottayam routes.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-gold-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Ample parking & trial rooms available</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <a
                href={KENZAE_STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <span>Open Location in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default StoreLocator;
