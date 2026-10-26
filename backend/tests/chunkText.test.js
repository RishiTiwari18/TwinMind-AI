const test = require("node:test");
const assert = require("node:assert/strict");

const chunkText = require("../src/utils/chunkText");

test("Should return an empty array for empty text", () => {
  const result = chunkText("");

  assert.deepEqual(result, []);
});

test("Should return an empty array for whitespace-only text", () => {
  const result = chunkText("   \n\t   ");

  assert.deepEqual(result, []);
});

test("Should return one chunk when the text fits within the chunk size", () => {
  const result = chunkText("Hello TwinMind", {
    chunkSize: 100,
    overlap: 10,
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].index, 0);
  assert.equal(result[0].text, "Hello TwinMind");
});

test("Should split long text into multiple chunks", () => {
  const result = chunkText("ABCDEFGHIJKLMNO", {
    chunkSize: 6,
    overlap: 2,
  });

  assert.equal(result.length, 4);

  assert.deepEqual(
    result.map((chunk) => chunk.text),
    ["ABCDEF", "EFGHIJ", "IJKLMN", "MNO"]
  );
});


test("Should assign sequential chunk indexes", () => {
  const result = chunkText("ABCDEFGHIJKLMNO", {
    chunkSize: 6,
    overlap: 2,
  });

  assert.deepEqual(
    result.map((chunk) => chunk.index),
    [0, 1, 2, 3]
  );
});


test("Should normalize consecutive whitespace", () => {
  const result = chunkText("TwinMind\n\nis    an AI assistant.");

  assert.equal(
    result[0].text,
    "TwinMind is an AI assistant."
  );
});

test("Should reject non-string input", () => {
  assert.throws(
    () => chunkText(123),
    {
      name: "TypeError",
      message: "Text must be a string",
    }
  );
});

test("Should reject a zero chunk size", () => {
  assert.throws(
    () => chunkText("Hello", {
      chunkSize: 0,
    }),
    {
      message: "Chunk size must be a positive integer",
    }
  );
});

test("Should reject negative overlap", () => {
  assert.throws(
    () => chunkText("Hello", {
      chunkSize: 10,
      overlap: -1,
    }),
    {
      message: "Overlap must be a non-negative integer smaller than chunk size",
    }
  );
});

test("Should reject overlap equal to chunk size", () => {
  assert.throws(
    () => chunkText("Hello", {
      chunkSize: 10,
      overlap: 10,
    }),
    {
      message: "Overlap must be a non-negative integer smaller than chunk size",
    }
  );
});