const vndFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

const usdtFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatVndAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '0';
  return vndFormatter.format(Math.round(value));
}

export function formatUsdtAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '0';
  return usdtFormatter.format(value);
}

export function formatUsdtWithOptionalVnd(amountUsdt, rateVndPerUsdt) {
  const usdtValue = Number(amountUsdt);

  if (!Number.isFinite(usdtValue)) {
    return '-';
  }

  if (usdtValue === 0) {
    return 'Miễn phí';
  }

  const usdtText = `${formatUsdtAmount(usdtValue)} USDT`;

  const rateValue = Number(rateVndPerUsdt);
  if (!Number.isFinite(rateValue) || rateValue <= 0) {
    return usdtText;
  }

  const vndValue = usdtValue * rateValue;
  return `${usdtText} (~${formatVndAmount(vndValue)} VND)`;
}
