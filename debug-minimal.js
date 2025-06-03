// Minimal Debug Script for Immediate Testing
// Copy and paste this into your browser console on the TCS iON page

console.log('🚀 STARTING IMMEDIATE DEBUG...');

// 1. Check if extension is loaded
console.log('Extension loaded:', typeof chrome !== 'undefined');

// 2. Check current page
console.log('Current URL:', window.location.href);
console.log('Page title:', document.title);

// 3. Look for Bunk Mate debug messages
console.log('Looking for existing Bunk Mate messages...');
console.log('Check above for any "[Bunk Mate Debug]:" messages');

// 4. Quick content check
const bodyText = document.body.textContent;
console.log('Page has content:', bodyText.length > 0);
console.log('Content sample:', bodyText.substring(0, 200));

// 5. Check for tables
const tables = document.querySelectorAll('table');
console.log('Tables found:', tables.length);

// 6. Check for attendance keywords
const hasAttendance = bodyText.toLowerCase().includes('attendance');
const hasTotal = bodyText.toLowerCase().includes('total');
const hasClasses = bodyText.toLowerCase().includes('classes');
console.log('Has attendance keywords:', hasAttendance, hasTotal, hasClasses);

// 7. Manual extraction test
console.log('\n--- MANUAL EXTRACTION TEST ---');
const numbers = bodyText.match(/\d+/g);
if (numbers) {
    const numArray = numbers.map(n => parseInt(n, 10));
    const filtered = numArray.filter(n => n >= 10 && n <= 200);
    console.log('All numbers 10-200:', filtered);
}

// 8. Try to trigger extension manually
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('Trying to send message to extension...');
    chrome.runtime.sendMessage({action: 'extractData'}, (response) => {
        if (response) {
            console.log('Extension response:', response);
        } else {
            console.log('No response from extension');
        }
    });
} else {
    console.log('Chrome runtime not available');
}

console.log('✅ Debug complete - check messages above for issues');
