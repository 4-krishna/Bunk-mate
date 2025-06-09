/**
 * Bunk Mate - MVP Focus: Bunk Calculator
 * Popup script optimized for bunk counting
 * 
 * @author 4-krishna (https://github.com/4-krishna)
 * @version 2.1.0
 */

class BunkMatePopup {
    constructor() {
        this.elements = this.getElements();
        this.currentAttendanceData = null;
        this.autoDetectionAttempted = false;
        
        this.initialize();
    }

    /**
     * Get all DOM elements for MVP version
     */
    getElements() {
        return {
            // Auto-detection
            autoDetection: document.getElementById('autoDetection'),
            autoIcon: document.getElementById('autoIcon'),
            autoStatus: document.getElementById('autoStatus'),
            
            // Quick stats
            attendanceDisplay: document.getElementById('attendanceDisplay'),
            currentPercentage: document.getElementById('currentPercentage'),
            presentCount: document.getElementById('presentCount'),
            totalCount: document.getElementById('totalCount'),
            
            // Main bunk calculator
            targetPercentage: document.getElementById('targetPercentage'),
            targetDisplay: document.getElementById('targetDisplay'),
            calculateBunks: document.getElementById('calculateBunks'),
            
            // Bunk results - MVP focus
            bunkResult: document.getElementById('bunkResult'),
            bunkCount: document.getElementById('bunkCount'),
            bunkCountText: document.getElementById('bunkCountText'),
            bunkMessage: document.getElementById('bunkMessage'),
            bunkSubtext: document.getElementById('bunkSubtext'),
            
            // Manual input fallback
            totalClasses: document.getElementById('totalClasses'),
            attendedClasses: document.getElementById('attendedClasses'),
            calculate: document.getElementById('calculate'),
            statusMessage: document.getElementById('statusMessage')
        };
    }

    /**
     * Initialize the popup
     */
    async initialize() {
        try {
            await this.loadSavedData();
            await this.autoDetectAttendance();
            this.setupEventListeners();
        } catch (error) {
            console.error('[Bunk Mate] Initialization error:', error);
            this.showStatusMessage('Initialization failed', 'error');
        }
    }

