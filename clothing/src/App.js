import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Code-split routes for faster initial load
const Navigation = lazy(() => import('./routes/navigation/navigation.component'));
const Home = lazy(() => import('./routes/home/home.component'));
const Shop = lazy(() => import('./routes/shop/shop.component'));
const Authentication = lazy(() => import('./routes/authentication/authentication.component'));
const Checkout = lazy(() => import('./routes/checkout/checkout.component'));

const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      fontSize: '1.2rem',
      color: 'var(--color-text-secondary)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 12px',
        }}
      />
      Loading...
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />
          <Route path="shop/*" element={<Shop />} />
          <Route path="auth" element={<Authentication />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;