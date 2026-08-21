/*
 * Repli du menu derrière le bouton, sur mobile et tablette.
 *
 * `aria-expanded` porte l'état, et non la seule classe CSS : sans lui, un lecteur d'écran
 * annonce un bouton sans dire s'il ouvre ou ferme quelque chose.
 */
const burger = document.querySelector('.nav-burger')
const menu = document.querySelector('.nav-menu')

const basculer = (ouvert) => {
  burger.setAttribute('aria-expanded', String(ouvert))
  burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu')
  // Le menu couvre la page : la laisser défiler derrière lui donnerait un retour déroutant.
  document.body.classList.toggle('menu-ouvert', ouvert)
}

if (burger && menu) {
  burger.addEventListener('click', () => {
    basculer(menu.classList.toggle('ouvert'))
  })

  // Refermer à la touche Échap : le menu couvre la page sur un petit écran, et il faut pouvoir
  // en sortir sans viser le bouton.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !menu.classList.contains('ouvert')) return
    menu.classList.remove('ouvert')
    basculer(false)
    burger.focus()
  })
}

/*
 * Un poisson saute hors de l'eau, toutes les 40 secondes.
 *
 * Les formes sont injectees ici plutot qu'ecrites dans les trois pages : c'est une decoration,
 * elle n'a rien a faire dans le contenu, et sans JavaScript il ne se passe simplement rien.
 *
 * Le poisson passe DERRIERE la surface de l'eau : il sort donc de l'onde et y replonge, au lieu
 * de la survoler. C'est le meme empilement qui fait s'enfoncer les blocs.
 */
// Attente entre deux sauts, tiree au sort : un intervalle fixe se remarquerait comme un tic.
const ATTENTE_MIN = 40000
const ATTENTE_MAX = 70000

const FORMES = {
  poisson: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="284.48 -23.96 149.80 115.36" width="150" height="115" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"><path d="M424.277 11.0381C399.493 34.702 354.125 81.401 294.475 28.0509C352.445 -13.9552 387.731 11.0385 424.277 45.0638"/></svg>',
  jetG: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="608.86 205.11 31.15 37.34" width="31" height="37" fill="currentColor"><path d="M638.975 241.454C639.004 240.793 639.009 240.107 638.998 239.424C638.546 227.808 634.896 212.264 618.945 207.084C618.099 206.836 617.29 206.636 616.424 206.47C614.855 206.11 613.302 206.416 612.095 207.458C610.889 208.491 610.129 210.177 609.992 212.005C609.855 213.833 610.355 215.613 611.394 216.815C612.431 218.025 613.922 218.559 615.527 218.437C615.527 218.437 615.527 218.437 615.527 218.437C616.023 218.374 616.493 218.331 616.99 218.316C625.958 217.543 634.862 228.274 638.406 239.521C638.613 240.162 638.805 240.815 638.975 241.454Z"/></svg>',
  jetGLoin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="590.92 189.29 31.90 19.22" width="32" height="19" fill="currentColor"><path d="M621.817 201.325C621.547 200.997 621.247 200.667 620.945 200.352C615.735 194.872 605.762 190.29 595.954 195.588C595.437 195.862 594.951 196.14 594.453 196.454C593.016 197.237 592.083 198.48 592.006 200.074C591.921 201.659 592.7 203.464 594.023 204.928C595.346 206.393 597.062 207.35 598.647 207.426C600.241 207.512 601.573 206.709 602.497 205.359C602.497 205.359 602.497 205.359 602.497 205.359C602.641 205.094 602.782 204.846 602.941 204.595C605.358 199.954 613.344 198.193 620.618 200.855C621.019 200.996 621.427 201.157 621.817 201.325Z"/></svg>',
  jetD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="660.44 205.11 31.15 37.34" width="31" height="37" fill="currentColor"><path d="M661.475 241.454C661.447 240.793 661.441 240.107 661.452 239.424C661.905 227.808 665.555 212.264 681.506 207.084C682.351 206.836 683.161 206.636 684.027 206.47C685.595 206.11 687.149 206.416 688.355 207.458C689.561 208.491 690.321 210.177 690.458 212.005C690.596 213.833 690.095 215.613 689.057 216.815C688.019 218.025 686.529 218.559 684.924 218.437C684.924 218.437 684.924 218.437 684.924 218.437C684.427 218.374 683.958 218.331 683.46 218.316C674.492 217.543 665.588 228.274 662.044 239.521C661.837 240.162 661.645 240.815 661.475 241.454Z"/></svg>',
  jetDLoin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="677.13 189.29 31.89 19.22" width="32" height="19" fill="currentColor"><path d="M678.134 201.325C678.404 200.997 678.704 200.667 679.006 200.352C684.215 194.872 694.189 190.29 703.997 195.588C704.514 195.862 705 196.14 705.497 196.454C706.934 197.237 707.868 198.48 707.944 200.074C708.029 201.659 707.251 203.464 705.928 204.928C704.605 206.393 702.888 207.35 701.303 207.426C699.71 207.512 698.378 206.709 697.453 205.359C697.453 205.359 697.453 205.359 697.453 205.359C697.31 205.094 697.169 204.846 697.009 204.595C694.592 199.954 686.606 198.193 679.333 200.855C678.932 200.996 678.524 201.157 678.134 201.325Z"/></svg>',
}

