// src/utils/savedAccountsStorage.js
import { validateEmail } from './validation';

const SAVED_ACCOUNTS_KEY = 'shineticket_saved_accounts';
const MAX_SAVED = 10;

export const getSavedAccounts = () => {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAccount = (email, password) => {
  if (!email || !validateEmail(email)) return;
  const current = getSavedAccounts();

  // Mã hóa mật khẩu bằng Base64 cơ bản để không lộ plaintext trong Application tab
  const encodedPassword = password ? btoa(password) : '';
  const newAccount = {
    email: email.toLowerCase().trim(),
    password: encodedPassword,
  };

  // Xóa account cũ (nếu trùng email) và đẩy account mới lên đầu
  const updated = [
    newAccount,
    ...current.filter((acc) => acc.email !== newAccount.email),
  ].slice(0, MAX_SAVED);

  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
};

export const deleteAccount = (emailToDelete) => {
  const updated = getSavedAccounts().filter(
    (acc) => acc.email !== emailToDelete.toLowerCase().trim()
  );
  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {}
};
