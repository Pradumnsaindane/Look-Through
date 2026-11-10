import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Play, Pause } from 'lucide-react';

export interface KeyItem {
  id: string;
  label: string;
  sublabel?: string;
  width?: string;
  code?: string;
  isSpecial?: boolean;
}

export interface WorkflowShortcut {
  id: string;
  keys: string[]; // key ids
  keyLabels: string[];
  stepNumber: string;
  title: string;
  action: string;
  description: string;
  outcome: string;
  badge: string;
}

const WORKFLOW_SHORTCUTS: WorkflowShortcut[] = [
  {
    id: 'command-centre',
    keys: ['cmd-left', 'k'],
    keyLabels: ['⌘', 'K'],
    stepNumber: '01',
    title: 'Open command centre',
    action: 'Universal Workspace Triage',
    description: 'Instant cross-workspace search, ranking overnight changes and active decisions.',
    outcome: 'Brings forward overdue records and active focus items without navigating menus.',
    badge: 'TRIAGE',
  },
  {
    id: 'task-queue',
    keys: ['cmd-left', 'j'],
    keyLabels: ['⌘', 'J'],
    stepNumber: '02',
    title: 'Navigate to tasks',
    action: 'Operational Attention Queue',
    description: 'Review attention cards grouping urgent deliverables, blockers, and dependencies.',
    outcome: 'Focuses immediately on 3 critical path tasks awaiting team touchpoints.',
    badge: 'FOCUS',
  },
  {
    id: 'customer-context',
    keys: ['cmd-left', 'shift-left', 'c'],
    keyLabels: ['⌘', '⇧', 'C'],
    stepNumber: '03',
    title: 'Open customers',
    action: 'Context-Attached CRM',
    description: 'Inspect live customer health, meeting history, and open invoices in one drawer.',
    outcome: 'Opens TechCorp record with invoice history and past agreement sign-offs attached.',
    badge: 'CONTEXT',
  },
  {
    id: 'confirm-action',
    keys: ['cmd-left', 'enter'],
    keyLabels: ['⌘', '↵'],
    stepNumber: '04',
    title: 'Confirm an approved action',
    action: 'Verified Execution Step',
    description: 'Review and approve prepared reminder drafts or status updates with explicit consent.',
    outcome: 'Dispatches contextual invoice reminder draft with full audit trail preserved.',
    badge: 'APPROVAL',
  },
  {
    id: 'dismiss-panel',
    keys: ['escape'],
    keyLabels: ['Esc'],
    stepNumber: '05',
    title: 'Close current panel',
    action: 'Measure What Moved',
    description: 'Dismiss the active drawer and return to high-level workspace health metrics.',
    outcome: 'Ledger indicators update immediately with verified completion state.',
    badge: 'MEASURE',
  },
];

