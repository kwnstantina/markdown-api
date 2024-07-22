const fs = require('fs');
const path = require('path');
const { MARKDOWN_DIR } = require('./config');

const resolvers = {
  Query: {
    getMarkdownFile: async (_, { fileName }) => {
      try {
        const filePath = path.join(MARKDOWN_DIR, `${fileName}.md`);
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found');
        }
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        return fileContent;
      } catch (error) {
        console.error(`Error reading file ${fileName}:`, error);
        throw new Error('Error reading file');
      }
    },
    getAllMarkdownFiles: async () => {
      try {
        const files = await fs.promises.readdir(MARKDOWN_DIR);
        const markdownFiles = files
          .filter(file => path.extname(file) === '.md')
          .map((file, index) => {
            const filePath = path.join(MARKDOWN_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const title = content.split('\n')[0].replace(/^#\s/, ''); 
            return {
              id: index + 1,
              title: title || 'Untitled',
              fileName: path.basename(file, '.md')
            };
          });
        return markdownFiles;
      } catch (error) {
        console.error('Error reading markdown files:', error);
        throw new Error('Error reading markdown files');
      }
    },
  },
};

module.exports = resolvers;
