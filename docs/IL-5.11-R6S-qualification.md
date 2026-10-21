# IL-5.11-R6S — READY_FOR_SECURITY_REVIEW

**READY_FOR_SECURITY_REVIEW.** La [PR corrective #17](https://github.com/drumee/infra-layer/pull/17) est ouverte, non fusionnée. Main reste `a02b76e4c421e96e63406d7b10edc2b76a6056c1`. La source exécutée et qualifiée est `a7f8aae6c8f1de687ff05480115a0cb257ac8aa0` ; le HEAD de contrôle CI est `0f8d80ca002dfac08e2d36617aa1031943c4be06`. La clôture documentaire suivante conserve les mêmes helpers, tests, workflow et41 membres npm ; les contrôles seront relus au HEAD de livraison avant fin de mission.

Le défaut D4 est démontré puis corrigé uniquement dans le harnais : CAP_CHOWN ne permettait pas de traverser le parent privé0700. Le montage direct du sous-répertoire de fixture évite cette traversée sans privilège supplémentaire. UID étranger65532 réel, refus UnsafeEvidencePath UNTRUSTED_OWNER exigé, préconditions d’accès vérifiées, aucune écriture ni perte de sentinelle. D4 ciblé puis D complet réussissent ; l’échec initial et son diagnostic restent conservés.

| Contrôle | Résultat établi |
| --- | --- |
| D4 / D | PASS ;11 scénarios/86 assertions explicites, zéro skip ;15 assertions du ciblé séparées |
| E helpers | Trois helpers rejoués dans clone propre :11 commandes canoniques, campagne3×17/17, deux tarballs |
| Suites réelles |176 unitaires dont24 contrats ; contrats séparés24 ; Gateway17 ; Services17 ; Lifecycle16 ; application réelle, consommateur8+37/types stricts ; packaging/lint/audits PASS |
| npm |41 fichiers/101778 octets, deux paquets identiques ; exports/types/lockfile/dépendances inchangés |
| Quality | [39678278136](https://github.com/drumee/infra-layer/actions/runs/39678278136) : cinq jobs SUCCESS au HEAD0f8d80c. Packaging exécute réellement les11 tests Python/86 assertions, UID runner1001, ownership réel65532 confirmé |
| CodeQL | [39678273529](https://github.com/drumee/infra-layer/actions/runs/39678273529) : JS/TS et Actions SUCCESS ; upload réussi/processing complete dans les journaux ; résultat CodeQL SUCCESS, aucune nouvelle alerte du code changé selon ce check |
| SonarCloud | **FAILURE**,29 annotations au HEAD0f8d80c ; disposition individuelle sans clôture. Dix FP techniques, neuf observations de style, dix cas de scripts de diagnostic sûrs uniquement dans leur contexte enregistré et sous préconditions explicites de rejeu |
| Visibilité | Code Scanning/Dependabot HTTP403 au PAT ; protection classique HTTP403 au connecteur. Main protected=false ; rulesets parents inclus=[] observés. Aucun contrôle/protection modifié |
| Nettoyage/provenance | Empreintes de journaux vérifiées, reçus sourcés, conteneurs/réseaux des projets testés absents ; aucune suppression globale ni ressource étrangère modifiée |

SHA256 npm recalculé : `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`.
SRI npm recalculé : `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`.
Ces identités ne sont pas celles d’une archive source GitHub et ne constituent pas une publication.

[Snapshot CI](evidence/IL-5.11-R6S-D4/G-success/github.json), [journaux complets et empreintes](evidence/IL-5.11-R6S-D4/G-job-logs/ci-logs.json), [dispositions Sonar détaillées](IL-5.11-R6S-security-disposition.md), [qualification locale et reçus](evidence/IL-5.11-R6S-D4/local-receipt.json). Les journaux téléchargés par gh portent ses préfixes de formatage ; leurs empreintes visent exactement ces fichiers conservés, pas un autre flux brut.

Les limitations restent explicites : aucune couverture CodeQL Python prétendue ; les tests Python sont réels en local et sur GitHub. Root/sameUID/filesystem hostile et code enfant compromis sont hors garantie. Les copies de diagnostic enregistrent des chemins vers des entrées sélectionnées/vérifiées ; elles ne doivent pas importer un clone /tmp non vérifié sur un autre hôte. Aucun nouvel usage autonome de ces snapshots n’est qualifié. Docker rootless/userns doit satisfaire les préconditions d’identité réelles ou déclarer D4_SETUP_FAILED, jamais skip/PASS.

PR #16 demeure ouverte au1c9d20f ; ses copies vulnérables verify.py/source-archive.py ne sont pas corrigées dans main par cette PR et doivent converger avant leur fusion. Le statut présent autorise la **revue**, ni la fusion ni la publication. Réserve SMTP inchangée limitée à alpha.3 ; SMTP_RECOVERY_UNQUALIFIED, Internet delivery non qualifiée. Aucun npm publish, tag, image publiée, déplacement de latest, Debian/Runtime/Oxy-form/production ou D0. Debian conserve aa9057f224f4ae5cf80d777e3cb2fad092193fb1.

## Chronologie et rapports précédents conservés

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
