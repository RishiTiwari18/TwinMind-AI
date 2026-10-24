const chunkText = require("./src/utils/chunkText");

const sampleText = `
Binary Search is an efficient searching algorithm.
It works on sorted arrays.
Its time complexity is O(log n).

Linear Search checks every element one by one.
Its time complexity is O(n).
`;

const chunks = chunkText(sampleText, {
  chunkSize: 100,
  overlap: 20,
});

console.log("Total chunks:", chunks.length);

for (const chunk of chunks) {
  console.log(`\nChunk ${chunk.index}:`);
  console.log(chunk.text);
}

console.log("\nEmpty input test:");
console.log(chunkText("   "));

console.log("\nCustom configuration test:");
console.log(
  chunkText("ABCDEFGHIJKLMNOPQRSTUVWXYZ", {
    chunkSize: 10,
    overlap: 2,
  })
);

console.log("\nInvalid configuration test:");

try {
  chunkText("Some text", {
    chunkSize: 10,
    overlap: 10,
  });
} catch (error) {
  console.log(error.message);
}