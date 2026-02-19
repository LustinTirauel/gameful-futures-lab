import LandingScene3D, { type ModelOverride, type SceneTuning } from '../LandingScene3D';
import type { EditableModelId } from '../../hooks/useSceneTuning';
import type { Mode } from '../../types/navigation';

type SceneViewportProps = {
  mode: Mode;
  scene3DFailed: boolean;
  peopleScrollActive: boolean;
  onWheel?: (event: React.WheelEvent<HTMLDivElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
  sceneCharacters: React.ComponentProps<typeof LandingScene3D>['characters'];
  movementBehavior: 'idle' | 'run';
  onSceneRuntimeError: () => void;
  tuning: SceneTuning;
  editMode: boolean;
  selectedModelId: EditableModelId | null;
  onSelectModel: (id: EditableModelId) => void;
  onCharacterOverrideChange: (characterId: string, nextOverride: ModelOverride) => void;
  onFireOverrideChange: (nextOverride: ModelOverride) => void;
  onEnvironmentOverrideChange: (modelId: string, nextOverride: ModelOverride) => void;
  onCharacterActivate: (personId: string) => void;
  peopleScrollProgress: number;
  peopleScrollAnimated: boolean;
  onPeopleScrollEnabledChange: (enabled: boolean) => void;
};

// This component is a narrow adapter around LandingScene3D.
// It decides when the 3D viewport should render and which interaction handlers are active.
export default function SceneViewport({
  mode,
  scene3DFailed,
  peopleScrollActive,
  onWheel,
  onTouchStart,
  onTouchMove,
  sceneCharacters,
  movementBehavior,
  onSceneRuntimeError,
  tuning,
  editMode,
  selectedModelId,
  onSelectModel,
  onCharacterOverrideChange,
  onFireOverrideChange,
  onEnvironmentOverrideChange,
  onCharacterActivate,
  peopleScrollProgress,
  peopleScrollAnimated,
  onPeopleScrollEnabledChange,
}: SceneViewportProps) {
  // We only render the 3D canvas in Home/People mode, and skip it entirely if runtime failed.
  if ((mode !== 'home' && mode !== 'people') || scene3DFailed) return null;

  return (
    <div
      className="scene-viewport"
      style={{ height: '100vh', touchAction: peopleScrollActive ? 'none' : 'auto' }}
      onWheel={peopleScrollActive ? onWheel : undefined}
      onTouchStart={peopleScrollActive ? onTouchStart : undefined}
      onTouchMove={peopleScrollActive ? onTouchMove : undefined}
    >
      {/* LandingScene3D receives all scene behavior as props so state stays controlled from the page/hook layer. */}
      <LandingScene3D
        characters={sceneCharacters}
        movementBehavior={movementBehavior}
        mode={mode}
        onRuntimeError={onSceneRuntimeError}
        tuning={tuning}
        editMode={editMode}
        selectedModelId={selectedModelId}
        onSelectModel={(id) => onSelectModel(id as EditableModelId)}
        onCharacterOverrideChange={onCharacterOverrideChange}
        onFireOverrideChange={onFireOverrideChange}
        onEnvironmentOverrideChange={onEnvironmentOverrideChange}
        onCharacterActivate={onCharacterActivate}
        peopleScrollProgress={peopleScrollProgress}
        peopleScrollAnimated={peopleScrollAnimated}
        onPeopleScrollEnabledChange={onPeopleScrollEnabledChange}
      />
    </div>
  );
}
