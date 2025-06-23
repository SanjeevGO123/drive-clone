// This script generates numbers from 1 to 1 billion and writes them to a file.
const fs = require('fs');

const filePath = 'numbers.txt';
const stream = fs.createWriteStream(filePath);

console.log('Starting to write numbers to file...');

for (let i = 1; i <= 1000000000; i++) {
  stream.write(i + '\n');
  if (i % 1000000 === 0) {
    console.log(`Written ${i} numbers...`);
  }
}

stream.end(() => {
  console.log('Finished writing numbers to file.');
});
