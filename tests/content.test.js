const fs = require('fs');
const path = require('path');

// Mock chrome.runtime API
global.chrome = {
    runtime: {
        onMessage: {
            addListener: jest.fn(),
        },
        sendMessage: jest.fn(),
    },
};

// Import the content script
const contentScript = fs.readFileSync(
    path.resolve(__dirname, '../content.js'),
    'utf8'
);
eval(contentScript);

describe('Content Script Tests', () => {
    beforeEach(() => {
        // Setup a mock DOM environment
        document.body.innerHTML = `
            <table class="attendance-table">
                <tr>
                    <td>Class 1</td>
                    <td>Present</td>
                </tr>
                <tr>
                    <td>Class 2</td>
                    <td>Absent</td>
                </tr>
                <tr>
                    <td>Class 3</td>
                    <td>Present</td>
                </tr>
            </table>
        `;
    });

    test('scrapeAttendanceData should correctly calculate attendance', () => {
        const data = scrapeAttendanceData();
        expect(data).toEqual({
            total: 3,
            attended: 2,
            percentage: (2/3) * 100
        });
    });

    test('should handle empty attendance table', () => {
        document.body.innerHTML = '';
        const data = scrapeAttendanceData();
        expect(data).toBeNull();
    });

    test('should handle malformed table data', () => {
        document.body.innerHTML = `
            <table class="attendance-table">
                <tr>
                    <td>Invalid Data</td>
                </tr>
            </table>
        `;
        const data = scrapeAttendanceData();
        expect(data).toEqual({
            total: 0,
            attended: 0,
            percentage: 0
        });
    });
});