import { RouteKey } from '../scene/layouts';
import { useLabWorldStore } from '../store/useLabWorldStore';

const routes: RouteKey[] = ['home', 'projects', 'people'];

export function Nav(): JSX.Element {
  const route = useLabWorldStore((state) => state.route);
  const setRoute = useLabWorldStore((state) => state.setRoute);

  return (
    <nav style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
      {routes.map((routeKey) => {
        const active = routeKey === route;
        return (
          <button
            key={routeKey}
            onClick={() => setRoute(routeKey)}
            style={{
              textTransform: 'capitalize',
              borderRadius: '999px',
              border: active ? '2px solid #5e548e' : '1px solid #9f86c0',
              background: active ? '#e0b1cb' : '#fff',
              color: '#231942',
              padding: '0.45rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {routeKey}
          </button>
        );
      })}
    </nav>
  );
}
