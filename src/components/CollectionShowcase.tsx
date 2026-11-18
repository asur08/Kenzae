import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCategory } from '../types/catalog';

interface CollectionCardMeta {
  category: ProductCategory;
  title: string;
  subtitle: string;
}

const COLLECTION_CARDS: CollectionCardMeta[] = [
  {
    category: 'Saris',
    title: 'Handwoven Saris',
    subtitle: 'Banarasi Katan, Kasavu & Kanjivaram',
  },
  {
    category: 'Churidars & Salwar Sets',
    title: 'Churidars & Anarkalis',
    subtitle: 'Chanderi, Raw Silk & Mulmul Sets',
  },
  {
    category: 'Unstitched Dress Materials',
    title: 'Dress Materials',
    subtitle: 'Tailored 3-Piece Artisanal Yardage',
  },
  {
    category: 'Kurthis & Ready-to-Wear',
    title: 'Kurthis & Tunics',
    subtitle: 'Georgette Festive & Kalamkari Wear',
  },
];

export const CollectionShowcase: React.FC = () => {
  const { products, filterState, setFilterState } = useCatalog();

  const handleSelectCollection = (category: ProductCategory) => {
    setFilterState((prev) => ({
      ...prev,
      category: prev.category === category ? 'All' : category,
      subCategory: 'All',
    }));
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-canvas border-b border-canvas-border">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brass-dark block">
              Curated Categories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-maroon-950 mt-0.5">
              Browse by Silhouette
            </h2>
          </div>

          {filterState.category !== 'All' && (
            <button
              onClick={() =>
                setFilterState((prev) => ({ ...prev, category: 'All', subCategory: 'All' }))
              }
              className="text-xs font-medium text-maroon-900 hover:text-maroon-800 underline underline-offset-4 shrink-0"
            >
              Show All Pieces
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {COLLECTION_CARDS.map((card) => {
            const categoryProducts = products.filter((p) => p.category === card.category);
            const coverImage = categoryProducts[0]?.images[0];
            const isSelected = filterState.category === card.category;

            return (
              <button
                key={card.category}
                onClick={() => handleSelectCollection(card.category)}
                className={`group text-left rounded-xl overflow-hidden border transition-all duration-300 bg-white flex flex-col ${
                  isSelected
                    ? 'border-maroon-900 ring-1 ring-maroon-900 shadow-editorial'
                    : 'border-canvas-border hover:border-brass/60 shadow-sm hover:shadow-luxury'
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas-subtle">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/65 via-transparent to-transparent" />
                  <span className="absolute bottom-2 right-2.5 text-[10px] font-mono font-semibold text-white/95 bg-maroon-950/75 backdrop-blur-sm px-2 py-0.5 rounded-full tabular-nums">
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 w-full">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-medium text-obsidian group-hover:text-maroon-900 truncate transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-obsidian-slate truncate mt-0.5 font-light">
                      {card.subtitle}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-maroon-900 translate-x-0.5'
                        : 'text-obsidian-muted group-hover:text-maroon-900 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CollectionShowcase;
