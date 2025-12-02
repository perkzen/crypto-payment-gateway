'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { ChevronDown, X } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isRemovingRef = React.useRef(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleUnselect = React.useCallback(
    (value: string) => {
      isRemovingRef.current = true;
      onChange(selected.filter((item) => item !== value));
      setTimeout(() => {
        isRemovingRef.current = false;
      }, 0);
    },
    [selected, onChange],
  );

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (isRemovingRef.current) {
      return;
    }
    setOpen(newOpen);
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-input shadow-xs ring-offset-background focus-within:ring-ring dark:bg-input/30 dark:border-input flex min-h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-left text-sm focus-within:ring-2 focus-within:ring-offset-2"
          >
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  return (
                    <span
                      key={value}
                      className="bg-secondary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm"
                    >
                      {option?.label || value}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${option?.label || value}`}
                        className="ring-offset-background focus:ring-ring hover:bg-secondary/80 ml-1 cursor-pointer rounded-full outline-none transition-colors focus:ring-2 focus:ring-offset-2"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(value);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnselect(value);
                          }
                        }}
                      >
                        <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                      </span>
                    </span>
                  );
                })
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
