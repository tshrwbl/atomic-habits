import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { Habit } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { triggerCompletionConfetti } from '../utils/confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onImportHabits: (importedHabits: Habit[], mode: 'merge' | 'replace') => void;
  preSelectedHabitId?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  habits,
  onImportHabits,
  preSelectedHabitId,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Export State
  const [exportType, setExportType] = useState<'clean' | 'full'>('clean'); // 'clean' = recipe/template only, 'full' = with history
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Import State
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedHabits, setParsedHabits] = useState<Habit[] | null>(null);

  // Initialize selected habits when opened
  useEffect(() => {
    if (preSelectedHabitId) {
      setSelectedHabitIds([preSelectedHabitId]);
    } else {
      setSelectedHabitIds(habits.map((h) => h.id));
    }
  }, [preSelectedHabitId, habits, isOpen]);

  // Reset import state when opened
  useEffect(() => {
    if (isOpen) {
      setImportText('');
      setImportError(null);
      setParsedHabits(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build Export JSON payload
  const habitsToExport = habits
    .filter((h) => selectedHabitIds.includes(h.id))
    .map((h) => {
      if (exportType === 'clean') {
        // Clean recipe: strip out personal completion history, but retain 1% Betterment engine parameters
        const { completedDates, bettermentLogs, ...rest } = h;
        return {
          ...rest,
          completedDates: [],
          createdAt: getTodayDateString(),
        };
      }
      return h;
    });

  const exportPayload = {
    version: '2.0',
    type: exportType === 'clean' ? 'atomic-habits-routine' : 'atomic-habits-backup',
    exportedAt: new Date().toISOString(),
    count: habitsToExport.length,
    habits: habitsToExport,
  };

  const exportJsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = exportJsonString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadFile = () => {
    const filename = `atomic-habits-${exportType}-${getTodayDateString()}.json`;
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validate incoming JSON text or file
  const handleValidateJson = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setImportError(null);
      setParsedHabits(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      let list: any[] = [];

      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.habits)) {
        list = parsed.habits;
      } else if (parsed && typeof parsed === 'object' && parsed.title) {
        // Single habit object
        list = [parsed];
      } else {
        setImportError('JSON must contain a list of habits or a valid Atomic Habits export file.');
        setParsedHabits(null);
        return;
      }

      // Validate that items look like habits
      const validHabits: Habit[] = list.map((item, idx) => ({
        id: item.id || `imported-${Date.now()}-${idx}`,
        title: String(item.title || 'Untitled Habit'),
        identity: String(item.identity || 'Better Self'),
        timeOfDay: ['morning', 'afternoon', 'evening', 'anytime'].includes(item.timeOfDay) ? item.timeOfDay : 'anytime',
        habitStack: item.habitStack,
        twoMinuteVersion: item.twoMinuteVersion,
        attractiveReward: item.attractiveReward,
        completedDates: Array.isArray(item.completedDates) ? item.completedDates : [],
        createdAt: item.createdAt || getTodayDateString(),
        betterment: item.betterment,
        bettermentLogs: item.bettermentLogs || {},
      }));

      if (validHabits.length === 0) {
        setImportError('No recognizable habits found in JSON.');
        setParsedHabits(null);
      } else {
        setImportError(null);
        setParsedHabits(validHabits);
      }
    } catch (err: any) {
      setImportError(`Invalid JSON syntax: ${err.message}`);
      setParsedHabits(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidateJson(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedHabits || parsedHabits.length === 0) return;
    onImportHabits(parsedHabits, importMode);
    triggerCompletionConfetti();
    onClose();
  };

  const handleToggleHabitSelect = (id: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedHabitIds(habits.map((h) => h.id));
  };

  const handleDeselectAll = () => {
    setSelectedHabitIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Share & Import / Export Habits
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Share routines as JSON or backup & restore your habits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 px-6 pt-2 bg-stone-50/50 dark:bg-stone-900/50">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export & Share ({habitsToExport.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Export Mode */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                  Export Purpose:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportType('clean')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      exportType === 'clean'
                        ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-white shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Share Routine (Clean Recipe)</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      Includes identities, 4 laws & 1% engine. Strips your personal completion dates for sharing with others.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportType('full')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      exportType === 'full'
                        ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-white shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Full Backup (With History)</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      Includes all past completion dates, streaks, and logged metrics for device transfers.
                    </p>
                  </button>
                </div>
              </div>

              {/* Select habits to include */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Choose Habits to Include ({selectedHabitIds.length} of {habits.length}):
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-stone-400 dark:text-stone-600">&bull;</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-semibold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                  {habits.map((habit) => {
                    const isChecked = selectedHabitIds.includes(habit.id);
                    return (
                      <label
                        key={habit.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-amber-500/10 text-stone-900 dark:text-white font-medium'
                            : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleHabitSelect(habit.id)}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="truncate">{habit.title}</span>
                        </div>
                        <span className="text-[10px] text-stone-600 dark:text-stone-400 font-semibold capitalize px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-700/80 flex-shrink-0">
                          {habit.identity}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  disabled={habitsToExport.length === 0}
                  className={`w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-sm'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy JSON to Clipboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  disabled={habitsToExport.length === 0}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json File</span>
                </button>
              </div>

              {/* Formatted JSON Preview Box */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  <span>Formatted JSON Preview:</span>
                  <span>{exportJsonString.length} bytes</span>
                </div>
                <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36 leading-tight border border-stone-800">
                  {exportJsonString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-file-input"
                />
                <label htmlFor="json-file-input" className="cursor-pointer block space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Click to browse or drop an Atomic Habits JSON file
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-400">
                    Accepts .json files exported from Atomic Habits
                  </div>
                </label>
              </div>

              {/* Paste Textarea */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Or Paste JSON Directly:
                </label>
                <textarea
                  rows={4}
                  placeholder='Paste JSON here (e.g. {"habits": [...]})'
                  value={importText}
                  onChange={(e) => handleValidateJson(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Validation Status Box */}
              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedHabits && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Valid JSON: Found {parsedHabits.length} habits ready to import!</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedHabits.slice(0, 5).map((h) => (
                      <span
                        key={h.id}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 truncate max-w-[200px]"
                      >
                        {h.title}
                      </span>
                    ))}
                    {parsedHabits.length > 5 && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        +{parsedHabits.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Import Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                  Import Action:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      importMode === 'merge'
                        ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-white font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="text-xs">Merge & Add (Recommended)</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400 font-normal mt-0.5">
                      Adds shared habits without overwriting your existing habits.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'border-rose-500 bg-rose-500/10 text-stone-900 dark:text-white font-bold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="text-xs text-rose-700 dark:text-rose-400 font-bold">Replace Everything</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400 font-normal mt-0.5">
                      Replaces all current habits with the imported dataset.
                    </div>
                  </button>
                </div>
              </div>

              {/* Confirm Import Button */}
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!parsedHabits || parsedHabits.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {importMode === 'merge' ? 'Merge' : 'Replace with'}{' '}
                  {parsedHabits ? `${parsedHabits.length} Habits` : 'Habits'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
