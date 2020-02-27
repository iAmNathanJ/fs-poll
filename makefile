.PHONY: test
.PHONY: fmt

test:
	deno test --allow-read --allow-write --allow-env

fmt:
	deno fmt *.ts
