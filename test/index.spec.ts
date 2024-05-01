// test/index.spec.ts
import { env } from "cloudflare:test";
import { assert, beforeAll, expect, test } from "vitest";

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}

beforeAll(async () => {
  await env.MY_DB.exec(
    // TODO: why does D1 not allow new line characters here?
    `CREATE TABLE IF NOT EXISTS MyData (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			data BLOB NOT NULL
		)`.replaceAll("\n", " "),
  );
});

test("repro", async () => {
  const data = crypto.getRandomValues(new Uint8Array(100));
  const created = await env.MY_DB.prepare(
    "INSERT INTO MyData (data) VALUES (?1) RETURNING id, data",
  )
    .bind(data)
    .first<{ id: number; data: unknown }>();
  assert(created !== null);

  // ❌ throws here 👇🏻 shows number[] instead
  expect(created.data).toBeInstanceOf(ArrayBuffer);

  // data matches though ✅
  expect(new Uint8Array(created.data as any)).toEqual(data);

  // querying data has the same result
  const selected = await env.MY_DB.prepare(
    "SELECT id, data FROM MyData WHERE id = ?1",
  )
    .bind(created.id)
    .first<{ id: number; data: unknown }>();
  assert(selected !== null);

  // ❌ throws here 👇🏻 shows number[] instead
  expect(selected.data).toBeInstanceOf(ArrayBuffer);
});
