const protonhash = require('./protonhash.js');
const fs = require('fs');
const path = require('path');

// Get the file path from the command-line arguments
const filePath = process.argv[2];

// Check if a file path was provided
if (!filePath) {
  console.log('Please provide a file path as a command-line argument');
  process.exit(1);
}

// Get the file name and extension
const fileName = path.basename(filePath);
const fileExtension = path.extname(filePath);

// Get the file size
const fileSize = protonhash.filesize(filePath);

// Get the contents of the file as a Uint8Array
const fileContents = protonhash.getA(filePath, fileSize, false, false);

// Get the hash of the file contents
const fileHash = protonhash.HashString(fileContents, 0);

console.log(`File Hash: ${fileHash}`);
