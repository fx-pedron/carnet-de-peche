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
