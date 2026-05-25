import { useState } from 'react'
import PropTypes from 'prop-types'

const PresetSwitcher = ({ presets, activePresetId, onChange }) => {
  const [open, setOpen] = useState(false)
  const activePreset = presets.find((preset) => preset.id === activePresetId) || presets[0]

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Select color preset"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: activePreset.colors.accent }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-2 shadow-xl">
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Presets
          </div>
          <div className="space-y-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChange(preset.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: preset.colors.accent }}
                />
                <span className="flex-1">{preset.name}</span>
                {preset.id === activePresetId && (
                  <span className="text-xs font-semibold text-[var(--app-accent)]">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

PresetSwitcher.propTypes = {
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      colors: PropTypes.shape({
        accent: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
  activePresetId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default PresetSwitcher
