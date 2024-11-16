'use client';

export default function Loading() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
            <div className="text-5xl font-bold text-primary">
              Loading...
            </div>
            <div className="mt-5">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        </div>
      </div>
    </div>
  );
}