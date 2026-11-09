import { useEffect, useState } from 'react';
import './App.css';
import { listenToProducts } from './firebase/products';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // LOAD PRODUCTS FROM FIREBASE
  useEffect(() => {
    const unsubscribe = listenToProducts(
      (firebaseProducts) => {
        setProducts(firebaseProducts);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Product loading error:', err);
        setError('Unable to load products. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // PRODUCT CATEGORIES
  const categories = [
    'All',
    'Smartphones',
    'Smartwatches',
    'Earphones',
    'Accessories'
  ];

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase().trim();

    const productName = (product.name || '').toLowerCase();
    const productBrand = (product.brand || '').toLowerCase();
    const productCategory = (product.category || '').toLowerCase();

    const matchesSearch =
      productName.includes(search) ||
      productBrand.includes(search);

    const matchesCategory =
      selectedCategory === 'All' ||
      productCategory === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Smartphones' &&
        productCategory === 'smartphone') ||
      (selectedCategory === 'Smartwatches' &&
        productCategory === 'smartwatch') ||
      (selectedCategory === 'Earphones' &&
        productCategory === 'earphone') ||
      (selectedCategory === 'Accessories' &&
        ['accessory', 'phone accessories', 'phone covers'].includes(
          productCategory
        ));

    return matchesSearch && matchesCategory;
  });

  // FEATURED PRODUCTS
  const featuredProducts = products.filter(
    (product) =>
      product.featured === true &&
      product.available !== false
  );

  // If no products are marked as featured,
  // automatically display the first four available products.
  const displayedFeaturedProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : products
          .filter((product) => product.available !== false)
          .slice(0, 4);

  return (
    <div className="website">

      {/* NAVIGATION */}
      <nav className="navbar" id="home">

        <a href="#home" className="brand">

          <img
            src="/image/zion-logo.png"
            alt="ZION MOBILE PHONES Logo"
            className="zion-logo"
          />

          <div className="brand-text">
            <h2>ZION</h2>
            <span>MOBILE PHONES</span>
          </div>

        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#phones">Products</a>
          <a href="#loans">Phone Loans</a>
          <a href="#contact">Contact</a>
        </div>

        <a
          className="nav-button"
          href="https://wa.me/256709023059"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp Us
        </a>

      </nav>

      {/* PROMOTIONAL BANNER */}
      <section className="promo-banner">

        <div className="promo-content">

          <span className="promo-label">
            ZION MOBILE PHONES
          </span>

          <h2>
            NEW ARRIVALS & SPECIAL OFFERS!
          </h2>

          <p>
            Discover the latest smartphones and accessories.
            Quality phones at affordable prices.
            Buy on cash or explore our flexible loan options.
          </p>

          <a href="#phones">
            Explore Our Products →
          </a>

        </div>

      </section>

      {/* HERO SECTION */}
      <section className="hero">

        <div className="hero-content">

          <p className="tagline">
            WELCOME TO ZION MOBILE PHONES
          </p>

          <h1>
            Your World of <span>Smart Technology</span>
          </h1>

          <p>
            Discover quality smartphones, smartwatches,
            earphones and accessories at affordable prices.
            Buy on cash or explore our flexible phone loan options.
          </p>

          <div className="hero-buttons">

            <a href="#phones" className="primary-btn">
              Explore Products
            </a>

            <a
              href="https://wa.me/256709023059"
              className="secondary-btn"
              target="_blank"
              rel="noreferrer"
            >
              Contact Us
            </a>

          </div>

        </div>

      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="featured-section">

        <div className="section-heading">

          <span className="featured-label">
            HANDPICKED FOR YOU
          </span>

          <h2>Featured Products</h2>

          <p>
            Check out some of our selected phones
            and accessories at ZION MOBILE PHONES.
          </p>

        </div>

        {loading && (
          <p className="no-products">
            Loading featured products...
          </p>
        )}

        {!loading && !error && displayedFeaturedProducts.length === 0 && (
          <p className="no-products">
            Featured products will appear here soon.
          </p>
        )}

        <div className="featured-grid">

          {!loading && !error &&
            displayedFeaturedProducts.map((product) => (

              <div className="featured-card" key={product.id}>

                <div className="featured-badge">
                  FEATURED
                </div>

                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name || 'Zion product'}
                  />
                )}

                <div className="featured-info">

                  <h3>{product.name}</h3>

                  <p>
                    {product.brand || 'Quality Smartphone'}
                  </p>

                  <h3>
                    UGX{' '}
                    {Number(
                      product.cashPrice ?? product.cashprice ?? 0
                    ).toLocaleString('en-UG')}
                  </h3>

                  <a
                    href={`https://wa.me/256709023059?text=${encodeURIComponent(
                      `Hello ZION MOBILE PHONES. I am interested in ${product.name}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enquire on WhatsApp
                  </a>

                </div>

              </div>

            ))}

        </div>

      </section>

      {/* PRODUCTS SECTION */}
      <section className="products" id="phones">

        <div className="section-heading">

          <h2>Our Available Products</h2>

          <p>
            Explore phones and accessories available at ZION MOBILE PHONES.
          </p>

        </div>

        {/* PRODUCT SEARCH */}
        <div className="product-search">

          <input
            type="text"
            placeholder="Search by phone name or brand..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

        </div>

        {/* CATEGORY FILTERS */}
        <div className="category-filters">

          {categories.map((category) => (

            <button
              key={category}
              type="button"
              className={
                selectedCategory === category
                  ? 'active-category'
                  : ''
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>

          ))}

        </div>

        {/* LOADING MESSAGE */}
        {loading && (
          <p className="no-products">
            Loading products...
          </p>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <p className="no-products">
            {error}
          </p>
        )}

        {/* EMPTY PRODUCTS MESSAGE */}
        {!loading && !error && products.length === 0 && (
          <p className="no-products">
            No products available at the moment.
          </p>
        )}

        {/* NO SEARCH RESULTS */}
        {!loading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (

            <p className="no-products">
              No products match your search or selected category.
            </p>

          )}

        {/* PRODUCT GRID */}
        <div className="product-grid">

          {!loading && !error &&
            filteredProducts.map((product) => (

              <div className="product-card" key={product.id}>

                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name || 'Zion product'}
                  />
                )}

                <div className="product-info">

                  <h3>{product.name}</h3>

                  <p>
                    Brand: {product.brand || 'Not specified'}
                  </p>

                  <p>
                    Category: {product.category || 'Not specified'}
                  </p>

                  <p>
                    {product.description}
                  </p>

                  <h3>
                    Cash Price: UGX{' '}
                    {Number(
                      product.cashPrice ?? product.cashprice ?? 0
                    ).toLocaleString('en-UG')}
                  </h3>

                  <p>
                    Loan Deposit: UGX{' '}
                    {Number(
                      product.loanDeposit ??
                      product['loan deposit'] ??
                      0
                    ).toLocaleString('en-UG')}
                  </p>

                  <p>
                    Stock: {product.stock ?? 'Not specified'}
                  </p>

                  <p>
                    Status:{' '}
                    {product.available ? 'Available' : 'Unavailable'}
                  </p>

                  <a
                    href={`https://wa.me/256709023059?text=${encodeURIComponent(
                      `Hello ZION MOBILE PHONES. I am interested in ${product.name}. Please give me more information about cash and loan purchasing options.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Enquire / Order on WhatsApp
                  </a>

                </div>

              </div>

            ))}

        </div>

      </section>

      {/* PHONE LOAN SECTION */}
      <section className="loans" id="loans">

        <h2>Get Your Dream Phone Today!</h2>

        <p>
          Buy your favourite smartphone on cash or ask us
          about our flexible phone loan arrangements.
        </p>

        <a
          href="https://wa.me/256709023059?text=Hello%20ZION%20MOBILE%20PHONES.%20I%20would%20like%20to%20know%20about%20your%20phone%20loan%20options."
          target="_blank"
          rel="noreferrer"
        >
          Inquire About Phone Loans
        </a>

      </section>

      {/* FOOTER */}
      <footer id="contact">

        <h2>ZION MOBILE PHONES</h2>

        <p>
          Location: Mukono Town, Jinja Road,
          opposite Paris Corner Supermarket.
        </p>

        <p>
          Call/WhatsApp: 0709023059
        </p>

        <p>
          Quality Phones. Affordable Prices. Trusted Service.
        </p>

        <p>
          © 2026 ZION MOBILE PHONES. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;