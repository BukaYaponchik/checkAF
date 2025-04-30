const express = require('express');
const path = require('path');
const app = express();

// Раздача статических файлов из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Обработка всех маршрутов для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});