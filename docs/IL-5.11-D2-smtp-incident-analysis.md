# IL-5.11-D2 — Incident SMTP : audit préalable

## Contrôle A

Source historique D : `d19e62ba682dc2d781f5f941c7ba4b37e3a65053`. HEAD PR initial revérifié : `772875e2000545978d6b05f0f8d762900ec52188`, base `8f297d8f676706f052a24ce4e875d91b76555b91`, brouillon non fusionné. Rapports F/D, D-stop, reçu du rejeu et deux logs complets relus. Aucun AGENTS.md applicable trouvé ; checkout préexistant préservé.

**A satisfait pour l’audit préalable ; cause initiale non démontrée.** Les traces historiques n’ont pas de chronologie monotone détaillée, ni mesures CPU/I/O, ni trace SMTP de greeting. Elles ne suffisent pas à attribuer le timeout à une cause unique. Aucun correctif distribué décidé sur cette seule lecture.

## Chronologie historique et limites

| Étape | Observation historique |
| --- | --- |
| Isolation | Projet initial `drumee-il2-test-1a3edee9`, ports éphémères loopback ; collisions projet/image/réseau vérifiées par le harnais |
| Certificats et secrets | Créés et matérialisés avant le démarrage Compose ; aucune clé privée dans les preuves |
| Démarrage | Compose `up --wait --wait-timeout 90` avant TAP ; health Postfix teste le processus, OpenDKIM la configuration, capture HTTP, donc pas une preuve de greeting SMTP de bout en bout |
| Disponibilité Postfix | Journal `08:55:20` puis répétitions de « running PID 1 » ; ordre de logs interservices non totalement chronologique |
| Test 13 | 08:55:48 : envoi authentifié accepté et capturé, STARTTLS observé dans les commandes Postfix ; refus sans autorisation puis mauvais SASL à 08:55:52 ; PASS |
| Test 14 | Signature DKIM vérifiée, redémarrage OpenDKIM ; PASS, environ 5,256 s |
| Test 15 | Capture volontairement arrêtée ; `sendMail` échoue avant greeting : ETIMEDOUT, 5301 ms ; pas d’acceptation/enqueue démontrée pour ce message |
| Test 16 | Lecture HTTP capture échoue en 30 ms ; la source montre que le redémarrage capture prévu en fin de test 15 n’est pas atteint après son exception |
| Après tests | Connexion Postfix perdue après CONNECT à 08:56:06 ; absence de commande SMTP sur cette connexion ; pas de STARTTLS/SASL pour l’essai échoué démontré |
| Nettoyage | Harnais confirme destruction de ses ressources, lecture Docker ultérieure sans conteneur/réseau de ce projet |
| Rejeu propriétaire | Même source/délais, projet distinct `drumee-il2-test-bf78037e`, 17/17 en 40,090 s, nettoyage confirmé ; cause initiale toujours inconnue |

L’horloge murale Postfix et les durées TAP ne permettent pas de synchronisation précise des événements historiques. La pile Nodemailer indique la phase de greeting, pas la cause du délai. Les scénarios 13–16 sont séquentiels et partagent des ressources ; le résultat 16 initial ne constitue pas une défaillance indépendante du protocole de relais.

## Matrice d’hypothèses avant campagne

| Hypothèse | État des preuves | Observation nécessaire |
| --- | --- | --- |
| Readiness trop précoce | Healthchecks partiels, mais test 13 réussit avant 15 ; insuffisant pour cause initiale | Événements de démarrage/health et connexion/greeting/TLS |
| Course capture / SMTP | Capture arrêtée exprès au test 15 ; SMTP doit accepter puis conserver en file | Stop/start horodatés, tentative SMTP et compte capture |
| DNS/réseau interne | Aucune mesure DNS/reverse/transitoire conservée pour le timeout | Temps de connexion et état réseau/health si échec ; pas d’attribution DNS sans trace |
| Fermeture prématurée | Événement voulu pour la capture, pas de fermeture Postfix démontrée | Fermetures et codes d’erreur client/capture |
| Nettoyage antérieur | Projets distincts et cleanup attesté ; pas de conflit démontré | État Docker avant/après par label propriétaire |
| Réutilisation de port/projet | Ports éphémères, random project et collisions vérifiées ; course réservation/libération théoriquement possible | IDs/ports et absence de ressources du projet avant démarrage |
| Contention CPU/I/O/Docker | Pas de relevé historique ; durée seule insuffisante | Charge/mémoire/PSI, durées commandes, health et stats Docker bornées |
| Gestion de connexion | Greeting manquant avant TLS ; cause inconnue | Événements safe Nodemailer : connexion, codes réponse, STARTTLS, auth, fermeture |
| Dépendance à l’ordre | Ressources partagées, redémarrage DKIM juste avant ; lien causal non démontré | Campagne complète conservant ordre, durées et événements |
| Cascade 15 → 16 | Démontrée par le flux : capture stoppée et pas de finally de restauration avant lecture 16 | Trace stop, erreur, lecture HTTP ; ne pas assimiler à la cause du timeout |

## Plan fixé avant campagne B

**Trois exécutions Services complètes au maximum**, séquentielles depuis un clone propre commis avec instrumentation de test seulement. Aucun retry interne ajouté, aucun timeout changé. Chaque exécution crée un projet et ses fixtures exclusifs ; pas de concurrence avec les suites lourdes. Critère de succès : 17/17, zéro skip/échec, nettoyage confirmé et lecture Docker sans ressources du projet. Arrêt de campagne au premier test échoué, cleanup incomplet, fuite sensible, anomalie de sécurité ou limite d’environnement ; conserver l’essai et investiguer avant toute poursuite D. Pas de boucle jusqu’au premier succès.

Captures : logs complets de chaque essai, horodatages UTC et monotones, durées commandes, réponses SMTP réduites aux codes, étapes STARTTLS/auth/fermeture, événements capture sans payload, charge/mémoire/PSI, état et stats Docker par projet, exit codes, cleanup. Les logs natifs passent les protections/redactions existantes ; les nouveaux événements utilisent une allowlist de champs, sans nom d’utilisateur, secret, clé ou corps de message.

Si 3/3 réussissent sans reproduction : **INTERMITTENCE_NOT_REPRODUCED**, jamais ROOT_CAUSE_CONFIRMED. Sous hypothèses idéales d’essais Bernoulli indépendants/stationnaires, 0 échec sur 3 laisse une borne supérieure unilatérale 95 % d’environ 63 % sur le taux d’échec : échantillon trop petit pour une garantie statistique de rareté ; mêmes hôte/cache limitent encore l’indépendance. Le signal utile est la couverture réelle répétée et l’absence de défaut observé, avec réserve explicite soumise au propriétaire avant publication.

L’instrumentation n’ajoute ni sonde de readiness bloquante ni délai : elle peut modifier légèrement l’ordonnancement, limite à mentionner. Si un défaut distribué ou externe est démontré, appliquer les règles de correction/requalification ou d’arrêt canonique.

## Preuves liées

[Échec historique](evidence/IL-5.11-resume/D-services-failed.txt), [rejeu historique](evidence/IL-5.11-resume/D-services-rerun-1.txt), [arrêt](evidence/IL-5.11-resume/D-stop.json), [reçu rejeu](evidence/IL-5.11-resume/D-services-rerun-1.json), [plan machine](evidence/IL-5.11-D2/campaign-plan.json).
