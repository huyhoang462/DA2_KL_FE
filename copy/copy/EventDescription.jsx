import React from 'react';

export default function EventDescription({ description }) {
  return (
    <div>

      <h2 className="text-xl font-bold mb-4">Chi tiết sự kiện</h2>
    <div className="bg-background-secondary p-6 rounded-lg border border-border-default">
      <div 
        className="prose prose-invert max-w-none tiptap-content"
        dangerouslySetInnerHTML={{ __html: description }} 
        />
    </div>
        </div>
  );
}