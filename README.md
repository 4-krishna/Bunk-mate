# Bunk Mate

Bunk Mate is a minimalist Chrome extension designed to help students track their attendance percentage efficiently. With its clean and intuitive interface, students can quickly calculate their current attendance percentage and make informed decisions about class attendance.

## Features

- **Simple Interface**: Clean and modern design for easy interaction
- **Real-time Calculations**: Instantly calculate attendance percentage
- **Visual Feedback**: Color-coded status indicators for different attendance levels
- **Responsive Design**: Smooth animations and transitions for better user experience

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the Bunk Mate extension icon in your Chrome toolbar
2. Enter the total number of classes in the semester
3. Enter the number of classes you've attended
4. Click "Calculate" to see your attendance percentage
5. The result will show your current percentage along with a status indicator:
   - Green: Good attendance
   - Orange: Warning level
   - Red: Critical level

## Technical Details

- Built with vanilla JavaScript for optimal performance
- Uses Chrome Storage API for data persistence
- Modern CSS with CSS variables for theming
- Responsive design with smooth transitions

## Project Structure

```
├── manifest.json      # Extension configuration
├── popup.html        # Main UI interface
├── popup.js          # Core logic implementation
├── icon48.png        # Extension icon (48x48)
├── icon128.png       # Extension icon (128x128)
└── tests/            # Test files
    ├── popup.test.js
    ├── content.test.js
    ├── background.test.js
    └── setup.js
```

## Development

To contribute to the development:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## Testing

The project includes a comprehensive test suite. To run the tests:

```bash
npm install
npm test
```

## License

This project is open source and available under the MIT License.

## Author

[Krishna](https://github.com/4-krishna)