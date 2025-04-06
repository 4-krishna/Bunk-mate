// Content script to scrape attendance data

function scrapeAttendanceData() {
    // The actual selector for the attendance table in g21.tcsion.com
    const attendanceTable = document.querySelector('table.table.table-bordered');
    
    if (!attendanceTable) {
        console.log('Attendance table not found');
        return null;
    }

    try {
        // Extract total classes and attended classes from the attendance table
        const rows = attendanceTable.querySelectorAll('tbody tr');
        let totalClasses = 0;
        let attendedClasses = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            // Check if the row has the expected number of cells and contains attendance data
            if (cells.length >= 4) {
                totalClasses++;
                const status = cells[3].textContent.trim().toLowerCase();
                if (status === 'present' || status === 'p') {
                    attendedClasses++;
                }
            }
        });

        return {
            total: totalClasses,
            attended: attendedClasses,
            percentage: (attendedClasses / totalClasses) * 100
        };
    } catch (error) {
        console.error('Error scraping attendance data:', error);
        return null;
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAttendance') {
        const data = scrapeAttendanceData();
        sendResponse(data);
    }
});

// Function to check if we're on the attendance page
function isAttendancePage() {
    return window.location.href.includes('StudentAttendance/StudentAttendanceStatus');
}

// Observe DOM changes to detect when attendance page loads
const observer = new MutationObserver((mutations) => {
    if (isAttendancePage()) {
        const data = scrapeAttendanceData();
        if (data) {
            chrome.runtime.sendMessage({
                action: 'attendanceData',
                data: data
            });
        }
    }
});

// Initial check when the script loads
if (isAttendancePage()) {
    setTimeout(() => {
        const data = scrapeAttendanceData();
        if (data) {
            chrome.runtime.sendMessage({
                action: 'attendanceData',
                data: data
            });
        }
    }, 1000); // Wait for 1 second to ensure the table has loaded

observer.observe(document.body, {
    childList: true,
    subtree: true
});