import type { ModelOverride, SceneTuning } from './LandingScene3D';
import type { Mode } from '../types/navigation';
import type {
  NumericSceneTuningKey,
  PeopleLayoutPreset,
} from '../hooks/useSceneTuning';

type SceneTuningPanelProps = {
  mode: Mode;
  editMode: boolean;
  onToggleEditMode: () => void;
  sceneTuning: SceneTuning;
  peopleScrollAnimated: boolean;
  onPeopleScrollAnimatedChange: (next: boolean) => void;
  selectedModelId: string | null;
  selectedModelLabel: string | null;
  selectedModelOverride: ModelOverride | null;
  modelFields: Array<{ key: keyof ModelOverride; min: number; max: number; step: number }>;
  tuningFields: Array<{ key: NumericSceneTuningKey; label: string; min: number; max: number; step: number }>;
  peopleLayoutOptions: Array<{ value: PeopleLayoutPreset; label: string }>;
  onPeopleHueColorChange: (value: string) => void;
  onPeopleLayoutPresetChange: (key: 'peopleLayoutPreset' | 'peopleLayoutPresetNarrow', value: PeopleLayoutPreset) => void;
  onPeopleLayoutColumnsChange: (key: 'peopleLayoutColumns' | 'peopleLayoutColumnsNarrow', value: number) => void;
  onSelectedModelFieldChange: (key: keyof ModelOverride, value: number) => void;
  getTuningFieldValue: (key: NumericSceneTuningKey) => number;
  onTuningChange: (key: NumericSceneTuningKey, value: number) => void;
  onResetTuning: () => void;
  onCopyTuning: () => Promise<void>;
};

export default function SceneTuningPanel({
  mode,
  editMode,
  onToggleEditMode,
  sceneTuning,
  peopleScrollAnimated,
  onPeopleScrollAnimatedChange,
  selectedModelId,
  selectedModelLabel,
  selectedModelOverride,
  modelFields,
  tuningFields,
  peopleLayoutOptions,
  onPeopleHueColorChange,
  onPeopleLayoutPresetChange,
  onPeopleLayoutColumnsChange,
  onSelectedModelFieldChange,
  getTuningFieldValue,
  onTuningChange,
  onResetTuning,
  onCopyTuning,
}: SceneTuningPanelProps) {
  if (mode !== 'home' && mode !== 'people') return null;

  return (
    <>
      <button className="tuning-toggle" onClick={onToggleEditMode}>
        {editMode ? 'Close edit mode' : `Edit ${mode === 'people' ? 'people' : 'home'} scene`}
      </button>

      {editMode && (
        <aside className="tuning-panel">
          <h3>{mode === 'people' ? 'People scene edit mode' : 'Scene edit mode'}</h3>
          <p>Drag models in X/Z, then fine tune with sliders. Values auto-save.</p>

          {mode === 'people' && (
            <>
              <label>
                <span>People scroll movement animation</span>
                <input
                  type="checkbox"
                  checked={peopleScrollAnimated}
                  onChange={(event) => onPeopleScrollAnimatedChange(event.target.checked)}
                />
              </label>

              <label>
                <span>People hue color</span>
                <input
                  type="color"
                  value={sceneTuning.peopleHueColor}
                  onChange={(event) => onPeopleHueColorChange(event.target.value)}
                />
              </label>

              <label>
                <span>People layout (desktop/wide)</span>
                <select
                  value={sceneTuning.peopleLayoutPreset}
                  onChange={(event) =>
                    onPeopleLayoutPresetChange('peopleLayoutPreset', event.target.value as PeopleLayoutPreset)
                  }
                >
                  {peopleLayoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {sceneTuning.peopleLayoutPreset !== 'custom' && (
                <label>
                  <span>People columns (desktop/wide)</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    step={1}
                    value={sceneTuning.peopleLayoutColumns}
                    onChange={(event) => onPeopleLayoutColumnsChange('peopleLayoutColumns', Number(event.target.value))}
                  />
                </label>
              )}

              <label>
                <span>People layout (mobile/narrow)</span>
                <select
                  value={sceneTuning.peopleLayoutPresetNarrow}
                  onChange={(event) =>
                    onPeopleLayoutPresetChange('peopleLayoutPresetNarrow', event.target.value as PeopleLayoutPreset)
                  }
                >
                  {peopleLayoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {sceneTuning.peopleLayoutPresetNarrow !== 'custom' && (
                <label>
                  <span>People columns (mobile/narrow)</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    step={1}
                    value={sceneTuning.peopleLayoutColumnsNarrow}
                    onChange={(event) => onPeopleLayoutColumnsChange('peopleLayoutColumnsNarrow', Number(event.target.value))}
                  />
                </label>
              )}
            </>
          )}

          {selectedModelId && selectedModelOverride && (
            <section className="character-editor">
              <h4>Model: {selectedModelLabel ?? selectedModelId}</h4>
              <div className="tuning-fields">
                {modelFields.map((field) => (
                  <label key={field.key}>
                    <span>{field.key.toUpperCase()}</span>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={selectedModelOverride[field.key]}
                      onChange={(event) => onSelectedModelFieldChange(field.key, Number(event.target.value))}
                    />
                    <strong>{selectedModelOverride[field.key].toFixed(2)}</strong>
                  </label>
                ))}
              </div>
            </section>
          )}

          <div className="tuning-fields">
            {tuningFields.map((field) => {
              const value = getTuningFieldValue(field.key);
              return (
                <label key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(event) => onTuningChange(field.key, Number(event.target.value))}
                  />
                  <strong>{value.toFixed(2)}</strong>
                </label>
              );
            })}
          </div>

          <div className="tuning-actions">
            <button onClick={onResetTuning}>Reset all</button>
            <button onClick={() => void onCopyTuning()}>Copy JSON</button>
          </div>
        </aside>
      )}
    </>
  );
}
