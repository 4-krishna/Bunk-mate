document.addEventListener('DOMContentLoaded', function() {
    const totalClassesInput = document.getElementById('totalClasses');
    const attendedClassesInput = document.getElementById('attendedClasses');
    const calculateButton = document.getElementById('calculate');
    const resultDiv = document.getElementById('result');
    const percentageDiv = document.getElementById('percentage');
    const statusDiv = document.getElementById('status');

    // Load saved values if any
    chrome.storage.local.get(['totalClasses', 'attendedClasses'], (result) => {
        if (result.totalClasses) totalClassesInput.value = result.totalClasses;
        if (result.attendedClasses) attendedClassesInput.value = result.attendedClasses;
    });

    // Input validation for both inputs
    const validateInputs = () => {
        const total = parseInt(totalClassesInput.value) || 0;
        const attended = parseInt(attendedClassesInput.value) || 0;

        if (total < 0) totalClassesInput.value = 0;
        if (attended < 0) attendedClassesInput.value = 0;
        if (attended > total) attendedClassesInput.value = total;

        return { total, attended };
    };

    totalClassesInput.addEventListener('input', validateInputs);
    attendedClassesInput.addEventListener('input', validateInputs);

    calculateButton.addEventListener('click', () => {
        const { total, attended } = validateInputs();

        if (total <= 0) {
            alert('Please enter a valid number of total classes');
            return;
        }

        // Save values
        chrome.storage.local.set({
            totalClasses: total,
            attendedClasses: attended
        });

        const percentage = Math.min(100, (attended / total) * 100);
        percentageDiv.textContent = `${percentage.toFixed(1)}%`;

        // Update status message and style
        let statusMessage, statusClass;
        if (percentage >= 85) {
            statusMessage = 'You\'re doing great! 🎉';
            statusClass = 'good';
        } else if (percentage >= 75) {
            statusMessage = 'Almost there! Keep it up! 💪';
            statusClass = 'warning';
        } else {
            statusMessage = 'Need to attend more classes! 📚';
            statusClass = 'danger';
        }

        statusDiv.textContent = statusMessage;
        statusDiv.className = 'status ' + statusClass;
        resultDiv.style.display = 'block';

        // Calculate bunking possibilities
        const requiredPercentage = 75;
        
        if (percentage < requiredPercentage) {
            // Calculate classes needed to reach 75%
            const classesNeeded = Math.ceil((requiredPercentage * total - 100 * attended) / (100 - requiredPercentage));
            if (classesNeeded > 0) {
                statusDiv.textContent = `${statusMessage}\n\nYou need to attend ${classesNeeded} more class${classesNeeded === 1 ? '' : 'es'} to reach ${requiredPercentage}%`;
            }
        } else {
            // Calculate how many classes can be safely skipped
            const maxSkippable = Math.floor((100 * attended - requiredPercentage * total) / requiredPercentage);
            if (maxSkippable > 0) {
                statusDiv.textContent = `${statusMessage}\n\nYou can safely skip ${maxSkippable} more class${maxSkippable === 1 ? '' : 'es'} while maintaining ${requiredPercentage}%`;
            }
        }
    });
});