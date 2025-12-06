interface ErrorStateProps {
  error?: Error | unknown;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold text-red-600 dark:text-red-400">
          Error Loading Session
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {error instanceof Error
            ? error.message
            : 'Failed to load checkout session'}
        </p>
      </div>
    </div>
  );
}

