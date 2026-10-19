import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import './styles/fonts.css';
import './styles/base.css';
import './styles/nav.css';
import './styles/overlays.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/motion.css';

// Pages other than Home load on demand. A data router is what lets links morph between pages (View Transitions).
const page = load => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    hydrateFallbackElement: <div className="page-loading" />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', lazy: page(() => import('./pages/Shop.jsx')) },
      { path: 'product/:slug', lazy: page(() => import('./pages/Product.jsx')) },
      { path: '*', element: <Home /> }
    ]
  }
], { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_skipActionErrorRevalidation: true } });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>
);
