// Quick TCS iON Domain Test Script
// Paste this in browser console to test extension functionality

console.log('🔍 TCS iON Domain Test Starting...');

// Test 1: Check current page
console.log('Current URL:', window.location.href);
console.log('Domain test for tcsion.com:', window.location.href.includes('tcsion.com'));

// Test 2: Check if content script is loaded
console.log('Checking for Bunk Mate content script...');
if (window.chrome && window.chrome.runtime) {
    console.log('✅ Chrome extension API available');
} else {
    console.log('❌ Chrome extension API not available');
}

// Test 3: Look for TCS iON specific elements
console.log('\n📋 Looking for TCS iON attendance elements...');

const cumSlots = document.getElementById('cum_slots');
const cumPresent = document.getElementById('cum_present');
const ttlPlan = document.querySelector('._ttlPlan');
const prsntPlan = document.querySelector('._prsntPlan');

console.log('cum_slots element:', cumSlots);
console.log('cum_present element:', cumPresent);
console.log('_ttlPlan div:', ttlPlan);
console.log('_prsntPlan div:', prsntPlan);

if (cumSlots && cumPresent) {
    console.log('✅ Found TCS iON attendance elements!');
    console.log('Total classes:', cumSlots.textContent);
    console.log('Present classes:', cumPresent.textContent);
} else {
    console.log('❌ TCS iON attendance elements not found');
}

// Test 4: Check page content
console.log('\n📄 Page content analysis...');
const pageText = document.body.textContent.toLowerCase();
console.log('Page contains "attendance":', pageText.includes('attendance'));
console.log('Page contains "total":', pageText.includes('total'));
console.log('Page contains "present":', pageText.includes('present'));

// Test 5: Manual extension message test
if (window.chrome && window.chrome.runtime) {
    console.log('\n📨 Testing extension communication...');
    try {
        chrome.runtime.sendMessage({action: 'test'}, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Extension communication error:', chrome.runtime.lastError.message);
            } else {
                console.log('Extension communication successful:', response);
            }
        });
    } catch (error) {
        console.log('Extension communication failed:', error.message);
    }
}

console.log('\n🎯 Test Complete!');
console.log('If TCS iON elements were found above, the extension should work.');
console.log('If not, please share this output for debugging.');
