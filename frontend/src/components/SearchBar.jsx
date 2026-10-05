import { categories } from '../data/categories';
import Icon from './Icon';

function SearchBar({ search, setSearch, category, setCategory, sort, setSort }) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <Icon name="search" size={18} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="">Newest first</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}

export default SearchBar;