// Complete 75% Mac compact keyboard layout
const KEYBOARD_ROWS: KeyItem[][] = [
  // Function Row
  [
    { id: 'escape', label: 'esc', width: 'w-[36px] sm:w-[44px]' },
    { id: 'f1', label: 'F1', width: 'flex-1' },
    { id: 'f2', label: 'F2', width: 'flex-1' },
    { id: 'f3', label: 'F3', width: 'flex-1' },
    { id: 'f4', label: 'F4', width: 'flex-1' },
    { id: 'f5', label: 'F5', width: 'flex-1' },
    { id: 'f6', label: 'F6', width: 'flex-1' },
    { id: 'f7', label: 'F7', width: 'flex-1' },
    { id: 'f8', label: 'F8', width: 'flex-1' },
    { id: 'f9', label: 'F9', width: 'flex-1' },
    { id: 'f10', label: 'F10', width: 'flex-1' },
    { id: 'f11', label: 'F11', width: 'flex-1' },
    { id: 'f12', label: 'F12', width: 'flex-1' },
    { id: 'power', label: '⌽', width: 'w-[36px] sm:w-[44px]' },
  ],
  // Number Row
  [
    { id: 'backquote', label: '~', sublabel: '`', width: 'flex-1' },
    { id: 'digit1', label: '!', sublabel: '1', width: 'flex-1' },
    { id: 'digit2', label: '@', sublabel: '2', width: 'flex-1' },
    { id: 'digit3', label: '#', sublabel: '3', width: 'flex-1' },
    { id: 'digit4', label: '$', sublabel: '4', width: 'flex-1' },
    { id: 'digit5', label: '%', sublabel: '5', width: 'flex-1' },
    { id: 'digit6', label: '^', sublabel: '6', width: 'flex-1' },
    { id: 'digit7', label: '&', sublabel: '7', width: 'flex-1' },
    { id: 'digit8', label: '*', sublabel: '8', width: 'flex-1' },
    { id: 'digit9', label: '(', sublabel: '9', width: 'flex-1' },
    { id: 'digit0', label: ')', sublabel: '0', width: 'flex-1' },
    { id: 'minus', label: '_', sublabel: '-', width: 'flex-1' },
    { id: 'equal', label: '+', sublabel: '=', width: 'flex-1' },
    { id: 'backspace', label: 'delete', sublabel: '⌫', width: 'w-[52px] sm:w-[68px]' },
  ],
  // QWERTY Row
  [
    { id: 'tab', label: 'tab', sublabel: '⇥', width: 'w-[48px] sm:w-[62px]' },
    { id: 'q', label: 'Q', width: 'flex-1' },
    { id: 'w', label: 'W', width: 'flex-1' },
    { id: 'e', label: 'E', width: 'flex-1' },
    { id: 'r', label: 'R', width: 'flex-1' },
    { id: 't', label: 'T', width: 'flex-1' },
    { id: 'y', label: 'Y', width: 'flex-1' },
    { id: 'u', label: 'U', width: 'flex-1' },
    { id: 'i', label: 'I', width: 'flex-1' },
    { id: 'o', label: 'O', width: 'flex-1' },
    { id: 'p', label: 'P', width: 'flex-1' },
    { id: 'bracket-left', label: '{', sublabel: '[', width: 'flex-1' },
    { id: 'bracket-right', label: '}', sublabel: ']', width: 'flex-1' },
    { id: 'backslash', label: '|', sublabel: '\\', width: 'w-[36px] sm:w-[46px]' },
  ],
  // Home Row
  [
    { id: 'caps', label: 'caps lock', sublabel: '⇪', width: 'w-[58px] sm:w-[76px]' },
    { id: 'a', label: 'A', width: 'flex-1' },
    { id: 's', label: 'S', width: 'flex-1' },
    { id: 'd', label: 'D', width: 'flex-1' },
    { id: 'f', label: 'F', width: 'flex-1' },
    { id: 'g', label: 'G', width: 'flex-1' },
    { id: 'h', label: 'H', width: 'flex-1' },
    { id: 'j', label: 'J', width: 'flex-1' },
    { id: 'k', label: 'K', width: 'flex-1' },
    { id: 'l', label: 'L', width: 'flex-1' },
    { id: 'semicolon', label: ':', sublabel: ';', width: 'flex-1' },
    { id: 'quote', label: '"', sublabel: "'", width: 'flex-1' },
    { id: 'enter', label: 'return', sublabel: '↵', width: 'w-[58px] sm:w-[76px]' },
  ],
  // Bottom Alpha Row
  [
    { id: 'shift-left', label: 'shift', sublabel: '⇧', width: 'w-[74px] sm:w-[96px]' },
    { id: 'z', label: 'Z', width: 'flex-1' },
    { id: 'x', label: 'X', width: 'flex-1' },
    { id: 'c', label: 'C', width: 'flex-1' },
    { id: 'v', label: 'V', width: 'flex-1' },
    { id: 'b', label: 'B', width: 'flex-1' },
    { id: 'n', label: 'N', width: 'flex-1' },
    { id: 'm', label: 'M', width: 'flex-1' },
    { id: 'comma', label: '<', sublabel: ',', width: 'flex-1' },
    { id: 'period', label: '>', sublabel: '.', width: 'flex-1' },
    { id: 'slash', label: '?', sublabel: '/', width: 'flex-1' },
    { id: 'shift-right', label: 'shift', sublabel: '⇧', width: 'w-[74px] sm:w-[96px]' },
  ],
  // Modifiers & Space Row
  [
    { id: 'fn', label: 'fn', width: 'w-[36px] sm:w-[44px]' },
    { id: 'control', label: 'control', sublabel: '⌃', width: 'w-[38px] sm:w-[48px]' },
    { id: 'opt-left', label: 'option', sublabel: '⌥', width: 'w-[42px] sm:w-[54px]' },
    { id: 'cmd-left', label: 'command', sublabel: '⌘', width: 'w-[52px] sm:w-[66px]' },
    { id: 'space', label: 'look through', width: 'flex-[3.8] sm:flex-[4.2]', isSpecial: true },
    { id: 'cmd-right', label: 'command', sublabel: '⌘', width: 'w-[52px] sm:w-[66px]' },
    { id: 'opt-right', label: 'option', sublabel: '⌥', width: 'w-[42px] sm:w-[54px]' },
    { id: 'arrow-left', label: '◀', width: 'w-[32px] sm:w-[38px]' },
    { id: 'arrow-up-down', label: '▲▼', width: 'w-[32px] sm:w-[38px]' },
    { id: 'arrow-right', label: '▶', width: 'w-[32px] sm:w-[38px]' },
  ],
];

