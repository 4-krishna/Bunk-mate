// TCS iON Specific Debug Script for Bunk Mate Extension
// Copy and paste this script into your browser console while on the TCS iON attendance page

console.log('🔍 TCS iON Specific Debug Script Starting...');

// Function to safely get text content
function safeGetText(element) {
    try {
        if (!element) return '';
        return element.textContent || element.innerText || '';
    } catch (error) {
        console.error('Error getting text from element:', error);
        return '';
    }
}

// Test 1: Direct ID search for your specific elements
console.log('\n📍 Test 1: Direct ID Search');
const cumSlotsElement = document.getElementById('cum_slots');
const cumPresentElement = document.getElementById('cum_present');

console.log('cum_slots element:', cumSlotsElement);
console.log('cum_present element:', cumPresentElement);

if (cumSlotsElement) {
    console.log('  ✅ Found cum_slots:', safeGetText(cumSlotsElement));
} else {
    console.log('  ❌ cum_slots not found');
}

if (cumPresentElement) {
    console.log('  ✅ Found cum_present:', safeGetText(cumPresentElement));
} else {
    console.log('  ❌ cum_present not found');
}

// Test 2: Class-based search for TCS structure
console.log('\n📋 Test 2: Class-based Search');
const ttlPlanDiv = document.querySelector('._ttlPlan');
const prsntPlanDiv = document.querySelector('._prsntPlan');

console.log('_ttlPlan div:', ttlPlanDiv);
console.log('_prsntPlan div:', prsntPlanDiv);

if (ttlPlanDiv) {
    console.log('  ✅ Found _ttlPlan div');
    console.log('  Content:', safeGetText(ttlPlanDiv));
    console.log('  HTML:', ttlPlanDiv.outerHTML.substring(0, 200) + '...');
    
    // Look for child elements
    const valueInTotal = ttlPlanDiv.querySelector('._value');
    const idInTotal = ttlPlanDiv.querySelector('#cum_slots');
    console.log('  _value child:', valueInTotal, valueInTotal ? safeGetText(valueInTotal) : 'not found');
    console.log('  cum_slots child:', idInTotal, idInTotal ? safeGetText(idInTotal) : 'not found');
} else {
    console.log('  ❌ _ttlPlan div not found');
}

if (prsntPlanDiv) {
    console.log('  ✅ Found _prsntPlan div');
    console.log('  Content:', safeGetText(prsntPlanDiv));
    console.log('  HTML:', prsntPlanDiv.outerHTML.substring(0, 200) + '...');
    
    // Look for child elements
    const valueInPresent = prsntPlanDiv.querySelector('._value');
    const idInPresent = prsntPlanDiv.querySelector('#cum_present');
    console.log('  _value child:', valueInPresent, valueInPresent ? safeGetText(valueInPresent) : 'not found');
    console.log('  cum_present child:', idInPresent, idInPresent ? safeGetText(idInPresent) : 'not found');
} else {
    console.log('  ❌ _prsntPlan div not found');
}

// Test 3: Search for all elements with these patterns
console.log('\n🔍 Test 3: Pattern Search');
const allTCSElements = document.querySelectorAll(
    '._ttlPlan, ._prsntPlan, [class*="_ttlPlan"], [class*="_prsntPlan"], ' +
    '#cum_slots, #cum_present, [id*="cum_slots"], [id*="cum_present"]'
);

console.log(`Found ${allTCSElements.length} TCS-related elements:`);
allTCSElements.forEach((element, index) => {
    console.log(`  Element ${index + 1}:`, {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        text: safeGetText(element).substring(0, 50)
    });
});

// Test 4: Check page structure
console.log('\n🏗️ Test 4: Page Structure Analysis');
console.log('Page URL:', window.location.href);
console.log('Page title:', document.title);
console.log('Body has content:', document.body && document.body.textContent.length > 0);

// Look for specific text patterns
const bodyText = document.body.textContent.toLowerCase();
const hasAttendanceKeywords = [
    'attendance', 'total', 'present', 'classes', 'lectures',
    'conducted', 'attended', 'cumulative'
].some(keyword => bodyText.includes(keyword));

console.log('Page contains attendance keywords:', hasAttendanceKeywords);

// Test 5: Extract numbers if elements are found
console.log('\n🔢 Test 5: Number Extraction');
if (cumSlotsElement && cumPresentElement) {
    const totalText = safeGetText(cumSlotsElement).trim();
    const presentText = safeGetText(cumPresentElement).trim();
    
    const totalNum = parseInt(totalText, 10);
    const presentNum = parseInt(presentText, 10);
    
    console.log('Total text:', totalText, '→ Number:', totalNum);
    console.log('Present text:', presentText, '→ Number:', presentNum);
    
    if (!isNaN(totalNum) && !isNaN(presentNum)) {
        console.log('✅ Successfully extracted:', presentNum + '/' + totalNum);
        const percentage = ((presentNum / totalNum) * 100).toFixed(2);
        console.log('Attendance percentage:', percentage + '%');
    } else {
        console.log('❌ Failed to parse numbers');
    }
} else {
    console.log('❌ Cannot extract numbers - elements not found');
}

// Test 6: Alternative extraction methods
console.log('\n⚡ Test 6: Alternative Methods');

// Look for any elements containing numbers that might be attendance
const allElements = document.querySelectorAll('*');
const elementsWithNumbers = [];

for (const element of allElements) {
    const text = safeGetText(element);
    if (text && text.match(/^\d+$/) && text.length <= 3) {
        elementsWithNumbers.push({
            element: element,
            text: text,
            className: element.className,
            id: element.id,
            parent: element.parentElement ? element.parentElement.className : 'no parent'
        });
    }
}

console.log(`Found ${elementsWithNumbers.length} elements with pure numbers:`);
elementsWithNumbers.slice(0, 10).forEach((item, index) => {
    console.log(`  ${index + 1}: "${item.text}" (class: ${item.className}, id: ${item.id}, parent: ${item.parent})`);
});

console.log('\n🎯 Debug Complete!');
console.log('If you see attendance data above, the extension should be able to extract it.');
console.log('If not, please share the output and the page HTML structure.');
