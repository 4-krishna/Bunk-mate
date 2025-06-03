document.addEventListener('DOMContentLoaded', function() {
    const totalClassesInput = document.getElementById('totalClasses');
    const attendedClassesInput = document.getElementById('attendedClasses');
    const calculateButton = document.getElementById('calculate');
    const autoDetectButton = document.getElementById('autoDetect');
    const autoStatus = document.getElementById('autoStatus');
    const resultDiv = document.getElementById('result');
    const percentageDiv = document.getElementById('percentage');
    const statusDiv = document.getElementById('status');

    // Load saved values if any
    chrome.storage.local.get(['totalClasses', 'attendedClasses', 'autoExtractedData'], (result) => {
        if (result.totalClasses) totalClassesInput.value = result.totalClasses;
        if (result.attendedClasses) attendedClassesInput.value = result.attendedClasses;
        
        // Check if we have auto-extracted data
        if (result.autoExtractedData) {
            showAutoExtractedData(result.autoExtractedData);
        }
    });

    // Function to show auto-extracted data status
    function showAutoExtractedData(data) {
        const timeDiff = Date.now() - data.timestamp;
        const minutesAgo = Math.floor(timeDiff / (1000 * 60));
        
        autoStatus.style.display = 'block';
        autoStatus.className = 'auto-status success';
        autoStatus.textContent = `Found: ${data.attendedClasses}/${data.totalClasses} classes (${minutesAgo}m ago)`;
        
        // Auto-fill the inputs
        totalClassesInput.value = data.totalClasses;
        attendedClassesInput.value = data.attendedClasses;
    }

    // Function to show auto-detection status
    function showAutoStatus(message, type = 'info') {
        autoStatus.style.display = 'block';
        autoStatus.className = `auto-status ${type}`;
        autoStatus.textContent = message;
    }

    // Auto-detect button functionality
    autoDetectButton.addEventListener('click', async () => {
        showAutoStatus('Detecting...', 'info');
        autoDetectButton.disabled = true;
        autoDetectButton.textContent = 'Detecting...';

        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }

            console.log('Current tab URL:', tab.url);

            // Check if the tab URL is from TCS/supported domains
            const url = tab.url.toLowerCase();
            const supportedDomains = [
                'tcsondemand.com',
                'ion.digitalacademy.tcs.com',
                'tcs.com',
                'tcsonlineadvocacy.com',
                'fresco.tcs.com',
                'tcsion.com', // Added for g21.tcsion.com and other TCS iON domains
                'localhost', // For testing
                'file://' // For local test files
            ];
            
            const urlLower = url.toLowerCase();
            const isSupported = supportedDomains.some(domain => urlLower.includes(domain.toLowerCase()));
            
            console.log('URL check:', { url: url, urlLower: urlLower, isSupported: isSupported });
            
            if (!isSupported && !urlLower.includes('test') && !urlLower.includes('bunk-mate')) {
                console.log('URL not supported. Supported domains:', supportedDomains);
                showAutoStatus('Please navigate to TCS iON portal or a test page first', 'error');
                return;
            }

            showAutoStatus('Checking page content...', 'info');

            // First, get page info to understand what we're working with
            let pageInfo;
            try {
                pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
                console.log('Page info:', pageInfo);
            } catch (error) {
                console.log('Content script not loaded, attempting to inject...', error.message);
                showAutoStatus('Initializing... Please try again in a moment.', 'info');
                
                // Try to inject content script manually for already-open pages
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    showAutoStatus('Initialized. Please click "Detect from TCS iON" again.', 'success');
                } catch (injectError) {
                    console.log('Could not inject content script:', injectError.message);
                    showAutoStatus('Please refresh the page and try again.', 'error');
                }
                return;
            }

            if (!pageInfo.isAttendancePage) {
                showAutoStatus('This page doesn\'t appear to contain attendance data. Try navigating to your attendance/academic report page, or use the test page.', 'error');
                console.log('Page info details:', pageInfo);
                return;
            }

            showAutoStatus('Extracting attendance data...', 'info');

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractAttendance' });
            console.log('Extraction response:', response);
            
            if (response && response.found) {
                // Save the extracted data
                const extractedData = {
                    totalClasses: response.totalClasses,
                    attendedClasses: response.attendedClasses,
                    source: response.source,
                    timestamp: Date.now(),
                    url: tab.url,
                    debug: response.debug || []
                };

                chrome.storage.local.set({ autoExtractedData: extractedData });
                showAutoExtractedData(extractedData);
                
                // Optionally auto-calculate
                setTimeout(() => {
                    calculateButton.click();
                }, 500);
                
            } else {
                let errorMsg = 'No attendance data found on this page.';
                if (response && response.debug && response.debug.length > 0) {
                    console.log('Debug info:', response.debug);
                    errorMsg += ' Check browser console for details.';
                }
                showAutoStatus(errorMsg, 'error');
            }

        } catch (error) {
            console.error('Auto-detection error:', error);
            let errorMsg = 'Error: ' + error.message;
            
            if (error.message.includes('Could not establish connection')) {
                errorMsg = 'Please refresh the page and try again.';
            }
            
            showAutoStatus(errorMsg, 'error');
        } finally {
            autoDetectButton.disabled = false;
            autoDetectButton.textContent = 'Detect from TCS iON';
        }
    });

    // Input validation for both inputs
    const validateInputs = () => {
        const total = parseInt(totalClassesInput.value) || 0;
        const attended = parseInt(attendedClassesInput.value) || 0;

        if (total < 0) totalClassesInput.value = 0;
        if (attended < 0) attendedClassesInput.value = 0;
        if (attended > total) attendedClassesInput.value = total;

        return { total, attended };
    };

    totalClassesInput.addEventListener('input', validateInputs);
    attendedClassesInput.addEventListener('input', validateInputs);

    calculateButton.addEventListener('click', () => {
        const { total, attended } = validateInputs();

        if (total <= 0) {
            alert('Please enter a valid number of total classes');
            return;
        }

        // Save values
        chrome.storage.local.set({
            totalClasses: total,
            attendedClasses: attended
        });

        const percentage = (attended / total) * 100;
        const requiredPercentage = 75;
        let statusMessage = '';
        let statusClass = percentage >= requiredPercentage ? 'good' : 'danger';

        if (percentage >= requiredPercentage) {
            // Calculate how many classes can be safely skipped
            const maxSkippable = Math.floor((100 * attended - requiredPercentage * total) / requiredPercentage);
            const futureTotal = total + maxSkippable;
            const futurePercentage = (attended / futureTotal) * 100;

            statusMessage = `You can bunk for ${maxSkippable} more hours\n`;
            statusMessage += `Current Attendance: ${attended}/${total} -> ${percentage.toFixed(2)}%\n`;
            statusMessage += `Attendance Then: ${attended}/${futureTotal} -> ${futurePercentage.toFixed(2)}%`;
        } else {
            // Calculate classes needed to reach 75%
            const classesNeeded = Math.ceil((requiredPercentage * total - 100 * attended) / (100 - requiredPercentage));
            const futureTotal = total + classesNeeded;
            const futureAttended = attended + classesNeeded;

            statusMessage = `You need to attend ${classesNeeded} more classes to attain ${requiredPercentage}% attendance\n`;
            statusMessage += `Current Attendance: ${attended}/${total} -> ${percentage.toFixed(2)}%\n`;
            statusMessage += `Attendance Required: ${futureAttended}/${futureTotal} -> ${requiredPercentage.toFixed(2)}%`;
        }

        percentageDiv.textContent = `${percentage.toFixed(2)}%`;
        statusDiv.textContent = statusMessage;
        statusDiv.className = 'status ' + statusClass;
        resultDiv.style.display = 'block';
    });

    // Check for auto-extracted data on startup
    chrome.storage.local.get(['autoExtractedData'], (result) => {
        if (result.autoExtractedData) {
            const timeDiff = Date.now() - result.autoExtractedData.timestamp;
            // Show data if it's less than 1 hour old
            if (timeDiff < 60 * 60 * 1000) {
                showAutoExtractedData(result.autoExtractedData);
            }
        }
    });

    // Add a small test button for development
    if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
        const testButton = document.createElement('button');
        testButton.textContent = 'Open Test Page';
        testButton.style.cssText = 'margin-top: 10px; padding: 8px; font-size: 12px; background: #6c757d; color: white; border: none; border-radius: 4px; width: 100%;';
        testButton.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('test-page-enhanced.html') });
        });
        document.querySelector('.container').appendChild(testButton);
    }
});