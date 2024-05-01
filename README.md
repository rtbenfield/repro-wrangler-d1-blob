# Wrangler D1 BLOB type reproduction

Reproduction of wrangler D1 returning `Array<number>` for BLOB data instead of `ArrayBuffer`.

A table created this way:

```sql
CREATE TABLE MyData (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data BLOB NOT NULL
);
```

Will return `data` as `Array<number>` instead of the expected `ArrayBuffer`. However, `ArrayBuffer` and typed arrays are accepted as parameters for insert/update.

See `test/index.spec.ts` for reproduction.
