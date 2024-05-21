const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Directory containing JPEG files
const inputDir = 'input';
// Directory to save WebP files
const outputDir = 'output';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to convert and resize a single JPEG to WebP
async function convertJpegToWebp(inputPath, outputPath, width, height) {
  try {
    await sharp(inputPath)
      .resize({ width, height, fit: 'inside' }) // Resize while maintaining aspect ratio
      .webp({ quality: 100 }) // Adjust quality as needed
      .toFile(outputPath);
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const { filename, originalname } = req.file;
  const inputPath = path.join(__dirname, req.file.path);
  const outputPath = path.join(__dirname, outputDir, `${filename}.webp`);

  // Convert uploaded JPEG file to WebP format
  convertJpegToWebp(inputPath, outputPath, 1200, 1800); // Example dimensions: width = 800, height = 600

  res.status(200).send('File uploaded and converted successfully.');
});

app.get('/download', (req, res) => {
  // Create a zip file containing all converted images
  const zipOutputPath = path.join(__dirname, 'output', 'converted_images.zip');
  const output = fs.createWriteStream(zipOutputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('Zip file created:', zipOutputPath);
    // Send the zip file as a response
    res.download(zipOutputPath, 'converted_images.zip', (err) => {
      if (err) {
        console.error('Error sending zip file:', err);
        res.status(500).send('Error sending zip file.');
      } else {
        console.log('Download completed.');
        // Cleanup: delete the temporary output directory and uploaded zip file
        if (fs.existsSync(zipFilePath)) {
          fs.unlinkSync(zipFilePath);
          console.log('Uploaded zip file deleted.');
        } 
      }
    });
  });

  archive.pipe(output);

  archive.on('error', (err) => {
    console.error('Error creating zip file:', err);
    res.status(500).send('Error creating zip file.');
  });

  archive.on('finish', () => {
    console.log('Archive finished.');
  });

  const files = fs.readdirSync(outputDir);
  files.forEach((file) => {
    const filePath = path.join(outputDir, file);
    console.log('Appending file to archive:', filePath);
    archive.append(fs.createReadStream(filePath), { name: file }); // Append with original filename
  });

  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
