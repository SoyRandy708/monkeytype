import { palabras as INITIAL_WORDS } from "@/constants/palabras"

const $time = document.querySelector("#time")
const $paragraph = document.querySelector("#paragraph")
const $input = document.querySelector("#input")
const $game = document.querySelector('#game')
const $results = document.querySelector('#results')
const $wpm = document.querySelector('#results .wpm')
const $currancy = document.querySelector('#results .currancy')
const $reloadButton = document.querySelector("#button-reload")

const INITIAL_TIME = 10

let currentTime = INITIAL_TIME
let words = []
let isPlaying
let clock
let counterTypeError
// TODO: Palabras con acentos dan problemas al escribir
// TODO: Hacer que el counterTypeError no cuente errores de mas cuando hay 2 errores seguidos y se intenta correjir

startEvents()
startGame()

// TODO: CUANDO ESTE TERMINADO, AGREGAR MAS PALABRAS, PONER MAS PALABRAS INICIALES, CAMBIAR EL TIEMPO INICIAL, AGREGAR README Y PONER MIS REDES SOCIALES

function startGame () {
  $game.style.display = 'grid'
  $results.style.display = 'none'
  $input.value = ''

  clearInterval(clock)
  counterTypeError = 0
  isPlaying = false

  words = INITIAL_WORDS.toSorted(
    () => Math.random() - 0.5
  ).slice(0, 10)

  currentTime = INITIAL_TIME
  $time.textContent = currentTime

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

function startEvents () {
  document.addEventListener('keydown', () => {
    $input.focus()

    if (!isPlaying) {
      isPlaying = true
      startTimer()
    }
  })

  $input.addEventListener('keydown', onKeyUp)
  $input.addEventListener('keydown', onKeyDown)
  $reloadButton.addEventListener('click', startGame)
}

function onKeyDown (event) {
  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')

  const { key } = event
  if (key === ' ') {
    event.preventDefault()

    const $nextWord = $currentWord.nextElementSibling
    const $nextLetter = $nextWord?.querySelector('letter')

    if (!$nextWord) {
      endGame()
      return
    }

    $currentWord.classList.remove('active', 'marked')
    $currentLetter.classList.remove('active')

    $nextWord.classList.add('active')
    $nextLetter.classList.add('active')

    $input.value = ''

    const hasIncorrectLetters =
      $currentWord.querySelectorAll('letter:not(.correct)').length > 0

    const className = hasIncorrectLetters ? 'marked' : 'correct'

    $currentWord.classList.add(className)

    const $emptyLetters = $currentWord.querySelectorAll('letter:not(.correct, .incorrect)')

    $emptyLetters.forEach(letter => letter.classList.add('empty'))

    const hasEmptyLetters = $currentWord.querySelectorAll('letter.empty').length > 0

    if (hasEmptyLetters) {
      ++counterTypeError
    }

    return
  }

  if (key === 'Backspace') {
    const $prevWord = $currentWord.previousElementSibling
    const $prevLetter = $currentLetter.previousElementSibling
    const $prevWordMarked = $prevWord?.classList.contains('marked')
    const $letterToGo = $prevWord?.querySelector('letter:last-child')

    if (!$prevWord && !$prevLetter) {
      event.preventDefault()
      return
    }

    if ($prevWordMarked && !$prevLetter) {
      event.preventDefault()
      $prevWord.classList.remove('marked')
      $prevWord.classList.add('active')

      $currentLetter.classList.remove('active')
      $letterToGo.classList.add('active')

      $input.value = [
        ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
      ].map(char => char.classList.contains('correct') ? char.innerText : '*').join('')
      return
    }
  }
}

function onKeyUp () {
  const $currentWord = $paragraph.querySelector('word.active')
  const $currentLetter = $currentWord.querySelector('letter.active')
  const $allLetters = $currentWord.querySelectorAll('letter')
  const inputLength = $input.value.length
  const $nextActiveLetter = $allLetters[inputLength]

  const textWord = $currentWord.innerText
  $input.maxLength = textWord.length

  $allLetters.forEach(letter => letter.classList.remove('correct', 'incorrect'))

  $input.value.split('').forEach((letra, index) => {
    const letterToCheck = textWord[index]
    const $letter = $allLetters[index]
    const isCorrect = letra === letterToCheck
    const className = isCorrect ? 'correct' : 'incorrect'

    $letter?.classList.add(className)
  });

  let letterToWrite = $currentWord.innerText[inputLength - 1]
  let iWrote = $input.value.split('')[inputLength - 1]
  const isEqual = letterToWrite === iWrote

  // const noEsMala = $currentLetter?.classList?.contains('incorrect')

  if (inputLength > 0 && !isEqual) {
    ++counterTypeError
  }

  $currentLetter.classList.remove('active', 'is-last')

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add('active')
  } else {
    $currentLetter.classList.add('active', 'is-last')
    // TODO: Hacer que la animacion del cursor se haga correctamente en la ultima letra de la palabra
  }
}

function startTimer () {
  clock = setInterval(() => {
    currentTime--
    $time.textContent = currentTime

    if (currentTime <= 0) {
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
  const wpm = correctWords * 60 / INITIAL_TIME

  $wpm.textContent = `${wpm}`
  $currancy.textContent = `${acurrancy.toFixed(2)}%`
}