import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { Habit } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { triggerCompletionConfetti } from '../utils/confetti';
import { Modal } from './Modal';

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
        list = [parsed];
      } else {
        setImportError('JSON must contain a list of habits or a valid Atomic Habits export file.');
        setParsedHabits(null);
        return;
      }

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share & Transfer Habits"
      subtitle="Clean recipes for peers or full backups for device transfer"
      icon={<Share2 className="w-5 h-5 text-ink" />}
      size="max-w-2xl"
      headerExtra={
        <div className="flex items-center gap-2 px-6 py-3 border-b-2 border-dashed border-line bg-surface-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'export'}
            onClick={() => setActiveTab('export')}
            className={`f7-pill ${activeTab === 'export' ? 'f7-pill-gold' : ''}`}
          >
            <Download className="w-4 h-4" />
            <span>Export & Share ({habitsToExport.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'import'}
            onClick={() => setActiveTab('import')}
            className={`f7-pill ${activeTab === 'import' ? 'f7-pill-gold' : ''}`}
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Export Mode */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Export Purpose
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportType('clean')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    exportType === 'clean'
                      ? 'border-l-[6px] border-l-f7-gold border-line-strong bg-f7-gold/10 shadow-accent-glow'
                      : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm text-ink">
                    <Sparkles className="w-4 h-4 text-f7-gold-dark" />
                    <span>Clean Recipe</span>
                  </div>
                  <p className="text-xs text-ink-3 font-medium mt-1 leading-relaxed">
                    Includes identities, 4 laws & 1% engine. Strips personal completion history for sharing with peers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType('full')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    exportType === 'full'
                      ? 'border-l-[6px] border-l-f7-teal border-line-strong bg-brand-bg shadow-teal-glow'
                      : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm text-ink">
                    <ShieldCheck className="w-4 h-4 text-f7-teal" />
                    <span>Full Device Backup</span>
                  </div>
                  <p className="text-xs text-ink-3 font-medium mt-1 leading-relaxed">
                    Includes all past completion dates, streaks, and logged metrics for restoring on another device.
                  </p>
                </button>
              </div>
            </div>

            {/* Select habits to include */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Choose Habits to Include ({selectedHabitIds.length} / {habits.length})
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-f7-teal-dark font-bold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-line-strong">&bull;</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-ink-3 hover:text-ink font-semibold hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-surface-2 border-2 border-line">
                {habits.map((habit) => {
                  const isChecked = selectedHabitIds.includes(habit.id);
                  return (
                    <label
                      key={habit.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-surface border border-line-strong font-bold text-ink shadow-xs'
                          : 'text-ink-2 hover:bg-surface-3'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleHabitSelect(habit.id)}
                          className="w-4 h-4 rounded text-f7-teal focus:ring-f7-teal cursor-pointer"
                        />
                        <span className="truncate">{habit.title}</span>
                      </div>
                      <span className="f7-chip text-[10px] py-0.5 px-2 flex-shrink-0">
                        {habit.identity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyJson}
                disabled={habitsToExport.length === 0}
                className={`w-full sm:w-1/2 f7-btn ${
                  copied ? 'bg-success text-white' : 'f7-btn-gold'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy JSON to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                disabled={habitsToExport.length === 0}
                className="w-full sm:w-1/2 f7-btn f7-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Download .json File</span>
              </button>
            </div>

            {/* Formatted JSON Preview Box */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink-3 mb-1.5">
                <span>Formatted JSON Payload Preview</span>
                <span>{exportJsonString.length} bytes</span>
              </div>
              <pre className="p-3.5 bg-input-bg text-ink-2 rounded-2xl text-xs font-mono overflow-x-auto max-h-36 leading-tight border-2 border-line">
                {exportJsonString}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* File Upload Box */}
            <div className="border-2 border-dashed border-line-strong hover:border-f7-teal rounded-2xl p-5 text-center transition-colors bg-surface-2 hover:bg-surface">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-file-input"
              />
              <label htmlFor="json-file-input" className="cursor-pointer block space-y-1.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-f7-teal-bg text-f7-teal-dark border-2 border-f7-teal flex items-center justify-center shadow-teal-glow">
                  <Upload className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-sm font-black text-ink">
                  Click to browse or drop an Atomic Habits JSON file
                </div>
                <div className="text-xs text-ink-3 font-medium">
                  Accepts .json routines or full backup exports
                </div>
              </label>
            </div>

            {/* Paste Textarea */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Or Paste JSON Directly:
              </label>
              <textarea
                rows={4}
                placeholder='Paste JSON here (e.g. {"habits": [...]})'
                value={importText}
                onChange={(e) => handleValidateJson(e.target.value)}
                className="f7-input font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Validation Status Box */}
            {importError && (
              <div className="p-3.5 rounded-2xl bg-coral-bg border-2 border-f7-coral/40 text-coral-fg text-xs flex items-center gap-2.5 font-bold" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-f7-coral" />
                <span>{importError}</span>
              </div>
            )}

            {parsedHabits && (
              <div className="p-4 rounded-2xl bg-success-bg border-2 border-f7-success/40 text-success-fg text-xs space-y-2 shadow-teal-glow" role="status">
                <div className="flex items-center gap-2 font-black text-sm">
                  <PackageCheck className="w-5 h-5 text-f7-success" />
                  <span>Valid JSON: Found {parsedHabits.length} habit{parsedHabits.length !== 1 ? 's' : ''} ready to import!</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedHabits.slice(0, 5).map((h) => (
                    <span
                      key={h.id}
                      className="px-2.5 py-1 rounded-full bg-surface border border-f7-success/30 text-ink text-xs font-bold truncate max-w-[200px]"
                    >
                      {h.title}
                    </span>
                  ))}
                  {parsedHabits.length > 5 && (
                    <span className="px-2 py-1 text-xs font-black">
                      +{parsedHabits.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Import Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Import Strategy:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    importMode === 'merge'
                      ? 'border-l-[6px] border-l-f7-teal border-line-strong bg-brand-bg shadow-teal-glow'
                      : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div className="text-xs font-black text-ink">Merge & Add (Recommended)</div>
                  <div className="text-xs text-ink-3 font-medium mt-1">
                    Adds shared habits safely without overwriting your existing habits.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'border-l-[6px] border-l-f7-coral border-line-strong bg-coral-bg shadow-coral-glow'
                      : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div className="text-xs font-black text-coral-fg">Replace Everything</div>
                  <div className="text-xs text-ink-3 font-medium mt-1">
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
              className="w-full f7-btn f7-btn-gold py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>
                {importMode === 'merge' ? 'Merge & Import' : 'Replace All with'}{' '}
                {parsedHabits ? `${parsedHabits.length} Habits` : 'Habits'}
              </span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
