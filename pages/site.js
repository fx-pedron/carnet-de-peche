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
  jetG: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="608.90 204.64 33.07 39.81" width="33" height="40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M638.97 241.45 L638.85 240.43 L638.69 239.4 L638.5 238.38 L638.29 237.37 L638.05 236.36 L637.8 235.35 L637.53 234.35 L637.23 233.36 L636.91 232.38 L636.57 231.4 L636.21 230.43 L635.82 229.48 L635.41 228.53 L634.98 227.59 L634.52 226.66 L634.04 225.75 L633.53 224.85 L632.99 223.97 L632.43 223.11 L631.84 222.26 L631.21 221.44 L630.56 220.64 L629.88 219.87 L629.17 219.13 L628.42 218.43 L627.65 217.76 L626.84 217.13 L626 216.56 L625.14 216.03 L624.25 215.56 L623.33 215.15 L622.4 214.81 L621.46 214.53 L620.5 214.28 L619.53 214.01 L618.56 213.64 L617.62 213.19 L616.73 212.65 L615.91 212.05 L615.17 211.41 L614.5 210.75 L613.9 210.09 L613.37 209.45 L612.91 208.84 L612.5 208.33 L612.18 207.95 L611.97 207.71 L611.9 207.64"/></svg>',
  jetGLoin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="589.06 194.20 35.76 10.12" width="36" height="10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M621.82 201.32 L621.22 200.9 L620.61 200.5 L619.99 200.11 L619.36 199.75 L618.71 199.41 L618.06 199.1 L617.39 198.8 L616.71 198.53 L616.03 198.28 L615.34 198.06 L614.64 197.86 L613.93 197.69 L613.23 197.54 L612.51 197.41 L611.79 197.32 L611.08 197.25 L610.36 197.21 L609.64 197.2 L608.92 197.22 L608.21 197.28 L607.5 197.37 L606.81 197.49 L606.12 197.66 L605.45 197.86 L604.81 198.1 L604.19 198.38 L603.59 198.7 L603.03 199.05 L602.47 199.42 L601.86 199.77 L601.22 200.1 L600.55 200.4 L599.84 200.65 L599.12 200.85 L598.4 200.99 L597.68 201.09 L596.98 201.14 L596.3 201.17 L595.64 201.16 L595.01 201.14 L594.4 201.09 L593.83 201.04 L593.32 201.02 L592.88 201.02 L592.52 201.04 L592.27 201.06 L592.11 201.08 L592.06 201.09"/></svg>',
  jetD: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="658.47 204.64 33.08 39.81" width="33" height="40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M661.47 241.45 L661.6 240.43 L661.76 239.4 L661.95 238.38 L662.16 237.37 L662.4 236.36 L662.65 235.35 L662.92 234.35 L663.22 233.36 L663.54 232.38 L663.88 231.4 L664.24 230.43 L664.63 229.48 L665.04 228.53 L665.47 227.59 L665.93 226.66 L666.41 225.75 L666.92 224.85 L667.46 223.97 L668.02 223.11 L668.62 222.26 L669.24 221.44 L669.89 220.64 L670.57 219.87 L671.28 219.13 L672.03 218.43 L672.8 217.76 L673.61 217.13 L674.45 216.56 L675.31 216.03 L676.21 215.56 L677.12 215.15 L678.05 214.81 L678.99 214.53 L679.95 214.28 L680.92 214.01 L681.89 213.64 L682.83 213.19 L683.72 212.65 L684.54 212.05 L685.28 211.41 L685.95 210.75 L686.55 210.09 L687.08 209.46 L687.54 208.84 L687.95 208.33 L688.27 207.95 L688.48 207.71 L688.55 207.64"/></svg>',
  jetDLoin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="675.13 194.20 35.76 10.12" width="36" height="10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M678.13 201.32 L678.73 200.9 L679.34 200.5 L679.96 200.11 L680.59 199.75 L681.24 199.41 L681.89 199.1 L682.56 198.8 L683.24 198.53 L683.92 198.28 L684.61 198.06 L685.31 197.86 L686.02 197.68 L686.73 197.54 L687.44 197.41 L688.16 197.32 L688.87 197.25 L689.59 197.21 L690.31 197.2 L691.03 197.22 L691.74 197.28 L692.45 197.37 L693.14 197.49 L693.83 197.66 L694.5 197.86 L695.14 198.1 L695.76 198.38 L696.36 198.7 L696.92 199.05 L697.48 199.42 L698.09 199.77 L698.73 200.1 L699.4 200.4 L700.11 200.65 L700.83 200.85 L701.56 201 L702.27 201.09 L702.97 201.14 L703.65 201.17 L704.31 201.16 L704.94 201.14 L705.55 201.09 L706.12 201.05 L706.63 201.02 L707.07 201.02 L707.43 201.04 L707.68 201.06 L707.84 201.08 L707.89 201.09"/></svg>',
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
