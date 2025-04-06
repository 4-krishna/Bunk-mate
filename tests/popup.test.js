const fs = require('fs');
const path = require('path');

// Mock chrome APIs
global.chrome = {
    tabs: {
        query: jest.fn(),
    },
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn(),
        },
    },
    runtime: {
        sendMessage: jest.fn(),
    },
};

// Import popup script
const popupHtml = fs.readFileSync(
    path.resolve(__dirname, '../popup.html'),
    'utf8'
);
document.documentElement.innerHTML = popupHtml;

const popupScript = fs.readFileSync(
    path.resolve(__dirname, '../popup.js'),
    'utf8'
);
eval(popupScript);

describe('Popup UI Tests', () => {
    let contentDiv;

    beforeEach(() => {
        contentDiv = document.getElementById('content');
        // Reset all mocks
        jest.clearAllMocks();
    });

    test('should display above threshold message correctly', () => {
        const status = {
            status: 'above',
            currentPercentage: '80.00',
            canSkip: 5
        };
        updateUI(status);

        expect(contentDiv.innerHTML).toContain('80.00%');
        expect(contentDiv.innerHTML).toContain('You can safely skip 5 more classes');
        expect(contentDiv.querySelector('.status').classList.contains('above')).toBeTruthy();
    });

    test('should display below threshold message correctly', () => {
        const status = {
            status: 'below',
            currentPercentage: '70.00',
            needToAttend: 3
        };
        updateUI(status);

        expect(contentDiv.innerHTML).toContain('70.00%');
        expect(contentDiv.innerHTML).toContain('You need to attend 3 more classes');
        expect(contentDiv.querySelector('.status').classList.contains('below')).toBeTruthy();
    });

    test('should handle singular form of class/classes correctly', () => {
        const status = {
            status: 'above',
            currentPercentage: '76.00',
            canSkip: 1
        };
        updateUI(status);

        expect(contentDiv.innerHTML).toContain('You can safely skip 1 more class');
    });

    test('should display non-attendance page message', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ url: 'https://example.com' }]);
        });

        // Trigger DOMContentLoaded event
        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(contentDiv.innerHTML).toContain('Please navigate to the KJC portal');
    });
});