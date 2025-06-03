# Bunk Mate Extension - Complete Installation & Testing Guide

## 🚀 Quick Installation

### Install the Extension
1. **Download or Clone**: Get the Bunk Mate extension files
2. **Open Chrome Extensions**: Go to `chrome://extensions/` in Chrome
3. **Enable Developer Mode**: Toggle the "Developer mode" switch in the top right
4. **Load Extension**: Click "Load unpacked" and select the Bunk-mate folder
5. **Verify Installation**: The Bunk Mate icon should appear in your extensions toolbar

### Pin the Extension (Recommended)
- Click the puzzle piece icon in Chrome's toolbar
- Find "Bunk Mate" and click the pin icon to keep it visible

## 🧪 Testing the Extension

### Method 1: Use the Test Page
1. **Open Extension**: Click the Bunk Mate icon
2. **Open Test Page**: If available, click "Open Test Page" button (for local testing)
3. **Test Auto-Detection**: Click "Detect from TCS iON" on the test page
4. **Verify Results**: The extension should detect attendance data automatically

### Method 2: Test on Actual TCS iON Portal
1. **Login**: Navigate to your TCS iON portal
2. **Go to Attendance**: Find your attendance/academic report page
3. **Open Extension**: Click the Bunk Mate icon
4. **Auto-Detect**: Click "Detect from TCS iON"
5. **Manual Fallback**: If auto-detection fails, enter numbers manually

### Method 3: Debug with Console
1. **Open Developer Tools**: Press F12 on any TCS iON page
2. **Go to Console Tab**: Click the "Console" tab
3. **Run Debug Script**: Copy and paste the enhanced debug script
4. **Analyze Results**: Look for attendance patterns in the output

## 🔧 Troubleshooting

### Auto-Detection Not Working?

#### Check the Page Content
- Make sure you're on an attendance/academic report page
- Verify the page has loaded completely
- Look for tables or text containing attendance numbers

#### Enable Debug Mode
1. Open browser console (F12)
2. Look for "[Bunk Mate Debug]:" messages
3. Check what the extension is finding

#### Common Issues & Solutions

**"Please navigate to TCS iON portal first"**
- Solution: Make sure you're on a TCS domain or test page

**"This page doesn't appear to contain attendance data"**
- Solution: Navigate to your actual attendance report page
- Alternative: Use manual input mode

**"No attendance data found on this page"**
- Solution: The page format might be different
- Use the debug script to analyze the page structure
- Report the issue with page details

### Manual Debug Steps

1. **Check Page Source**: Right-click → "View Page Source"
2. **Search for Numbers**: Look for attendance-related numbers
3. **Identify Patterns**: Find how total/attended classes are displayed
4. **Use Debug Script**: Run the enhanced debug script in console

## 📋 Debug Script Usage

Copy this into your browser console on any TCS iON page:

```javascript
// Copy the content from debug-extraction-enhanced.js
// This will analyze the page and show potential attendance data
```

The script will show:
- Page analysis
- Table structures
- Text patterns
- Potential numbers
- Extraction suggestions

## 🎯 Supported Page Formats

The extension can detect these attendance formats:

### Table Format
```
| Subject | Total Classes | Classes Attended |
|---------|---------------|------------------|
| Math    | 45           | 38               |
```

### Summary Format
```
Total Classes Conducted: 50
Classes Attended: 42
Attendance Percentage: 84.0%
```

### Fraction Format
```
You have attended 35/40 classes this semester.
```

### Text Format
```
Total: 52 classes were conducted.
Present: You attended 46 classes.
```

## 🔄 Version History

### v1.2.0 (Current)
- Enhanced extraction with 6 different methods
- Improved TCS iON domain support
- Better error handling and debugging
- Comprehensive test page
- Enhanced debug script

### v1.1.0
- Added auto-detection functionality
- Content script for TCS iON pages
- Improved UI with auto-detection section

### v1.0.0
- Basic attendance calculator
- Manual input only

## 🐛 Reporting Issues

If the extension doesn't work on your TCS iON page:

1. **Gather Information**:
   - TCS iON URL (remove personal info)
   - Page structure (use debug script)
   - Console errors (F12 → Console)

2. **Create Issue Report**:
   - Describe the problem
   - Include debug script output
   - Mention what attendance data is visible on the page

3. **Submit Report**:
   - Create a GitHub issue
   - Include all gathered information
   - Screenshots of the page (blur personal data)

## 💡 Tips for Best Results

- **Wait for Page Load**: Let the page fully load before using auto-detection
- **Try Multiple Times**: Click "Detect from TCS iON" multiple times if needed
- **Use Different Pages**: Try different attendance report pages
- **Manual Input**: Always available as a fallback option
- **Check Console**: Enable browser console for detailed debug info

## 🔧 Advanced Configuration

For developers or advanced users:

### Enable All Debugging
```javascript
// In browser console
localStorage.setItem('bunkMateDebug', 'true');
```

### Test Specific Selectors
```javascript
// Test if specific elements exist
inspectElement('table');
inspectElement('.attendance-table');
```

### Manual Extraction Test
```javascript
// Test extraction manually
testExtraction();
```

## 📞 Support

- **GitHub Issues**: For bugs and feature requests
- **Debug Script**: Use for immediate troubleshooting
- **Test Page**: Verify extension functionality
- **Console Logs**: Check for detailed error information
