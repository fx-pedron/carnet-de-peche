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

// Un saut sur cent en moyenne, tire independamment a chaque fois : le poisson passe dore, escorte
// de trois etoiles. Rien ne l'annonce et rien ne le garantit — c'est tout l'interet.
const CHANCE_DORE = 0.01

const FORMES = {
  poisson: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="284.48 -23.96 149.80 115.36" width="150" height="115" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"><path d="M424.277 11.0381C399.493 34.702 354.125 81.401 294.475 28.0509C352.445 -13.9552 387.731 11.0385 424.277 45.0638"/></svg>',
  arche: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 0 134 71" width="134" height="71" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path pathLength="100" d="M5 67C5 32.21 33.21 4 68 4C102.79 4 131 32.21 131 67"/></svg>',
  etoile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="71.15 4.01 21.71 20.64" width="22" height="21" fill="currentColor"><path d="M80.0979 5.8541C80.6966 4.01148 83.3034 4.01148 83.9021 5.8541L84.9187 8.98278C85.1864 9.80682 85.9543 10.3647 86.8208 10.3647H90.1105C92.0479 10.3647 92.8535 12.844 91.2861 13.9828L88.6246 15.9164C87.9237 16.4257 87.6303 17.3284 87.8981 18.1525L88.9147 21.2812C89.5134 23.1238 87.4044 24.656 85.837 23.5172L83.1756 21.5836C82.4746 21.0743 81.5254 21.0743 80.8244 21.5836L78.163 23.5172C76.5956 24.656 74.4866 23.1238 75.0853 21.2812L76.1019 18.1525C76.3697 17.3284 76.0763 16.4257 75.3754 15.9164L72.714 13.9828C71.1465 12.844 71.9521 10.3647 73.8895 10.3647H77.1792C78.0457 10.3647 78.8136 9.80682 79.0813 8.98278L80.0979 5.8541Z"/></svg>',
  archeCourte: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 20 108 50" width="108" height="50" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path pathLength="100" d="M6 66C6 42.8 27.9 24 56 24C83.61 24 106 42.8 106 66"/></svg>',
}

// Rien pour qui demande moins d'animation : un saut au milieu d'une lecture n'est pas anodin.
const sobre = window.matchMedia('(prefers-reduced-motion: reduce)')

function preparerSaut() {
  if (sobre.matches) return

  const scene = document.createElement('div')
  scene.className = 'saut'
  scene.setAttribute('aria-hidden', 'true')
  // Deux arches par flanc, l'une plus ample que l'autre, nees du meme pied.
  const gerbe = (ou) =>
    `<span class="gerbe gerbe-${ou}">` +
    ['droite', 'gauche']
      .map(
        (cote) =>
          `<span class="flanc flanc-${cote}">` +
          `<span class="arche arche-large">${FORMES.arche}</span>` +
          `<span class="arche arche-courte">${FORMES.archeCourte}</span>` +
          `</span>`,
      )
      .join('') +
    `</span>`

  // Les etoiles suivent la meme parabole que le poisson, sans en epouser l'inclinaison.
  const etoiles =
    `<span class="etoiles">` +
    [1, 2, 3].map((n) => `<span class="etoile etoile-${n}">${FORMES.etoile}</span>`).join('') +
    `</span>`

  scene.innerHTML =
    `<span class="poisson">${FORMES.poisson}</span>` + etoiles + gerbe('depart') + gerbe('retour')
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
    scene.classList.toggle('dore', Math.random() < CHANCE_DORE)
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
