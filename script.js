class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement, expressionPreviewElement) {
        this.previousOperandTextElement = previousOperandTextElement
        this.currentOperandTextElement = currentOperandTextElement
        this.historyListElement = historyListElement
        this.expressionPreviewElement = expressionPreviewElement
        this.history = JSON.parse(localStorage.getItem('calc_history')) || []
        this.clear()
        this.renderHistory()
    }

    clear() {
        this.currentOperand = '0'
        this.previousOperand = ''
        this.operation = undefined
        this.updatePreview()
    }

    delete() {
        if (this.currentOperand === '0') return
        this.currentOperand = this.currentOperand.toString().slice(0, -1)
        if (this.currentOperand === '') this.currentOperand = '0'
        this.updatePreview()
    }

    appendNumber(number) {
        if (this.currentOperand === "Error") this.clear()
        if (number === '.' && this.currentOperand.includes('.')) return
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString()
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString()
        }
        this.updatePreview()
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return
        if (this.previousOperand !== '') {
            this.compute()
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
        this.updatePreview()
    }

    compute() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current)) return
        switch (this.operation) {
            case '+': computation = prev + current; break
            case '-': computation = prev - current; break
            case '*': computation = prev * current; break
            case '/':
                if (current === 0) {
                    this.currentOperand = "Error"
                    this.operation = undefined
                    this.previousOperand = ''
                    this.updatePreview()
                    return
                }
                computation = prev / current
                break
            default: return
        }

        const fullOperation = `${this.previousOperand} ${this.operation} ${this.currentOperand} = ${computation}`
        this.addHistory(fullOperation)

        this.currentOperand = computation.toString()
        this.operation = undefined
        this.previousOperand = ''
        this.updatePreview()
    }

    computeScientific(type) {
        let result
        const current = parseFloat(this.currentOperand)
        if (isNaN(current)) return

        switch (type) {
            case 'sin': result = Math.sin(current * Math.PI / 180); break
            case 'cos': result = Math.cos(current * Math.PI / 180); break
            case 'tan': result = Math.tan(current * Math.PI / 180); break
            case 'sqrt': result = Math.sqrt(current); break
            case 'sq': result = Math.pow(current, 2); break
            case 'log': result = Math.log10(current); break
            case 'pi': result = Math.PI; break
            default: return
        }

        this.addHistory(`${type}(${current}) = ${result}`)
        this.currentOperand = result.toString()
        this.updateDisplay()
        this.updatePreview()
    }

    addHistory(item) {
        this.history.unshift(item)
        if (this.history.length > 10) this.history.pop()
        localStorage.setItem('calc_history', JSON.stringify(this.history))
        this.renderHistory()
    }

    renderHistory() {
        if (!this.historyListElement) return
        this.historyListElement.innerHTML = ''
        this.history.forEach(item => {
            const li = document.createElement('li')
            li.innerText = item
            this.historyListElement.appendChild(li)
        })
    }

    clearHistory() {
        this.history = []
        localStorage.removeItem('calc_history')
        this.renderHistory()
    }

    updatePreview() {
        if (!this.expressionPreviewElement) return
        let previewText = ''
        if (this.previousOperand !== '') {
            previewText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation} ${this.currentOperand === '' ? '' : this.getDisplayNumber(this.currentOperand)}`
        } else {
            previewText = this.currentOperand === '0' ? '' : this.getDisplayNumber(this.currentOperand)
        }
        this.expressionPreviewElement.innerText = previewText
    }

    getDisplayNumber(number) {
        if (number === "Error") return "Error"
        if (number === Math.PI.toString()) return "π"
        const stringNumber = number.toString()
        const parts = stringNumber.split('.')
        const integerDigits = parseFloat(parts[0])
        const decimalDigits = parts[1]
        let integerDisplay
        if (isNaN(integerDigits)) {
            integerDisplay = ''
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 })
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`
        } else {
            return integerDisplay
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand)
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
        } else {
            this.previousOperandTextElement.innerText = ''
        }
    }
}

class StatsAnalyzer {
    static calculateMean(data) {
        return data.reduce((a, b) => a + b, 0) / data.length
    }

    static calculateMedian(data) {
        const sorted = [...data].sort((a, b) => a - b)
        const middle = Math.floor(sorted.length / 2)
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        }
        return sorted[middle]
    }

    static calculateMode(data) {
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
    }

    static calculateStdDev(data) {
        const mean = this.calculateMean(data)
        const squareDiffs = data.map(n => Math.pow(n - mean, 2))
        const avgSquareDiff = this.calculateMean(squareDiffs)
        return Math.sqrt(avgSquareDiff)
    }
}

let statsChart = null

// UI Elements & State
const statsPanel = document.getElementById('stats-panel')
const calculatorMainUI = document.getElementById('calculator-main-ui')
const toggleStatsBtn = document.getElementById('toggle-stats')
const statsInput = document.getElementById('stats-input')
const analyzeBtn = document.getElementById('analyze-btn')
const csvFileInput = document.getElementById('csv-file')

// Mode Toggle
toggleStatsBtn.addEventListener('click', () => {
    statsPanel.classList.toggle('active')
    calculatorMainUI.classList.toggle('hidden')
    toggleStatsBtn.innerText = statsPanel.classList.contains('active') ? '🔢' : '📊'
})