// Rien pour qui demande moins d'animation : un saut au milieu d'une lecture n'est pas anodin.
const sobre = window.matchMedia('(prefers-reduced-motion: reduce)')

function preparerSaut() {
  if (sobre.matches) return

  const scene = document.createElement('div')
  scene.className = 'saut'
  scene.setAttribute('aria-hidden', 'true')
  // Deux jets par flanc : le principal, et celui qui part plus loin et plus haut.
  const gerbe = (ou) =>
    `<span class="gerbe gerbe-${ou}">` +
    ['g', 'g-loin', 'd', 'd-loin']
      .map((jet) => {
        const forme = 'jet' + jet.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
        return `<span class="jet jet-${jet}">${FORMES[forme]}</span>`
      })
      .join('') +
    `</span>`
  scene.innerHTML =
    `<span class="poisson">${FORMES.poisson}</span>` + gerbe('depart') + gerbe('retour')
  document.body.appendChild(scene)

  // Largeur de la parabole, cf. `offset-path` dans site.css.
  const ARC = 180

  /*
   * Ou et dans quel sens sauter.
   *
   * Le bloc de contenu est opaque : le decor ne se voit que dans les marges qui l'encadrent. On y
   * cale donc le sommet du saut, a gauche ou a droite, dans un sens ou dans l'autre — quatre
   * combinaisons, de quoi ne pas se repeter.
   */
  const tirage = () => {
    const l = window.innerWidth
    const gouttiere = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gouttiere'), 10) || 20
    const colonne = Math.min(720, l - 2 * gouttiere)
    const marge = Math.max(gouttiere, (l - colonne) / 2)

    const aGauche = Math.random() < 0.5
    const sommet = aGauche
      ? 8 + Math.random() * Math.max(1, marge - 16)
      : l - 8 - Math.random() * Math.max(1, marge - 16)

    const miroir = Math.random() < 0.5
    return { depart: sommet - (miroir ? -1 : 1) * (ARC / 2), miroir }
  }

  const sauter = () => {
    // Onglet en arriere-plan : le navigateur bride les minuteries, et l'animation se jouerait
    // en rafale au retour. Autant la sauter.
    if (document.visibilityState !== 'visible') return
    const { depart, miroir } = tirage()
    scene.style.setProperty('--depart', `${depart}px`)
    scene.classList.toggle('miroir', miroir)
    scene.classList.remove('joue')
    // Forcer un reflow, sans quoi retirer puis remettre la classe ne relance rien.
    void scene.offsetWidth
    scene.classList.add('joue')
  }

  // Reprogramme a chaque fois plutot qu'un intervalle fixe, pour que l'attente varie.
  const programmer = (delai) =>
    setTimeout(() => {
      sauter()
      programmer(ATTENTE_MIN + Math.random() * (ATTENTE_MAX - ATTENTE_MIN))
    }, delai)

  programmer(4000)
}

preparerSaut()
