import { useEffect, useMemo, useRef, useState } from 'react';

// Icon Mũi tên
const ChevronIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
      isOpen ? 'rotate-180' : ''
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Component bao bọc có chức năng đóng/mở (Accordion)
const CollapsibleSection = ({ header, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-border-default bg-background-secondary overflow-hidden rounded-lg">
      <div
        className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">{header}</div>
        <div className="ml-2 flex-shrink-0">
          <ChevronIcon isOpen={isOpen} />
        </div>
      </div>
      {isOpen && (
        <div className="border-border-default border-t p-3">{children}</div>
      )}
    </div>
  );
};

const TreeCheckbox = ({
  checked,
  indeterminate,
  disabled,
  onChange,
  onClick,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = Boolean(indeterminate) && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="border-border-default text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer rounded"
      checked={checked}
      disabled={disabled}
      onClick={onClick}
      onChange={onChange}
    />
  );
};

const getArray = (value) => (Array.isArray(value) ? value : []);

const formatUtcTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatUtcDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const collectTicketIdsFromTicketType = (ticketType) =>
  getArray(ticketType?.tickets)
    .map((ticket) => ticket?.id)
    .filter(Boolean);

const collectTicketIdsFromShow = (show) => {
  const ticketTypes = getArray(show?.ticketTypes);
  return ticketTypes.flatMap(collectTicketIdsFromTicketType);
};

const collectTicketIdsFromEvent = (event) => {
  const shows = getArray(event?.shows);
  return shows.flatMap(collectTicketIdsFromShow);
};

export const buildPendingTicketMetaMap = (events = []) => {
  const result = new Map();

  events.forEach((event) => {
    getArray(event?.shows).forEach((show) => {
      getArray(show?.ticketTypes).forEach((ticketType) => {
        getArray(ticketType?.tickets).forEach((ticket) => {
          if (!ticket?.id) return;
          result.set(String(ticket.id), {
            ticketId: String(ticket.id),
            eventId: String(event?.eventId || ''),
            eventName: event?.eventName,
            bannerImageUrl: event?.bannerImageUrl,
            location: event?.location,
            format: event?.format,
            showId: String(show?.showId || ''),
            showName: show?.showName,
            startTime: show?.startTime,
            endTime: show?.endTime,
            ticketTypeId: String(ticketType?.ticketTypeId || ''),
            ticketTypeName: ticketType?.ticketTypeName,
            originalPrice: Number(ticketType?.price ?? 0),
            status: ticket?.status,
            mintStatus: ticket?.mintStatus,
          });
        });
      });
    });
  });

  return result;
};

const getCheckState = (ticketIds, selectedSet) => {
  if (ticketIds.length === 0) return { checked: false, indeterminate: false };
  let selectedCount = 0;
  ticketIds.forEach((id) => {
    if (selectedSet.has(String(id))) selectedCount += 1;
  });

  if (selectedCount === 0) return { checked: false, indeterminate: false };
  if (selectedCount === ticketIds.length)
    return { checked: true, indeterminate: false };
  return { checked: false, indeterminate: true };
};

const toggleMany = (selectedSet, ids, shouldSelect) => {
  const next = new Set(selectedSet);
  ids.forEach((id) => {
    const key = String(id);
    if (!key) return;
    if (shouldSelect) next.add(key);
    else next.delete(key);
  });
  return next;
};

