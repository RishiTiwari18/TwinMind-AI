const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:5000";

test("document chunks API rejects requests without a token", async () => {
  const response = await fetch(
    `${BASE_URL}/api/document-chunks/INVALID_ID`
  );

  assert.equal(response.status, 401);
});

test("document chunks API rejects an invalid token", async () => {
  const response = await fetch(
    `${BASE_URL}/api/document-chunks/INVALID_ID`,
    {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    }
  );

  assert.equal(response.status, 401);
});