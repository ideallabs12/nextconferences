const fs=require('fs');
const data = JSON.parse(fs.readFileSync('conferences/conferences.json'));
data.forEach(c => console.log(c.slug + ': ' + (c.insightSessions ? c.insightSessions.length : 0) + ' categories'));
