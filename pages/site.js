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
  arche: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 0 134 71" width="134" height="71" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path pathLength="100" d="M5 67C5 32.21 33.21 4 68 4C102.79 4 131 32.21 131 67"/></svg>',
  archeCourte: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 20 108 50" width="108" height="50" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path pathLength="100" d="M6 66C6 42.8 27.9 24 56 24C83.61 24 106 42.8 106 66"/></svg>',
}

// Rien pour qui demande moins d'animation : un saut au milieu d'une lecture n'est pas anodin.
const sobre = window.matchMedia('(prefers-reduced-motion: reduce)')

function preparerSaut() {
  if (sobre.matches) return

  const scene = document.createElement('div')
  scene.className = 'saut'
  scene.setAttribute('aria-hidden', 'true')
  // Deux arches nees du meme point, l'une plus ample que l'autre, deployees de part et d'autre.
  const gerbe = (ou) =>
    `<span class="gerbe gerbe-${ou}">` +
    `<span class="arche arche-large">${FORMES.arche}</span>` +
    `<span class="arche arche-courte">${FORMES.archeCourte}</span>` +
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
