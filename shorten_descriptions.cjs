const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src', 'pages', 'conferences', 'conferences.json');
const rootJsonPath = path.join(__dirname, 'conferences', 'conferences.json');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let totalOrigChars = 0;
let totalNewChars = 0;

data.forEach((c, idx) => {
    const originalLen = c.description.length;
    totalOrigChars += originalLen;

    let text = c.description;

    // 1. Remove redundant theme sections and quoted theme sentences (since theme is already shown in page header)
    text = text.replace(/(?:Conference Theme|Congress Theme|Theme\s*:?)\s*[\r\n]+["“][^"”\r\n]+["”]\s*/gi, '');
    text = text.replace(/Theme:\s*["“][^"”\r\n]+["”]\s*/gi, '');

    // 2. Remove 'This theme reflects...'
    text = text.replace(/This theme reflects a global shift toward purpose-driven leadership[\s\S]*?governance, and society\.\s*/gi, '');

    // 3. Remove verbose boilerplate / networking filler
    // SPHW
    text = text.replace(/Participants seeking to enhance their research[\s\S]*?beyond the conference\.\s*/gi, '');
    text = text.replace(/• Collaborative problem-solving forums addressing real-world challenges and future opportunities\s*/gi, '');

    // WPLC
    text = text.replace(/Looking to elevate your leadership journey[\s\S]*?worldwide professional network\.\s*/gi, '');

    // QWLE & NPLC_SPHWC
    text = text.replace(/These personalized and interactive sessions ensure every delegate gains direct access to insights[\s\S]*?evolving global landscape\.\s*/gi, '');
    text = text.replace(/By fostering strategic collaboration, global networking, and cross-sector partnerships[\s\S]*?Development Goals \(SDGs\)\.\s*/gi, '');
    text = text.replace(/Key engagement formats include:\s*/gi, '');

    // MPPW
    text = text.replace(/Join the movement shaping the future of mental health[\s\S]*?(?:lifespan|global stage)\.\s*/gi, '');
    text = text.replace(/Designed to nurture the next generation of mental health leaders[\s\S]*?mental health sciences\.\s*/gi, '');
    text = text.replace(/Designed to nurture the next generation of mental health leaders[\s\S]*?mental health innovation\.\s*/gi, '');

    // 4. Clean extra newlines & spaces (standardize to double newlines between paragraphs)
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    c.description = text;

    const newLen = text.length;
    totalNewChars += newLen;
    const reduction = ((originalLen - newLen) / originalLen * 100).toFixed(1);
    console.log(`${idx.toString().padStart(2)} ${c.slug.padEnd(16)}: ${originalLen} -> ${newLen} chars (${reduction}% reduced)`);
});

const overallReduction = ((totalOrigChars - totalNewChars) / totalOrigChars * 100).toFixed(1);
console.log(`\nOverall Reduction: ${totalOrigChars} -> ${totalNewChars} chars (${overallReduction}%)`);

// Save to src/pages/conferences/conferences.json and conferences/conferences.json
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
if (fs.existsSync(rootJsonPath)) {
    fs.writeFileSync(rootJsonPath, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Saved updated descriptions successfully.');
