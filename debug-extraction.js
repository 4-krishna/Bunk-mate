// Bunk Mate Extension Debug Script
// Run this in the browser console on any TCS iON page to test data extraction

console.log('🔍 Bunk Mate Debug Script Started');
console.log('=====================================');

// Test the extraction functions directly
function testExtraction() {
    console.log('\n🧪 Testing Attendance Data Extraction...\n');

    // Enhanced patterns (copied from content script)
    const PATTERNS = {
        totalKeywords: ['total', 'total classes', 'total lectures', 'total sessions', 'conducted'],
        presentKeywords: ['present', 'attended', 'attendance'],
        absentKeywords: ['absent', 'missed']
    };

    function extractNumber(text) {
        if (!text) return [];
        const matches = text.match(/\d+/g);
        return matches ? matches.map(m => parseInt(m, 10)) : [];
    }

    function analyzeTable(table, index) {
        console.log(`\n📊 Analyzing Table ${index + 1}:`);
        console.log('Table class/id:', table.className || table.id || 'none');
        
        const rows = table.querySelectorAll('tr');
        console.log(`  Rows: ${rows.length}`);
        
        let result = { totalClasses: null, attendedClasses: null, found: false };
        
        rows.forEach((row, rowIndex) => {
            const rowText = row.textContent.toLowerCase();
            const cells = row.querySelectorAll('td, th');
            
            if (rowText.includes('total') && (rowText.includes('present') || rowText.includes('attended'))) {
                const numbers = extractNumber(rowText);
                console.log(`  Row ${rowIndex}: "${rowText.trim()}"`);
                console.log(`  Numbers found: [${numbers.join(', ')}]`);
                
                if (numbers.length >= 2) {
                    result.totalClasses = Math.max(...numbers);
                    result.attendedClasses = Math.min(...numbers);
                    result.found = true;
                    console.log(`  ✅ MATCH! Total: ${result.totalClasses}, Attended: ${result.attendedClasses}`);
                }
            }
            
            // Check adjacent cells
            for (let i = 0; i < cells.length - 1; i++) {
                const currentText = cells[i].textContent.toLowerCase();
                const nextText = cells[i + 1].textContent.toLowerCase();
                
                if (PATTERNS.totalKeywords.some(k => currentText.includes(k))) {
                    const nums = extractNumber(nextText);
                    if (nums.length > 0) {
                        result.totalClasses = nums[0];
                        console.log(`  📝 Total found: ${nums[0]} (from "${currentText}" -> "${nextText}")`);
                    }
                }
                
                if (PATTERNS.presentKeywords.some(k => currentText.includes(k))) {
                    const nums = extractNumber(nextText);
                    if (nums.length > 0) {
                        result.attendedClasses = nums[0];
                        console.log(`  📝 Attended found: ${nums[0]} (from "${currentText}" -> "${nextText}")`);
                    }
                }
            }
        });
        
        if (result.totalClasses && result.attendedClasses) {
            result.found = true;
            console.log(`  ✅ TABLE RESULT: ${result.attendedClasses}/${result.totalClasses}`);
        }
        
        return result;
    }

    function analyzeTextPatterns() {
        console.log('\n📝 Analyzing Text Patterns:');
        
        const text = document.body.textContent;
        const patterns = [
            /total[:\s]*(\d+)[,\s]*present[:\s]*(\d+)/i,
            /present[:\s]*(\d+)[,\s]*total[:\s]*(\d+)/i,
            /attended[:\s]*(\d+)[,\s]*total[:\s]*(\d+)/i,
            /total[:\s]*(\d+)[,\s]*attended[:\s]*(\d+)/i,
            /(\d+)\s*\/\s*(\d+)/g,
            /(\d+)\s+out\s+of\s+(\d+)/i,
            /(\d+)\s+classes?\s+out\s+of\s+total\s+(\d+)/i
        ];

        patterns.forEach((pattern, index) => {
            const matches = pattern.exec(text);
            if (matches) {
                console.log(`  Pattern ${index + 1}: "${matches[0]}"`);
                console.log(`    Numbers: ${matches[1]}, ${matches[2]}`);
            }
        });
    }

    function analyzePage() {
        console.log('\n🌐 Page Analysis:');
        console.log(`  URL: ${window.location.href}`);
        console.log(`  Title: ${document.title}`);
        console.log(`  Body text length: ${document.body.textContent.length} characters`);
        
        const pageText = document.body.textContent.toLowerCase();
        console.log('  Contains keywords:');
        console.log(`    - "attendance": ${pageText.includes('attendance')}`);
        console.log(`    - "total": ${pageText.includes('total')}`);
        console.log(`    - "present": ${pageText.includes('present')}`);
        console.log(`    - "attended": ${pageText.includes('attended')}`);
    }

    // Run all analyses
    analyzePage();
    
    // Analyze all tables
    const tables = document.querySelectorAll('table');
    console.log(`\n📊 Found ${tables.length} tables to analyze:`);
    
    let bestResult = { found: false };
    tables.forEach((table, index) => {
        const result = analyzeTable(table, index);
        if (result.found && !bestResult.found) {
            bestResult = result;
        }
    });
    
    analyzeTextPatterns();
    
    // Final result
    console.log('\n🎯 FINAL RESULT:');
    if (bestResult.found) {
        console.log(`✅ SUCCESS: Found ${bestResult.attendedClasses}/${bestResult.totalClasses} classes`);
        const percentage = (bestResult.attendedClasses / bestResult.totalClasses * 100).toFixed(2);
        console.log(`📊 Attendance: ${percentage}%`);
    } else {
        console.log('❌ No attendance data found');
        console.log('💡 Suggestions:');
        console.log('   - Make sure you\'re on an attendance/academic report page');
        console.log('   - Check if the page has finished loading');
        console.log('   - Look for tables or text containing attendance information');
    }
    
    return bestResult;
}

// Auto-run the test
const result = testExtraction();

// Additional helper function to manually test specific elements
window.testElement = function(selector) {
    console.log(`\n🎯 Testing specific element: ${selector}`);
    const elements = document.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements`);
    
    elements.forEach((el, index) => {
        console.log(`Element ${index + 1}:`);
        console.log(`  Text: "${el.textContent.trim()}"`);
        console.log(`  HTML: "${el.innerHTML}"`);
    });
};

console.log('\n🔧 Debug Functions Available:');
console.log('- testExtraction() - Run full extraction test');
console.log('- testElement("selector") - Test specific CSS selector');
console.log('\nExample: testElement("table")');

console.log('\n=====================================');
console.log('🔍 Bunk Mate Debug Script Complete');
