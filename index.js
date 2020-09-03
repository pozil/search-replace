const ROOT_DIR = '../lwc-recipes';
const FILE_PATTERN = '.test.js';
const IGNORE_PATTERNS = 'node_modules';
const SEARCH_PATTERN = /^\}\);$/m;

const COMPONENT_TAG = '%COMPONENT_TAG%';
const COMPONENT_CLASS = '%COMPONENT_CLASS%';
const REPLACE_TEMPLATE = `
    it('is accessible', () => {
        const element = createElement('%COMPONENT_TAG%', {
            is: %COMPONENT_CLASS%
        });

        document.body.appendChild(element);

        return Promise.resolve().then(() => {
          expect(element).toBeAccessible();
        });
    });
});`;

const fs = require('fs');

const scanDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const path = `${dirPath}/${file}`;
    if (fs.statSync(path).isDirectory() && file !== IGNORE_PATTERNS) {
      scanDir(path);
    } else if (path.endsWith(FILE_PATTERN)) {
      processFile(path);
    }
  });
};

const processFile = (filePath) => {
  console.log(filePath);

  let fileName = filePath.substring(0, filePath.length - FILE_PATTERN.length);
  fileName = fileName.substring(fileName.lastIndexOf('/')+1);
  
  const className = toClassName(fileName);
  const tagName = toTagName(fileName);

  const template = REPLACE_TEMPLATE
    .replace(COMPONENT_TAG, tagName)
    .replace(COMPONENT_CLASS, className);

  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(SEARCH_PATTERN, template);
  fs.writeFileSync(filePath, content, 'utf-8');
}

const toClassName = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const toTagName = str => {
  return 'c-'+ str
    .replace(/([A-Z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')            
    .toLowerCase();
}

scanDir(ROOT_DIR);