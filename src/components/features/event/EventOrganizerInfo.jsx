import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function EventOrganizerInfo({ organizer }) {
  if (!organizer) return null;

  const { name, email, phone, description } = organizer;

  return (
    <div>
            <h2 className="text-xl font-bold mb-4">Thông tin ban tổ chức</h2>
         <div className="bg-white border border-border-default rounded-lg shadow-sm p-4 sm:p-6 mx-auto">
      
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
        {name}
      </h3>

      {/* Email & Phone */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-text-secondary mb-3">
        {email && (
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span className="text-sm sm:text-base">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span className="text-sm sm:text-base">{phone}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm sm:text-base text-text-secondary">
          {description}
        </p>
      )}
    </div>
    </div>
   
  );
}
