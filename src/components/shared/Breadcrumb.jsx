import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/70 mb-6">
      <Link to="/" className="flex items-center gap-1 hover:text-copper transition-colors">
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-white/40" />
          {item.path ? (
            <Link to={item.path} className="hover:text-copper transition-colors">
              {item.name}
            </Link>
          ) : (
            <span>{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
}