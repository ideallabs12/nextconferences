const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'conferences', 'conferences.json');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const conferences = JSON.parse(rawData);

conferences.forEach(conf => {
    const text = conf.rawText;
    
    // Extract description
    // It starts after "About Conference" and ends before the standalone "Theme" that precedes "Insight Sessions"
    let description = '';
    const aboutMatch = text.match(/About Conference\s*\n+([\s\S]*?)\nTheme\n/i) || text.match(/About Conference\s*\n+([\s\S]*?)\nInsight Sessions\n/i);
    
    if (aboutMatch) {
        description = aboutMatch[1].trim();
        // Remove the internal "Conference Theme:" part from description if you want, but it's part of the text so let's keep it or just clean up
    }
    
    // If Theme was extracted differently
    const themeMatch = text.match(/\nTheme\n+([^\n]+)/);
    if (themeMatch) {
        conf.theme = themeMatch[1].replace(/['"]+/g, '').trim();
    }
    
    // Extract insight sessions
    const sessionsMatch = text.match(/Insight Sessions\n+([\s\S]*?)\nAgenda\n/);
    let insightSessions = [];
    
    if (sessionsMatch) {
        const sessionsText = sessionsMatch[1];
        const lines = sessionsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        let currentCategory = null;
        for (const line of lines) {
            if (line.startsWith('•') || line.startsWith('-')) {
                if (currentCategory) {
                    currentCategory.topics.push(line.replace(/^[•-]\s*/, '').trim());
                }
            } else {
                // New category
                if (currentCategory) {
                    insightSessions.push(currentCategory);
                }
                currentCategory = {
                    title: line.replace(/:$/, '').trim(),
                    topics: []
                };
            }
        }
        if (currentCategory) {
            insightSessions.push(currentCategory);
        }
    }
    
    conf.description = description;
    conf.insightSessions = insightSessions;
    delete conf.rawText; // Remove raw text to clean up JSON
});

fs.writeFileSync(jsonPath, JSON.stringify(conferences, null, 2));
console.log('JSON processed successfully!');
