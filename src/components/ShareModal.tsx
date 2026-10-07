import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  PackageCheck, 
  Bot, 
  ArrowRight,
  TrendingUp,
  Layers,
  Clock,
  Zap,
  Gift
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
  initialTab?: 'export' | 'import' | 'prompt';
}

const PROMPT_PRESETS = [
  '🏃 Fitness & Strength',
  '⚡ Deep Work & Focus',
  '🧘 Mindfulness & Sleep',
  '📚 Reading & Lifelong Learning',
  '🥗 Clean Nutrition & Hydration',
  '✍️ Writing & Creativity',
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  habits,
  onImportHabits,
  preSelectedHabitId,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'prompt'>(initialTab);

  // Export State
  const [exportType, setExportType] = useState<'clean' | 'full'>('clean'); // 'clean' = recipe/template only, 'full' = with history
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Import State
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedHabits, setParsedHabits] = useState<Habit[] | null>(null);

  // AI Prompt State
  const [customGoal, setCustomGoal] = useState('');
  const [habitCount, setHabitCount] = useState<number>(3);
  const [promptCopied, setPromptCopied] = useState(false);

  // Initialize selected habits when opened
  useEffect(() => {
    if (preSelectedHabitId) {
      setSelectedHabitIds([preSelectedHabitId]);
    } else {
      setSelectedHabitIds(habits.map((h) => h.id));
    }
  }, [preSelectedHabitId, habits, isOpen]);

  // Reset import and prompt states when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setImportText('');
      setImportError(null);
      setParsedHabits(null);
      setCopied(false);
      setPromptCopied(false);
    }
  }, [isOpen, initialTab]);

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

  // Helper to extract JSON from raw text, markdown code blocks, or conversational AI responses
  const extractJson = (rawText: string): any => {
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    // 1. Direct parsing attempt
    try {
      return JSON.parse(trimmed);
    } catch {
      // Continue to extraction strategies
    }

    // 2. Markdown fenced code block (```json ... ``` or ``` ... ```)
    const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch {
        // Continue
      }
    }

    // 3. Find outermost JSON object { ... } or array [ ... ]
    const firstBrace = trimmed.indexOf('{');
    const firstBracket = trimmed.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = trimmed.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = trimmed.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const candidate = trimmed.substring(startIdx, endIdx + 1);
      return JSON.parse(candidate);
    }

    throw new Error('Could not find valid JSON format in the text provided.');
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
      const parsed = extractJson(text);
      if (!parsed) {
        setImportError(null);
        setParsedHabits(null);
        return;
      }

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

      // Validate that items look like habits with all settings preserved
      const validHabits: Habit[] = list.map((item, idx) => ({
        id: item.id || `imported-${Date.now()}-${idx}`,
        title: String(item.title || 'Untitled Habit'),
        identity: String(item.identity || 'Better Self'),
        timeOfDay: ['morning', 'afternoon', 'evening', 'anytime'].includes(item.timeOfDay) ? item.timeOfDay : 'anytime',
        habitStack: item.habitStack && (item.habitStack.after || item.habitStack.then)
          ? {
              after: String(item.habitStack.after || 'my regular routine'),
              then: String(item.habitStack.then || item.title || 'my habit'),
            }
          : undefined,
        twoMinuteVersion: item.twoMinuteVersion ? String(item.twoMinuteVersion) : undefined,
        attractiveReward: item.attractiveReward ? String(item.attractiveReward) : undefined,
        completedDates: Array.isArray(item.completedDates) ? item.completedDates : [],
        createdAt: item.createdAt || getTodayDateString(),
        targetPerWeek: typeof item.targetPerWeek === 'number' ? item.targetPerWeek : 7,
        routineId: item.routineId ? String(item.routineId) : undefined,
        routineName: item.routineName ? String(item.routineName) : undefined,
        orderInRoutine: typeof item.orderInRoutine === 'number' ? item.orderInRoutine : undefined,
        linkedHabitId: item.linkedHabitId ? String(item.linkedHabitId) : undefined,
        betterment: item.betterment
          ? {
              enabled: item.betterment.enabled !== false,
              baselineValue: Number(item.betterment.baselineValue) || 1,
              unit: String(item.betterment.unit || 'units'),
              period: ['daily', 'weekly', 'monthly'].includes(item.betterment.period)
                ? item.betterment.period
                : 'daily',
              ratePercent: Number(item.betterment.ratePercent) || 1,
              startDate: item.betterment.startDate || getTodayDateString(),
            }
          : undefined,
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

  // Generate Master AI Prompt for ChatGPT / Claude / Gemini
  const isCustomGoalActive = Boolean(customGoal.trim());

  const generatePromptText = () => {
    const today = getTodayDateString();

    const introSection = isCustomGoalActive
      ? `You are an elite behavioral scientist and Atomic Habits coach inspired by James Clear.
Your task is to design a personalized routine of ${habitCount} atomic habits formatted as a strict JSON document that can be directly imported into the Atomic Habits web app.

USER SPECIFIC GOAL / FOCUS:
"${customGoal.trim()}"
Design all habits, identities, habit stacks, 2-minute gateways, and 1% metrics specifically around this objective.`
      : `Convert the habits we discussed (or the habits I specified above) into a valid JSON document that can be directly imported into the Atomic Habits web app.

Keep the exact habits and count I requested. Do not change what I asked for—simply configure each habit with all required behavioral settings according to James Clear's Atomic Habits framework.`;

    return `${introSection}
=====================================================
ATOMIC HABITS FRAMEWORK & REQUIRED SETTINGS:
For EACH habit in the routine, configure ALL settings according to the 4 Laws of Behavior Change:

1. "id": A unique string ID (e.g. "habit-ai-1", "habit-ai-2").
2. "title": Action-oriented habit name (e.g. "Read 10 Pages of Non-Fiction", "Morning Core & Mobility Movement", "Deep Work Sprint").
3. "identity": Identity-based framing answering "Who do you want to become?" (e.g. "Lifelong Learner", "Energized Athlete", "Master Craftsperson", "Mindful Thinker", "Healthy & Vital Person", "Consistent Writer", "Organized Professional").
4. "timeOfDay": Routine schedule slot. MUST be one of: "morning", "afternoon", "evening", or "anytime".
5. "habitStack": The 1st Law (Make it Obvious) implementation cue formula:
   - "after": Specific anchor habit / trigger (e.g. "After I brew my morning coffee", "After I sit down at my desk and put on headphones", "After I brush my teeth before bed").
   - "then": The new atomic habit (e.g. "I will read 10 pages", "I will write focused code", "I will write 3 things I am grateful for").
6. "twoMinuteVersion": The 3rd Law (Make it Easy) 2-Minute Rule gateway habit. Downscale the habit to take under 2 minutes to eliminate starting friction (e.g. "Open book and read just 1 page", "Put on shoes and do 5 pushups", "Open code editor and clear open tabs").
7. "attractiveReward": The 2nd & 4th Law (Make it Attractive & Satisfying) temptation bundling or immediate reward (e.g. "Sip fresh espresso in my favorite armchair", "Play favorite high-energy music playlist", "Relax in calm dim bedroom lighting").
8. "betterment": The 1% Compounding Betterment Engine configuration:
   - "enabled": true
   - "baselineValue": Starting measurable baseline (e.g. 10, 15, 45, 3).
   - "unit": Metric unit (e.g. "pages", "mins", "reps", "words", "steps", "sentences").
   - "period": Compounding increment interval. MUST be one of: "daily", "weekly", or "monthly".
   - "ratePercent": Compounding rate percentage (standard is 1 for +1% compounding).
   - "startDate": "${today}" (current date YYYY-MM-DD).
9. "routineId": (Optional string) Identifier to group habits into a linked routine sequence (e.g. "routine-morning").
10. "routineName": (Optional string) Human-friendly routine name (e.g. "Morning Momentum Routine").
11. "orderInRoutine": (Optional number) 1-based order within routine (1, 2, 3...).
12. "linkedHabitId": (Optional string) ID of previous habit in stack sequence.
13. "completedDates": [] (empty array).
14. "createdAt": "${today}" (current date YYYY-MM-DD).

=====================================================
JSON SCHEMA & SAMPLE OUTPUT:
Return ONLY a valid JSON object matching this exact schema:

{
  "version": "2.0",
  "type": "atomic-habits-routine",
  "exportedAt": "${new Date().toISOString()}",
  "count": ${habitCount},
  "habits": [
    {
      "id": "habit-ai-1",
      "title": "Morning Core & Mobility Movement",
      "identity": "Energized Athlete",
      "timeOfDay": "morning",
      "routineId": "routine-morning-kickstart",
      "routineName": "Morning Momentum Routine",
      "orderInRoutine": 1,
      "habitStack": {
        "after": "After I roll out of bed and drink water",
        "then": "I will do 10 minutes of mobility movements"
      },
      "twoMinuteVersion": "Do 5 pushups and stretch hamstrings",
      "attractiveReward": "Play favorite high-energy morning playlist",
      "betterment": {
        "enabled": true,
        "baselineValue": 10,
        "unit": "mins",
        "period": "daily",
        "ratePercent": 1,
        "startDate": "${today}"
      },
      "completedDates": [],
      "createdAt": "${today}"
    },
    {
      "id": "habit-ai-2",
      "title": "Read 10 Pages of Non-Fiction",
      "identity": "Lifelong Learner",
      "timeOfDay": "morning",
      "routineId": "routine-morning-kickstart",
      "routineName": "Morning Momentum Routine",
      "orderInRoutine": 2,
      "linkedHabitId": "habit-ai-1",
      "habitStack": {
        "after": "After I finish morning mobility movement",
        "then": "I will sit and read non-fiction books"
      },
      "twoMinuteVersion": "Open book and read just 1 page",
      "attractiveReward": "Sip fresh espresso in my favorite armchair",
      "betterment": {
        "enabled": true,
        "baselineValue": 10,
        "unit": "pages",
        "period": "daily",
        "ratePercent": 1,
        "startDate": "${today}"
      },
      "completedDates": [],
      "createdAt": "${today}"
    }
  ]
}

=====================================================
STRICT RULES FOR OUTPUT:
1. Output ONLY the JSON code block (enclosed in \`\`\`json \`\`\` or raw JSON). Do NOT include conversational pleasantries, markdown text outside the code fence, or explanations.
2. Ensure valid JSON syntax: double-quoted keys and strings, no trailing commas.
3. Every habit MUST include all settings: title, identity, timeOfDay, habitStack, twoMinuteVersion, attractiveReward, and betterment.`;
  };

  const handleCopyPrompt = async () => {
    const promptText = generatePromptText();
    try {
      await navigator.clipboard.writeText(promptText);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = promptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2500);
    }
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
                Share routines, backup & restore, or generate with AI prompt
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
        <div className="flex border-b border-stone-100 dark:border-stone-800 px-6 pt-2 bg-stone-50/50 dark:bg-stone-900/50 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
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
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-500" />
            <span>Copy Prompt</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: EXPORT & SHARE */}
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
                          {habit.routineName && (
                            <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded hidden sm:inline">
                              {habit.routineName} {habit.orderInRoutine ? `#${habit.orderInRoutine}` : ''}
                            </span>
                          )}
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

          {/* TAB 2: IMPORT JSON */}
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
                    Accepts .json files exported from Atomic Habits or AI outputs
                  </div>
                </label>
              </div>

              {/* Paste Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Or Paste JSON Directly:
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('prompt')}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3" />
                    <span>Need habits? Copy AI Prompt</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder='Paste JSON or AI response here (e.g. {"habits": [...]})'
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

          {/* TAB 3: COPY PROMPT (AI PROMPT GENERATOR) */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              {/* Introduction Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-stone-900 dark:text-white">
                      {isCustomGoalActive ? 'Custom Goal AI Prompt' : 'Neutral JSON Import Prompt'}
                    </h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCustomGoalActive
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {isCustomGoalActive ? 'Goal Mode' : 'Neutral Mode (Default)'}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[11px]">
                    {isCustomGoalActive
                      ? `Instructs the AI to design habits specifically for "${customGoal.trim()}" and format them with all settings into importable JSON.`
                      : 'Assumes you already told the AI what habits and how many you want. This prompt gives the AI the exact JSON format & settings instructions to convert them into an importable file.'}
                  </p>
                </div>
              </div>

              {/* Custom Goal & Habit Count Customization */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {isCustomGoalActive ? 'Goal / Focus Area:' : 'Optional: Specify a Custom Goal'}
                      </label>
                      {isCustomGoalActive && (
                        <button
                          type="button"
                          onClick={() => setCustomGoal('')}
                          className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          &larr; Switch back to Neutral Prompt
                        </button>
                      )}
                    </div>
                    {isCustomGoalActive && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                        <span>Count:</span>
                        <div className="flex rounded-lg bg-stone-200/70 dark:bg-stone-700/60 p-0.5">
                          {[3, 4, 5].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setHabitCount(cnt)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                habitCount === cnt
                                  ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
                                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                              }`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Leave blank for Neutral prompt, or type a custom goal (e.g. Marathon training)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5 flex items-center justify-between">
                    <span>Quick suggestions (Click to apply, or leave unselected for Neutral prompt):</span>
                    {isCustomGoalActive && (
                      <button
                        type="button"
                        onClick={() => setCustomGoal('')}
                        className="text-[10px] text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 underline cursor-pointer"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_PRESETS.map((preset) => {
                      const cleanText = preset.replace(/^[^\s]+\s/, '');
                      const isSelected = customGoal.toLowerCase().includes(cleanText.toLowerCase());
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCustomGoal('');
                            } else {
                              setCustomGoal(cleanText);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Copy Prompt + Switch to Import */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    promptCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 text-stone-950 shadow-amber-500/10'
                  }`}
                >
                  {promptCopied ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>
                    {promptCopied
                      ? 'Copied AI Prompt to Clipboard!'
                      : isCustomGoalActive
                      ? 'Copy Goal-Specific AI Prompt'
                      : 'Copy Neutral AI Prompt (All Settings)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                >
                  <span>Ready? Paste in Import Tab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* All Settings Included Grid */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-3 bg-stone-50/50 dark:bg-stone-900/50">
                <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Configured Settings Included in this AI Prompt:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">🏷️ Identity Framing</span>
                    <span className="text-stone-500 dark:text-stone-400">"Who do you want to become?" (e.g. Lifelong Learner)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-500" />
                      Habit Stacking
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">Anchor trigger: "After [Current], then [New]"</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      2-Minute Rule
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">Frictionless gateway version to eliminate resistance</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 flex items-center gap-1">
                      <Gift className="w-3 h-3 text-amber-500" />
                      Attractive Reward
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">Temptation bundling for immediate satisfaction</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      1% Engine
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">Baseline value, measurable unit, period & +1% rate</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      Time Slot
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">Morning, afternoon, evening, or anytime tags</span>
                  </div>
                </div>
              </div>

              {/* Formatted Prompt Preview */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  <span>
                    Prompt Preview ({isCustomGoalActive ? 'Goal-Specific Mode' : 'Neutral Mode - Preserves Your Custom Habits'}):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Prompt</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-44 leading-relaxed border border-stone-800 whitespace-pre-wrap select-all">
                  {generatePromptText()}
                </pre>
              </div>

              {/* Quick 3-Step Walkthrough */}
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
                  How it works:
                </span>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>
                    {isCustomGoalActive
                      ? 'Click Copy Goal-Specific AI Prompt to send your goals to the AI.'
                      : 'Chat with your AI to define your habits and quantity, then send this Neutral Prompt to convert them into importable JSON.'}
                  </li>
                  <li>Paste into <strong className="text-stone-700 dark:text-stone-300">ChatGPT, Claude, Gemini, or any AI assistant</strong>.</li>
                  <li>Copy the AI's JSON output, switch to the <strong>Import JSON</strong> tab, and click <strong>Merge Habits</strong>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
