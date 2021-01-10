import { delay, walk, WalkOptions } from "./deps.ts";

export type EventType = "created" | "modified" | "removed";

export type FileEvent = {
  type: EventType;
  path: string;
};

export type FileEventBatch = {
  [key in EventType]: string[];
};

export type PollOptions = {
  root?: string;
  batch?: boolean;
  interval?: number;
  walkOptions?: WalkOptions;
  signal?: AbortSignal;
};

const defaultWalkOptions = {
  includeDirs: false,
  exts: [".js", ".ts", ".tsx"],
};

export async function* poll({
  root = Deno.cwd(),
  batch = false,
  interval = 100,
  walkOptions,
  signal,
}: PollOptions = {}): AsyncGenerator<FileEvent | FileEventBatch> {
  const finalWalkOptions = { ...defaultWalkOptions, ...walkOptions };
  const eventBatch = new EventBatch();
  let files = await collectFiles(root, finalWalkOptions);
  let latestFiles;

  while (true) {
    if (signal?.aborted) break;

    latestFiles = await collectFiles(root, finalWalkOptions);

    for (const [filename, latestInfo] of latestFiles) {
      if (!files.has(filename)) {
        if (batch) {
          eventBatch.created.push(filename);
        } else {
          yield { type: "created", path: filename };
        }
        files.delete(filename);
      } else if (
        files.get(filename)?.mtime?.toString() !== latestInfo.mtime?.toString()
      ) {
        if (batch) {
          eventBatch.modified.push(filename);
        } else {
          yield { type: "modified", path: filename };
        }
        files.delete(filename);
      }
    }

    for (const [filename] of files) {
      if (!latestFiles.has(filename)) {
        if (batch) {
          eventBatch.removed.push(filename);
        } else {
          yield { type: "removed", path: filename };
        }
      }
    }

    if (batch && eventBatch.hasFiles()) {
      yield eventBatch;
    }

    files = latestFiles;
    eventBatch.clear();

    await delay(interval);
  }
}

type FileMap = Map<string, Deno.FileInfo>;

async function collectFiles(
  root: string,
  options: WalkOptions,
): Promise<FileMap> {
  const walkResults = walk(root, {
    includeDirs: false,
    exts: [".js", ".ts", ".tsx"],
    ...options,
  });
  const files: FileMap = new Map();
  for await (const { name, path } of walkResults) {
    files.set(name, await Deno.stat(path));
  }
  return files;
}

class EventBatch {
  public created: string[] = [];
  public modified: string[] = [];
  public removed: string[] = [];

  hasFiles(): boolean {
    return (
      !!this.created.length ||
      !!this.modified.length ||
      !!this.removed.length
    );
  }

  clear() {
    this.created = [];
    this.modified = [];
    this.removed = [];
  }
}
