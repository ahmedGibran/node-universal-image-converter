const express = require('express');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(fileUpload());
app.use(express.static('public'));

app.post('/convert', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const outputPath = path.join(__dirname, 'output', `${path.parse(file.name).name}.webp`);

  try {
    await sharp(file.data)
      .resize({ width: 1200, height: 1800, fit: 'inside' }) // Example dimensions
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    res.download(outputPath, `${path.parse(file.name).name}.webp`);
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).send('Error converting file.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
