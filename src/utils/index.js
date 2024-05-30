import { palabras as INITIAL_WORDS } from "@/constants/palabras"

const $time = document.querySelector("#time")
const $word = document.querySelector("#word")
const $paragraph = document.querySelector("#paragraph")
const $input = document.querySelector("#input")
const $game = document.querySelector('#game')
const $results = document.querySelector('#results')
const $wpm = document.querySelector('#results .wpm')
const $currancy = document.querySelector('#results .currancy')
const $reloadButton = document.querySelector("#button-reload")
const $navModifiers = document.querySelector('#modifiers')
const $gameModifiers = document.querySelectorAll('#modifiers ul li')

let initialTime = 10
let currentTime
let isTimeActive = true
let initialWords = 100
let numberWords
let numberWordsPassed
let words = []
let isPlaying
let clock
let counterTypeError
// TODO: Hacer que el counterTypeError no cuente errores de mas cuando hay 2 errores seguidos y se intenta correjir

startEvents()
resetGame()

// TODO: CUANDO ESTE TERMINADO, AGREGAR MAS PALABRAS, PONER MAS PALABRAS INICIALES, CAMBIAR EL TIEMPO INICIAL, AGREGAR README Y PONER MIS REDES SOCIALES

function resetGame () {
  $game.style.display = 'grid'
  $results.style.display = 'none'
  $navModifiers.style.display = 'flex'
  $input.value = ''

  clearInterval(clock)
  counterTypeError = 0
  numberWordsPassed = 0
  isPlaying = false

  currentTime = initialTime
  $time.textContent = currentTime
  numberWords = `${numberWordsPassed} / ${initialWords}`
  $word.textContent = numberWords

  addWordsToParagraph()

  $paragraph.scroll({
    top: 0,
    behavior: 'smooth',
  })
}

function startEvents () {
  document.addEventListener('keydown', () => {
    $input.focus()

    if (!isPlaying) {
      isPlaying = true
      startTimer()
      $navModifiers.style.display = 'none'
    }
  })

  $input.addEventListener('keyup', onKeyLetter)
  $input.addEventListener('keyup', onKeyDown)
  $reloadButton.addEventListener('click', resetGame)
  $gameModifiers.forEach(mofidier => {
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

    if (!$nextWord) {
      endGame()
      return
    }

    $currentWord.classList.remove('active', 'marked')
    $currentLetter.classList.remove('active')
    $nextWord.classList.add('active')
    $nextLetter.classList.add('active')

    $input.value = ''
    numberWordsPassed++
    numberWords = `${numberWordsPassed} / ${initialWords}`
    $word.textContent = numberWords

    const hasIncorrectLetters =
      $currentWord.querySelectorAll('letter:not(.correct)').length > 0
    const className = hasIncorrectLetters ? 'marked' : 'correct'
    const $emptyLetters = $currentWord.querySelectorAll('letter:not(.correct, .incorrect)')
    const hasEmptyLetters = $currentWord.querySelectorAll('letter.empty').length > 0

    $currentWord.classList.add(className)
    $emptyLetters.forEach(letter => letter.classList.add('empty'))

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

      numberWordsPassed--
      numberWords = `${numberWordsPassed} / ${initialWords}`
      $word.textContent = numberWords

      $input.value = [
        ...$prevWord.querySelectorAll('letter.correct, letter.incorrect')
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

  $currentLetter.classList.remove('active', 'is-last')

  if (nextActiveLetter) {
    nextActiveLetter.classList.add('active')
  } else {
    $currentLetter.classList.add('active', 'is-last')
    // TODO: Hacer que la animacion del cursor se haga correctamente en la ultima letra de la palabra
  }
}

function modifyGame (event) {
  const classNameParent = event.target.parentElement.classList
  const element = event.target

  $gameModifiers.forEach(modifier => {
    modifier.classList.remove('active')
  })

  if (classNameParent.contains('time')) {
    element.classList.add('active')
    initialTime = element.textContent
    currentTime = initialTime
    $time.textContent = currentTime
    isTimeActive = true
  } else if (classNameParent.contains('words')) {
    element.classList.add('active')
    initialWords = element.textContent
    numberWords = `${numberWordsPassed} / ${initialWords}`
    $word.textContent = numberWords
    isTimeActive = false
  }

  useTimeOrWords()
}

function startTimer () {
  clock = setInterval(() => {
    currentTime--
    $time.textContent = currentTime

    if (currentTime <= 0 && isTimeActive) {
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
  const wpm = correctWords * 60 / initialTime
  // TODO: usar el tiempo que paso para sacar el wpm y no el elegido (solo pasaron 21s y no 30)

  $wpm.textContent = `${wpm}`
  $currancy.textContent = `${acurrancy.toFixed(2)}%`
}