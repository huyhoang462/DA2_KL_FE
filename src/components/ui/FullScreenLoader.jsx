import React from 'react';

export default function FullScreenLoader() {
  return (
    <div className="from-background-primary to-foreground flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="relative flex flex-col items-center">
        <div className="animate-breath border-primary/20 bg-background-secondary shadow-primary/10 relative h-48 w-80 rounded-2xl border-2 shadow-2xl">
          <div className="border-primary/20 bg-background-primary absolute top-1/2 -left-6 h-12 w-12 -translate-y-1/2 rounded-full border-2"></div>
          <div className="border-primary/20 bg-background-primary absolute top-1/2 -right-6 h-12 w-12 -translate-y-1/2 rounded-full border-2"></div>

          <div className="animate-reveal flex h-full flex-col items-center justify-center p-6">
            <img
              src="favicon.ico"
              alt="ShineTicket Logo"
              className="h-24 w-auto"
            />
            <p className="text-text-secondary mt-4 text-sm font-semibold tracking-[0.2em]">
              LOADING...
            </p>
          </div>
        </div>

        <div className="via-primary/50 mt-8 h-px w-40 bg-gradient-to-r from-transparent to-transparent"></div>

        {/* <p className="text-text-secondary mt-4 animate-pulse text-sm">
          Đang chuẩn bị trải nghiệm của bạn...
        </p> */}
      </div>
    </div>
  );
}