// Lightweight synthesized mechanical keyboard sound using Web Audio API
class MechanicalAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = false;

  constructor(initialEnabled: boolean = false) {
    this.soundEnabled = initialEnabled;
  }

  setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  getEnabled() {
    return this.soundEnabled;
  }

  playKeySound(isPressed: boolean = true) {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // 1. Tactile high-frequency mechanical click transient
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      const clickFilter = this.ctx.createBiquadFilter();

      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(isPressed ? 2400 : 3100, now);
      clickFilter.Q.setValueAtTime(4.0, now);

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(isPressed ? 650 : 850, now);
      clickOsc.frequency.exponentialRampToValueAtTime(isPressed ? 140 : 220, now + 0.012);

      clickGain.gain.setValueAtTime(0.045, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.ctx.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.018);

      // 2. Mechanical switch housing resonance
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(isPressed ? 160 : 210, now);
      thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.028);

      thudGain.gain.setValueAtTime(0.035, now);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);

      thudOsc.start(now);
      thudOsc.stop(now + 0.034);
    } catch {
      // Audio fallback is silent
    }
  }

  destroy() {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // silent cleanup
      }
      this.ctx = null;
    }
  }
}

export interface KeyboardProps {
  className?: string;
}

export const Keyboard: React.FC<KeyboardProps> = ({ className = '' }) => {
  const [activeShortcutIndex, setActiveShortcutIndex] = useState<number>(0);
  const [pressedKeyIds, setPressedKeyIds] = useState<Set<string>>(new Set(['cmd-left', 'k']));
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lt_keyboard_sound') === 'true';
    }
    return false;
  });

  const prefersReduced = useReducedMotion();
  const audioRef = useRef<MechanicalAudioEngine | null>(null);

  // Initialize audio engine
  useEffect(() => {
    audioRef.current = new MechanicalAudioEngine(soundEnabled);
    return () => {
      audioRef.current?.destroy();
    };
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lt_keyboard_sound', String(next));
      }
      if (audioRef.current) {
        audioRef.current.setEnabled(next);
        if (next) {
          audioRef.current.playKeySound(true);
        }
      }
      return next;
    });
  }, []);

  const triggerShortcut = useCallback(
    (index: number, playAudio: boolean = true) => {
      const shortcut = WORKFLOW_SHORTCUTS[index];
      if (!shortcut) return;

      setActiveShortcutIndex(index);
      setPressedKeyIds(new Set(shortcut.keys));

      if (playAudio && audioRef.current?.getEnabled()) {
        audioRef.current.playKeySound(true);
      }
    },
    []
  );

  // Auto-play cycling workflow demonstration
  useEffect(() => {
    if (!isAutoPlaying || prefersReduced) return;

    const timer = setInterval(() => {
      setActiveShortcutIndex((prev) => {
        const next = (prev + 1) % WORKFLOW_SHORTCUTS.length;
        const shortcut = WORKFLOW_SHORTCUTS[next];
        setPressedKeyIds(new Set(shortcut.keys));
        if (audioRef.current?.getEnabled()) {
          audioRef.current.playKeySound(true);
        }
        return next;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoPlaying, prefersReduced]);

  // Physical keyboard listener for live interactive feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Map physical keys to virtual key IDs
      const keyMap: Record<string, string> = {
        Meta: 'cmd-left',
        Control: 'control',
        Shift: 'shift-left',
        Alt: 'opt-left',
        Escape: 'escape',
        Enter: 'enter',
        Backspace: 'backspace',
        Tab: 'tab',
        ' ': 'space',
        ArrowLeft: 'arrow-left',
        ArrowRight: 'arrow-right',
      };

      const keyId = keyMap[e.key] || e.key.toLowerCase();
      setPressedKeyIds((prev) => {
        const next = new Set(prev);
        next.add(keyId);
        return next;
      });

      if (audioRef.current?.getEnabled()) {
        audioRef.current.playKeySound(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        Meta: 'cmd-left',
        Control: 'control',
        Shift: 'shift-left',
        Alt: 'opt-left',
        Escape: 'escape',
        Enter: 'enter',
        Backspace: 'backspace',
        Tab: 'tab',
        ' ': 'space',
        ArrowLeft: 'arrow-left',
        ArrowRight: 'arrow-right',
      };

      const keyId = keyMap[e.key] || e.key.toLowerCase();
      setPressedKeyIds((prev) => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const activeShortcut = WORKFLOW_SHORTCUTS[activeShortcutIndex];

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* ---------- 1. Top Workflow Shortcut Selector Bar ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
        {/* Shortcut Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {WORKFLOW_SHORTCUTS.map((shortcut, index) => {
            const isActive = activeShortcutIndex === index;
            return (
              <button
                key={shortcut.id}
                type="button"
                onClick={() => {
                  setIsAutoPlaying(false);
                  triggerShortcut(index, true);
                }}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#182035] border-[#4c6fff] text-white shadow-[0_0_15px_-3px_rgba(76,111,255,0.35)]'
                    : 'bg-[#111318]/80 border-white/[0.07] text-[#8b8e95] hover:text-white hover:border-white/[0.15] hover:bg-[#161a22]'
                }`}
                aria-pressed={isActive}
              >
                <span className="flex items-center gap-0.5 font-mono text-[10px] font-semibold text-[#8ba4ff]">
                  {shortcut.keyLabels.map((k) => (
                    <kbd
                      key={k}
                      className={`px-1 py-0.2 rounded ${
                        isActive ? 'bg-[#4c6fff]/25 text-white' : 'bg-white/10 text-[#8b8e95]'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
                <span className="text-[11px] sm:text-xs truncate">{shortcut.title}</span>
              </button>
            );
          })}
        </div>

        {/* Controls: Audio & Play/Pause */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute mechanical keyboard click sound' : 'Enable mechanical keyboard click sound'}
            aria-pressed={soundEnabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              soundEnabled
                ? 'bg-[#182035] border-[#4c6fff]/60 text-[#8ba4ff]'
                : 'bg-[#111318]/80 border-white/[0.08] text-[#717682] hover:text-[#a4a9b3]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#4c6fff]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10.5px]">Sound {soundEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-label={isAutoPlaying ? 'Pause automatic walkthrough' : 'Resume automatic walkthrough'}
            aria-pressed={isAutoPlaying}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-[#111318]/80 text-[#8b8e95] hover:text-white transition-colors"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#4c6fff]" />}
          </button>
        </div>
      </div>

      {/* ---------- 2. Keyboard Device Presentation ---------- */}
      <div className="relative mx-auto w-full max-w-4xl">
        {/* Soft Ambient Blue Shadow Beneath Keyboard */}
        <div
          className="pointer-events-none absolute -inset-2 sm:-inset-4 bg-[#4c6fff]/12 rounded-[28px] sm:rounded-[36px] blur-2xl transition-opacity duration-500"
          aria-hidden="true"
        />

        {/* Keyboard Hardware Chassis */}
        <motion.div
          initial={prefersReduced ? undefined : { opacity: 0, y: 24, rotateX: 10 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: '1000px' }}
          className="relative rounded-[20px] sm:rounded-[26px] bg-gradient-to-b from-[#181b22] via-[#121419] to-[#0c0e12] p-2.5 sm:p-4 border border-[#2b303c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_-8px_rgba(76,111,255,0.16),inset_0_1px_1px_rgba(255,255,255,0.14)]"
        >
          {/* Subtle Top Chassis Chamfer Highlight */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* Deep Recessed Switch Plate */}
          <div className="relative rounded-[14px] sm:rounded-[18px] bg-[#08090d] border border-white/[0.05] p-1.5 sm:p-2.5 space-y-1 sm:space-y-1.5 shadow-inner">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-0.5 xs:gap-1 sm:gap-1.5 w-full justify-between">
                {row.map((key) => {
                  const isPressed = pressedKeyIds.has(key.id);
                  return (
                    <button
                      key={key.id}
                      type="button"
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setPressedKeyIds(new Set([key.id]));
                        if (audioRef.current?.getEnabled()) {
                          audioRef.current.playKeySound(true);
                        }
                      }}
                      className={`relative ${key.width} h-[26px] xs:h-[30px] sm:h-[38px] md:h-[42px] rounded-[4px] xs:rounded-[5px] sm:rounded-[7px] text-[8px] xs:text-[9.5px] sm:text-xs font-mono font-medium transition-all duration-150 flex flex-col items-center justify-center select-none overflow-hidden ${
                        isPressed
                          ? 'translate-y-[2px] bg-gradient-to-b from-[#1e273f] to-[#141b2c] border border-[#4c6fff] text-white shadow-[0_0_16px_rgba(76,111,255,0.6),inset_0_0_8px_rgba(76,111,255,0.35)]'
                          : 'bg-gradient-to-b from-[#191c24] via-[#14161d] to-[#0e1015] border border-[#262b36] border-b-2 border-b-[#0a0c10] text-[#8b91a3] hover:text-white hover:border-[#4c6fff]/40'
                      }`}
                    >
                      {/* Sub-label for dual-symbol keys */}
                      {key.sublabel && !['⌫', '⇥', '⇪', '↵', '⇧', '⌃', '⌥', '⌘'].includes(key.sublabel) && (
                        <span className="text-[7px] sm:text-[9px] text-[#636877] leading-none mb-0.5 hidden xs:inline">
                          {key.sublabel}
                        </span>
                      )}

                      {/* Main Key Label with responsive word/symbol fallback */}
                      <span
                        className={`leading-none truncate ${
                          key.isSpecial ? 'font-mono tracking-wider text-[7.5px] sm:text-[10px] uppercase text-[#6f7587]' : ''
                        }`}
                      >
                        {key.sublabel && ['⌫', '⇥', '⇪', '↵', '⇧', '⌃', '⌥', '⌘'].includes(key.sublabel) ? (
                          <>
                            <span className="hidden sm:inline">{key.label}</span>
                            <span className="sm:hidden font-mono text-[9px]">{key.sublabel}</span>
                          </>
                        ) : (
                          key.label
                        )}
                      </span>

                      {/* Subtle Under-Key Blue Lighting when pressed */}
                      {isPressed && (
                        <span
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[#4c6fff] blur-[1px]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---------- 3. Contextual Action HUD (Command Feedback Panel) ---------- */}
      <motion.div
        key={activeShortcut.id}
        initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 sm:mt-8 mx-auto w-full max-w-4xl rounded-xl bg-gradient-to-r from-[#10141f] via-[#0d1017] to-[#10141f] border border-white/[0.08] p-3 sm:p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
      >
        {/* Left: Active Keycap Badge + Workflow Step */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 p-1.5 rounded-lg bg-[#161c2d] border border-[#4c6fff]/40 shadow-[0_0_12px_rgba(76,111,255,0.25)] shrink-0">
            {activeShortcut.keyLabels.map((k) => (
              <span
                key={k}
                className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 rounded bg-[#4c6fff]/20 text-[#8ba4ff] font-mono font-bold text-xs"
              >
                {k}
              </span>
            ))}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4c6fff] font-bold">
                STEP {activeShortcut.stepNumber}
              </span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#a0a5b3]">
                {activeShortcut.action}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-white truncate mt-0.5">
              {activeShortcut.description}
            </p>
          </div>
        </div>

        {/* Right: Outcome Result & Verification Tag */}
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-mono text-emerald-400 font-medium block">
              ✓ {activeShortcut.badge} VERIFIED
            </span>
            <span className="text-[10px] text-[#717682] block max-w-[220px] truncate">
              {activeShortcut.outcome}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4c6fff]/15 border border-[#4c6fff]/30 text-[11px] font-medium text-[#b8c7ff]">
            <Sparkles className="w-3 h-3 text-[#4c6fff]" />
            <span>Active</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Keyboard;
