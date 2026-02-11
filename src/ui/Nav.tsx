import { RouteKey } from '../scene/layouts';
import { useLabWorldStore } from '../store/useLabWorldStore';

const routes: RouteKey[] = ['home', 'projects', 'people'];

export function Nav(): JSX.Element {
  const route = useLabWorldStore((state) => state.route);
  const setRoute = useLabWorldStore((state) => state.setRoute);

  return (
    <nav className="app-nav" aria-label="Lab navigation">
      {routes.map((routeKey) => {
        const active = routeKey === route;
        return (
          <button
            key={routeKey}
            onClick={() => setRoute(routeKey)}
            className={`app-nav__button ${active ? 'app-nav__button--active' : ''}`}
          >
            {routeKey}
          </button>
        );
      })}
    </nav>
  );
}
