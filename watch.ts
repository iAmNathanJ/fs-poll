import { FileEvent, FileEventBatch, poll, PollOptions } from "./poll.ts";

export type WatchOptions = PollOptions & {
  handle: (e: FileEvent | FileEventBatch) => unknown;
};

export function watch(opts: WatchOptions) {
  const controller = new AbortController();
  const watcher = poll({ ...opts, signal: controller.signal });

  (async () => {
    for await (const fileEvent of watcher) {
      opts.handle(fileEvent);
    }
  })();

  return {
    abort: async () => {
      controller.abort();
      await watcher.return(undefined);
    },
  };
}
