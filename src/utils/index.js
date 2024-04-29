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
    <x-palabra>
    ${words
        .map(letra => `<x-letra>${letra}</x-letra>`)
        .join('')
      }
    </x-palabra>
    `
  }).join('')

  const $currentWord = $paragraph.querySelector('x-palabra')
  const $currentLetter = $currentWord.querySelector('x-letra')

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
  const { key } = event

  if (key === ' ') {
    console.log('space')
  }

}

function onKeyUp () {
  const $currentWord = $paragraph.querySelector('x-palabra.active')
  const $currentLetter = $currentWord.querySelector('x-letra.active')

  const textWord = $currentWord.innerText
  $input.maxLength = textWord.length

  const allLetters = $currentWord.querySelectorAll('x-letra')

  allLetters.forEach(letter => letter.classList.remove('correct', 'incorrect'))

  $input.value.split('').forEach((letra, index) => {
    const letterToCheck = textWord[index]
    const $letter = allLetters[index]

    const isCorrect = letra === letterToCheck
    const className = isCorrect ? 'correct' : 'incorrect'
    $letter.classList.add(className)
  });

  $currentLetter.classList.remove('active', 'is-last')
  const inputLength = $input.value.length
  const nextActiveLetter = allLetters[inputLength]

  if (nextActiveLetter) {
    nextActiveLetter.classList.add('active')
  } else {
    $currentLetter.classList.add('active', 'is-last')
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