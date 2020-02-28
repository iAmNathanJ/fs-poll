import {
  poll,
  PollOptions,
  FileEvent,
  FileEventBatch
} from "./poll.ts";

export type WatchOptions = PollOptions & {
  handle: (e: FileEvent | FileEventBatch) => any;
};

export function watch(opts: WatchOptions) {
  let cancelled = false;

  (async function watchFiles() {
    for await (const fileEvent of poll(opts)) {
      if (cancelled) break;
      opts.handle(fileEvent);
    }
  })();

  return {
    cancel(): void {
      cancelled = true;
    }
  };
}
