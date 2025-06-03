// Content script for TCS iON portal attendance data extraction
(() => {
    'use strict';

    // Enhanced configuration for TCS iON portal layouts
    const PATTERNS = {
        // Text patterns to look for
        totalKeywords: ['total', 'total classes', 'total lectures', 'total sessions', 'conducted', 'classes conducted', 'lectures conducted'],
        presentKeywords: ['present', 'attended', 'attendance', 'classes attended', 'lectures attended'],
        absentKeywords: ['absent', 'missed', 'absenteeism'],
        
        // Common TCS iON table classes and IDs
        tableSelectors: [
            'table',
            '.table',
            '.data-table',
            '.attendance-table',
            '.report-table',
            '[class*="table"]',
            '[class*="attendance"]',
            '[class*="report"]',
            '[class*="grid"]',
            '[class*="data"]',
            '[id*="attendance"]',
            '[id*="table"]',
            '[id*="report"]',
            '[id*="grid"]'
        ],
        
        // TCS iON specific selectors
        tcsSelectors: [
            '.attendance-summary',
            '.academic-report',
            '.student-report',
            '[class*="summary"]',
            '[class*="academic"]',
            '[class*="student"]',
            '.report-content',
            '.content-panel'
        ]
    };

    // Debug logging function
    function debugLog(...args) {
        console.log('[Bunk Mate Debug]:', ...args);
    }

    // Function to extract numbers from text
    function extractNumber(text) {
        if (!text) return null;
        const matches = text.match(/\d+/g);
        return matches ? matches.map(m => parseInt(m, 10)) : [];
    }

    // Function to search for attendance data using enhanced methods
    function extractAttendanceData() {
        debugLog('Starting attendance extraction...');
        
        const result = {
            totalClasses: null,
            attendedClasses: null,
            source: 'unknown',
            found: false,
            debug: []
        };

        try {
            // Method 0: Quick TCS-specific selector search
            debugLog('Method 0: TCS-specific selectors');
            const tcsData = searchTCSSpecificElements();
            if (tcsData.found) {
                Object.assign(result, tcsData);
                result.source = 'tcs_specific';
                debugLog('✅ Found via TCS-specific selectors');
                return result;
            }

            // Method 1: Comprehensive text search
            debugLog('Method 1: Text pattern search');
            const pageText = document.body.textContent.toLowerCase();
            debugLog('Page contains attendance keywords:', 
                PATTERNS.totalKeywords.some(k => pageText.includes(k)) && 
                PATTERNS.presentKeywords.some(k => pageText.includes(k))
            );

            // Method 2: Enhanced table scanning
            debugLog('Method 2: Table scanning');
            const tables = document.querySelectorAll(PATTERNS.tableSelectors.join(','));
            debugLog(`Found ${tables.length} potential tables`);

            for (const table of tables) {
                debugLog('Analyzing table:', table.className || table.id || 'unnamed');
                const tableData = analyzeTable(table);
                if (tableData.found) {
                    Object.assign(result, tableData);
                    result.source = 'table_analysis';
                    break;
                }
            }

            // Method 3: DOM element search with better patterns
            if (!result.found) {
                debugLog('Method 3: DOM element search');
                const elementData = searchDOMElements();
                if (elementData.found) {
                    Object.assign(result, elementData);
                    result.source = 'dom_search';
                }
            }

            // Method 4: Percentage reverse calculation
            if (!result.found) {
                debugLog('Method 4: Percentage analysis');
                const percentData = analyzePercentages();
                if (percentData.found) {
                    Object.assign(result, percentData);
                    result.source = 'percentage_calc';
                }
            }

            // Method 5: Regex pattern matching
            if (!result.found) {
                debugLog('Method 5: Pattern matching');
                const patternData = patternMatching();
                if (patternData.found) {
                    Object.assign(result, patternData);
                    result.source = 'pattern_match';
                }
            }

            // Validate and fix data
            if (result.found) {
                result = validateAndFixData(result);
            }

            debugLog('Final result:', result);
            return result;

        } catch (error) {
            console.error('Error extracting attendance data:', error);
            result.debug.push(`Error: ${error.message}`);
        }

        return { ...result, found: false };
    }

    // TCS iON specific element search
    function searchTCSSpecificElements() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            // Look for TCS-specific containers first
            const tcsContainers = document.querySelectorAll(PATTERNS.tcsSelectors.join(','));
            debugLog(`Found ${tcsContainers.length} TCS-specific containers`);
            
            for (const container of tcsContainers) {
                const containerData = analyzeContainer(container);
                if (containerData.found) {
                    Object.assign(result, containerData);
                    result.debug.push('Found in TCS container: ' + (container.className || container.id));
                    return result;
                }
            }
            
            // Look for specific text patterns in the page
            const textPatterns = [
                /Classes\s+Conducted[:\s]*(\d+)/i,
                /Classes\s+Attended[:\s]*(\d+)/i,
                /Total\s+Classes[:\s]*(\d+)/i,
                /Present[:\s]*(\d+)/i,
                /Absent[:\s]*(\d+)/i,
                /Attendance[:\s]*(\d+)\s*\/\s*(\d+)/i,
                /(\d+)\s+out\s+of\s+(\d+)/i,
                /(\d+)\s*\/\s*(\d+)\s*classes/i
            ];
            
            const pageText = document.body.textContent;
            let totalFound = false, attendedFound = false;
            
            for (const pattern of textPatterns) {
                const match = pattern.exec(pageText);
                if (match) {
                    debugLog('Found pattern match:', match[0]);
                    
                    if (pattern.source.includes('Conducted') || pattern.source.includes('Total')) {
                        result.totalClasses = parseInt(match[1]);
                        totalFound = true;
                    } else if (pattern.source.includes('Attended') || pattern.source.includes('Present')) {
                        result.attendedClasses = parseInt(match[1]);
                        attendedFound = true;
                    } else if (match[2]) {
                        // For patterns with two numbers (like fractions)
                        result.attendedClasses = parseInt(match[1]);
                        result.totalClasses = parseInt(match[2]);
                        totalFound = attendedFound = true;
                    }
                    
                    if (totalFound && attendedFound) {
                        result.found = true;
                        result.debug.push(`Found via pattern: ${match[0]}`);
                        break;
                    }
                }
            }
            
        } catch (error) {
            result.debug.push(`TCS-specific search error: ${error.message}`);
        }
        
        return result;
    }

    // Analyze a specific container for attendance data
    function analyzeContainer(container) {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const text = container.textContent;
            const numbers = extractNumber(text);
            
            if (numbers.length >= 2) {
                // Try to identify which number is which
                const lowText = text.toLowerCase();
                
                if (lowText.includes('total') && lowText.includes('present')) {
                    // Find the numbers associated with each keyword
                    const totalMatch = text.match(/total[:\s]*(\d+)/i);
                    const presentMatch = text.match(/present[:\s]*(\d+)/i);
                    
                    if (totalMatch && presentMatch) {
                        result.totalClasses = parseInt(totalMatch[1]);
                        result.attendedClasses = parseInt(presentMatch[1]);
                        result.found = true;
                        result.debug.push('Container analysis: total/present pattern');
                    }
                } else {
                    // Assume larger number is total, smaller is attended
                    const sorted = numbers.sort((a, b) => b - a);
                    result.totalClasses = sorted[0];
                    result.attendedClasses = sorted[1];
                    result.found = true;
                    result.debug.push('Container analysis: assumed larger=total');
                }
            }
            
        } catch (error) {
            result.debug.push(`Container analysis error: ${error.message}`);
        }
        
        return result;
    }

    // Enhanced table analysis
    function analyzeTable(table) {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const rows = table.querySelectorAll('tr');
            result.debug.push(`Table has ${rows.length} rows`);

            for (const row of rows) {
                const cells = row.querySelectorAll('td, th');
                const rowText = row.textContent.toLowerCase();
                
                // Pattern 1: Look for "Total: X, Present: Y" style
                if (rowText.includes('total') && (rowText.includes('present') || rowText.includes('attended'))) {
                    const numbers = extractNumber(rowText);
                    if (numbers.length >= 2) {
                        result.totalClasses = Math.max(...numbers);
                        result.attendedClasses = Math.min(...numbers);
                        result.found = true;
                        result.debug.push('Found pattern: total+present in same row');
                        break;
                    }
                }

                // Pattern 2: Adjacent cells with keywords
                for (let i = 0; i < cells.length - 1; i++) {
                    const currentText = cells[i].textContent.toLowerCase();
                    const nextText = cells[i + 1].textContent.toLowerCase();
                    
                    if (PATTERNS.totalKeywords.some(k => currentText.includes(k))) {
                        const num = extractNumber(nextText);
                        if (num.length > 0) {
                            result.totalClasses = num[0];
                            result.debug.push(`Found total: ${num[0]}`);
                        }
                    }
                    
                    if (PATTERNS.presentKeywords.some(k => currentText.includes(k))) {
                        const num = extractNumber(nextText);
                        if (num.length > 0) {
                            result.attendedClasses = num[0];
                            result.debug.push(`Found attended: ${num[0]}`);
                        }
                    }
                }

                if (result.totalClasses && result.attendedClasses) {
                    result.found = true;
                    result.debug.push('Found both values in adjacent cells');
                    break;
                }
            }

        } catch (error) {
            result.debug.push(`Table analysis error: ${error.message}`);
        }

        return result;
    }

    // Search all DOM elements
    function searchDOMElements() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const allElements = document.querySelectorAll('*');
            let totalFound = false, attendedFound = false;

            for (const element of allElements) {
                const text = element.textContent.toLowerCase();
                const numbers = extractNumber(text);

                if (numbers.length > 0 && !totalFound) {
                    if (PATTERNS.totalKeywords.some(k => text.includes(k))) {
                        result.totalClasses = Math.max(...numbers);
                        totalFound = true;
                        result.debug.push(`Found total from element: ${numbers}`);
                    }
                }

                if (numbers.length > 0 && !attendedFound) {
                    if (PATTERNS.presentKeywords.some(k => text.includes(k))) {
                        result.attendedClasses = Math.max(...numbers);
                        attendedFound = true;
                        result.debug.push(`Found attended from element: ${numbers}`);
                    }
                }

                if (totalFound && attendedFound) {
                    result.found = true;
                    break;
                }
            }

        } catch (error) {
            result.debug.push(`DOM search error: ${error.message}`);
        }

        return result;
    }

    // Analyze percentages and try to reverse calculate
    function analyzePercentages() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const allText = document.body.textContent;
            const percentageRegex = /(\d+(?:\.\d+)?)\s*%/g;
            let match;

            while ((match = percentageRegex.exec(allText)) !== null) {
                const percentage = parseFloat(match[1]);
                if (percentage > 0 && percentage <= 100) {
                    // Look for numbers in surrounding context
                    const start = Math.max(0, match.index - 200);
                    const end = Math.min(allText.length, match.index + 200);
                    const context = allText.substring(start, end);
                    const numbers = extractNumber(context);
                    
                    if (numbers.length >= 2) {
                        // Try to find total and attended from context
                        const sorted = numbers.sort((a, b) => b - a);
                        const total = sorted[0];
                        const attended = sorted[1];
                        
                        // Verify if the percentage matches
                        const calculatedPerc = (attended / total) * 100;
                        if (Math.abs(calculatedPerc - percentage) < 1) {
                            result.totalClasses = total;
                            result.attendedClasses = attended;
                            result.found = true;
                            result.debug.push(`Found via percentage context: ${percentage}%`);
                            break;
                        }
                    }
                }
            }

        } catch (error) {
            result.debug.push(`Percentage analysis error: ${error.message}`);
        }

        return result;
    }

    // Pattern matching with regex
    function patternMatching() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const text = document.body.textContent;
            
            // Enhanced patterns for TCS iON
            const patterns = [
                // Basic patterns
                /total[:\s]*(\d+)[,\s]*present[:\s]*(\d+)/i,
                /present[:\s]*(\d+)[,\s]*total[:\s]*(\d+)/i,
                /attended[:\s]*(\d+)[,\s]*total[:\s]*(\d+)/i,
                /total[:\s]*(\d+)[,\s]*attended[:\s]*(\d+)/i,
                
                // TCS iON specific patterns
                /classes\s+conducted[:\s]*(\d+)/i,
                /classes\s+attended[:\s]*(\d+)/i,
                /total\s+lectures[:\s]*(\d+)/i,
                /lectures\s+attended[:\s]*(\d+)/i,
                
                // Fraction patterns
                /(\d+)\s*\/\s*(\d+)\s*classes/i,
                /(\d+)\s*\/\s*(\d+)\s*lectures/i,
                /(\d+)\s*\/\s*(\d+)/g,
                
                // "Out of" patterns
                /(\d+)\s+out\s+of\s+(\d+)/i,
                
                // Table-like patterns
                /total[:\s]*(\d+)\s*\|\s*present[:\s]*(\d+)/i,
                /present[:\s]*(\d+)\s*\|\s*total[:\s]*(\d+)/i
            ];

            for (const pattern of patterns) {
                const matches = pattern.exec(text);
                if (matches) {
                    const num1 = parseInt(matches[1]);
                    const num2 = parseInt(matches[2]) || null;
                    
                    if (pattern.source.includes('conducted') || pattern.source.includes('total')) {
                        result.totalClasses = num1;
                        if (num2) result.attendedClasses = num2;
                    } else if (pattern.source.includes('attended') || pattern.source.includes('present')) {
                        result.attendedClasses = num1;
                        if (num2) result.totalClasses = num2;
                    } else if (num2) {
                        // For fraction format, assume first/second
                        result.attendedClasses = num1;
                        result.totalClasses = num2;
                    }
                    
                    // If we only have one value, try to find the other
                    if ((result.totalClasses && !result.attendedClasses) || 
                        (!result.totalClasses && result.attendedClasses)) {
                        
                        // Look for the missing value in nearby text
                        const contextStart = Math.max(0, matches.index - 200);
                        const contextEnd = Math.min(text.length, matches.index + 200);
                        const context = text.substring(contextStart, contextEnd);
                        const contextNumbers = extractNumber(context);
                        
                        if (contextNumbers.length >= 2) {
                            if (!result.totalClasses) {
                                result.totalClasses = Math.max(...contextNumbers);
                            }
                            if (!result.attendedClasses) {
                                result.attendedClasses = Math.min(...contextNumbers);
                            }
                        }
                    }
                    
                    if (result.totalClasses && result.attendedClasses) {
                        result.found = true;
                        result.debug.push(`Found via enhanced pattern: ${matches[0]}`);
                        break;
                    }
                }
            }

        } catch (error) {
            result.debug.push(`Pattern matching error: ${error.message}`);
        }

        return result;
    }

    // Validate and fix extracted data
    function validateAndFixData(data) {
        const result = { ...data };
        
        if (result.totalClasses && result.attendedClasses) {
            // Ensure attended <= total
            if (result.attendedClasses > result.totalClasses) {
                [result.totalClasses, result.attendedClasses] = [result.attendedClasses, result.totalClasses];
                result.debug.push('Swapped values (attended > total)');
            }
            
            // Basic sanity checks
            if (result.totalClasses > 0 && 
                result.attendedClasses >= 0 && 
                result.attendedClasses <= result.totalClasses &&
                result.totalClasses <= 1000) { // reasonable upper limit
                result.found = true;
                result.debug.push('Data validation passed');
            } else {
                result.found = false;
                result.debug.push('Data validation failed');
            }
        }
        
        return result;
    }
    // Function to check if we're on an attendance page
    function isAttendancePage() {
        const url = window.location.href.toLowerCase();
        const pageText = document.body.textContent.toLowerCase();
        const title = document.title.toLowerCase();
        
        debugLog('Checking if attendance page...');
        debugLog('URL:', url);
        debugLog('Title:', title);
        
        const attendanceIndicators = [
            // URL indicators
            url.includes('attendance'),
            url.includes('report'),
            url.includes('academic'),
            url.includes('student'),
            
            // Page content indicators
            pageText.includes('attendance'),
            pageText.includes('total lecture'),
            pageText.includes('total class'),
            pageText.includes('classes conducted'),
            pageText.includes('classes attended'),
            pageText.includes('present'),
            pageText.includes('absent'),
            pageText.includes('conducted'),
            
            // Title indicators
            title.includes('attendance'),
            title.includes('report'),
            title.includes('academic'),
            
            // TCS iON specific indicators
            pageText.includes('academic report'),
            pageText.includes('student report'),
            pageText.includes('attendance summary')
        ];
        
        const isAttPage = attendanceIndicators.some(indicator => indicator);
        debugLog('Is attendance page:', isAttPage);
        
        return isAttPage;
    }

    // Enhanced function to wait for dynamic content
    function waitForContent(maxAttempts = 10, attempt = 1) {
        return new Promise((resolve) => {
            debugLog(`Waiting for content, attempt ${attempt}/${maxAttempts}`);
            
            const hasContent = document.body.textContent.length > 500 && 
                              (document.querySelectorAll('table').length > 0 || 
                               document.querySelectorAll('[class*="report"]').length > 0 ||
                               document.querySelectorAll('[class*="attendance"]').length > 0);
            
            if (hasContent || attempt >= maxAttempts) {
                debugLog('Content ready or max attempts reached');
                resolve();
            } else {
                setTimeout(() => {
                    waitForContent(maxAttempts, attempt + 1).then(resolve);
                }, 1500);
            }
        });
    }

    // Main function to handle data extraction
    async function handleDataExtraction() {
        debugLog('Handle data extraction called');
        
        // Wait for content to load
        await waitForContent();
        
        if (!isAttendancePage()) {
            debugLog('Not an attendance page, skipping extraction');
            return;
        }

        debugLog('This appears to be an attendance page, extracting data...');
        const attendanceData = extractAttendanceData();
        
        if (attendanceData.found) {
            // Store the extracted data
            const extractedData = {
                totalClasses: attendanceData.totalClasses,
                attendedClasses: attendanceData.attendedClasses,
                source: attendanceData.source,
                timestamp: Date.now(),
                url: window.location.href,
                debug: attendanceData.debug
            };

            chrome.storage.local.set({
                autoExtractedData: extractedData
            });

            debugLog('✅ Attendance data extracted and saved:', extractedData);
            
            // Send notification to popup if it's open
            try {
                chrome.runtime.sendMessage({
                    action: 'dataExtracted',
                    data: extractedData
                });
            } catch (error) {
                debugLog('Could not send message to popup (popup might be closed)');
            }
            
        } else {
            debugLog('❌ No attendance data found');
            debugLog('Debug info:', attendanceData.debug);
            debugLog('Page content preview:', document.body.textContent.substring(0, 500));
        }
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        debugLog('Received message:', request);
        
        if (request.action === 'extractAttendance') {
            debugLog('Manual extraction requested');
            const data = extractAttendanceData();
            debugLog('Sending response:', data);
            sendResponse(data);
        }
        
        if (request.action === 'getPageInfo') {
            debugLog('Page info requested');
            const pageInfo = {
                url: window.location.href,
                title: document.title,
                isAttendancePage: isAttendancePage(),
                hasContent: document.body.textContent.length > 0
            };
            debugLog('Sending page info:', pageInfo);
            sendResponse(pageInfo);
        }
        
        return true;
    });

    // Initialize extraction
    function initialize() {
        debugLog('Content script initialized on:', window.location.href);
        debugLog('Document ready state:', document.readyState);
        
        // Multiple extraction attempts with different timings
        const extractionAttempts = [
            { delay: 1000, label: 'Initial attempt' },
            { delay: 3000, label: 'Secondary attempt' },
            { delay: 6000, label: 'Delayed attempt' },
            { delay: 10000, label: 'Final attempt' }
        ];
        
        extractionAttempts.forEach(({ delay, label }) => {
            setTimeout(() => {
                debugLog(`${label} - starting extraction`);
                handleDataExtraction();
            }, delay);
        });

        // Enhanced mutation observer for dynamic content
        let extractionTimeout;
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if added nodes contain potentially relevant content
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const text = node.textContent.toLowerCase();
                            if (text.includes('attendance') || 
                                text.includes('total') || 
                                text.includes('present') ||
                                text.includes('class') ||
                                node.tagName === 'TABLE') {
                                shouldCheck = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldCheck) {
                debugLog('Relevant DOM changes detected, scheduling re-extraction...');
                clearTimeout(extractionTimeout);
                extractionTimeout = setTimeout(() => {
                    handleDataExtraction();
                }, 2000);
            }
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });
        }

        // Also listen for hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            debugLog('Hash change detected, re-extracting in 3s...');
            setTimeout(handleDataExtraction, 3000);
        });

        // Listen for popstate (back/forward navigation)
        window.addEventListener('popstate', () => {
            debugLog('Navigation detected, re-extracting in 3s...');
            setTimeout(handleDataExtraction, 3000);
        });
    }

    // Start the script
    initialize();

})();
