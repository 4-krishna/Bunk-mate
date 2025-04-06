// Background script for attendance calculations

function calculateAttendanceStatus(total, attended) {
    if (total === 0) return null;
    
    const currentPercentage = (attended / total) * 100;
    const targetPercentage = 75;
    
    // Calculate how many more classes can be missed while maintaining 75%
    if (currentPercentage > targetPercentage) {
        // Formula: (attended / (total + x)) = 0.75, solve for x
        const maxSkippableClasses = Math.floor((attended / 0.75) - total);
        return {
            status: 'above',
            currentPercentage: currentPercentage.toFixed(2),
            canSkip: maxSkippableClasses,
            total: total,
            attended: attended
        };
    } else {
        // Calculate how many classes need to be attended to reach 75%
        // Formula: ((attended + x) / (total + x)) = 0.75, solve for x
        const requiredClasses = Math.ceil((0.75 * total - attended) / (1 - 0.75));
        return {
            status: 'below',
            currentPercentage: currentPercentage.toFixed(2),
            needToAttend: requiredClasses,
            total: total,
            attended: attended
        };
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'attendanceData' && request.data) {
        const status = calculateAttendanceStatus(request.data.total, request.data.attended);
        if (status) {
            // Store the calculated status
            chrome.storage.local.set({ attendanceStatus: status }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving attendance status:', chrome.runtime.lastError);
                }
            });
            // Notify all tabs that data has been updated
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'attendanceUpdated',
                        status: status
                    }).catch(() => {}); // Ignore errors for inactive tabs
                });
            });
        }
    }
    return true; // Keep the message channel open for async response
});