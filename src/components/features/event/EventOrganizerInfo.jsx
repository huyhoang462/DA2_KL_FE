// src/components/features/event/EventOrganizerInfo.jsx
import React from 'react';
import { Mail, Phone, ShieldCheck } from 'lucide-react';

export default function EventOrganizerInfo({ organizer }) {
  if (!organizer) return null;

  const { name, email, phone, description } = organizer;

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-text-primary">Ban tổ chức</h2>
      <div className="rounded-2xl bg-foreground p-6 shadow-sm md:p-8">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {/* Avatar placeholder - Lấy chữ cái đầu */}
            <span className="text-xl font-bold">{name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-lg font-bold text-text-primary md:text-xl">
              {name}
              <ShieldCheck className="h-5 w-5 text-info" title="Đã xác thực" />
            </h3>
            <p className="text-sm font-medium text-text-secondary">Đơn vị tổ chức uy tín</p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {email && (
            <div className="flex items-center gap-2 rounded-lg bg-background-secondary px-3 py-2 text-text-primary">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 rounded-lg bg-background-secondary px-3 py-2 text-text-primary">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{phone}</span>
            </div>
          )}
        </div>

        {description && (
          <div className="border-t border-border-default pt-4 text-sm leading-relaxed text-text-secondary">
            {description}
          </div>
        )}
      </div>
    </section>
  );
}