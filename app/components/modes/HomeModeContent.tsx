import type { Mode } from '../../types/navigation';

type HomeModeContentProps = {
  mode: Mode;
  editMode: boolean;
};

export default function HomeModeContent({ mode, editMode }: HomeModeContentProps) {
  if (mode !== 'home' || editMode) return null;

  return (
    <div className="center-copy">
      <h1>Gameful Futures Lab</h1>
      <p>We build futures through games and play!</p>
    </div>
  );
}
