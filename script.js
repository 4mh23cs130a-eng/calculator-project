class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement) {
        this.previousOperandTextElement = previousOperandTextElement
        this.currentOperandTextElement = currentOperandTextElement
        this.historyListElement = historyListElement
        this.history = []
        this.clear()
    }

    clear() {
        this.currentOperand = '0'
        this.previousOperand = ''
        this.operation = undefined
    }

    delete() {
        if (this.currentOperand === '0') return
        this.currentOperand = this.currentOperand.toString().slice(0, -1)
        if (this.currentOperand === '') this.currentOperand = '0'
    }

    appendNumber(number) {
        if (this.currentOperand === "Error") this.clear()
        if (number === '.' && this.currentOperand.includes('.')) return
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString()
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString()
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return
        if (this.previousOperand !== '') {
            this.compute()
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
    }

    compute() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current)) return
        switch (this.operation) {
            case '+':
                computation = prev + current
                break
            case '-':
                computation = prev - current
                break
            case '*':
                computation = prev * current
                break
            case '/':
                if (current === 0) {
                    this.currentOperand = "Error"
                    this.operation = undefined
                    this.previousOperand = ''
                    return
                }
                computation = prev / current
                break
            default:
                return
        }

        const fullOperation = `${this.previousOperand} ${this.operation} ${this.currentOperand} = ${computation}`
        this.addHistory(fullOperation)

        this.currentOperand = computation.toString()
        this.operation = undefined
        this.previousOperand = ''
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
    }

    addHistory(item) {
        this.history.unshift(item)
        if (this.history.length > 10) this.history.pop()
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
        this.renderHistory()
    }

    getDisplayNumber(number) {
        if (number === "Error") return "Error"
        if (number === Math.PI.toString()) return "3.14159..."
        const stringNumber = number.toString()
        const integerDigits = parseFloat(stringNumber.split('.')[0])
        const decimalDigits = stringNumber.split('.')[1]
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


const numberButtons = document.querySelectorAll('[data-number]')
const operationButtons = document.querySelectorAll('[data-operation]')
const sciButtons = document.querySelectorAll('[data-sci]')
const equalsButton = document.querySelector('[data-equals]')
const deleteButton = document.querySelector('[data-delete]')
const allClearButton = document.querySelector('[data-all-clear]')
const previousOperandTextElement = document.getElementById('previous-operand')
const currentOperandTextElement = document.getElementById('current-operand')
const historyListElement = document.getElementById('history-list')

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement)

// Theme Toggle
const themeToggleButton = document.getElementById('theme-toggle')
if (localStorage.getItem('theme') === 'light') document.documentElement.setAttribute('data-theme', 'light')
themeToggleButton.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme')
    theme = theme === 'light' ? 'dark' : 'light'
    theme === 'light' ? document.documentElement.setAttribute('data-theme', 'light') : document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', theme)
})

// History Panel Toggle
const toggleHistoryBtn = document.getElementById('toggle-history')
const historyPanel = document.getElementById('history-panel')
toggleHistoryBtn.addEventListener('click', () => {
    historyPanel.style.display = historyPanel.style.display === 'block' ? 'none' : 'block'
})
document.getElementById('clear-history').addEventListener('click', () => calculator.clearHistory())

// Scientific Mode Toggle
const toggleSciBtn = document.getElementById('toggle-sci-mode')
const sciPanel = document.getElementById('scientific-buttons')
toggleSciBtn.addEventListener('click', () => {
    sciPanel.classList.toggle('active')
})

// Copy Button
document.getElementById('copy-btn').addEventListener('click', () => {
    const text = currentOperandTextElement.innerText
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-btn')
        btn.innerText = 'check'
        setTimeout(() => btn.innerText = 'content_copy', 2000)
    })
})

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

numberButtons.forEach(button => button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText)
    calculator.updateDisplay()
}))

operationButtons.forEach(button => button.addEventListener('click', () => {
    calculator.chooseOperation(button.getAttribute('data-operation') || button.innerText)
    calculator.updateDisplay()
}))

sciButtons.forEach(button => button.addEventListener('click', () => {
    calculator.computeScientific(button.getAttribute('data-sci'))
}))

equalsButton.addEventListener('click', () => { calculator.compute(); calculator.updateDisplay() })
allClearButton.addEventListener('click', () => { calculator.clear(); calculator.updateDisplay() })
deleteButton.addEventListener('click', () => { calculator.delete(); calculator.updateDisplay() })