// Data Analysis Logic
function performAnalysis(data) {
    if (data.length === 0) return

    const mean = StatsAnalyzer.calculateMean(data)
    const median = StatsAnalyzer.calculateMedian(data)
    const mode = StatsAnalyzer.calculateMode(data)
    const stdDev = StatsAnalyzer.calculateStdDev(data)

    document.getElementById('mean-val').innerText = mean.toFixed(2)
    document.getElementById('median-val').innerText = median.toFixed(2)
    document.getElementById('mode-val').innerText = mode
    document.getElementById('std-val').innerText = stdDev.toFixed(2)

    updateChart(data)
}

function updateChart(data) {
    const ctx = document.getElementById('stats-chart').getContext('2d')

    if (statsChart) {
        statsChart.destroy()
    }

    statsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i + 1),
            datasets: [{
                label: 'Data Values',
                data: data,
                borderColor: '#00ffff',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    })
}

// Event Listeners
analyzeBtn.addEventListener('click', () => {
    const input = statsInput.value
    const data = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
    performAnalysis(data)
})

csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        const text = event.target.result
        const data = text.split(/[\n,]/).map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
        statsInput.value = data.join(', ')
        performAnalysis(data)
    }
    reader.readAsText(file)
})

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Registration Failed', err))
    })
}

// DOM Elements
const numberButtons = document.querySelectorAll('[data-number]')
const operationButtons = document.querySelectorAll('[data-operation]')
const sciButtons = document.querySelectorAll('[data-sci]')
const equalsButton = document.querySelector('[data-equals]')
const deleteButton = document.querySelector('[data-delete]')
const allClearButton = document.querySelector('[data-all-clear]')
const previousOperandTextElement = document.getElementById('previous-operand')
const currentOperandTextElement = document.getElementById('current-operand')
const historyListElement = document.getElementById('history-list')
const expressionPreviewElement = document.getElementById('expression-preview')

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement, expressionPreviewElement)

// Multiple Themes
const themeSelect = document.getElementById('theme-select')
const savedTheme = localStorage.getItem('theme_v3') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)
themeSelect.value = savedTheme

themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme_v3', theme)
})

// History Toggle
const toggleHistoryBtn = document.getElementById('toggle-history')
const historyPanel = document.getElementById('history-panel')
toggleHistoryBtn.addEventListener('click', () => {
    historyPanel.style.display = historyPanel.style.display === 'block' ? 'none' : 'block'
})
document.getElementById('clear-history').addEventListener('click', () => calculator.clearHistory())

// Scientific Toggles
document.getElementById('toggle-sci-mode').addEventListener('click', () => {
    document.getElementById('scientific-buttons').classList.toggle('active')
})

// Copy
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentOperandTextElement.innerText).then(() => {
        const btn = document.getElementById('copy-btn')
        btn.innerText = 'check'
        setTimeout(() => btn.innerText = 'content_copy', 2000)
    })
})

// Voice Recognition
const voiceBtn = document.getElementById('voice-btn')
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'

    voiceBtn.addEventListener('click', () => {
        recognition.start()
        voiceBtn.classList.add('voice-active')
    })

    recognition.onresult = (event) => {
        voiceBtn.classList.remove('voice-active')
        const result = event.results[0][0].transcript.toLowerCase()
        processVoice(result)
    }

    recognition.onerror = () => voiceBtn.classList.remove('voice-active')
} else {
    voiceBtn.style.display = 'none'
}

function processVoice(text) {
    // Basic Voice Mapping
    const map = { 'plus': '+', 'minus': '-', 'times': '*', 'divided by': '/', 'multiplied by': '*' }
    Object.keys(map).forEach(key => text = text.replace(key, map[key]))

    // Attempt parsing (e.g., "5 plus 10")
    const parts = text.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/)
    if (parts) {
        calculator.clear()
        calculator.appendNumber(parts[1])
        calculator.chooseOperation(parts[2])
        calculator.appendNumber(parts[3])
        calculator.compute()
        calculator.updateDisplay()
    }
}

// Keyboard
window.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9) calculator.appendNumber(e.key)
    if (e.key === '.') calculator.appendNumber(e.key)
    if (e.key === '=' || e.key === 'Enter') calculator.compute()
    if (e.key === 'Backspace') calculator.delete()
    if (e.key === 'Escape') calculator.clear()
    if (['+', '-', '*', '/'].includes(e.key)) calculator.chooseOperation(e.key)
    calculator.updateDisplay()
})

numberButtons.forEach(btn => btn.addEventListener('click', () => { calculator.appendNumber(btn.innerText); calculator.updateDisplay() }))
operationButtons.forEach(btn => btn.addEventListener('click', () => { calculator.chooseOperation(btn.getAttribute('data-operation') || btn.innerText); calculator.updateDisplay() }))
sciButtons.forEach(btn => btn.addEventListener('click', () => calculator.computeScientific(btn.getAttribute('data-sci'))))
equalsButton.addEventListener('click', () => { calculator.compute(); calculator.updateDisplay() })
allClearButton.addEventListener('click', () => { calculator.clear(); calculator.updateDisplay() })
deleteButton.addEventListener('click', () => { calculator.delete(); calculator.updateDisplay() })
