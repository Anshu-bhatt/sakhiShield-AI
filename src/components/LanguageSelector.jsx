// src/components/LanguageSelector.jsx — CREATE this file

const LANGUAGES = [
  { code: 'gu-IN', label: 'ગુજ', full: 'Gujarati' },
  { code: 'hi-IN', label: 'हिं', full: 'Hindi' },
  { code: 'en-IN', label: 'Eng', full: 'English' },
]

export default function LanguageSelector({ selected, onChange }) {
  return (
    <div className="flex gap-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`text-xs px-2 py-1 rounded-full font-bold transition-colors ${
            selected === lang.code
              ? 'bg-purple-700 text-white'
              : 'bg-purple-100 text-purple-600'
          }`}
          title={lang.full}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}