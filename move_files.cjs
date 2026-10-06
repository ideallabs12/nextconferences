const fs = require('fs');
const path = require('path');

const srcConfs = path.join(__dirname, 'conferences');
const destConfs = path.join(__dirname, 'src', 'pages', 'conferences');

if (fs.existsSync(srcConfs)) {
    const jsonPath = path.join(srcConfs, 'conferences.json');
    if (fs.existsSync(jsonPath)) {
        fs.copyFileSync(jsonPath, path.join(destConfs, 'conferences.json'));
    }

    const srcImgs = path.join(srcConfs, 'conference_imgs');
    const destImgs = path.join(destConfs, 'conferences_imgs'); // Scaffolded as conferences_imgs
    
    if (fs.existsSync(srcImgs)) {
        const files = fs.readdirSync(srcImgs);
        files.forEach(f => {
            fs.copyFileSync(path.join(srcImgs, f), path.join(destImgs, f));
        });
    }
    
    fs.rmSync(srcConfs, { recursive: true, force: true });
}
console.log('Moved files successfully');
