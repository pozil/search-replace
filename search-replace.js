const fs = require('fs');

const ROOT_DIR = '..';
const FILE_PATTERN = /\.github\/workflows\/.*\.yml/;
const IGNORE_PATTERNS = 'node_modules';
const SEARCH_PATTERN = /run: echo \${{ secrets\.DEVHUB_SFDX_URL}} > \.\/DEVHUB_SFDX_URL\.txt/m;

const REPLACE_TEMPLATE = `run: |
                  echo $\{{ secrets.DEVHUB_SFDX_URL}} > ./DEVHUB_SFDX_URL.txt
                  secretFileSize=$(wc -c "./DEVHUB_SFDX_URL.txt" | awk '{print $1}')
                  if [ $secretFileSize == 1 ]; then
                      echo "Missing DEVHUB_SFDX_URL secret. Is this workflow running on a fork?";
                      exit 1;
                  fi`;

const scanDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const path = `${dirPath}/${file}`;
    if (fs.statSync(path).isDirectory() && file !== IGNORE_PATTERNS) {
      scanDir(path);
    } else if (FILE_PATTERN.test(path)) {
      processFile(path);
    }
  });
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (SEARCH_PATTERN.test(content)) {
    console.log(filePath);
    content = content.replace(SEARCH_PATTERN, REPLACE_TEMPLATE);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

scanDir(ROOT_DIR);