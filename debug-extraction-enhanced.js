// TCS iON Attendance Data Extraction Debug Script - Enhanced Version
// Copy and paste this into browser console on TCS iON attendance page
// This will help identify what data is available and how to extract it

console.log('🔍 Starting TCS iON Attendance Debug Analysis...');

// Enhanced patterns for debugging
const DEBUG_PATTERNS = {
    totalKeywords: ['total', 'total classes', 'total lectures', 'total sessions', 'conducted', 'classes conducted', 'lectures conducted'],
    presentKeywords: ['present', 'attended', 'attendance', 'classes attended', 'lectures attended'],
    absentKeywords: ['absent', 'missed', 'absenteeism'],
    
    tableSelectors: [
        'table', '.table', '.data-table', '.attendance-table', '.report-table',
        '[class*="table"]', '[class*="attendance"]', '[class*="report"]', 
        '[class*="grid"]', '[class*="data"]', '[id*="attendance"]', 
        '[id*="table"]', '[id*="report"]', '[id*="grid"]'
    ],
    
    tcsSelectors: [
        '.attendance-summary', '.academic-report', '.student-report',
        '[class*="summary"]', '[class*="academic"]', '[class*="student"]',
        '.report-content', '.content-panel'
    ]
};

function extractNumber(text) {
    if (!text) return [];
    const matches = text.match(/\d+/g);
    return matches ? matches.map(m => parseInt(m, 10)) : [];
}

function debugAnalysis() {
    console.log('\n📋 PAGE ANALYSIS');
    console.log('URL:', window.location.href);
    console.log('Title:', document.title);
    console.log('Page Text Length:', document.body.textContent.length);
    
    // Check for keywords
    const pageText = document.body.textContent.toLowerCase();
    console.log('\n🔑 KEYWORD ANALYSIS');
    console.log('Contains "attendance":', pageText.includes('attendance'));
    console.log('Contains "total":', pageText.includes('total'));
    console.log('Contains "present":', pageText.includes('present'));
    console.log('Contains "classes":', pageText.includes('classes'));
    console.log('Contains "lectures":', pageText.includes('lectures'));
    console.log('Contains "conducted":', pageText.includes('conducted'));
    
    // Find all tables
    console.log('\n📊 TABLE ANALYSIS');
    const tables = document.querySelectorAll(DEBUG_PATTERNS.tableSelectors.join(','));
    console.log(`Found ${tables.length} potential tables`);
    
    tables.forEach((table, index) => {
        console.log(`\nTable ${index + 1}:`);
        console.log('Class:', table.className || 'none');
        console.log('ID:', table.id || 'none');
        console.log('Rows:', table.querySelectorAll('tr').length);
        console.log('Text preview:', table.textContent.substring(0, 200) + '...');
        
        // Look for numbers in table
        const numbers = extractNumber(table.textContent);
        if (numbers.length > 0) {
            console.log('Numbers found:', numbers);
        }
    });
    
    // Find TCS-specific containers
    console.log('\n🏢 TCS CONTAINER ANALYSIS');
    const tcsContainers = document.querySelectorAll(DEBUG_PATTERNS.tcsSelectors.join(','));
    console.log(`Found ${tcsContainers.length} TCS-specific containers`);
    
    tcsContainers.forEach((container, index) => {
        console.log(`\nTCS Container ${index + 1}:`);
        console.log('Class:', container.className || 'none');
        console.log('ID:', container.id || 'none');
        console.log('Text preview:', container.textContent.substring(0, 200) + '...');
        
        const numbers = extractNumber(container.textContent);
        if (numbers.length > 0) {
            console.log('Numbers found:', numbers);
        }
    });
    
    // Pattern matching analysis
    console.log('\n🎯 PATTERN MATCHING ANALYSIS');
    const text = document.body.textContent;
    
    const patterns = [
        { name: 'Total + Present', regex: /total[:\s]*(\d+)[,\s]*present[:\s]*(\d+)/i },
        { name: 'Present + Total', regex: /present[:\s]*(\d+)[,\s]*total[:\s]*(\d+)/i },
        { name: 'Classes Conducted', regex: /classes\s+conducted[:\s]*(\d+)/i },
        { name: 'Classes Attended', regex: /classes\s+attended[:\s]*(\d+)/i },
        { name: 'Total Classes', regex: /total\s+classes[:\s]*(\d+)/i },
        { name: 'Total Lectures', regex: /total\s+lectures[:\s]*(\d+)/i },
        { name: 'Lectures Attended', regex: /lectures\s+attended[:\s]*(\d+)/i },
        { name: 'Fraction Format', regex: /(\d+)\s*\/\s*(\d+)/g },
        { name: 'Out of Format', regex: /(\d+)\s+out\s+of\s+(\d+)/i },
        { name: 'Classes Out Of', regex: /(\d+)\s+classes?\s+out\s+of\s+(\d+)/i }
    ];
    
    patterns.forEach(pattern => {
        const matches = pattern.regex.exec(text);
        if (matches) {
            console.log(`✅ ${pattern.name}:`, matches[0]);
            console.log('   Numbers:', matches.slice(1).map(n => parseInt(n)));
        } else {
            console.log(`❌ ${pattern.name}: No match`);
        }
    });
    
    // Extract all numbers from page
    console.log('\n🔢 ALL NUMBERS IN PAGE');
    const allNumbers = extractNumber(document.body.textContent);
    const uniqueNumbers = [...new Set(allNumbers)].sort((a, b) => a - b);
    console.log('All unique numbers:', uniqueNumbers);
    console.log('Potential attendance ranges:', uniqueNumbers.filter(n => n >= 1 && n <= 200));
    
    // Search for percentage indicators
    console.log('\n📊 PERCENTAGE ANALYSIS');
    const percentMatches = text.match(/(\d+(?:\.\d+)?)\s*%/g);
    if (percentMatches) {
        console.log('Percentages found:', percentMatches);
        
        // Try to find context around percentages
        percentMatches.forEach(perc => {
            const index = text.indexOf(perc);
            const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100));
            console.log(`Context for ${perc}:`, context.replace(/\s+/g, ' ').trim());
        });
    } else {
        console.log('No percentages found');
    }
    
    // Look for specific DOM elements that might contain data
    console.log('\n🎯 ELEMENT INSPECTION');
    const potentialElements = [
        'td', 'th', 'div', 'span', 'p'
    ];
    
    potentialElements.forEach(tagName => {
        const elements = document.querySelectorAll(tagName);
        let attendanceElements = 0;
        
        elements.forEach(el => {
            const text = el.textContent.toLowerCase();
            if ((text.includes('total') || text.includes('present') || text.includes('attended')) && 
                extractNumber(el.textContent).length > 0) {
                attendanceElements++;
                if (attendanceElements <= 5) { // Show only first 5
                    console.log(`${tagName.toUpperCase()} element:`, el.textContent.trim());
                    console.log('   Numbers:', extractNumber(el.textContent));
                }
            }
        });
        
        if (attendanceElements > 0) {
            console.log(`Found ${attendanceElements} ${tagName} elements with potential attendance data`);
        }
    });
    
    console.log('\n✅ Debug analysis complete!');
    console.log('💡 If you see relevant numbers above, the extension should be able to extract them.');
    console.log('💡 If not, the attendance data might be in a different format or location.');
}

