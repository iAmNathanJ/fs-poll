import {
  poll,
  WatchOptions,
  FileEvent,
  FileEventBatch
} from "./poll.ts";

type Options = WatchOptions & {
  handle: (e: FileEvent | FileEventBatch) => void;
};

export function watch(opts: Options) {
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
