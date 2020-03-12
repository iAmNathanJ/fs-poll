# `fs-poll`

A simple, polling file watcher for [Deno]. Probably don't use this. Deno will support [fsEvents] in the very near future.

```ts
import { watch } from "https://denopkg.com/iamnathanj/fs-poll@v1.3.0/mod.ts";
```

## Usage
```ts
// default mode
// use this for directories that don't change rapidly, like src/
watch({
  handle: fileChange => {
    // fileChange will have the shape:
    {
      type: "created" | "modified" | "removed",
      path: string;
    }
  }
});
```

```ts
// batch mode
// use this for directories that change often, like dist/
watch({
  batch: true,
  handle: fileChanges => {
    // fileChanges will have the shape:
    {
      created?: path[],
      modified?: path[],
      removed?: path[],
    }
  }
});
```

## Options
(defaults shown)
```ts
{
  handle: (FileEvent | FileEventBatch) => void,
  root?: string; // Deno.cwd()
  batch?: boolean // false
  interval?: number; // 100
  walkOptions?: WalkOptions; // see below
}
```

[`walkOptions`][WalkOptions] are passed directly to [`std/fs/walk.ts`][walk] with the following defaults:
```ts
{
  includeDirs: false,
  exts: [".js", ".ts", ".tsx"]
}
```

[Deno]: https://deno.land/
[WalkOptions]: https://deno.land/std/fs/walk.ts?doc#WalkOptions
[walk]: https://deno.land/std/fs/walk.ts?doc#walk
[fsEvents]: https://github.com/denoland/deno/pull/3452
