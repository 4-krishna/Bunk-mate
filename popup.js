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

        const percentage = (attended / total) * 100;
        const requiredPercentage = 75;
        let statusMessage = '';
        let statusClass = percentage >= requiredPercentage ? 'good' : 'danger';

        if (percentage >= requiredPercentage) {
            // Calculate how many classes can be safely skipped
            const maxSkippable = Math.floor((100 * attended - requiredPercentage * total) / requiredPercentage);
            const futureTotal = total + maxSkippable;
            const futurePercentage = (attended / futureTotal) * 100;

            statusMessage = `You can bunk for ${maxSkippable} more hours\n`;
            statusMessage += `Current Attendance: ${attended}/${total} -> ${percentage.toFixed(2)}%\n`;
            statusMessage += `Attendance Then: ${attended}/${futureTotal} -> ${futurePercentage.toFixed(2)}%`;
        } else {
            // Calculate classes needed to reach 75%
            const classesNeeded = Math.ceil((requiredPercentage * total - 100 * attended) / (100 - requiredPercentage));
            const futureTotal = total + classesNeeded;
            const futureAttended = attended + classesNeeded;

            statusMessage = `You need to attend ${classesNeeded} more classes to attain ${requiredPercentage}% attendance\n`;
            statusMessage += `Current Attendance: ${attended}/${total} -> ${percentage.toFixed(2)}%\n`;
            statusMessage += `Attendance Required: ${futureAttended}/${futureTotal} -> ${requiredPercentage.toFixed(2)}%`;
        }

        percentageDiv.textContent = `${percentage.toFixed(2)}%`;
        statusDiv.textContent = statusMessage;
        statusDiv.className = 'status ' + statusClass;
        resultDiv.style.display = 'block';
    });
});