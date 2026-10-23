import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { Spinner, EmptyState } from './components/ui';

const Explore = lazy(() => import('./pages/Explore'));
const FoodDetail = lazy(() => import('./pages/FoodDetail'));
const Districts = lazy(() => import('./pages/Districts').then((m) => ({ default: m.DistrictsIndex })));
const District = lazy(() => import('./pages/Districts').then((m) => ({ default: m.DistrictPage })));
const Community = lazy(() => import('./pages/Community'));
const Passport = lazy(() => import('./pages/Passport'));
const AddFood = lazy(() => import('./pages/AddFood'));
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));

const wrap = (el: React.ReactNode) => (
  <Suspense
    fallback={
      <p className="flex items-center gap-2 py-16 text-ink-soft">
        <Spinner /> Loading…
      </p>
    }
  >
    {el}
  </Suspense>
);

function NotFound() {
  return (
    <div className="py-16">
      <EmptyState title="This page isn’t on the map" action={<Link to="/" className="btn-primary">Go home</Link>}>
        The link may be mistyped.
      </EmptyState>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: wrap(<Explore />) },
      { path: '/food/:id', element: wrap(<FoodDetail />) },
      { path: '/districts', element: wrap(<Districts />) },
      { path: '/district/:id', element: wrap(<District />) },
      { path: '/community', element: wrap(<Community />) },
      { path: '/passport', element: wrap(<Passport />) },
      { path: '/add', element: wrap(<AddFood />) },
      { path: '/about', element: wrap(<About />) },
      { path: '/admin', element: wrap(<Admin />) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
