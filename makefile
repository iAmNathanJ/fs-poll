.PHONY: test

test:
	deno test --allow-read --allow-write --allow-env watch_test.ts
