import { palabras as PALABRAS_INICIALES } from "@/constants/palabras"

const $tiempo = document.querySelector("#tiempo")
const $parrafo = document.querySelector("#parrafo")
const $input = document.querySelector("#input")

const TIEMPO_INICIAL = 5
let palabras = []

iniciarEventos()
iniciarJuego()

function iniciarJuego () {
  palabras = PALABRAS_INICIALES.toSorted(
    () => Math.random() - 0.5
  ).slice(0, 50)

  $parrafo.innerHTML = palabras.map((palabra) => {
    const letras = palabra.split('')

    return `
    <x-palabra>
    ${letras
        .map(letra => `<x-letra>${letra}</x-letra>`)
        .join('')
      }
    </x-palabra>
    `
  }).join('')

  const $palabraActual = $parrafo.querySelector('x-palabra')
  const $letraActual = $palabraActual.querySelector('x-letra')

  $palabraActual.classList.add('activo')
  $letraActual.classList.add('activo')

  cronometro()
}

function iniciarEventos () {
  document.addEventListener('keydown', () => {
    $input.focus()
  })

  $input.addEventListener('keydown', presionarTecla)
  $input.addEventListener('keyup', soltarTecla)
}

function presionarTecla (evento) {
  const { key } = evento

  if (key === ' ') {
    console.log('espacio')
  }

}

function soltarTecla () {
  const $palabraActual = $parrafo.querySelector('x-palabra.activo')
  const $letraActual = $palabraActual.querySelector('x-letra.activo')

  const palabraActual = $palabraActual.innerText
  $input.maxLength = palabraActual.length

  const allLetters = $palabraActual.querySelectorAll('x-letra')

  allLetters.forEach(letter => letter.classList.remove('correct', 'incorrect'))

  $input.value.split('').forEach((letra, index) => {
    const letterToCheck = palabraActual[index]
    const $letter = allLetters[index]

    const isCorrect = letra === letterToCheck
    const clase = isCorrect ? 'correct' : 'incorrect'
    $letter.classList.add(clase)
  });

  $letraActual.classList.remove('activo', 'is-last')
  const inputLength = $input.value.length
  const nextActiveLetter = allLetters[inputLength]

  if (nextActiveLetter) {
    nextActiveLetter.classList.add('activo')
  } else {
    $letraActual.classList.add('activo', 'is-last')
  }

  console.log({ value: $input.value, palabraActual })
}

function cronometro () {
  let tiempoActual = TIEMPO_INICIAL
  $tiempo.textContent = tiempoActual

  const reloj = setInterval(() => {
    tiempoActual--
    $tiempo.textContent = tiempoActual

    if (tiempoActual === 0) {
      clearInterval(reloj)
      terminarJuego()
    }
  }, 1000)
}

function terminarJuego () { }