// Helper function to test extraction manually
window.testExtraction = function() {
    console.log('\n🧪 TESTING MANUAL EXTRACTION...');
    
    // Try to extract using the same logic as the extension
    const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
    
    // Method 1: Look for fraction patterns
    const fractionMatches = document.body.textContent.match(/(\d+)\s*\/\s*(\d+)/g);
    if (fractionMatches) {
        console.log('Fraction patterns found:', fractionMatches);
        const lastFraction = fractionMatches[fractionMatches.length - 1]; // Often the last one is attendance
        const nums = lastFraction.match(/(\d+)\s*\/\s*(\d+)/);
        if (nums) {
            result.attendedClasses = parseInt(nums[1]);
            result.totalClasses = parseInt(nums[2]);
            result.found = true;
            console.log(`Extracted from fraction: ${result.attendedClasses}/${result.totalClasses}`);
        }
    }
    
    // Method 2: Look for table data
    if (!result.found) {
        const tables = document.querySelectorAll('table');
        tables.forEach((table, index) => {
            const text = table.textContent.toLowerCase();
            if (text.includes('total') && (text.includes('present') || text.includes('attended'))) {
                console.log(`Table ${index + 1} contains attendance keywords`);
                const numbers = extractNumber(table.textContent);
                if (numbers.length >= 2) {
                    result.totalClasses = Math.max(...numbers);
                    result.attendedClasses = Math.min(...numbers);
                    result.found = true;
                    console.log(`Extracted from table: ${result.attendedClasses}/${result.totalClasses}`);
                }
            }
        });
    }
    
    if (result.found) {
        const percentage = (result.attendedClasses / result.totalClasses * 100).toFixed(1);
        console.log(`✅ EXTRACTION SUCCESS: ${result.attendedClasses}/${result.totalClasses} (${percentage}%)`);
    } else {
        console.log('❌ EXTRACTION FAILED: No attendance data found');
    }
    
    return result;
};

// Helper function to inspect specific elements
window.inspectElement = function(selector) {
    console.log(`\n🔍 INSPECTING: ${selector}`);
    const elements = document.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements`);
    
    elements.forEach((el, index) => {
        if (index < 10) { // Limit to first 10
            console.log(`\nElement ${index + 1}:`);
            console.log('Text:', el.textContent.trim());
            console.log('HTML:', el.innerHTML);
            console.log('Numbers:', extractNumber(el.textContent));
        }
    });
    
    if (elements.length > 10) {
        console.log(`... and ${elements.length - 10} more elements`);
    }
};

// Run the analysis
debugAnalysis();

console.log('\n🔧 AVAILABLE DEBUG FUNCTIONS:');
console.log('• testExtraction() - Test manual extraction logic');
console.log('• inspectElement("selector") - Inspect specific elements');
console.log('• DEBUG_PATTERNS - View all search patterns');
console.log('\nExamples:');
console.log('• inspectElement("table")');
console.log('• inspectElement(".report-table")');
console.log('• inspectElement("td")');
