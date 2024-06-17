import { palabras as INITIAL_WORDS } from "@/constants/palabras"

const $time = document.querySelector("#time")
const $word = document.querySelector("#word")
const $paragraph = document.querySelector("#paragraph")
const $input = document.querySelector("#input")
const $game = document.querySelector('#game')
const $results = document.querySelector('#results')
const $wpm = document.querySelector('#results .wpm')
const $currancy = document.querySelector('#results .currancy')
const $reloadButtons = document.querySelectorAll(".button-reload")
const $navModifiers = document.querySelector('#modifiers')
const $gameModifierTime = document.querySelector('#modifiers .show_time')
const $gameModifierLetters = document.querySelector('#modifiers .show_words')
const $gameModifiersOptions = document.querySelectorAll('#modifiers .modifier li')

let maxInitialTime = 10
let currentTime
let isTimeActive = true
let initialWords = 100
let numberWordsPassed
let words = []
let isPlaying
let clock
let counterTypeError
// TODO: Hacer que el counterTypeError no cuente errores de mas cuando hay 2 errores seguidos y se intenta correjir
// TODO: Error al quitar la ultima letra de una palabra salta a la palabra anterior

startEvents()
resetGame()

// TODO: CUANDO ESTE TERMINADO, AGREGAR MAS PALABRAS, PONER MAS PALABRAS INICIALES, CAMBIAR EL TIEMPO INICIAL, AGREGAR README Y PONER MIS REDES SOCIALES

function resetGame () {
  $game.style.display = 'grid'
  $results.style.display = 'none'
  $navModifiers.classList.remove('hidden')
  $input.value = ''

  clearInterval(clock)
  counterTypeError = 0
  numberWordsPassed = 0
  currentTime = 0
  isPlaying = false

  formattedTime()
  formattedNumberWords()
  addWordsToParagraph()

  $paragraph.scroll({
    top: 0,
    behavior: 'smooth',
  })
}

function startGame () {
  $navModifiers.classList.add('hidden')
}

function startEvents () {
  document.addEventListener('keydown', () => {
    $input.focus()

    if (!isPlaying) {
      isPlaying = true
      startTimer()
      startGame()
    }
  })

  $input.addEventListener('keyup', onKeyLetter)
  $input.addEventListener('keyup', onKeyDown)
  $reloadButtons.forEach(button => {
    button.addEventListener('click', resetGame)
  })
  $gameModifiersOptions.forEach(mofidier => {
    mofidier.addEventListener('click', modifyGame)
  })
}

function addWordsToParagraph () {
  words = INITIAL_WORDS.toSorted(
    () => Math.random() - 0.5
  ).slice(0, initialWords)

  $paragraph.innerHTML = words.map((palabra) => {
    const words = palabra.split('')

    return `
    <word>
    ${words
        .map(letra => `<letter>${letra}</letter>`)
        .join('')
      }
    </word>
    `
  }).join('')

  const $currentWord = $paragraph.querySelector('word')
  const $currentLetter = $currentWord.querySelector('letter')

  $currentWord.classList.add('active')
  $currentLetter.classList.add('active')
}

function useTimeOrWords () {
  if (isTimeActive) {
    initialWords = 100
    $time.style.display = 'inline'
    $word.style.display = 'none'
  } else {
    $time.style.display = 'none'
    $word.style.display = 'inline'
  }

  addWordsToParagraph()
}

function formattedTime () {
  $time.textContent = `${maxInitialTime - currentTime}s`
}

function formattedNumberWords () {
  $word.textContent = `${numberWordsPassed} / ${initialWords}`
}

