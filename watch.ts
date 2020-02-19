import { walk, WalkOptions, delay } from "./deps.ts";

export type FileEvent = {
  type: "added" | "changed" | "removed";
  path: string;
};

export type WatchOptions = {
  root: string;
  initial?: boolean;
  interval?: number;
  walkOptions?: WalkOptions;
};

// todo: make cancellable
export async function* watch({
  root,
  initial = false,
  interval = 100,
  walkOptions = {
    includeDirs: false,
    exts: [".js", ".ts", ".tsx"]
  }
}: WatchOptions): AsyncGenerator<FileEvent> {
  let files = await collectFiles(root, walkOptions);
  let latestFiles;
  // todo: add options for batched changes
  // let eventBatch;

  if (initial) {
    for (const [filename] of files) {
      yield { type: "added", path: filename };
    }
  }

  while (true) {
    latestFiles = await collectFiles(root, walkOptions);

    for (const [filename, info] of latestFiles) {
      if (!files.has(filename)) {
        yield { type: "added", path: filename };
        files.delete(filename);
      } else if (files.get(filename).modified !== info.modified) {
        yield { type: "changed", path: filename };
        files.delete(filename);
      }
    }

    for (const [filename] of files) {
      if (!latestFiles.has(filename)) {
        yield { type: "removed", path: filename };
      }
    }

    files = latestFiles;
    await delay(interval);
  }
}

type FileMap = Map<string, Deno.FileInfo>;

async function collectFiles(
  root: string,
  options: WalkOptions
): Promise<FileMap> {
  const walkResults = walk(root, {
    includeDirs: false,
    exts: [".js", ".ts", ".tsx"],
    ...options
  });
  const files: FileMap = new Map();
  for await (const { filename, info } of walkResults) {
    files.set(filename, info);
  }
  return files;
}
