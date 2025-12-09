export function MissingSessionId() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Missing Session ID
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Please provide a valid checkout session ID.
        </p>
      </div>
    </div>
  );
}

