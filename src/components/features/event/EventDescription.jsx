import React from 'react';

export default function EventDescription({ description }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Chi tiết sự kiện</h2>
      <div className="bg-background-secondary border-border-default rounded-lg border p-6 shadow-sm">
        <div
          className="prose prose-invert tiptap-content max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
}