    /**
     * Load saved data from storage
     */
    async loadSavedData() {
        try {
            const result = await chrome.storage.local.get([
                'totalClasses', 
                'attendedClasses',
                'autoExtractedData',
                'targetPercentage'
            ]);
            
            if (result.totalClasses) this.elements.totalClasses.value = result.totalClasses;
            if (result.attendedClasses) this.elements.attendedClasses.value = result.attendedClasses;
            if (result.targetPercentage) this.elements.targetPercentage.value = result.targetPercentage;
            
            // If we have saved attendance data, display it
            if (result.totalClasses && result.attendedClasses) {
                this.updateAttendanceDisplay(result.attendedClasses, result.totalClasses);
            }
            
            // Check for auto-extracted data
            if (result.autoExtractedData) {
                const timeDiff = Date.now() - result.autoExtractedData.timestamp;
                const minutesAgo = Math.floor(timeDiff / (1000 * 60));
                
                if (minutesAgo < 60) { // Data is less than 1 hour old
                    this.updateAttendanceDisplay(
                        result.autoExtractedData.attendedClasses,
                        result.autoExtractedData.totalClasses,
                        'auto',
                        minutesAgo
                    );
                }
            }
        } catch (error) {
            console.error('[Bunk Mate] Error loading saved data:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Manual calculate button
        this.elements.calculate.addEventListener('click', () => this.handleManualCalculate());
        
        // Bunk calculator
        this.elements.calculateBunks.addEventListener('click', () => this.calculatePossibleBunks());
        
        // Input validation
        this.elements.totalClasses.addEventListener('input', () => this.validateInputs());
        this.elements.attendedClasses.addEventListener('input', () => this.validateInputs());
        this.elements.targetPercentage.addEventListener('input', () => this.saveTargetPercentage());
        
        // Auto-update when manual inputs change
        this.elements.totalClasses.addEventListener('change', () => this.handleManualCalculate());
        this.elements.attendedClasses.addEventListener('change', () => this.handleManualCalculate());
    }

    /**
     * Auto-detect attendance data from the current tab
     */
    async autoDetectAttendance() {
        if (this.autoDetectionAttempted) return;
        this.autoDetectionAttempted = true;

        this.updateAutoDetectionStatus('Detecting...', '🔍', 'Scanning TCS iON page for attendance data');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !this.isTCSIonTab(tab.url)) {
                this.updateAutoDetectionStatus('Not TCS iON', '⚠️', 'Please open a TCS iON attendance page');
                return;
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
            
            console.log('[Bunk Mate] Auto-detection response:', response);

            if (response && response.success && response.data) {
                const { totalClasses, attendedClasses, source } = response.data;
                
                // Save auto-extracted data
                await this.saveAutoExtractedData(attendedClasses, totalClasses, source);
                
                // Update UI
                this.updateAttendanceDisplay(attendedClasses, totalClasses, 'auto');
                this.updateAutoDetectionStatus('Found!', '✅', `Auto-detected from ${source}`);
                
                this.currentAttendanceData = { totalClasses, attendedClasses };
                
            } else {
                this.updateAutoDetectionStatus('Not found', '❌', 'No attendance data detected on this page');
                console.log('[Bunk Mate] Debug info:', response?.debug);
            }
            
        } catch (error) {
            console.error('[Bunk Mate] Auto-detection error:', error);
            this.updateAutoDetectionStatus('Error', '❌', 'Failed to detect attendance data');
        }
    }

    /**
     * Check if URL is a TCS iON tab
     */
    isTCSIonTab(url) {
        if (!url) return false;
        const tcsPatterns = [
            'tcsondemand.com',
            'ion.digitalacademy.tcs.com',
            'tcs.com',
            'tcsonlineadvocacy.com',
            'fresco.tcs.com',
            'tcsion.com'
        ];
        return tcsPatterns.some(pattern => url.includes(pattern));
    }

    /**
     * Update auto-detection status for MVP
     */
    updateAutoDetectionStatus(title, icon, subtitle) {
        this.elements.autoStatus.textContent = title;
        this.elements.autoIcon.textContent = icon;
    }

    /**
     * Update attendance display - MVP focused
     */
    updateAttendanceDisplay(attended, total, source = 'manual', minutesAgo = null) {
        const percentage = ((attended / total) * 100).toFixed(1);
        
        // Update quick stats
        this.elements.currentPercentage.textContent = `${percentage}%`;
        this.elements.presentCount.textContent = attended;
        this.elements.totalCount.textContent = total;
        
        // Update form fields if auto-detected
        if (source === 'auto') {
            this.elements.attendedClasses.value = attended;
            this.elements.totalClasses.value = total;
        }
        
        // Show attendance display
        this.elements.attendanceDisplay.classList.remove('hidden');
        this.elements.attendanceDisplay.classList.add('fade-in');
        
        // Store current data for bunk calculation
        this.currentAttendanceData = { totalClasses: total, attendedClasses: attended };
    }

    /**
     * Calculate possible bunks - MVP HERO FEATURE
     */
    calculatePossibleBunks() {
        if (!this.currentAttendanceData) {
            this.showStatusMessage('Please enter or detect attendance data first', 'error');
            return;
        }

        const { totalClasses, attendedClasses } = this.currentAttendanceData;
        const targetPercentage = parseFloat(this.elements.targetPercentage.value) || 75;
        
        // Update target display
        this.elements.targetDisplay.textContent = targetPercentage;
        
        // Calculate current percentage
        const currentPercentage = (attendedClasses / totalClasses) * 100;
        
        // Calculate required classes to maintain target percentage
        const requiredForTarget = Math.ceil((targetPercentage * totalClasses) / 100);
        
        if (currentPercentage < targetPercentage) {
            // Need to attend more classes
            const needToAttend = requiredForTarget - attendedClasses;
            
            this.elements.bunkCount.textContent = '0';
            this.elements.bunkCountText.textContent = '0';
            this.elements.bunkMessage.innerHTML = `⚠️ You need to attend <strong>${needToAttend}</strong> more classes first!`;
            this.elements.bunkSubtext.innerHTML = `Current: ${currentPercentage.toFixed(1)}% | Target: ${targetPercentage}%`;
            
            // Change result styling for warning
            this.elements.bunkResult.style.background = 'var(--bunk-warning)';
            
        } else {
            // Calculate maximum possible bunks
            let maxBunks = 0;
            let testTotal = totalClasses;
            
            // Test how many future classes can be bunked
            while (testTotal < totalClasses + 50) { // Safety limit
                testTotal++;
                const futurePercentage = (attendedClasses / testTotal) * 100;
                
                if (futurePercentage >= targetPercentage) {
                    maxBunks++;
                } else {
                    break;
                }
            }
            
            this.elements.bunkCount.textContent = maxBunks;
            this.elements.bunkCountText.textContent = maxBunks;
            
            if (maxBunks === 0) {
                this.elements.bunkMessage.innerHTML = `✅ You're at the limit! Can't bunk any more classes.`;
                this.elements.bunkResult.style.background = 'var(--bunk-warning)';
            } else {
                this.elements.bunkMessage.innerHTML = `🎉 You can safely skip <strong>${maxBunks}</strong> more classes!`;
                this.elements.bunkResult.style.background = 'var(--bunk-success)';
            }
            
            this.elements.bunkSubtext.innerHTML = `While maintaining <span id="targetDisplay">${targetPercentage}</span>% attendance`;
        }
        
        // Show the result with animation
        this.elements.bunkResult.classList.remove('hidden');
        this.elements.bunkResult.classList.add('fade-in');
        
        // Save target percentage
        chrome.storage.local.set({ targetPercentage });
    }

    /**
     * Validate attendance data
     */
    validateAttendanceData(attended, total) {
        if (isNaN(attended) || isNaN(total)) {
            this.showStatusMessage('Please enter valid numbers', 'error');
            return false;
        }
        
        if (total <= 0) {
            this.showStatusMessage('Total classes must be greater than 0', 'error');
            return false;
        }
        
        if (attended < 0) {
            this.showStatusMessage('Attended classes cannot be negative', 'error');
            return false;
        }
        
        if (attended > total) {
            this.showStatusMessage('Attended classes cannot exceed total classes', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Validate inputs
     */
    validateInputs() {
        const total = parseInt(this.elements.totalClasses.value);
        const attended = parseInt(this.elements.attendedClasses.value);
        
        this.elements.calculate.disabled = !this.validateAttendanceData(attended, total);
    }

    /**
     * Save target percentage
     */
    async saveTargetPercentage() {
        const targetPercentage = parseFloat(this.elements.targetPercentage.value);
        if (!isNaN(targetPercentage) && targetPercentage > 0 && targetPercentage <= 100) {
            await chrome.storage.local.set({ targetPercentage });
        }
    }

    /**
     * Save auto-extracted data
     */
    async saveAutoExtractedData(attendedClasses, totalClasses, source) {
        await chrome.storage.local.set({
            autoExtractedData: {
                attendedClasses,
                totalClasses,
                source,
                timestamp: Date.now()
            }
        });
    }

    /**
     * Show status message
     */
    showStatusMessage(message, type = 'info') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message ${type}`;
        this.elements.statusMessage.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.elements.statusMessage.classList.add('hidden');
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BunkMatePopup();
});