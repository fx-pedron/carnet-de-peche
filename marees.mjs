/**
 * Génère le fichier de marées publié sur GitHub Pages.
 *
 * Ce script tourne dans GitHub Actions, jamais dans l'app : la clé API vient d'un secret du
 * dépôt et n'est donc embarquée nulle part côté client. L'app se contente de télécharger le
 * JSON produit, puis de le garder en cache pour fonctionner hors-ligne.
 *
 * L'API n'accepte que la fenêtre J-30 à J+30, d'où le rafraîchissement quotidien.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const BASE = 'https://api-maree.fr'
const CLE = process.env.API_MAREE_KEY
const SORTIE = 'site'
const JOURS_AVANT = 2
const JOURS_APRES = 29

if (!CLE) {
  console.error('❌ API_MAREE_KEY absente ou vide.')
  console.error('   Settings → Secrets and variables → Actions → New repository secret')
  console.error('   Nom attendu, exactement : API_MAREE_KEY')
  process.exit(1)
}

// Longueur seulement : les logs Actions d'un dépôt public sont lisibles par tous.
console.log(`Clé détectée : ${CLE.length} caractères.`)

const jour = (decalage) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + decalage)
  return d.toISOString().slice(0, 10)
}

async function json(url) {
  const rep = await fetch(url)
  if (rep.ok) return rep.json()

  // La clé est masquée dans les traces : les logs Actions d'un dépôt public sont visibles.
  const anonyme = url.replace(CLE, '***')
  const corps = (await rep.text()).slice(0, 300)
  if (rep.status === 401 || rep.status === 403) {
    console.error(`❌ Clé refusée par l'API (HTTP ${rep.status}).`)
    console.error("   Vérifie la valeur du secret API_MAREE_KEY, et que le compte api-maree.fr est actif.")
  } else if (rep.status === 422) {
    console.error(`❌ Requête invalide (HTTP 422) — paramètre manquant ou hors fenêtre J-30/J+30.`)
  }
  throw new Error(`HTTP ${rep.status} sur ${anonyme}\n${corps}`)
}

const from = jour(-JOURS_AVANT)
const to = jour(JOURS_APRES)

// La liste des sites ne demande pas de clé.
const { sites } = await json(`${BASE}/sites`)
const connus = new Map(sites.map((s) => [s.site_id, s]))

/**
 * `ports.json` restreint la sélection si besoin ; vide ou absent, on publie tous les ports
 * disponibles, pour que l'app propose la France entière dans son menu déroulant.
 */
let ports
try {
  const choisis = JSON.parse(await readFile(new URL('./ports.json', import.meta.url), 'utf8'))
  ports = Array.isArray(choisis) && choisis.length ? choisis : [...connus.keys()]
} catch {
  ports = [...connus.keys()]
}

console.log(`${ports.length} port(s) à récupérer, du ${from} au ${to}.`)

const marees = {}
let ok = 0
for (const id of ports) {
  if (!connus.has(id)) {
    console.error(`Port inconnu, ignoré : ${id}`)
    continue
  }
  const url = `${BASE}/tide-extrema?site=${id}&from=${from}&to=${to}&tz=Europe/Paris&key=${CLE}`
  const rep = await json(url)

  // Format compact : [heure, hauteur en cm, "PM"|"BM", coefficient]
  marees[id] = Object.fromEntries(
    rep.data.map((j) => [
      j.date,
      j.extrema.map((e) => [e.time, Math.round(e.height * 100), e.type, e.coef ?? null]),
    ]),
  )
  ok++
  if (ok % 25 === 0) console.log(`  ${ok}/${ports.length}…`)
}
console.log(`${ok} ports récupérés.`)

const fichier = {
  genere: new Date().toISOString(),
  du: from,
  au: to,
  attribution:
    'Données de marée fournies par api-maree.fr sous licence CC BY, calculées à partir de composantes harmoniques Ifremer / PREVIMER',
  format: ['heure', 'hauteur_cm', 'type', 'coefficient'],
  ports: ports
    .filter((id) => connus.has(id))
    .map((id) => ({
      id,
      nom: connus.get(id).site_name,
      lat: connus.get(id).latitude,
      lng: connus.get(id).longitude,
    })),
  marees,
}

await mkdir(SORTIE, { recursive: true })
await writeFile(`${SORTIE}/marees.json`, JSON.stringify(fichier))

const taille = (JSON.stringify(fichier).length / 1024).toFixed(1)
console.log(`\n${SORTIE}/marees.json — ${taille} Ko, du ${from} au ${to}`)
