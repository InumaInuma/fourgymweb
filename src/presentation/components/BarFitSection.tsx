import React from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Batido Whey Pro Recovery',
    category: 'Proteínas',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400&auto=format&fit=crop',
    description: 'Batido de proteína aislado con plátano y leche de almendras.'
  },
  {
    id: '2',
    name: 'Intra-Workout BCAAs',
    category: 'Hidratación',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400&auto=format&fit=crop',
    description: 'Aminoácidos ramificados con electrolitos sabor frutos rojos.'
  },
  {
    id: '3',
    name: 'Energy Shake Avena & Cacao',
    category: 'Pre-Entreno',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?q=80&w=400&auto=format&fit=crop',
    description: 'Batido pre-entreno con avena, cacao orgánico y miel.'
  },
  {
    id: '4',
    name: 'Barra Proteica Crunchy',
    category: 'Snacks',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=400&auto=format&fit=crop',
    description: 'Barra de proteína de maní baja en azúcar y gluten free.'
  },
  {
    id: '5',
    name: 'C4 Caffeinated Shot',
    category: 'Pre-Entreno',
    price: 7.00,
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400&auto=format&fit=crop',
    description: 'Bebida pre-entreno carbonatada para un pump explosivo.'
  }
];

export const BarFitSection: React.FC = () => {
  return (
    <div className="w-full space-y-4 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent-cyan rounded-full animate-pulse"></span>
          Recupérate en el Bar Fit
        </h2>
        <span className="text-xs text-text-secondary">Pide en recepción</span>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="flex-shrink-0 w-64 snap-start bg-slate-950/40 border border-white/5 hover:border-accent-cyan/20 rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 group hover:scale-[1.01]"
          >
            <div>
              {/* Product Image */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] text-accent-cyan border border-accent-cyan/20 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {prod.category}
                </span>
              </div>

              {/* Info */}
              <h3 className="text-xs font-black text-white line-clamp-1 group-hover:text-accent-cyan transition-colors uppercase">
                {prod.name}
              </h3>
              <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 h-7">
                {prod.description}
              </p>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
              <span className="text-sm font-black text-white font-mono">
                S/ {prod.price.toFixed(2)}
              </span>
              <span className="text-[9px] text-brand-green font-bold uppercase tracking-wider bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-lg">
                Comprar
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
