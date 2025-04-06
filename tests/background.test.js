const { calculateAttendanceStatus } = require('../background');

describe('Attendance Calculations', () => {
    test('should correctly calculate status when attendance is above 75%', () => {
        const result = calculateAttendanceStatus(100, 80);
        expect(result.status).toBe('above');
        expect(parseFloat(result.currentPercentage)).toBe(80.00);
        expect(result.canSkip).toBe(6); // (80/0.75) - 100 = 6.67, floor to 6
    });

    test('should correctly calculate status when attendance is below 75%', () => {
        const result = calculateAttendanceStatus(100, 70);
        expect(result.status).toBe('below');
        expect(parseFloat(result.currentPercentage)).toBe(70.00);
        expect(result.needToAttend).toBe(20); // (0.75*100 - 70)/(1-0.75) = 20
    });

    test('should handle edge case with exactly 75% attendance', () => {
        const result = calculateAttendanceStatus(100, 75);
        expect(result.status).toBe('above');
        expect(parseFloat(result.currentPercentage)).toBe(75.00);
        expect(result.canSkip).toBe(0);
    });

    test('should handle small numbers correctly', () => {
        const result = calculateAttendanceStatus(10, 8);
        expect(result.status).toBe('above');
        expect(parseFloat(result.currentPercentage)).toBe(80.00);
        expect(result.canSkip).toBe(0);
    });
});