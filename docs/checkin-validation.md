# Validation du check-in quotidien

## Vérifié dans le code et Supabase
- La réclamation exige auth.uid() et sérialise les appels par joueur avec pg_advisory_xact_lock.
- Les journées sont calculées dans PostgreSQL à partir du fuseau du cycle.
- Le crédit du jour 7 utilise une addition au solde existant dans la transaction.
- La clôture des tournois utilise désormais une transaction serveur : verrou tournoi, refus des tournois déjà clôturés, additions aux soldes sous verrou de profil.
- La statistique par fuseau compte désormais les lignes daily_checkins, et non les cycles.
- TypeScript passe après ces changements.

## Tests réels non exécutés
Cet environnement ne dispose ni de navigateur pilotable ni de téléphones. Les appels SQL successifs ne constituent pas une preuve de concurrence multi-appareils.

Procédure à exécuter avec le même compte de test sur téléphone et ordinateur :
1. Fermer la fenêtre quotidienne sans réclamer ; retrouver la carte dans le profil.
2. Réclamer simultanément sur les deux appareils. Vérifier une seule présence en base et aucun crédit au solde principal avant J7.
3. Actualiser les deux appareils : présence validée, bouton désactivé.
4. Vérifier sur écran étroit le défilement de la fenêtre, les sept cases, le bouton et sa fermeture.
5. Laisser la page ouverte pendant le changement de journée locale ; vérifier la nouvelle disponibilité et la nouvelle fenêtre.

## Écarts restant à traiter avant recette exhaustive
- Les propositions de fuseaux multi-zones peuvent choisir le premier fuseau sans choix explicite ; les pays hors Afrique ne sont pas tous accessibles dans le formulaire.
- L'historique des changements pays/fuseau et un historique unifié des récompenses de tournoi ne sont pas implémentés.
- Le barème podium 50/20/10 retenu précédemment n'est pas la proposition 1 victoire pour chaque place de l'utilisateur et nécessite sa confirmation.

## Corrections supplémentaires vérifiées statiquement
- Le compte à rebours utilise server_now_epoch renvoyé par PostgreSQL, puis performance.now() comme horloge monotone : un changement de l'heure système ne change plus sa base de calcul.
- Une nouvelle lecture serveur est programmée après minuit ; les confirmations locales sont effacées quand today_local ou le compte change.
- Les statistiques classent les séries expirées comme interrompues sans attendre une nouvelle réclamation ; leurs points ne sont plus inclus dans le total en attente.
- Les joueurs ayant terminé J7 aujourd'hui sont inclus dans la répartition J7.
- Le nouveau calcul des statistiques a été appelé avec succès dans un test SQL ; TypeScript passe. Cela ne remplace pas un test visuel au passage réel de minuit.

La recette complète des 25 scénarios ne doit pas être déclarée réussie à ce stade.
