/**
 * Shared tool catalog.
 *
 * Single source of truth for the product's capability set. Both the composer
 * tools menu and the capability deck read from here, so a capability is named
 * and described in exactly one place.
 *
 * The label and description strings are product copy: they are the capability
 * names, not decoration. Do not rename, translate, reorder or drop entries.
 */

import {
  BookOpen,
  Brain,
  Columns,
  Database,
  Edit3,
  FileCode,
  Globe,
  Layers,
  Presentation,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ChatTool } from '@/lib/types';

export interface ToolOptionDef {
  tool: ChatTool;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgLight: string;
  bgDark: string;
  textColor: string;
}

export const TOOL_OPTIONS: ToolOptionDef[] = [
  {
    tool: 'WEB_SEARCH',
    label: 'Search',
    description: 'Real-time live web browsing & instant source citations',
    icon: Globe,
    color: 'text-sky-500',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    textColor: 'text-sky-700 dark:text-sky-300',
  },
  {
    tool: 'THINK',
    label: 'Think',
    description: 'Extended step-by-step deep reasoning & structured logic',
    icon: Brain,
    color: 'text-amber-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    tool: 'CANVAS',
    label: 'Canvas',
    description: 'Living interactive document creator, markdown & rich exports',
    icon: Edit3,
    color: 'text-blue-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    tool: 'SLIDES',
    label: 'Slides',
    description: 'Interactive presentation decks with PDF & PowerPoint export',
    icon: Presentation,
    color: 'text-pink-500',
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-950/40',
    textColor: 'text-pink-700 dark:text-pink-300',
  },
  {
    tool: 'WEB_DEV',
    label: 'Web Dev',
    description: 'Interactive HTML, React, CSS & JS sandbox with ZIP export',
    icon: FileCode,
    color: 'text-cyan-500',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    tool: 'DEEP_RESEARCH',
    label: 'Deep Research',
    description: 'Autonomous multi-step research, web synthesis & report generation',
    icon: Sparkles,
    color: 'text-purple-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    tool: 'SOURCE_QA',
    label: 'Sources',
    description: 'Grounding & semantic search across your uploaded documents',
    icon: Database,
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    tool: 'LEARN',
    label: 'Learn',
    description: 'Socratic dialogue, interactive testing & mastery breakdowns',
    icon: BookOpen,
    color: 'text-rose-500',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    textColor: 'text-rose-700 dark:text-rose-300',
  },
  {
    tool: 'DEBATE',
    label: 'Debate',
    description: 'Multi-agent adversarial debate, opposing views & consensus',
    icon: Layers,
    color: 'text-orange-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  {
    tool: 'COMPARE',
    label: 'Compare Models',
    description: 'Run 1 to 4 models side-by-side with split screen comparison',
    icon: Columns,
    color: 'text-purple-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    tool: 'COUNCIL',
    label: 'Model Council',
    description: 'Multi-model collaborative consensus: Models brainstorm & synthesize optimal answer',
    icon: Users,
    color: 'text-amber-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
];

// Mutually exclusive dedicated workspaces
export const DEDICATED_TOOLS: ChatTool[] = [
  'CANVAS',
  'SLIDES',
  'WEB_DEV',
  'DEEP_RESEARCH',
  'DEBATE',
  'LEARN',
  'SOURCE_QA',
  'ARTIFACTS',
];
