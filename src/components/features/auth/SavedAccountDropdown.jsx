// src/components/features/auth/SavedAccountDropdown.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Trash2 } from 'lucide-react';
import {
  getSavedAccounts,
  deleteAccount,
} from '../../../utils/savedAccountsStorage';

// ─── Hook quản lý trạng thái dropdown ──────────────────────────────────────
export function useSavedAccountsDropdown(inputValue) {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    setSavedAccounts(getSavedAccounts());
  }, []);

  const query = inputValue.trim().toLowerCase();
  const filtered = query
    ? savedAccounts.filter((acc) => acc.email.includes(query))
    : savedAccounts;

  const shouldShow = isOpen && filtered.length > 0;

  const openDropdown = useCallback(() => {
    setSavedAccounts(getSavedAccounts());
    setIsOpen(true);
    setHighlightIndex(-1);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightIndex(-1);
  }, []);

  const removeAccount = useCallback((email, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    deleteAccount(email);
    setSavedAccounts(getSavedAccounts());
  }, []);

  const handleKeyDown = useCallback(
    (e, onSelect) => {
      if (!shouldShow) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault();
        onSelect(filtered[highlightIndex]);
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    },
    [shouldShow, filtered, highlightIndex, closeDropdown]
  );

  return {
    filtered,
    shouldShow,
    highlightIndex,
    openDropdown,
    closeDropdown,
    removeAccount,
    handleKeyDown,
  };
}

// ─── Component Dropdown ───────────────────────────────────────────────────
export default function SavedAccountDropdown({
  items,
  highlightIndex,
  onSelect,
  onRemove,
}) {
  return (
    <ul
      role="listbox"
      aria-label="Tài khoản đã lưu"
      className="border-border-default bg-background-secondary absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
    >
      <li className="text-text-secondary border-border-subtle flex items-center gap-2 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase select-none">
        <User className="h-3 w-3 flex-shrink-0" />
        Tài khoản đã lưu
      </li>
      {items.map((acc, index) => (
        <li
          key={acc.email}
          role="option"
          aria-selected={index === highlightIndex}
          className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
            index === highlightIndex
              ? 'bg-primary-light text-primary'
              : 'text-text-primary hover:bg-foreground'
          }`}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(acc); // Trả về cả Object account
            }}
          >
            <div className="bg-primary/10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">
              <span className="text-primary text-xs font-bold uppercase">
                {acc.email[0]}
              </span>
            </div>
            <span className="truncate text-sm">{acc.email}</span>
          </button>

          <button
            type="button"
            aria-label={`Xóa ${acc.email} khỏi danh sách`}
            className="text-text-secondary hover:text-destructive ml-2 flex-shrink-0 rounded-md p-1 transition-colors"
            onMouseDown={(e) => onRemove(acc.email, e)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
