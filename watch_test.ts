import { assert } from "https://deno.land/std@v0.33.0/testing/asserts.ts";
import { resolve } from "https://deno.land/std@v0.33.0/path/mod.ts";
import { encode } from "https://deno.land/std@v0.33.0/strings/mod.ts";
import { delay } from "./deps.ts";
import { watch, FileEvent } from "./watch.ts";

async function startWatching(events) {
  for await (const event of watch({ root: Deno.cwd() })) {
    events.push(event);
  }
}

Deno.test({
  name: "file events",
  async fn() {
    const targetFile = resolve(Deno.cwd(), "foo.ts");
    const events: FileEvent[] = [];
    startWatching(events);

    await delay(100);

    await Deno.create(targetFile);
    await delay(100);
    assert(
      events.some(e => (e.type === "added" && e.path === targetFile)),
      "failed to report file added"
    );

    const f = await Deno.open(targetFile, { write: true });
    await f.write(encode("foo"));
    f.close();
    await delay(100);
    assert(
      events.some(e => (e.type === "changed" && e.path === targetFile)),
      "failed to report file changed"
    );

    await Deno.remove(targetFile);
    await delay(100);
    assert(
      events.some(e => (e.type === "removed" && e.path === targetFile)),
      "failed to report file removed"
    );
  }
});

await Deno.runTests({ exitOnFail: false });

Deno.exit();
