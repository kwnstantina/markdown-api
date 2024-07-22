const path = require('path');

const MARKDOWN_DIR = path.join(__dirname, '../markdown');
const PORT = process.env.PORT || 4000;

module.exports = {
  MARKDOWN_DIR,
  PORT,
};
