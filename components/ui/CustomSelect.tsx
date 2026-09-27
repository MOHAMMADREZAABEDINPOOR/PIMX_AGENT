'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {UiText,useT} from '@/components/i18n/LocaleProvider';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  group?: string;
  description?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  ariaLabel?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export function CustomSelect({
  ariaLabel,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  size = 'md',
}: CustomSelectProps) {
  const $t=useT();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Group options if groups exist
  const hasGroups = options.some((opt) => !!opt.group);
  const groupedOptions: Record<string, SelectOption[]> = {};
  if (hasGroups) {
    options.forEach((opt) => {
      const g = opt.group || 'Other';
      if (!groupedOptions[g]) groupedOptions[g] = [];
      groupedOptions[g].push(opt);
    });
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] rounded-lg',
    sm: 'px-2.5 py-1.5 text-xs rounded-xl',
    md: 'px-3 py-2 text-xs rounded-xl',
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`} id={id}>
      <button
        type="button"
        aria-label={$t(ariaLabel)}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={isOpen ? {
          borderColor: 'var(--accent-color)',
          boxShadow: '0 0 0 2px var(--accent-ring)',
          backgroundColor: 'var(--accent-subtle)',
        } : undefined}
        className={`w-full flex items-center justify-between gap-2 border transition-all cursor-pointer select-none font-medium text-neutral-900 dark:text-neutral-100 ${
          sizeClasses[size]
        } ${
          isOpen
            ? ''
            : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? (
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">{<UiText source={selectedOption.label}/>}</span>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-500"><UiText source={placeholder}/></span>
            )}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-color)',
                borderColor: 'var(--accent-border)',
              }}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono border"
            >
              <UiText source={selectedOption.badge}/>
            </span>
          )}
        </div>
        <ChevronDown
          style={isOpen ? { color: 'var(--accent-color)' } : undefined}
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-full min-w-[220px] max-h-64 overflow-y-auto rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900/95 backdrop-blur-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
          style={{
            backgroundColor: 'var(--surface-color)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-color)',
          }}
        >
          {hasGroups ? (
            Object.entries(groupedOptions).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-2 last:mb-0">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
                  <UiText source={groupName}/>
                </div>
                <div className="space-y-0.5">
                  {groupItems.map((opt) => (
                    <OptionItem
                      key={opt.value}
                      option={opt}
                      isSelected={opt.value === value}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange(opt.value);
                          setIsOpen(false);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-0.5">
              {options.map((opt) => (
                <OptionItem
                  key={opt.value}
                  option={opt}
                  isSelected={opt.value === value}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionItem({
  option,
  isSelected,
  onClick,
}: {
  option: SelectOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer select-none ${
        option.disabled
          ? 'opacity-40 cursor-not-allowed'
          : isSelected
          ? 'text-white font-semibold'
          : 'text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
      }`}
      style={{
        backgroundColor: isSelected ? 'var(--accent-color, #9333ea)' : undefined,
      }}
    >
      <div className="flex items-center gap-2 min-w-0 truncate">
        {option.icon && <span className="shrink-0">{option.icon}</span>}
        <div className="truncate">
          <div className="truncate">{<UiText source={option.label}/>}</div>
          {option.description && (
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{<UiText source={option.description}/>}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {option.badge && (
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
              isSelected
                ? 'bg-black/30 text-white'
                : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {option.badge}
          </span>
        )}
        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
    </div>
  );
}
