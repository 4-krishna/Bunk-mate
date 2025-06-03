// Enhanced Live Debug Script for TCS iON Portal
// Copy and paste this into your browser console on the TCS iON page

console.log('🚀 Starting TCS iON Live Debug Analysis...');

// Function to safely get text content
function safeGetText(element) {
    try {
        return element ? element.textContent || element.innerText || '' : '';
    } catch (e) {
        return '';
    }
}

// Function to extract numbers from text
function extractNumbers(text) {
    if (!text) return [];
    const matches = text.match(/\d+/g);
    return matches ? matches.map(m => parseInt(m, 10)) : [];
}

// 1. Basic Page Analysis
console.log('📄 PAGE ANALYSIS:');
console.log('URL:', window.location.href);
console.log('Title:', document.title);
console.log('Domain:', window.location.hostname);

// 2. Content Analysis
const bodyText = document.body.textContent.toLowerCase();
console.log('📝 CONTENT KEYWORDS:');
console.log('Contains "attendance":', bodyText.includes('attendance'));
console.log('Contains "total":', bodyText.includes('total'));
console.log('Contains "present":', bodyText.includes('present'));
console.log('Contains "classes":', bodyText.includes('classes'));
console.log('Contains "lectures":', bodyText.includes('lectures'));

// 3. Table Analysis
console.log('📊 TABLE ANALYSIS:');
const tables = document.querySelectorAll('table');
console.log(`Found ${tables.length} tables`);

tables.forEach((table, index) => {
    console.log(`\n--- Table ${index + 1} ---`);
    console.log('Table classes:', table.className);
    console.log('Table ID:', table.id);
    
    const rows = table.querySelectorAll('tr');
    console.log(`Rows: ${rows.length}`);
    
    if (rows.length > 0) {
        // Show first few rows
        for (let i = 0; i < Math.min(3, rows.length); i++) {
            const cells = rows[i].querySelectorAll('td, th');
            const cellTexts = Array.from(cells).map(cell => safeGetText(cell).trim()).filter(text => text.length > 0);
            console.log(`Row ${i + 1}:`, cellTexts);
        }
        
        // Look for numbers in the table
        const tableText = safeGetText(table);
        const numbers = extractNumbers(tableText);
        console.log('Numbers in table:', numbers);
    }
});

// 4. Specific Element Search
console.log('🔍 SPECIFIC ELEMENT SEARCH:');

const selectors = [
    'table',
    '.table',
    '.attendance-table',
    '.report-table',
    '[class*="attendance"]',
    '[class*="report"]',
    '[class*="academic"]',
    '[class*="summary"]',
    '.attendance-summary',
    '.academic-report',
    '.student-report'
];

selectors.forEach(selector => {
    try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`Found ${elements.length} elements for "${selector}"`);
            elements.forEach((el, idx) => {
                const text = safeGetText(el);
                if (text.length > 20) {
                    console.log(`  Element ${idx + 1} text (first 100 chars):`, text.substring(0, 100));
                    const numbers = extractNumbers(text);
                    if (numbers.length > 0) {
                        console.log(`  Numbers found:`, numbers);
                    }
                }
            });
        }
    } catch (e) {
        console.log(`Error with selector "${selector}":`, e.message);
    }
});

// 5. Text Pattern Analysis
console.log('🔤 TEXT PATTERN ANALYSIS:');

const patterns = [
    /total\s*:?\s*(\d+)/i,
    /total\s+classes?\s*:?\s*(\d+)/i,
    /total\s+lectures?\s*:?\s*(\d+)/i,
    /classes?\s+conducted\s*:?\s*(\d+)/i,
    /lectures?\s+conducted\s*:?\s*(\d+)/i,
    /present\s*:?\s*(\d+)/i,
    /attended\s*:?\s*(\d+)/i,
    /classes?\s+attended\s*:?\s*(\d+)/i,
    /lectures?\s+attended\s*:?\s*(\d+)/i,
    /(\d+)\s*\/\s*(\d+)/g,
    /(\d+)\s+out\s+of\s+(\d+)/i,
    /attendance\s*:?\s*(\d+(?:\.\d+)?)%/i
];

const fullText = document.body.textContent;
patterns.forEach((pattern, index) => {
    const matches = fullText.match(pattern);
    if (matches) {
        console.log(`Pattern ${index + 1} (${pattern}) found:`, matches);
    }
});

// 6. All Numbers on Page
console.log('🔢 ALL NUMBERS ON PAGE:');
const allNumbers = extractNumbers(fullText);
const uniqueNumbers = [...new Set(allNumbers)].sort((a, b) => a - b);
console.log('All unique numbers:', uniqueNumbers);

// Filter numbers that could be class counts (reasonable range)
const possibleClassCounts = uniqueNumbers.filter(n => n >= 10 && n <= 200);
console.log('Possible class counts (10-200):', possibleClassCounts);

// 7. Check for Dynamic Content
console.log('⚡ DYNAMIC CONTENT CHECK:');
const scripts = document.querySelectorAll('script');
console.log(`Found ${scripts.length} script tags`);

// Look for AJAX/fetch calls
const hasReact = !!window.React;
const hasAngular = !!window.angular;
const hasVue = !!window.Vue;
console.log('React detected:', hasReact);
console.log('Angular detected:', hasAngular);
console.log('Vue detected:', hasVue);

// 8. TCS iON Specific Analysis
console.log('🏢 TCS iON SPECIFIC ANALYSIS:');

// Check for common TCS iON elements
const tcsElements = [
    '[class*="ion"]',
    '[class*="tcs"]',
    '[id*="ion"]',
    '[id*="tcs"]',
    '.navbar',
    '.header',
    '.content',
    '.main',
    '.panel'
];

tcsElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`TCS element "${selector}": ${elements.length} found`);
    }
});

// 9. Iframe Check
console.log('🖼️ IFRAME CHECK:');
const iframes = document.querySelectorAll('iframe');
console.log(`Found ${iframes.length} iframes`);
iframes.forEach((iframe, index) => {
    console.log(`Iframe ${index + 1}:`, iframe.src);
});

// 10. Final Summary
console.log('\n📋 SUMMARY FOR EXTENSION DEBUGGING:');
console.log('='.repeat(50));
console.log('1. Page appears to be attendance-related:', 
    bodyText.includes('attendance') || bodyText.includes('present') || bodyText.includes('classes'));
console.log('2. Tables found:', tables.length);
console.log('3. Potential numbers:', possibleClassCounts.slice(0, 10));
console.log('4. Has dynamic content:', scripts.length > 5);
console.log('5. TCS iON domain:', window.location.hostname.includes('tcsion'));

// Instructions for user
console.log('\n🎯 NEXT STEPS:');
console.log('1. Look for patterns in the numbers above');
console.log('2. Check if tables contain attendance data');
console.log('3. Look for specific text patterns that might indicate total/attended classes');
console.log('4. If page loads dynamically, wait and run this script again');

console.log('\n✅ Debug analysis complete!');
