import { delay } from "https://deno.land/std@0.83.0/async/delay.ts";
import { assert, assertEquals } from "./dev-deps.ts";
import { watch } from "./watch.ts";
const { test, makeTempDir, readFile, writeFile, create } = Deno;

async function setup(config = {}) {
  const projectRoot = await makeTempDir();

  // await writeFile(`${projectRoot}/project.json`, encode(projectConfig));
  // await writeFile(`${projectRoot}/README.md`, encode(readme));

  // async function run(args: string) {
  //   const cmd = Deno.run({
  //     cwd: projectRoot,
  //     cmd: args.split(" "),
  //     stdout: "piped",
  //     stderr: "piped",
  //   });

  //   const status = await cmd.status();
  //   const stdout = decode(await cmd.output());
  //   const stderr = decode(await cmd.stderrOutput());

  //   cmd.close();

  //   return { status, stdout, stderr };
  // }

  // async function cleanup() {
  //   const cmd = Deno.run({
  //     cmd: ["rm", "-rf", projectRoot],
  //     stdout: "piped",
  //     stderr: "piped",
  //   });
  //   await cmd.status();
  //   cmd.stdout?.close();
  //   cmd.stderr?.close();
  //   cmd.close();
  // }

  // return { projectRoot, run, bump, cleanup };
}

function spy() {
  const calls: unknown[][] = [];
  const s = (...realArgs: unknown[]) => {
    calls.push(realArgs);
  };
  s.calledWith = (...assertArgs: unknown[]) => {
    return !!calls.find((call, i) =>
      call.every((arg) => arg === assertArgs[i])
    );
  };
  s.called = () => {
    calls.length > 0;
  };

  return s;
}

test("create", async () => {
  const handler = spy();
  const projectRoot = await makeTempDir();

  const { abort } = watch({ root: projectRoot, handle: handler });

  await delay(150);
  await create(`${projectRoot}/test.file`);
  await delay(150);
  await abort();

  assert(handler.called());
});
