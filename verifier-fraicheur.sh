#!/usr/bin/env bash
#
# Détecte, depuis l'extérieur de GitHub, que les marées ne se rafraîchissent plus.
#
# GitHub désactive un workflow planifié après 60 jours sans activité sur le dépôt, en silence —
# c'est arrivé le 8 novembre 2026. Le workflow s'arrête alors de tourner sans que rien ne casse
# tout de suite : marees.json reste en ligne, simplement figé. L'application ne perd son
# pré-remplissage qu'à l'expiration de la fenêtre, environ un mois plus tard. D'où ce contrôle
# qui ne dépend ni d'Actions ni du dépôt : il lit le fichier publié et juge sur deux dates.
#
# Sortie 0 : nominal. 1 : les marées sont figées. 2 : le fichier est illisible.

set -u

# `-r 0-300` plutôt que le fichier entier : les deux dates sont dans l'en-tête du JSON, et
# marees.json pèse 450 Ko. Le paramètre `cb` contourne le cache de 600 s du CDN.
tete=$(curl -sS --max-time 25 -r 0-300 "https://kerpesk.fr/marees.json?cb=$(date +%s)")
genere=$(printf '%s' "$tete" | sed -n 's/.*"genere":"\([^"]*\)".*/\1/p')
au=$(printf '%s' "$tete" | sed -n 's/.*"au":"\([^"]*\)".*/\1/p')

# `genere` est l'indicateur avancé — il se fige dès le premier run manqué. `au` est l'échéance
# réelle, celle où l'application commence à perdre des marées. Les deux valent d'être surveillées :
# la première laisse le temps d'agir, la seconde dit si ce temps est écoulé.
python3 -I -c '
import datetime, sys
genere, au = sys.argv[1], sys.argv[2]
if not genere or not au:
    print("ALERTE : impossible de lire genere/au dans marees.json")
    sys.exit(2)
now = datetime.datetime.now(datetime.timezone.utc)
age = (now - datetime.datetime.fromisoformat(genere.replace("Z", "+00:00"))).days
reste = (datetime.date.fromisoformat(au) - now.date()).days
print(f"genere le {genere} -> {age} jours")
print(f"fenetre jusqu au {au} -> {reste} jours restants")
if age > 3 or reste < 7:
    print("ALERTE : les marees ne se rafraichissent plus")
    sys.exit(1)
print("OK : rafraichissement nominal")
' "$genere" "$au"
