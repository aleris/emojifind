# data

To install dependencies:

```bash
bun install
```

To generate the CSV files in src/assets:

```bash
bun run csv.ts
```

To generate the search index file in src/assets:

```bash
bun run searchIndex.ts
```

To generate descriptions usind OpenAI/Deepseek:

```bash
# edit .env.development
bun run desc.ts
```
