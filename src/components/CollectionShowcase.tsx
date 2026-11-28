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
    title: 'Handwoven saris',
    subtitle: 'Banarasi Katan, Kasavu & Kanjivaram',
  },
  {
    category: 'Churidars & Salwar Sets',
    title: 'Churidars & Anarkalis',
    subtitle: 'Chanderi, Raw Silk & Mulmul sets',
  },
  {
    category: 'Unstitched Dress Materials',
    title: 'Dress materials',
    subtitle: 'Tailored 3-piece artisanal yardage',
  },
  {
    category: 'Kurthis & Ready-to-Wear',
    title: 'Kurthis & tunics',
    subtitle: 'Georgette festive & Kalamkari wear',
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
    <section className="bg-canvas border-b border-canvas-border">
      <div className="max-w-[1600px] mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-baseline justify-between gap-4 border-b border-canvas-border">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-normal text-obsidian leading-[1.15]">
            Browse by silhouette
          </h2>

          {filterState.category !== 'All' && (
            <button
              onClick={() =>
                setFilterState((prev) => ({ ...prev, category: 'All', subCategory: 'All' }))
              }
              className="text-[13px] font-medium text-maroon-900 hover:text-maroon-800 underline underline-offset-4 shrink-0 transition-colors duration-150"
            >
              Show all pieces
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-canvas-border lg:border-b-0">
          {COLLECTION_CARDS.map((card, index) => {
            const categoryProducts = products.filter((p) => p.category === card.category);
            const coverImage = categoryProducts[0]?.images[0];
            const isSelected = filterState.category === card.category;

            return (
              <button
                key={card.category}
                onClick={() => handleSelectCollection(card.category)}
                className={`group text-left flex flex-col transition-colors duration-150 border-canvas-border ${
                  index % 2 === 0 ? 'border-r' : 'border-r-0 lg:border-r'
                } ${index < 2 ? 'border-b lg:border-b-0' : ''} ${
                  index === 3 ? 'lg:border-r-0' : ''
                } ${
                  isSelected
                    ? 'bg-canvas-subtle'
                    : 'bg-white hover:bg-canvas'
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas-subtle border-b border-canvas-border">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  )}
                </div>

                <div className="p-4 sm:p-5 flex items-start justify-between gap-3 w-full">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-[18px] sm:text-[20px] font-normal text-obsidian group-hover:text-maroon-900 truncate transition-colors duration-150">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-obsidian-slate truncate">
                      {card.subtitle}
                    </p>
                    <p className="text-xs text-obsidian-muted tabular-nums pt-0.5">
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 mt-1 transition-colors duration-150 ${
                      isSelected
                        ? 'text-maroon-900'
                        : 'text-obsidian-muted group-hover:text-obsidian'
                    }`}
                    strokeWidth={1.5}
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
