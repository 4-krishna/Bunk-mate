// Popup script to display attendance information

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');

    // Function to show loading state
    function showLoading() {
        contentDiv.innerHTML = '<p class="loading">Loading attendance data...</p>';
    }

    // Function to show error state
    function showError(message) {
        contentDiv.innerHTML = `<p class="error">${message}</p>`;
    }

    // Function to update the popup UI
    function updateUI(status) {
        if (!status) {
            showError('Unable to calculate attendance status.');
            return;
        }

        let html = `
            <div class="status ${status.status}">
                <div class="percentage">${status.currentPercentage}%</div>
                <div class="details">
                    <p>Total Classes: ${status.total}</p>
                    <p>Classes Attended: ${status.attended}</p>
                </div>
                <div class="message">`;

        if (status.status === 'above') {
            html += `You can safely skip ${status.canSkip} more ${status.canSkip === 1 ? 'class' : 'classes'} 
                    and still maintain 75% attendance.`;
        } else {
            html += `You need to attend ${status.needToAttend} more ${status.needToAttend === 1 ? 'class' : 'classes'} 
                    to reach 75% attendance.`;
        }

        html += '</div></div>';
        contentDiv.innerHTML = html;
    }

    // Listen for attendance updates from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'attendanceUpdated') {
            updateUI(request.status);
        }
    });

    // Check if we're on the attendance page
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab.url) {
            showError('Unable to access current tab.');
            return;
        }

        if (currentTab.url.includes('g21.tcsion.com')) {
            showLoading();
            // First check storage for existing data
            chrome.storage.local.get(['attendanceStatus'], (result) => {
                if (chrome.runtime.lastError) {
                    showError('Error accessing storage.');
                    return;
                }

                if (result.attendanceStatus) {
                    updateUI(result.attendanceStatus);
                } else {
                    // Request new data from content script
                    chrome.tabs.sendMessage(currentTab.id, {action: 'getAttendance'}, (response) => {
                        if (chrome.runtime.lastError) {
                            showError('Please navigate to the attendance page to view your status.');
                            return;
                        }

                        if (response) {
                            const status = {
                                status: response.percentage >= 75 ? 'above' : 'below',
                                currentPercentage: response.percentage.toFixed(2),
                                total: response.total,
                                attended: response.attended,
                                canSkip: Math.floor((response.attended / 0.75) - response.total),
                                needToAttend: Math.ceil((0.75 * response.total - response.attended) / (1 - 0.75))
                            };
                            updateUI(status);
                        } else {
                            showError('Please navigate to the attendance page to view your status.');
                        }
                    });
                }
            });
        } else {
            showError('Please navigate to the KJC portal to view your attendance status.');
        }
    });
});