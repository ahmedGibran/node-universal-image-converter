const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Directory containing various image files
const inputDir = 'input';
// Directory to save WebP files
const outputDir = 'output';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  try {
    fs.mkdirSync(outputDir);
  } catch (error) {
    console.error('Error creating output directory:', error);
    process.exit(1);
  }
}

// Function to convert and optimize an image to WebP
async function convertToWebp(inputPath, outputPath, width, height, quality, lossless) {
  try {
    await sharp(inputPath)
      .resize({ width, height, fit: 'inside' }) // Resize while maintaining aspect ratio
      .webp({ quality, lossless }) // Adjust quality and use lossless compression if specified
      .toFile(outputPath);
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

// Read all files in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Error reading input directory:', err);
    return;
  }

  // Filter out non-image files and ensure they are files, not directories
  const imageFiles = files.filter(file => {
    const filePath = path.join(inputDir, file);
    return fs.lstatSync(filePath).isFile() && /\.(jpe?g|png|tiff|gif|bmp)$/i.test(file);
  });

  if (imageFiles.length === 0) {
    console.log('No image files found in the input directory.');
    return;
  }

  // Convert each image file to WebP with resizing and optimizations
  imageFiles.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);
    // Adjust dimensions and quality as needed
    convertToWebp(inputPath, outputPath, 1200, 1800, 85, false); // Example dimensions and quality
  });

  console.log(`Processing ${imageFiles.length} files.`);
});
