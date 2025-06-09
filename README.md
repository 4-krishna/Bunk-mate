# 🎯 Bunk Mate - Smart Attendance Manager

**The ultimate Chrome extension that answers the question: "How many classes can I safely bunk?"**

> **MVP Philosophy**: *TCS already shows your attendance percentage - what you really need to know is how many classes you can skip while maintaining your target attendance!*

## ✨ Key Features

### 🚀 **Primary Feature: Smart Bunk Calculator**
- **Large, prominent bunk calculator** as the main feature
- **Hero-sized result display** showing exactly how many classes you can bunk
- **Target percentage setting** (default: 75% - adjustable)
- **Real-time calculations** with clear messaging: *"You can safely skip X more classes!"*
- **Warning system** if attendance is too low

### 🔍 **Auto-Detection**
- **Zero-click data extraction** from TCS iON portal
- **Compact status indicator** for detection progress
- **Works across multiple TCS platforms** (iON, Digital Academy, Fresco Play)
- **Automatic refresh** of data when popup opens

### 📝 **Manual Input Fallback**
- **Collapsible manual input** (only shown if auto-detection fails)
- **Input validation** to prevent errors
- **Data persistence** using Chrome storage
- **Quick update functionality**

### 🎨 **Modern MVP Design**
- **Bunk-calculator-first visual hierarchy**
- **Compact 400px mobile-optimized layout**
- **Beautiful gradient interface** with smooth animations
- **Color-coded results** (success/warning/danger states)
- **Clean, intuitive user flow**

## 🚀 Installation

### Quick Setup (Developer Mode)
1. **Download/Clone** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (top-right toggle)
4. **Click "Load unpacked"** and select the `Bunk-mate` folder
5. **Pin the extension** for easy access

### Alternative: Package Installation
```bash
# In Chrome Extensions page
# Click "Pack extension"
# Select Bunk-mate folder
# Install the generated .crx file
```

## 💡 How to Use

### **Primary Workflow (MVP)**
1. **Open Extension** → Immediately see "Calculate My Safe Bunks" button
2. **Auto-Detection** → Extension pulls data from TCS (if on supported page)
3. **Set Target** → Adjust minimum attendance % (default 75%)
4. **Calculate** → Get instant answer: "You can bunk X classes!"
5. **Done** → You have your answer in seconds!

### **Manual Input (Fallback)**
1. **Open the extension** on any page
2. **Expand manual input section** (if auto-detection fails)
3. **Enter attendance data** (classes attended / total classes)
4. **Click "Update Data"**
5. **Use bunk calculator** as normal

## 🎯 Bunk Calculator Logic

The smart algorithm calculates:
- **Current attendance percentage**
- **Required classes to maintain target percentage**
- **Maximum safe bunks** for future classes
- **Warnings and recommendations** based on current status

### Example Scenarios:
- **✅ Safe Zone**: "You can bunk 8 more classes!"
- **⚠️ Warning Zone**: "You need to attend 3 more classes first!"
- **❌ Danger Zone**: "You're at the minimum - can't bunk any more!"

## 🔧 Supported Platforms

- **TCS iON** (g21.tcsion.com, etc.)
- **TCS Digital Academy** (ion.digitalacademy.tcs.com)
- **Fresco Play** (fresco.tcs.com)
- **TCS Corporate platforms**
- **Manual input works everywhere**

## 📁 Project Structure

```
Bunk-mate/
├── manifest.json                     # Extension configuration
├── popup-mvp.html                   # MVP-focused popup interface
├── src/
│   ├── scripts/
│   │   ├── content.js              # TCS page data extraction
│   │   └── popup.js                # Main popup logic (class-based)
│   ├── styles/
│   │   └── popup-mvp-focused.css   # Bunk-calculator-first styling
│   └── assets/
│       ├── icon48.png              # Extension icons
│       └── icon128.png
└── docs/                            # Documentation
```

## 🧪 Testing

### **Test on TCS iON**
1. Navigate to your TCS iON attendance page
2. Click the Bunk Mate icon
3. Verify auto-detection works
4. Test bunk calculator with different target percentages

### **Test Manual Input**
1. Open extension on any page
2. Expand manual input section
3. Enter sample data (e.g., 45 attended, 60 total)
4. Verify calculations are correct

### **Test Edge Cases**
- Very low attendance (below target)
- Perfect attendance (100%)
- Target percentage changes
- Invalid input handling

## 🔄 Version History

### **Version 2.1.0 - MVP Focus** (Current)
- ✅ **MVP transformation**: Bunk calculator as hero feature
- ✅ **Streamlined UI**: Compact, bunk-focused design
- ✅ **Enhanced algorithm**: Improved bunk calculation logic
- ✅ **Clean codebase**: Organized structure, removed duplicates
- ✅ **Mobile-optimized**: 400px responsive layout

### **Version 2.0.0 - Major Cleanup**
- ✅ Auto-detection on popup open
- ✅ Redesigned UI with gradients
- ✅ Smart Bunk Calculator as main feature
- ✅ Removed debug files, improved performance
- ✅ Class-based architecture, modular code

## 🐛 Troubleshooting

### **Extension Issues**
- **Not detecting data?** → Ensure you're on a TCS iON attendance page
- **Popup not opening?** → Check if extension is enabled in chrome://extensions/
- **Auto-detection failed?** → Use manual input as fallback

### **Calculation Issues**
- **Wrong bunk count?** → Verify input numbers and target percentage
- **No result shown?** → Check that attendance data is loaded first
- **Unexpected warnings?** → Review current attendance vs target percentage

### **Performance Issues**
- **Slow loading?** → Try refreshing the page and reopening extension
- **Data not saving?** → Check Chrome storage permissions

## 🤝 Contributing

### **Development Setup**
1. Clone the repository
2. Make changes to source files
3. Test in Chrome developer mode
4. Submit pull requests

### **Reporting Issues**
- Use GitHub Issues for bug reports
- Include browser version and TCS platform details
- Provide steps to reproduce

## 📊 Technical Details

### **Architecture**
- **Content Script**: Extracts data from TCS pages using multiple selectors
- **Popup Script**: Class-based architecture with error handling
- **Storage**: Chrome storage API for data persistence
- **Permissions**: Minimal required permissions for security

### **Browser Compatibility**
- Chrome 88+ (Manifest V3)
- Edge Chromium-based
- Other Chromium browsers

## 📧 Contact & Support

**Made with ❤️ for students who want to bunk smartly!**

- **GitHub**: [@4-krishna](https://github.com/4-krishna)
- **Issues**: Use GitHub Issues for support
- **Email**: Available in GitHub profile

---

## 🎉 Quick Start Summary

1. **Install** → Load unpacked in Chrome extensions
2. **Open** → Click extension icon on TCS page
3. **Calculate** → Hit "Calculate My Safe Bunks"
4. **Bunk** → Follow the recommendation safely!

**⭐ Star this repo if Bunk Mate helped you plan your bunks smartly!**

> **Remember**: Use responsibly and maintain good attendance for your academic success! 🎓
