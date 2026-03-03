// Minimal test script for StatsAnalyzer logic
const StatsAnalyzer = {
    calculateMean(data) {
        return data.reduce((a, b) => a + b, 0) / data.length
    },
    calculateMedian(data) {
        const sorted = [...data].sort((a, b) => a - b)
        const middle = Math.floor(sorted.length / 2)
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        }
        return sorted[middle]
    },
    calculateMode(data) {
        const counts = {}
        data.forEach(n => counts[n] = (counts[n] || 0) + 1)
        let maxCount = 0
        let modes = []
        for (const n in counts) {
            if (counts[n] > maxCount) {
                maxCount = counts[n]
                modes = [Number(n)]
            } else if (counts[n] === maxCount) {
                modes.push(Number(n))
            }
        }
        if (modes.length === data.length) return "None"
        return modes.join(', ')
    },
    calculateStdDev(data) {
        const mean = this.calculateMean(data)
        const squareDiffs = data.map(n => Math.pow(n - mean, 2))
        const avgSquareDiff = this.calculateMean(squareDiffs)
        return Math.sqrt(avgSquareDiff)
    }
}

const testData = [10, 20, 30, 40]
console.log("Test Data:", testData)
console.log("Mean:", StatsAnalyzer.calculateMean(testData), "(Expected: 25)")
console.log("Median:", StatsAnalyzer.calculateMedian(testData), "(Expected: 25)")
console.log("Mode:", StatsAnalyzer.calculateMode(testData), "(Expected: None)")
console.log("Std Dev:", StatsAnalyzer.calculateStdDev(testData).toFixed(2), "(Expected: 11.18)")

const testData2 = [1, 2, 2, 3, 4]
console.log("\nTest Data 2:", testData2)
console.log("Mode:", StatsAnalyzer.calculateMode(testData2), "(Expected: 2)")
