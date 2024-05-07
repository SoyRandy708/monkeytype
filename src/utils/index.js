import { palabras as INITIAL_WORDS } from "@/constants/palabras"

const $time = document.querySelector("#time")
const $paragraph = document.querySelector("#paragraph")
const $input = document.querySelector("#input")
const $game = document.querySelector('#game')
const $results = document.querySelector('#results')
const $wpm = document.querySelector('#results .wpm')
const $currancy = document.querySelector('#results .currancy')
const $reloadButton = document.querySelector("#button-reload")

const INITIAL_TIME = 3

let currentTime = INITIAL_TIME
let words = []
let playing
let clock

startEvents()
startGame()

// TODO: CUANDO ESTE TERMINADO, AGREGAR MAS PALABRAS, PONER MAS PALABRAS INICIALES, CAMBIAR EL TIEMPO INICIAL, AGREGAR README Y PONER MIS REDES SOCIALES

function startGame () {
  $game.style.display = 'grid'
  $results.style.display = 'none'
  $input.value = ''
  clearInterval(clock)

  playing = false
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

    if (!playing) {
      playing = true
      startTimer()
    }
  })

  $input.addEventListener('keydown', onKeyDown)
  $input.addEventListener('keyup', onKeyUp)
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
    return
  }

  if (key === 'Backspace') {
    const $prevWord = $currentWord.previousElementSibling
    const $prevLetter = $currentLetter.previousElementSibling

    if (!$prevWord && !$prevLetter) {
      event.preventDefault()
      return
    }

    // TODO: Hacer que solo se pueda regresar hacia atras solo si la palabra anterior esta mal y no una que sea mas lejana
    const $wordMarked = $paragraph.querySelector('word.marked')

    if ($wordMarked && !$prevLetter) {
      event.preventDefault()
      $prevWord.classList.remove('marked')
      $prevWord.classList.add('active')

      const $letterToGo = $prevWord.querySelector('letter:last-child')
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

  const textWord = $currentWord.innerText
  $input.maxLength = textWord.length

  const $allLetters = $currentWord.querySelectorAll('letter')

  $allLetters.forEach(letter => letter.classList.remove('correct', 'incorrect'))

  $input.value.split('').forEach((letra, index) => {
    const letterToCheck = textWord[index]
    const $letter = $allLetters[index]

    const isCorrect = letra === letterToCheck
    const className = isCorrect ? 'correct' : 'incorrect'
    $letter.classList.add(className)
  });

  $currentLetter.classList.remove('active', 'is-last')
  const inputLength = $input.value.length
  const $nextActiveLetter = $allLetters[inputLength]

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

  const totalLetters = correctLetters + incorrectLetters
  const acurrancy = totalLetters > 0
    ? (correctLetters / totalLetters) * 100
    : 0
  const wpm = correctWords * 60 / INITIAL_TIME

  $wpm.textContent = `${wpm}`
  $currancy.textContent = `${acurrancy.toFixed(2)}%`
}