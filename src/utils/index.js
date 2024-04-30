import { palabras as INITIAL_WORDS } from "@/constants/palabras"

const $time = document.querySelector("#tiempo")
const $paragraph = document.querySelector("#parrafo")
const $input = document.querySelector("#input")

const INITIAL_TIME = 5
let words = []

startEvents()
startGame()

function startGame () {
  words = INITIAL_WORDS.toSorted(
    () => Math.random() - 0.5
  ).slice(0, 50)

  $paragraph.innerHTML = words.map((palabra) => {
    const words = palabra.split('')

    return `
    <x-word>
    ${words
        .map(letra => `<x-letter>${letra}</x-letter>`)
        .join('')
      }
    </x-word>
    `
  }).join('')

  const $currentWord = $paragraph.querySelector('x-word')
  const $currentLetter = $currentWord.querySelector('x-letter')

  $currentWord.classList.add('active')
  $currentLetter.classList.add('active')

  timer()
}

function startEvents () {
  document.addEventListener('keydown', () => {
    $input.focus()
  })

  $input.addEventListener('keydown', onKeyDown)
  $input.addEventListener('keyup', onKeyUp)
}

function onKeyDown (event) {
  const $currentWord = $paragraph.querySelector('x-word.active')
  const $currentLetter = $currentWord.querySelector('x-letter.active')

  const { key } = event
  if (key === ' ') {
    event.preventDefault()

    const $nextWord = $currentWord.nextElementSibling
    const $nextLetter = $nextWord.querySelector('x-letter')

    $currentWord.classList.remove('active', 'marked')
    $currentLetter.classList.remove('active')

    $nextWord.classList.add('active')
    $nextLetter.classList.add('active')

    $input.value = ''

    const hasIncorrectLetters =
      $currentWord.querySelectorAll('x-letter:not(.correct)').length > 0

    const className = hasIncorrectLetters ? 'marked' : 'correct'

    $currentWord.classList.add(className)
  }
}

function onKeyUp () {
  const $currentWord = $paragraph.querySelector('x-word.active')
  const $currentLetter = $currentWord.querySelector('x-letter.active')

  const textWord = $currentWord.innerText
  $input.maxLength = textWord.length

  const $allLetters = $currentWord.querySelectorAll('x-letter')

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
    // TODO: Game over sino hay mas palabras
  }

  console.log({ value: $input.value, textWord })
}

function timer () {
  let currentTime = INITIAL_TIME
  $time.textContent = currentTime

  const clock = setInterval(() => {
    currentTime--
    $time.textContent = currentTime

    if (currentTime === 0) {
      clearInterval(clock)
      endGame()
    }
  }, 1000)
}

function endGame () { }