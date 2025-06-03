(() => {
    'use strict';

    // Content script initialization
    console.log('[Bunk Mate Content Script] Loading on:', window.location.href);
    console.log('[Bunk Mate Content Script] Page title:', document.title);

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
            '.content-panel',
            '._ttlPlan',
            '._prsntPlan',
            '[class*="_ttlPlan"]',
            '[class*="_prsntPlan"]',
            '#cum_slots',
            '#cum_present',
            '[id*="cum_slots"]',
            '[id*="cum_present"]'
        ]
    };

    // Debug logging function with extra safety
    function debugLog(...args) {
        try {
            console.log('[Bunk Mate Debug]:', ...args);
        } catch (error) {
            // Fallback if console is not available
            try {
                if (window.console && window.console.log) {
                    window.console.log('[Bunk Mate Debug]:', ...args);
                }
            } catch (e) {
                // Silent fail if no console available
            }
        }
    }

    // Safe function to get text content
    function safeGetText(element) {
        try {
            if (!element) return '';
            return element.textContent || element.innerText || '';
        } catch (error) {
            debugLog('Error getting text from element:', error.message);
            return '';
        }
    }

    // Function to extract numbers from text
    function extractNumber(text) {
        if (!text) return null;
        try {
            const matches = text.match(/\d+/g);
            return matches ? matches.map(m => parseInt(m, 10)) : [];
        } catch (error) {
            debugLog('Error extracting numbers:', error.message);
            return [];
        }
    }

    // TCS iON specific element search
    function searchTCSSpecificElements() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            debugLog('Searching for TCS iON specific elements...');
            
            // Method 1: Direct ID-based search (most reliable for TCS iON)
            const totalElement = document.getElementById('cum_slots');
            const presentElement = document.getElementById('cum_present');
            
            if (totalElement && presentElement) {
                const totalText = safeGetText(totalElement).trim();
                const presentText = safeGetText(presentElement).trim();
                
                debugLog('Found TCS elements by ID:', { total: totalText, present: presentText });
                
                const totalNum = parseInt(totalText, 10);
                const presentNum = parseInt(presentText, 10);
                
                if (!isNaN(totalNum) && !isNaN(presentNum) && totalNum > 0 && presentNum >= 0) {
                    result.totalClasses = totalNum;
                    result.attendedClasses = presentNum;
                    result.found = true;
                    result.debug.push(`Direct ID extraction: Found ${presentNum}/${totalNum} via cum_slots and cum_present`);
                    debugLog('✅ Successfully extracted via direct ID search');
                    return result;
                }
            }
            
            // Method 2: Class-based search for TCS iON structure (_ttlPlan and _prsntPlan)
            const totalDiv = document.querySelector('._ttlPlan');
            const presentDiv = document.querySelector('._prsntPlan');
            
            if (totalDiv && presentDiv) {
                debugLog('Found TCS divs by class');
                
                // Look for the value elements within these divs
                const totalValueElement = totalDiv.querySelector('._value') || 
                                        totalDiv.querySelector('#cum_slots') ||
                                        totalDiv.querySelector('[id*="cum_slots"]');
                                        
                const presentValueElement = presentDiv.querySelector('._value') || 
                                          presentDiv.querySelector('#cum_present') ||
                                          presentDiv.querySelector('[id*="cum_present"]');
                
                if (totalValueElement && presentValueElement) {
                    const totalText = safeGetText(totalValueElement).trim();
                    const presentText = safeGetText(presentValueElement).trim();
                    
                    debugLog('Found values in TCS divs:', { total: totalText, present: presentText });
                    
                    const totalNum = parseInt(totalText, 10);
                    const presentNum = parseInt(presentText, 10);
                    
                    if (!isNaN(totalNum) && !isNaN(presentNum) && totalNum > 0 && presentNum >= 0) {
                        result.totalClasses = totalNum;
                        result.attendedClasses = presentNum;
                        result.found = true;
                        result.debug.push(`Class-based extraction: Found ${presentNum}/${totalNum} via _ttlPlan and _prsntPlan`);
                        debugLog('✅ Successfully extracted via class search');
                        return result;
                    }
                }
            }
            
            // Method 3: Enhanced backup search for TCS iON elements
            debugLog('Enhanced backup search for TCS elements...');
            
            // Search for elements containing TCS-specific IDs and classes
            const allTCSElements = document.querySelectorAll(
                '._ttlPlan, ._prsntPlan, [class*="_ttlPlan"], [class*="_prsntPlan"], ' +
                '#cum_slots, #cum_present, [id*="cum_slots"], [id*="cum_present"]'
            );
            
            debugLog(`Enhanced backup search found ${allTCSElements.length} TCS elements`);
            
            let foundTotal = null;
            let foundPresent = null;
            
            for (const element of allTCSElements) {
                const text = safeGetText(element).trim();
                const className = element.className || '';
                const id = element.id || '';
                
                debugLog(`Checking element: class="${className}", id="${id}", text="${text}"`);
                
                // Check for total classes (cum_slots or _ttlPlan)
                if ((className.includes('_ttlPlan') || id.includes('cum_slots')) && !foundTotal) {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num > 0) {
                        foundTotal = num;
                        result.debug.push(`Enhanced backup total found: ${num} in element with class="${className}" id="${id}"`);
                    }
                }
                
                // Check for present classes (cum_present or _prsntPlan)
                if ((className.includes('_prsntPlan') || id.includes('cum_present')) && !foundPresent) {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num >= 0) {
                        foundPresent = num;
                        result.debug.push(`Enhanced backup present found: ${num} in element with class="${className}" id="${id}"`);
                    }
                }
                
                // Early exit if both found
                if (foundTotal !== null && foundPresent !== null) {
                    break;
                }
            }
            
            if (foundTotal !== null && foundPresent !== null) {
                result.totalClasses = foundTotal;
                result.attendedClasses = foundPresent;
                result.found = true;
                result.debug.push(`Enhanced backup search: Found ${foundPresent}/${foundTotal}`);
                debugLog('✅ Successfully extracted via enhanced backup search');
                return result;
            }
            
            // Method 4: Fallback to original TCS container search
            const tcsContainers = document.querySelectorAll(PATTERNS.tcsSelectors.join(','));
            debugLog(`Found ${tcsContainers.length} TCS-specific containers`);
            
            for (const container of tcsContainers) {
                if (!container) continue;
                const containerData = analyzeContainer(container);
                if (containerData && containerData.found) {
                    Object.assign(result, containerData);
                    result.debug.push('Found in TCS container: ' + (container.className || container.id));
                    return result;
                }
            }
            
        } catch (error) {
            debugLog('Error in TCS specific search:', error.message);
            result.debug.push(`TCS search error: ${error.message}`);
        }
        
        return result;
    }

    // Enhanced table analysis
    function analyzeTable(table) {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            if (!table) return result;
            
            const tableText = safeGetText(table).toLowerCase();
            result.debug.push(`Table text preview: ${tableText.substring(0, 100)}`);
            
            // Look for attendance-related content
            const hasAttendanceTerms = PATTERNS.totalKeywords.some(k => tableText.includes(k)) ||
                                     PATTERNS.presentKeywords.some(k => tableText.includes(k));
            
            if (!hasAttendanceTerms) {
                return result;
            }

            // Analyze table rows
            const rows = table.querySelectorAll('tr');
            debugLog(`Analyzing table with ${rows.length} rows`);
            
            for (const row of rows) {
                if (!row) continue;
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(cell => safeGetText(cell).trim().toLowerCase());
                
                // Look for total and attended patterns
                for (let i = 0; i < cellTexts.length; i++) {
                    const cellText = cellTexts[i];
                    const numbers = extractNumber(cellText);
                    
                    if (PATTERNS.totalKeywords.some(k => cellText.includes(k)) && numbers.length > 0) {
                        result.totalClasses = numbers[numbers.length - 1]; // Take the last number
                    }
                    
                    if (PATTERNS.presentKeywords.some(k => cellText.includes(k)) && numbers.length > 0) {
                        result.attendedClasses = numbers[numbers.length - 1]; // Take the last number
                    }
                }
                
                // Check for fraction patterns in cells
                const rowText = cellTexts.join(' ');
                const fractionMatch = rowText.match(/(\d+)\s*\/\s*(\d+)/);
                if (fractionMatch) {
                    result.attendedClasses = parseInt(fractionMatch[1], 10);
                    result.totalClasses = parseInt(fractionMatch[2], 10);
                }
            }

            if (result.totalClasses && result.attendedClasses) {
                result.found = true;
                result.debug.push(`Table analysis successful: ${result.attendedClasses}/${result.totalClasses}`);
            }

        } catch (error) {
            debugLog('Error analyzing table:', error.message);
            result.debug.push(`Table analysis error: ${error.message}`);
        }
        
        return result;
    }

    // Analyze container for attendance data
    function analyzeContainer(container) {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            if (!container) return result;
            
            const containerText = safeGetText(container);
            const numbers = extractNumber(containerText);
            
            debugLog(`Container analysis: ${numbers.length} numbers found`);
            result.debug.push(`Container numbers: ${numbers.join(', ')}`);
            
            // Look for specific patterns in the container
            const patterns = [
                /total\s*:?\s*(\d+)/i,
                /attended\s*:?\s*(\d+)/i,
                /present\s*:?\s*(\d+)/i,
                /(\d+)\s*\/\s*(\d+)/i
            ];
            
            for (const pattern of patterns) {
                const match = containerText.match(pattern);
                if (match) {
                    if (pattern.source.includes('total')) {
                        result.totalClasses = parseInt(match[1], 10);
                    } else if (pattern.source.includes('attended') || pattern.source.includes('present')) {
                        result.attendedClasses = parseInt(match[1], 10);
                    } else if (pattern.source.includes('\\/')) {
                        result.attendedClasses = parseInt(match[1], 10);
                        result.totalClasses = parseInt(match[2], 10);
                    }
                }
            }

            if (result.totalClasses && result.attendedClasses) {
                result.found = true;
                result.debug.push(`Container analysis successful: ${result.attendedClasses}/${result.totalClasses}`);
            }

        } catch (error) {
            debugLog('Error analyzing container:', error.message);
            result.debug.push(`Container analysis error: ${error.message}`);
        }
        
        return result;
    }

    // Search DOM elements
    function searchDOMElements() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const allElements = document.querySelectorAll('*');
            let totalFound = false;
            let attendedFound = false;
            
            for (const element of allElements) {
                if (totalFound && attendedFound) break;
                
                const text = safeGetText(element);
                if (!text || text.length > 200) continue; // Skip very long text
                
                const lowerText = text.toLowerCase();
                
                // Look for total classes
                if (!totalFound && PATTERNS.totalKeywords.some(k => lowerText.includes(k))) {
                    const numbers = extractNumber(text);
                    if (numbers.length > 0) {
                        result.totalClasses = numbers[numbers.length - 1];
                        totalFound = true;
                        result.debug.push(`Total found in: ${text.substring(0, 50)}`);
                    }
                }
                
                // Look for attended classes
                if (!attendedFound && PATTERNS.presentKeywords.some(k => lowerText.includes(k))) {
                    const numbers = extractNumber(text);
                    if (numbers.length > 0) {
                        result.attendedClasses = numbers[numbers.length - 1];
                        attendedFound = true;
                        result.debug.push(`Attended found in: ${text.substring(0, 50)}`);
                    }
                }
            }

            if (result.totalClasses && result.attendedClasses) {
                result.found = true;
                result.debug.push(`DOM search successful: ${result.attendedClasses}/${result.totalClasses}`);
            }

        } catch (error) {
            debugLog('Error in DOM search:', error.message);
            result.debug.push(`DOM search error: ${error.message}`);
        }
        
        return result;
    }

    // Analyze percentages to reverse calculate
    function analyzePercentages() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const bodyText = safeGetText(document.body);
            const percentagePattern = /(\d+(?:\.\d+)?)\s*%/g;
            const percentages = [];
            let match;
            
            while ((match = percentagePattern.exec(bodyText)) !== null) {
                percentages.push(parseFloat(match[1]));
            }
            
            debugLog(`Found percentages: ${percentages.join(', ')}`);
            result.debug.push(`Percentages found: ${percentages.join(', ')}`);
            
            // If we find a reasonable attendance percentage (40-100%)
            const attendancePercentages = percentages.filter(p => p >= 40 && p <= 100);
            
            if (attendancePercentages.length > 0) {
                // Try to find total and calculate attended
                const numbers = extractNumber(bodyText);
                const possibleTotals = numbers.filter(n => n >= 10 && n <= 200);
                
                if (possibleTotals.length > 0) {
                    const percentage = attendancePercentages[0];
                    const total = possibleTotals[possibleTotals.length - 1]; // Take the largest reasonable number
                    const attended = Math.round((percentage / 100) * total);
                    
                    result.totalClasses = total;
                    result.attendedClasses = attended;
                    result.found = true;
                    result.debug.push(`Percentage calculation: ${attended}/${total} (${percentage}%)`);
                }
            }

        } catch (error) {
            debugLog('Error in percentage analysis:', error.message);
            result.debug.push(`Percentage analysis error: ${error.message}`);
        }
        
        return result;
    }

    // Pattern matching with regex
    function patternMatching() {
        const result = { totalClasses: null, attendedClasses: null, found: false, debug: [] };
        
        try {
            const bodyText = safeGetText(document.body);
            
            const patterns = [
                // Fraction patterns: "35/40", "attended 35/40"
                /(?:attended|present)?\s*(\d+)\s*\/\s*(\d+)/gi,
                // Text patterns: "Total: 40, Attended: 35"
                /total\s*:?\s*(\d+)[\s\S]*?(?:attended|present)\s*:?\s*(\d+)/gi,
                // Reverse pattern: "Attended: 35, Total: 40"
                /(?:attended|present)\s*:?\s*(\d+)[\s\S]*?total\s*:?\s*(\d+)/gi,
                // Out of pattern: "35 out of 40"
                /(\d+)\s+out\s+of\s+(\d+)/gi,
                // Classes pattern: "attended 35 classes out of 40"
                /attended\s+(\d+)\s+(?:classes?|lectures?)\s+out\s+of\s+(\d+)/gi
            ];
            
            for (const pattern of patterns) {
                const matches = [...bodyText.matchAll(pattern)];
                debugLog(`Pattern ${pattern.source} found ${matches.length} matches`);
                
                for (const match of matches) {
                    let attended, total;
                    
                    if (pattern.source.includes('out of') || pattern.source.includes('\\/')) {
                        attended = parseInt(match[1], 10);
                        total = parseInt(match[2], 10);
                    } else if (pattern.source.includes('total.*attended')) {
                        total = parseInt(match[1], 10);
                        attended = parseInt(match[2], 10);
                    } else if (pattern.source.includes('attended.*total')) {
                        attended = parseInt(match[1], 10);
                        total = parseInt(match[2], 10);
                    }
                    
                    if (attended && total && attended <= total && total >= 10 && total <= 200) {
                        result.totalClasses = total;
                        result.attendedClasses = attended;
                        result.found = true;
                        result.debug.push(`Pattern match: ${attended}/${total} from "${match[0]}"`);
                        return result;
                    }
                }
            }

        } catch (error) {
            debugLog('Error in pattern matching:', error.message);
            result.debug.push(`Pattern matching error: ${error.message}`);
        }
        
        return result;
    }

    // Validate and fix extracted data
    function validateAndFixData(data) {
        try {
            const result = { ...data };
            
            // Ensure numbers are valid
            if (!result.totalClasses || !result.attendedClasses) {
                result.found = false;
                result.debug.push('Validation failed: missing total or attended classes');
                return result;
            }
            
            // Ensure attended <= total
            if (result.attendedClasses > result.totalClasses) {
                // Swap if they're reversed
                const temp = result.totalClasses;
                result.totalClasses = result.attendedClasses;
                result.attendedClasses = temp;
                result.debug.push('Swapped total and attended (were reversed)');
            }
            
            // Ensure reasonable ranges
            if (result.totalClasses < 1 || result.totalClasses > 500) {
                result.found = false;
                result.debug.push(`Invalid total classes: ${result.totalClasses}`);
                return result;
            }
            
            if (result.attendedClasses < 0 || result.attendedClasses > result.totalClasses) {
                result.found = false;
                result.debug.push(`Invalid attended classes: ${result.attendedClasses}`);
                return result;
            }
            
            result.debug.push(`Validation successful: ${result.attendedClasses}/${result.totalClasses}`);
            return result;

        } catch (error) {
            debugLog('Error in validation:', error.message);
            data.debug.push(`Validation error: ${error.message}`);
            data.found = false;
            return data;
        }
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
            // Defensive check for document availability
            if (!document || !document.body) {
                debugLog('Document or body not available');
                result.debug.push('Document or body not available');
                return result;
            }

            // Method 0: Quick TCS-specific selector search
            debugLog('Method 0: TCS-specific selectors');
            try {
                const tcsData = searchTCSSpecificElements();
                if (tcsData && tcsData.found) {
                    Object.assign(result, tcsData);
                    result.source = 'tcs_specific';
                    result.found = true;
                    debugLog('✅ Found via TCS-specific selectors');
                    return result;
                }
            } catch (error) {
                debugLog('Error in Method 0:', error.message);
                result.debug.push(`Method 0 error: ${error.message}`);
            }

            // Method 1: Comprehensive text search
            debugLog('Method 1: Text pattern search');
            try {
                const pageText = document.body.textContent?.toLowerCase() || '';
                debugLog('Page contains attendance keywords:', 
                    PATTERNS.totalKeywords.some(k => pageText.includes(k)) && 
                    PATTERNS.presentKeywords.some(k => pageText.includes(k))
                );
                result.debug.push(`Page text length: ${pageText.length}`);
            } catch (error) {
                debugLog('Error in Method 1:', error.message);
                result.debug.push(`Method 1 error: ${error.message}`);
            }

            // Method 2: Enhanced table scanning
            debugLog('Method 2: Table scanning');
            try {
                const tables = document.querySelectorAll(PATTERNS.tableSelectors.join(','));
                debugLog(`Found ${tables.length} potential tables`);
                result.debug.push(`Found ${tables.length} tables`);

                for (const table of tables) {
                    if (!table) continue;
                    debugLog('Analyzing table:', table.className || table.id || 'unnamed');
                    const tableData = analyzeTable(table);
                    if (tableData && tableData.found) {
                        Object.assign(result, tableData);
                        result.source = 'table_analysis';
                        result.found = true;
                        break;
                    }
                }
            } catch (error) {
                debugLog('Error in Method 2:', error.message);
                result.debug.push(`Method 2 error: ${error.message}`);
            }

            // Method 3: DOM element search with better patterns
            if (!result.found) {
                debugLog('Method 3: DOM element search');
                try {
                    const elementData = searchDOMElements();
                    if (elementData && elementData.found) {
                        Object.assign(result, elementData);
                        result.source = 'dom_search';
                        result.found = true;
                    }
                } catch (error) {
                    debugLog('Error in Method 3:', error.message);
                    result.debug.push(`Method 3 error: ${error.message}`);
                }
            }

            // Method 4: Percentage reverse calculation
            if (!result.found) {
                debugLog('Method 4: Percentage analysis');
                try {
                    const percentData = analyzePercentages();
                    if (percentData && percentData.found) {
                        Object.assign(result, percentData);
                        result.source = 'percentage_calc';
                        result.found = true;
                    }
                } catch (error) {
                    debugLog('Error in Method 4:', error.message);
                    result.debug.push(`Method 4 error: ${error.message}`);
                }
            }

            // Method 5: Regex pattern matching
            if (!result.found) {
                debugLog('Method 5: Pattern matching');
                try {
                    const patternData = patternMatching();
                    if (patternData && patternData.found) {
                        Object.assign(result, patternData);
                        result.source = 'pattern_match';
                        result.found = true;
                    }
                } catch (error) {
                    debugLog('Error in Method 5:', error.message);
                    result.debug.push(`Method 5 error: ${error.message}`);
                }
            }

            // Validate and fix data
            if (result.found) {
                try {
                    const validatedResult = validateAndFixData(result);
                    Object.assign(result, validatedResult);
                } catch (error) {
                    debugLog('Error in validation:', error.message);
                    result.debug.push(`Validation error: ${error.message}`);
                    result.found = false;
                }
            }

            debugLog('Final result:', result);
            return result;

        } catch (error) {
            console.error('Critical error extracting attendance data:', error);
            result.debug.push(`Critical error: ${error.message}`);
            result.debug.push(`Stack: ${error.stack}`);
        }

        return { ...result, found: false };
    }

    // Enhanced function to check if this is an attendance page
    function isAttendancePage() {
        try {
            const url = window.location.href.toLowerCase();
            const title = document.title.toLowerCase();
            const pageText = safeGetText(document.body).toLowerCase();
            
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
        } catch (error) {
            debugLog('Error checking if attendance page:', error.message);
            return true; // Default to true to allow extraction attempts
        }
    }

    // Enhanced function to wait for dynamic content
    function waitForContent(maxAttempts = 10, attempt = 1) {
        return new Promise((resolve) => {
            debugLog(`Waiting for content, attempt ${attempt}/${maxAttempts}`);
            
            try {
                const hasContent = document.body && 
                                 document.body.textContent && 
                                 document.body.textContent.trim().length > 100;
                
                const hasTables = document.querySelectorAll('table').length > 0;
                const hasRelevantContent = hasTables || 
                                         document.body.textContent.toLowerCase().includes('attendance') ||
                                         document.body.textContent.toLowerCase().includes('total');
                
                if (hasContent && (hasRelevantContent || attempt >= maxAttempts)) {
                    debugLog('Content ready');
                    resolve();
                } else if (attempt < maxAttempts) {
                    setTimeout(() => {
                        waitForContent(maxAttempts, attempt + 1).then(resolve);
                    }, 1500);
                } else {
                    debugLog('Max attempts reached, proceeding anyway');
                    resolve();
                }
            } catch (error) {
                debugLog('Error waiting for content:', error.message);
                resolve(); // Continue anyway
            }
        });
    }

    // Main function to handle data extraction
    async function handleDataExtraction() {
        debugLog('Handle data extraction called');
        
        try {
            // Wait for content to load
            await waitForContent();
            
            if (!isAttendancePage()) {
                debugLog('Not an attendance page, skipping extraction');
                return;
            }

            debugLog('This appears to be an attendance page, extracting data...');
            const attendanceData = extractAttendanceData();
            
            if (attendanceData && attendanceData.found) {
                // Store the extracted data
                const extractedData = {
                    totalClasses: attendanceData.totalClasses,
                    attendedClasses: attendanceData.attendedClasses,
                    source: attendanceData.source,
                    timestamp: Date.now(),
                    url: window.location.href,
                    debug: attendanceData.debug
                };

                // Store in chrome storage
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ extractedAttendanceData: extractedData }, () => {
                        debugLog('Attendance data stored successfully');
                    });
                } else {
                    debugLog('Chrome storage not available');
                }

                debugLog('✅ Extracted attendance data:', extractedData);
                
                // Send notification to popup if it's open
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime) {
                        chrome.runtime.sendMessage({
                            action: 'dataExtracted',
                            data: extractedData
                        });
                    }
                } catch (error) {
                    debugLog('Could not send message to popup (popup might be closed)');
                }
                
            } else {
                debugLog('❌ No attendance data found on this page');
                const debugInfo = {
                    timestamp: Date.now(),
                    url: window.location.href,
                    debug: attendanceData ? attendanceData.debug : ['Failed to extract data'],
                    found: false
                };
                
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ extractedAttendanceData: debugInfo });
                }
                
                debugLog('Debug info:', attendanceData ? attendanceData.debug : []);
                debugLog('Page content preview:', document.body.textContent.substring(0, 500));
            }
        } catch (error) {
            console.error('Error in handleDataExtraction:', error);
            debugLog('Critical error in handleDataExtraction:', error.message);
            
            // Store error information
            const errorInfo = {
                timestamp: Date.now(),
                url: window.location.href,
                error: error.message,
                stack: error.stack,
                found: false,
                debug: [`Critical error: ${error.message}`]
            };
            
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ extractedAttendanceData: errorInfo });
            }
        }
    }

    // Message listener for popup communication
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            debugLog('Message received:', request);
            
            try {
                if (request.action === 'extractData') {
                    debugLog('Extract data request received');
                    
                    // Extract data and send response
                    const attendanceData = extractAttendanceData();
                    
                    const pageInfo = {
                        found: attendanceData.found,
                        totalClasses: attendanceData.totalClasses,
                        attendedClasses: attendanceData.attendedClasses,
                        source: attendanceData.source,
                        url: window.location.href,
                        title: document.title,
                        debug: attendanceData.debug
                    };
                    
                    debugLog('Sending response:', pageInfo);
                    sendResponse(pageInfo);
                    
                    // Also store the data if found
                    if (attendanceData.found) {
                        const extractedData = {
                            ...pageInfo,
                            timestamp: Date.now()
                        };
                        
                        if (chrome.storage) {
                            chrome.storage.local.set({ extractedAttendanceData: extractedData });
                        }
                    }
                    
                } else if (request.action === 'getPageInfo') {
                    debugLog('Page info request received');
                    
                    const pageInfo = {
                        url: window.location.href,
                        title: document.title,
                        isAttendancePage: isAttendancePage(),
                        hasContent: document.body && document.body.textContent.length > 100,
                        tableCount: document.querySelectorAll('table').length
                    };
                    
                    debugLog('Sending page info:', pageInfo);
                    sendResponse(pageInfo);
                }
                
                return true; // Will respond asynchronously
            } catch (error) {
                console.error('Error handling message:', error);
                sendResponse({
                    error: error.message,
                    found: false,
                    debug: [`Message handling error: ${error.message}`]
                });
            }
        });
    }

    // Set up mutation observer for dynamic content
    function setupMutationObserver() {
        try {
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                    // Check if significant content was added
                    const hasSignificantChanges = mutations.some(mutation => 
                        mutation.addedNodes.length > 0 && 
                        Array.from(mutation.addedNodes).some(node => 
                            node.nodeType === Node.ELEMENT_NODE && 
                            (node.tagName === 'TABLE' || 
                             node.querySelector && node.querySelector('table'))
                        )
                    );
                    
                    if (hasSignificantChanges) {
                        debugLog('Significant DOM changes detected, re-extracting data');
                        setTimeout(handleDataExtraction, 2000);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                debugLog('Mutation observer set up');
            }
        } catch (error) {
            debugLog('Error setting up mutation observer:', error.message);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            debugLog('DOM content loaded');
            setTimeout(handleDataExtraction, 3000);
            setupMutationObserver();
        });
    } else {
        debugLog('DOM already ready');
        setTimeout(handleDataExtraction, 3000);
        setupMutationObserver();
    }

})();
