const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

const pages = [
    'home', 'conferences', 'speakers', 'gallery', 'contactus', 'aboutus',
    'committee', 'faqs', 'privacypolicy', 'termsandconditions'
];

pages.forEach(page => {
    const pDir = path.join(pagesDir, page);
    if (!fs.existsSync(pDir)) {
        fs.mkdirSync(pDir);
    }
    const name = page.charAt(0).toUpperCase() + page.slice(1);
    
    // Check if json/imgs exist for this specific page, otherwise just create placeholders
    const imgDir = path.join(pDir, `${page}_imgs`);
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir);
    }
    
    // JSON
    const jsonFile = path.join(pDir, `${page}.json`);
    if (!fs.existsSync(jsonFile)) {
        fs.writeFileSync(jsonFile, '[]');
    }

    // JSX
    const jsxFile = path.join(pDir, `${name}.jsx`);
    if (!fs.existsSync(jsxFile)) {
        fs.writeFileSync(jsxFile, `import React from 'react';
import './${page}.css';

const ${name} = () => {
    return (
        <div className="${page}-container">
            <h1>${name}</h1>
        </div>
    );
};

export default ${name};
`);
    }

    // CSS
    const cssFile = path.join(pDir, `${page}.css`);
    if (!fs.existsSync(cssFile)) {
        fs.writeFileSync(cssFile, `.${page}-container {
    padding: 2rem;
}
`);
    }
});

console.log('Pages scaffolded successfully.');
