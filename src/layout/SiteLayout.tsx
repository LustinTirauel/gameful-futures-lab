import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { RouteKey } from '../scene/layouts';
import { LabScene } from '../scene/LabScene';
import { useLabWorldStore } from '../store/useLabWorldStore';

const routeByPath: Record<string, RouteKey> = {
  '/': 'home',
  '/projects': 'projects',
  '/people': 'people',
};

const navItems: Array<{ label: string; to: string }> = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'People', to: '/people' },
];

export function SiteLayout(): JSX.Element {
  const location = useLocation();
  const setRoute = useLabWorldStore((state) => state.setRoute);

  useEffect(() => {
    setRoute(routeByPath[location.pathname] ?? 'home');
  }, [location.pathname, setRoute]);

  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: '1.5rem 1rem 2rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(#f8edff, #f1f7ff)',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#231942' }}>Gameful Futures Lab — Interactive Site Skeleton</h1>
        <p style={{ margin: 0, color: '#5e548e' }}>
          Route-aware characters run to Home, Projects clusters, or People alphabetical placements.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              textDecoration: 'none',
              borderRadius: '999px',
              border: isActive ? '2px solid #5e548e' : '1px solid #9f86c0',
              background: isActive ? '#e0b1cb' : '#fff',
              color: '#231942',
              padding: '0.45rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <LabScene />

      <section
        style={{
          maxWidth: '960px',
          margin: '1rem auto 0',
          background: '#ffffffc9',
          borderRadius: '12px',
          padding: '1rem',
          color: '#231942',
          lineHeight: 1.4,
        }}
      >
        <Outlet />
      </section>
    </main>
  );
}