function onKeyDown (event) {
  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')

  $currentWord.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })

  const { key } = event
  if (key === ' ') {
    event.preventDefault()

    const $nextWord = $currentWord.nextElementSibling
    const $nextLetter = $nextWord?.querySelector('letter')

    $currentWord?.classList.remove('active', 'marked')
    $currentLetter?.classList.remove('active')
    $nextWord?.classList.add('active')
    $nextLetter?.classList.add('active')

    $input.value = ''
    numberWordsPassed++
    formattedNumberWords()

    const hasIncorrectLetters =
      $currentWord.querySelectorAll('letter:not(.correct)').length > 0
    const className = hasIncorrectLetters ? 'marked' : 'correct'
    const $emptyLetters = $currentWord.querySelectorAll('letter:not(.correct, .incorrect)')
    const hasEmptyLetters = $currentWord.querySelectorAll('letter.empty').length > 0

    $currentWord.classList.add(className)
    $emptyLetters.forEach(letter => letter.classList.add('empty'))

    if (!$nextWord) {
      endGame()
      return
    }

    if (hasEmptyLetters) {
      ++counterTypeError
    }

    return
  }

  if (key === 'Backspace') {
    const $previousWord = $currentWord.previousElementSibling
    const $previousLetter = $currentLetter.previousElementSibling
    const $previousWordMarked = $previousWord?.classList.contains('marked')

    if (!$previousWord && !$previousLetter) {
      event.preventDefault()
      return
    }

    if ($previousWordMarked && !$previousLetter) {
      event.preventDefault()
      const $previousWordAllLetters = $previousWord?.querySelectorAll('letter')
      const $previousWordLettersFilled = $previousWord?.querySelectorAll('letter:not(.empty)')
      const $letterToGo = $previousWordLettersFilled.length === 0
        ? $previousWord?.querySelector('letter:first-child')
        : $previousWordLettersFilled[$previousWordLettersFilled.length - 1].nextElementSibling ??
        $previousWordLettersFilled[$previousWordLettersFilled.length - 1]

      $previousWordAllLetters.forEach(letter => letter.classList.remove('empty'))
      $previousWord.classList.remove('marked')
      $currentWord.classList.remove('active')
      $currentLetter.classList.remove('active')
      $previousWord.classList.add('active')
      $letterToGo.classList.add('active')

      numberWordsPassed--
      formattedNumberWords()

      $input.value = [
        ...$previousWord.querySelectorAll('letter.correct, letter.incorrect')
      ].map(char => char.classList.contains('correct') ? char.innerText : '*').join('')
      return
    }
  }
}

function onKeyLetter (event) {
  const { key } = event
  if (key === ' ') return

  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')
  const $lastLetter = $currentWord.querySelector('letter:last-child')
  const $allLetters = $currentWord.querySelectorAll('letter')
  const inputLength = $input.value.length
  const inputLetters = $input.value.split('')
  const nextActiveLetter = $allLetters[inputLength]
  const textWord = $currentWord.innerText
  const letterToWrite = textWord[inputLength - 1]
  const iWrote = inputLetters[inputLength - 1]
  const isEqual = letterToWrite === iWrote

  $input.maxLength = textWord.length
  $allLetters.forEach(letter => letter.classList.remove('correct', 'incorrect'))

  inputLetters.forEach((letra, index) => {
    const letterToCheck = textWord[index]
    const $letter = $allLetters[index]
    const isCorrect = letra === letterToCheck
    const className = isCorrect ? 'correct' : 'incorrect'

    $letter?.classList.add(className)
  });

  if (inputLength > 0 && !isEqual) {
    ++counterTypeError
  }

  $currentLetter.classList.remove('active', 'is-last', 'empty')

  if (nextActiveLetter) {
    nextActiveLetter.classList.add('active')
  } else {
    $lastLetter.classList.add('active', 'is-last')
  }
}

function modifyGame (event) {
  const classNameParent = event.target.parentElement.classList
  const element = event.target

  $gameModifiersOptions.forEach(modifier => {
    modifier.classList.remove('active')
  })

  if (classNameParent.contains('time')) {
    $gameModifierTime.classList.add('active')
    $gameModifierLetters.classList.remove('active')
    element.classList.add('active')

    maxInitialTime = element.textContent
    formattedTime()
    isTimeActive = true
  } else if (classNameParent.contains('words')) {
    $gameModifierTime.classList.remove('active')
    $gameModifierLetters.classList.add('active')
    element.classList.add('active')

    initialWords = element.textContent
    formattedNumberWords()
    isTimeActive = false
  }

  useTimeOrWords()
}

function startTimer () {
  clock = setInterval(() => {
    currentTime++
    formattedTime()

    if (maxInitialTime - currentTime === 0 && isTimeActive) {
      clearInterval(clock)
      endGame()
    }
  }, 1000)
}

function endGame () {
  $game.style.display = 'none'
  $results.style.display = 'grid'

  const correctWords = $paragraph.querySelectorAll('word.correct').length
  const correctLetters = $paragraph.querySelectorAll('letter.correct').length
  const incorrectLetters = $paragraph.querySelectorAll('letter.incorrect').length

  const totalLetters = correctLetters + incorrectLetters + counterTypeError
  const acurrancy = totalLetters > 0
    ? (correctLetters / totalLetters) * 100
    : 0
  const wpm = correctWords * 60 / currentTime

  $wpm.textContent = `${Math.trunc(wpm)}`
  $currancy.textContent = `${acurrancy.toFixed(2)}%`
}