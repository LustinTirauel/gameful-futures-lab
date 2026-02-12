type Mode = 'home' | 'people' | 'projects';

type TopNavProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

const modes: Mode[] = ['home', 'people', 'projects'];

export default function TopNav({ mode, onModeChange }: TopNavProps) {
  return (
    <nav className="nav">
      {modes.map((item) => (
        <button key={item} className={item === mode ? 'active' : ''} onClick={() => onModeChange(item)}>
          {item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </nav>
  );
}
