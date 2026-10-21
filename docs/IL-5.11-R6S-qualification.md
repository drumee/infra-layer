# IL-5.11-R6S — Requalification locale après D4

**LOCAL_QUALIFICATION_PASSED — G_PENDING.** Les contrôles locaux D/E sont satisfaits ; CI et revue des nouveaux diagnostics à vérifier après push, avant READY_FOR_SECURITY_REVIEW.

| Domaine | Nouvelle preuve exécutée |
| --- | --- |
| Source | Clone propre `a7f8aae6c8f1de687ff05480115a0cb257ac8aa0`, main distant a02b76e inchangé |
| D4 | D4_PASS : UID65532 réel, refus métier UNTRUSTED_OWNER, sentinelles intactes, restauration/cleanup vérifiés |
| D complet | 11scénarios / 86assertions explicites, aucun skip/échec ; confirmé depuis clone propre |
| qualify.py | Onze commandes dans l’ordre original, toutes exit0 ; progression complète et stopped=false |
| Tests JS | Unitaires176/176 dont contrats24 ; contrats séparés24/24 ; Gateway17/17 ; Services17/17 ; Lifecycle16/16 |
| Application | Parcours réels réussis : Nginx/HTTPS, LAN indépendant, RPC, interruptions/reprise/rollback, restauration sans SMTP, refus SMTP_RECOVERY_UNQUALIFIED, STARTTLS/SASL/DKIM et refus d’open relay |
| campaign.py | Trois essais prévus exécutés : 3×17/17, zéro skip ; trois readbacks conteneurs/réseaux vides |
| Consommateur | Huit assertions initiales et37supplémentaires, exports et types stricts NodeNext PASS |
| Packaging/lint/audits | PASS ; lint0erreur/29avertissements historiques/0nouveau ; audits production et développement zéro vulnérabilité connue au relevé |
| artifact.py | Deux tarballs identiques,41membres/101778octets ; chaque membre comparé à la source et au reçu D |
| Intégrité des preuves | Empreintes des11journaux recalculées et identiques aux reçus ; JSON complets et sources/arbre enregistrés |
| Nettoyage | Readback vide pour chaque projet canonique observé ; aucun nettoyage global. Preuves privées conservées, descripteurs fermés |
| Scan des journaux | Aucun motif de clé privée/token détecté ; contrôles anti-divulgation des harnais canoniques également réussis. Ce scan n’est pas une preuve universelle d’absence de secret |
| GitHub | En attente après qualification locale, pas de fusion autorisée |

SHA256 npm **recalculé** : `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`.
SRI npm **recalculé** : `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`.
Aucun export/type/lockfile/dépendance de production changé. Aucune archive source GitHub confondue avec le tarball npm.

[Ordre, dates, commandes et empreintes](evidence/IL-5.11-R6S-D4/E-qualification/qualification-progress.json), [reçu npm exhaustif](evidence/IL-5.11-R6S-D4/E-artifact/artifact-receipt.json), [campagne et cleanup](evidence/IL-5.11-R6S-D4/E-campaign/campaign-summary.json), [validation des journaux](evidence/IL-5.11-R6S-D4/E-validation/validation.json). Tous ces résultats sont nouveaux ; les résultats historiques ne servent pas de remplacement d’exécution.

La protection nouvelle porte sur les destinations Python, leurs journaux/JSON/cache et les sous-répertoires npm. Les outils enfants/harnas canoniques continuent à gérer leurs propres fixtures et sorties externes inchangées ; aucune propriété générale de confinement d’un programme enfant n’est revendiquée. Les tarballs/cache volumineux restent dans les racines privées référencées par les exports ; leurs métadonnées et empreintes sont livrées sans duplication binaire.

Le passage qualifie les conditions de succès réelles de campaign et ses mesures sans erreur d’observateur. Un échec rendrait all_pass=false et exit1, sans retry ; l’intermittence SMTP initiale n’est pas déclarée corrigée. Son acceptation limitée alpha.3 reste distincte.

