/**
 * Bunk Mate - Content Script for TCS iON Data Extraction
 * Automatically extracts attendance data from TCS portals
 * 
 * @author devag7 (https://github.com/devag7)
 * @version 2.1.0
 */
(() => {
    'use strict';

    // Configuration
    const CONFIG = {
        debug: true,
        retryAttempts: 3,
        retryDelay: 1000
    };

    console.log('[Bunk Mate] Content script loaded on:', window.location.href);

    /**
     * Enhanced TCS iON attendance data extraction
     * Supports multiple TCS portal layouts and structures
     */
    function extractTCSAttendanceData() {
        const result = { 
            totalClasses: null, 
            attendedClasses: null, 
            found: false, 
            debug: [],
            extractionMethod: null
        };
        
        try {
            // Method 1: Primary TCS iON structure (_countTab)
            const extractionResult = tryCountTabExtraction() || 
                                   tryDirectIdExtraction() || 
                                   tryClassBasedExtraction() || 
                                   tryPatternExtraction();
            
            if (extractionResult && extractionResult.found) {
                Object.assign(result, extractionResult);
                console.log('[Bunk Mate] ✅ Successfully extracted:', result);
                return result;
            }
            
        } catch (error) {
            console.error('[Bunk Mate] Error in TCS extraction:', error);
            result.debug.push(`Error: ${error.message}`);
        }
        
        console.log('[Bunk Mate] ❌ No attendance data found');
        return result;
    }

    /**
     * Method 1: Extract from _countTab structure
     */
    function tryCountTabExtraction() {
        const countTab = document.querySelector('._countTab');
        if (!countTab) return null;

        const totalElement = countTab.querySelector('._ttlPlan ._value#cum_slots') || 
                           countTab.querySelector('#cum_slots') ||
                           countTab.querySelector('._ttlPlan ._value');
        
        const presentElement = countTab.querySelector('._prsntPlan ._value#cum_present') || 
                             countTab.querySelector('#cum_present') ||
                             countTab.querySelector('._prsntPlan ._value');
        
        if (totalElement && presentElement) {
            const result = parseAttendanceNumbers(totalElement.textContent, presentElement.textContent);
            if (result) {
                result.extractionMethod = '_countTab';
                result.debug.push(`_countTab extraction: Found ${result.attendedClasses}/${result.totalClasses}`);
                return result;
            }
        }
        return null;
    }

    /**
     * Method 2: Direct ID-based extraction
     */
    function tryDirectIdExtraction() {
        const totalElement = document.getElementById('cum_slots');
        const presentElement = document.getElementById('cum_present');
        
        if (totalElement && presentElement) {
            const result = parseAttendanceNumbers(totalElement.textContent, presentElement.textContent);
            if (result) {
                result.extractionMethod = 'direct_id';
                result.debug.push(`Direct ID extraction: Found ${result.attendedClasses}/${result.totalClasses}`);
                return result;
            }
        }
        return null;
    }

    /**
     * Method 3: Class-based extraction
     */
    function tryClassBasedExtraction() {
        const totalDiv = document.querySelector('._ttlPlan');
        const presentDiv = document.querySelector('._prsntPlan');
        
        if (totalDiv && presentDiv) {
            const totalValueElement = totalDiv.querySelector('._value') || 
                                    totalDiv.querySelector('p') ||
                                    totalDiv;
                                    
            const presentValueElement = presentDiv.querySelector('._value') || 
                                      presentDiv.querySelector('p') ||
                                      presentDiv;
            
            if (totalValueElement && presentValueElement) {
                const result = parseAttendanceNumbers(totalValueElement.textContent, presentValueElement.textContent);
                if (result) {
                    result.extractionMethod = 'class_based';
                    result.debug.push(`Class-based extraction: Found ${result.attendedClasses}/${result.totalClasses}`);
                    return result;
                }
            }
        }
        return null;
    }

    /**
     * Method 4: Pattern-based extraction from page text
     */
    function tryPatternExtraction() {
        const bodyText = document.body.textContent || '';
        
        const patterns = [
            /(\d+)\s*\/\s*(\d+)/g,
            /(\d+)\s+out\s+of\s+(\d+)/gi,
            /attended\s+(\d+)\s+(?:out\s+of\s+)?(\d+)/gi,
            /present\s*:?\s*(\d+)[\s\S]*?total\s*:?\s*(\d+)/gi
        ];
        
        for (const pattern of patterns) {
            const matches = [...bodyText.matchAll(pattern)];
            for (const match of matches) {
                const result = parseAttendanceNumbers(match[1], match[2]);
                if (result && isValidAttendanceRange(result.attendedClasses, result.totalClasses)) {
                    result.extractionMethod = 'pattern_matching';
                    result.debug.push(`Pattern extraction: Found ${result.attendedClasses}/${result.totalClasses}`);
                    return result;
                }
            }
        }
        return null;
    }

    /**
     * Parse and validate attendance numbers
     */
    function parseAttendanceNumbers(totalText, presentText) {
        const totalNum = parseInt(String(totalText).trim(), 10);
        const presentNum = parseInt(String(presentText).trim(), 10);
        
        if (!isNaN(totalNum) && !isNaN(presentNum) && 
            totalNum > 0 && presentNum >= 0 && presentNum <= totalNum) {
            return {
                totalClasses: totalNum,
                attendedClasses: presentNum,
                found: true,
                debug: []
            };
        }
        return null;
    }

    /**
     * Validate attendance numbers are in reasonable range
     */
    function isValidAttendanceRange(attended, total) {
        return total >= 10 && total <= 500 && attended <= total;
    }

    /**
     * Get general page information for debugging
     */
    function getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            hasTables: document.querySelectorAll('table').length > 0,
            hasAttendanceKeywords: /attendance|present|absent|total.*class/i.test(document.body.textContent || ''),
            timestamp: Date.now()
        };
    }

    /**
     * Main extraction function with retry logic
     */
    async function extractAttendanceData() {
        console.log('[Bunk Mate] Starting attendance extraction...');
        
        const result = {
            totalClasses: null,
            attendedClasses: null,
            source: 'tcs_ion',
            found: false,
            debug: [],
            pageInfo: getPageInfo()
        };

        // Try extraction with retry logic
        for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
            const tcsData = extractTCSAttendanceData();
            
            if (tcsData.found) {
                Object.assign(result, tcsData);
                result.source = `tcs_ion_${tcsData.extractionMethod}`;
                console.log(`[Bunk Mate] ✅ Success on attempt ${attempt}:`, result);
                return result;
            }
            
            result.debug = [...result.debug, ...tcsData.debug];
            
            if (attempt < CONFIG.retryAttempts) {
                console.log(`[Bunk Mate] Attempt ${attempt} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
            }
        }
        
        console.log('[Bunk Mate] ❌ All extraction attempts failed');
        return result;
    }

    /**
     * Enhanced message listener with better error handling
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[Bunk Mate] Received message:', request);
        
        (async () => {
            try {
                switch (request.action) {
                    case 'extractData':
                        const data = await extractAttendanceData();
                        
                        sendResponse({
                            success: data.found,
                            data: data.found ? {
                                totalClasses: data.totalClasses,
                                attendedClasses: data.attendedClasses,
                                source: data.source,
                                extractionMethod: data.extractionMethod
                            } : null,
                            error: data.found ? null : 'No attendance data found on this page',
                            debug: data.debug,
                            pageInfo: data.pageInfo
                        });
                        break;
                        
                    case 'getPageInfo':
                        const pageInfo = getPageInfo();
                        sendResponse({ success: true, data: pageInfo });
                        break;
                        
                    default:
                        sendResponse({ 
                            success: false, 
                            error: `Unknown action: ${request.action}` 
                        });
                }
            } catch (error) {
                console.error('[Bunk Mate] Error handling message:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message,
                    debug: [`Message handler error: ${error.message}`]
                });
            }
        })();
        
        return true; // Keep message channel open for async response
    });

    // Initialize content script
    console.log('[Bunk Mate] Content script ready for TCS iON attendance extraction');
    
    // Auto-extract on page load if debug mode is enabled
    if (CONFIG.debug) {
        setTimeout(() => {
            extractAttendanceData().then(result => {
                console.log('[Bunk Mate] Auto-extraction result:', result);
            });
        }, 2000);
    }

})();
