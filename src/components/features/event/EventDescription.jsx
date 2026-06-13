// src/components/features/event/EventDescription.jsx
import React from 'react';

export default function EventDescription({ description }) {
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-text-primary">Giới thiệu sự kiện</h2>
      <div className="overflow-hidden rounded-2xl bg-background-secondary p-6 shadow-sm md:p-8">
        <div
          className="prose prose-lg prose-invert tiptap-content max-w-none text-text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </section>
  );
}