## Historique conservé : qualification arrêtée avant D4

# IL-5.11-R6S — Qualification

**FAILED_QUALIFICATION**, arrêt au contrôle D. Les conditions de READY_FOR_SECURITY_REVIEW ne sont pas satisfaites.

| Étape | Résultat |
| --- | --- |
| A | Inventaire des quatre Python de main et copies de #16 ; deux primitives reproduites dans fixture privée ; chemins connexes source/cache/TS/Nginx/proc/archive examinés |
| B | Contrat documenté : racine exclusive0700, fichiers0600/exclusifs/no-follow, opérations fd, pas de nettoyage récursif |
| C | Correction candidate commit `5a56d3d`, aucune modification des 41 membres npm |
| D | **FAIL** : dix tests réussissent, un ERROR de préparation D4 ; aucun skip ; non requalifié |
| E | **NON EXÉCUTÉ** : arrêt ; aucun helper complet rejoué depuis clone propre, aucun nouveau package construit |
| F | **INCOMPLET** : dispositions techniques candidates documentées ; pas de nouvelle analyse |
| G | **NON EXÉCUTÉ** : pas de push, PR corrective, CI distante ou qualification des protections ; arrêt avant ces étapes |

Base distante observée : `a02b76e4c421e96e63406d7b10edc2b76a6056c1`. PR #15 fusionnée, #16 ouverte à `1c9d20f1cc315628cfd703199423c6efc873ff13`. Clone distinct `/tmp/il511-r6s`, branche `fix/il511-r6s-evidence-helpers`. Le checkout initial `/home/somanos/github/infra-layer` n’a pas été modifié.

La suite des onze commandes de qualify conserve l’ordre, les exécutables absolus et le timeout2200. campaign conserve trois essais planifiés et ses critères TAP17/0/0/cleanup ; il rend désormais aussi un exit non nul si all_pass=false (l’ancien programme n’exprimait l’échec que dans son JSON). Ce changement de signalement doit être qualifié avec une exécution réelle avant validation. L’observateur conserve ses erreurs dans le reçu. artifact conserve les comparaisons de membres et d’octets ; les assertions de sécurité sont devenues des erreurs explicites, actives sous Python-O. Les sorties de progression sont des snapshots exclusifs et un reçu final unique.

Ces observations de code ne valent pas qualification fonctionnelle. Services, Lifecycle, Application, consommateur et packaging n’ont pas été rejoués dans R6S. Les résultats D2 restent historiques et n’ont pas été réécrits ou déclarés nouvellement exécutés.

Comparaison statique : les SHA256 des **41 fichiers du checkout** correspondent au reçu D2. [Matrice recalculée](evidence/IL-5.11-R6S/static-distributed-comparison.json). Aucun package.json, lockfile, export, type ou dépendance de production modifié. **SHA256/SRI du tarball non recalculés** après arrêt ; les valeurs c503d31c… et sha512-R3Y1… restent uniquement les références attendues. Aucune nouvelle identité d’archive source GitHub calculée.

Preuves : [tests et journal](IL-5.11-R6S-security-tests.md), [diagnostics](IL-5.11-R6S-security-disposition.md), [inventaire](IL-5.11-R6S-path-inventory.md), [contrat](IL-5.11-R6S-output-contract.md). Dates/commandes/empreintes/provenance sont dans les reçus JSON du dossier evidence/IL-5.11-R6S. Le fichier hashes.json protège les pièces livrées par empreinte ; il n’est pas une signature ou une attestation indépendante.

Reprise nécessaire : diagnostiquer le conteneur de fixture D4 en restituant son stderr, rendre sa préparation fiable sans mock/skip/affaiblissement, puis exécuter la suite négative complète. Reprendre ensuite seulement E/F/G, les trois helpers depuis clone propre, les deux packages et les nouveaux contrôles GitHub. Vérifier la convergence des copies de #16 avant fusion de celle-ci. Pas de fusion corrective ni publication autorisée par ce mandat.