const PendingTicketsTreeSelect = ({
  label,
  events = [],
  selectedTicketIds = [],
  onChange,
  disabled = false,
  loading = false,
  loadingLabel = 'Đang tải vé... ',
  emptyMessage = 'Không có vé nào.',
  // Props mới cho phần nhập giá:
  salePrices = {},
  onSalePriceChange,
  salePriceLabel,
  salePricePlaceholder,
  maxResaleMultiplier,
  ticketMetaMap,
}) => {
  const selectedSet = useMemo(
    () => new Set(selectedTicketIds.map((id) => String(id))),
    [selectedTicketIds]
  );

  const fallbackMetaMap = useMemo(
    () => ticketMetaMap || buildPendingTicketMetaMap(events),
    [events, ticketMetaMap]
  );

  const lockedEventId = useMemo(() => {
    for (const id of selectedSet) {
      const meta = fallbackMetaMap.get(String(id));
      if (meta?.eventId) return meta.eventId;
    }
    return '';
  }, [selectedSet, fallbackMetaMap]);

  const visibleEvents = useMemo(() => {
    if (!lockedEventId) return events;
    return events.filter((event) => String(event?.eventId) === lockedEventId);
  }, [events, lockedEventId]);

  const commit = (nextSet) => {
    let firstEventId = '';
    for (const id of nextSet) {
      const meta = fallbackMetaMap.get(String(id));
      if (meta?.eventId) {
        firstEventId = meta.eventId;
        break;
      }
    }

    const normalized = new Set();
    if (firstEventId) {
      for (const id of nextSet) {
        const meta = fallbackMetaMap.get(String(id));
        if (meta?.eventId === firstEventId) normalized.add(String(id));
      }
    }

    onChange?.(Array.from(firstEventId ? normalized : nextSet));
  };

  if (loading) {
    return (
      <div className="space-y-1.5">
        {label ? (
          <label className="text-text-secondary block text-sm font-medium">
            {label}
          </label>
        ) : null}
        <div className="border-border-default bg-background-secondary text-text-secondary rounded-lg border px-3 py-2.5 text-sm">
          {loadingLabel}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="text-text-secondary block text-sm font-medium">
          {label}
        </label>
      ) : null}

      <div className="border-border-default overflow-hidden rounded-lg border">
        {visibleEvents.length === 0 ? (
          <div className="text-text-secondary bg-background-secondary px-3 py-3 text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="p-3">
            <div className="space-y-4">
              {visibleEvents.map((event) => {
                const eventTicketIds = collectTicketIdsFromEvent(event);
                const eventState = getCheckState(eventTicketIds, selectedSet);

                return (
                  <CollapsibleSection
                    key={event?.eventId || event?.eventName}
                    defaultOpen={true}
                    header={
                      <div className="flex items-start gap-2">
                        <div
                          className="pt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TreeCheckbox
                            checked={eventState.checked}
                            indeterminate={eventState.indeterminate}
                            disabled={disabled}
                            onChange={() => {
                              const shouldSelect = !eventState.checked;
                              const next = toggleMany(
                                selectedSet,
                                eventTicketIds,
                                shouldSelect
                              );
                              commit(next);
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-text-primary line-clamp-1 text-sm font-bold">
                            {event?.eventName || 'Sự kiện'}
                          </div>
                          <div className="text-text-secondary mt-0.5 line-clamp-1 text-xs">
                            {event?.location || ''}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      {getArray(event?.shows).map((show) => {
                        const showTicketIds = collectTicketIdsFromShow(show);
                        const showState = getCheckState(
                          showTicketIds,
                          selectedSet
                        );

                        return (
                          <CollapsibleSection
                            key={show?.showId || show?.showName}
                            defaultOpen={true}
                            header={
                              <div className="flex items-start gap-2">
                                <div
                                  className="pt-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <TreeCheckbox
                                    checked={showState.checked}
                                    indeterminate={showState.indeterminate}
                                    disabled={disabled}
                                    onChange={() => {
                                      const shouldSelect = !showState.checked;
                                      const next = toggleMany(
                                        selectedSet,
                                        showTicketIds,
                                        shouldSelect
                                      );
                                      commit(next);
                                    }}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-text-primary line-clamp-1 text-sm font-semibold">
                                    {show?.showName || 'Suất diễn'}
                                  </div>
                                  <div className="text-text-secondary mt-0.5 text-xs">
                                    {show?.startTime
                                      ? `${formatUtcDate(show.startTime)} ${formatUtcTime(
                                          show.startTime
                                        )}${
                                          show?.endTime
                                            ? ` - ${formatUtcTime(show.endTime)}`
                                            : ''
                                        }`
                                      : ''}
                                  </div>
                                </div>
                              </div>
                            }
                          >
                            <div className="space-y-3">
                              {getArray(show?.ticketTypes).map((ticketType) => {
                                const typeTicketIds =
                                  collectTicketIdsFromTicketType(ticketType);
                                const typeState = getCheckState(
                                  typeTicketIds,
                                  selectedSet
                                );

                                return (
                                  <CollapsibleSection
                                    key={
                                      ticketType?.ticketTypeId ||
                                      ticketType?.ticketTypeName
                                    }
                                    defaultOpen={true}
                                    header={
                                      <div className="flex items-start gap-2">
                                        <div
                                          className="pt-0.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <TreeCheckbox
                                            checked={typeState.checked}
                                            indeterminate={
                                              typeState.indeterminate
                                            }
                                            disabled={disabled}
                                            onChange={() => {
                                              const shouldSelect =
                                                !typeState.checked;
                                              const next = toggleMany(
                                                selectedSet,
                                                typeTicketIds,
                                                shouldSelect
                                              );
                                              commit(next);
                                            }}
                                          />
                                        </div>
                                        <div className="flex min-w-0 flex-1 items-center justify-between pr-2">
                                          <div className="text-text-primary line-clamp-1 text-sm font-semibold">
                                            {ticketType?.ticketTypeName ||
                                              'Loại vé'}
                                            {' - '}
                                            {Number(
                                              ticketType?.price ?? 0
                                            )}{' '}
                                            USDT
                                          </div>
                                          <div className="text-text-primary text-sm font-medium"></div>
                                        </div>
                                      </div>
                                    }
                                  >
                                    {/* Danh sách vé con */}
                                    <div className="grid gap-2">
                                      {getArray(ticketType?.tickets).map(
                                        (ticket) => {
                                          const ticketId = String(
                                            ticket?.id || ''
                                          );
                                          if (!ticketId) return null;

                                          const checked =
                                            selectedSet.has(ticketId);
                                          const meta =
                                            fallbackMetaMap.get(ticketId);

                                          const limitText =
                                            typeof maxResaleMultiplier ===
                                            'number'
                                              ? `Giới hạn: ≤ ${
                                                  Number(
                                                    meta.originalPrice || 0
                                                  ) * maxResaleMultiplier
                                                } USDT`
                                              : '';
                                          const currentSalePrice =
                                            salePrices?.[ticketId] ?? '';

                                          return (
                                            <div
                                              key={ticketId}
                                              className={`border-border-default overflow-hidden rounded-lg border transition-colors duration-200 ${
                                                checked
                                                  ? 'bg-primary/5 border-primary/30'
                                                  : 'bg-background-secondary hover:bg-black/5 dark:hover:bg-white/5'
                                              }`}
                                            >
                                              <button
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => {
                                                  const next = new Set(
                                                    selectedSet
                                                  );
                                                  if (checked)
                                                    next.delete(ticketId);
                                                  else next.add(ticketId);
                                                  commit(next);
                                                }}
                                                className="flex w-full items-center justify-between p-3 text-left"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <div className="pt-0.5">
                                                    <TreeCheckbox
                                                      checked={checked}
                                                      indeterminate={false}
                                                      disabled={disabled}
                                                      onClick={(event) =>
                                                        event.stopPropagation()
                                                      }
                                                      onChange={() => {
                                                        const next = new Set(
                                                          selectedSet
                                                        );
                                                        if (checked)
                                                          next.delete(ticketId);
                                                        else next.add(ticketId);
                                                        commit(next);
                                                      }}
                                                    />
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <div className="text-text-primary text-sm font-semibold">
                                                      Vé #{ticketId.slice(-6)}
                                                    </div>
                                                    <div className="text-text-secondary mt-0.5 text-[11px]">
                                                      {meta?.status
                                                        ? `Trạng thái: ${meta.status}`
                                                        : ''}
                                                      {meta?.mintStatus
                                                        ? ` · Mint: ${meta.mintStatus}`
                                                        : ''}
                                                    </div>
                                                  </div>
                                                </div>
                                              </button>

                                              {/* HIỂN THỊ PHẦN NHẬP GIÁ NGAY DƯỚI VÉ KHI ĐƯỢC CHỌN */}
                                              {checked && (
                                                <div className="border-border-default border-t bg-white p-3 dark:bg-transparent">
                                                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-transparent">
                                                      {salePriceLabel && (
                                                        <label className="text-text-secondary text-xs font-medium whitespace-nowrap">
                                                          {salePriceLabel}:
                                                        </label>
                                                      )}
                                                      <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        max={
                                                          typeof maxResaleMultiplier ===
                                                          'number'
                                                            ? Number(
                                                                meta.originalPrice ||
                                                                  0
                                                              ) *
                                                              maxResaleMultiplier
                                                            : undefined
                                                        }
                                                        value={currentSalePrice}
                                                        onChange={(event) =>
                                                          onSalePriceChange?.(
                                                            ticketId,
                                                            event.target.value
                                                          )
                                                        }
                                                        placeholder={
                                                          salePricePlaceholder ||
                                                          '0.00'
                                                        }
                                                        className="text-text-primary w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-gray-400"
                                                      />
                                                      <span className="text-text-secondary text-xs font-bold">
                                                        USDT
                                                      </span>
                                                    </div>

                                                    {limitText && (
                                                      <p className="text-text-secondary text-[11px] leading-tight sm:max-w-[150px] sm:text-right">
                                                        {limitText}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </CollapsibleSection>
                                );
                              })}
                            </div>
                          </CollapsibleSection>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTicketsTreeSelect;
