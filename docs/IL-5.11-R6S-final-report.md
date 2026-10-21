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

# IL-5.11-R6S — Reprise D4 et clôture locale

**LOCAL_QUALIFICATION_PASSED — G_PENDING.** La cause de D4 est établie et le harnais corrigé sans nouveau privilège : montage direct de la fixture au lieu de traverser son parent0700 avec CAP_CHOWN seule. D4 exige désormais un refus explicite UNTRUSTED_OWNER après stat de l’UID65532.

D4 ciblé PASS ; contrôle D complet **11scénarios/86assertions, zéro skip**, confirmé depuis clone propre. Les trois helpers sont réellement requalifiés au `a7f8aae6c8f1de687ff05480115a0cb257ac8aa0` : onze commandes canoniques réussies, campagne3×17/17, deux packages identiques aux références. Les41membres npm sont inchangés, SHA256/SRI recalculés. [Qualification complète](IL-5.11-R6S-qualification.md), [résultat D4](IL-5.11-R6S-D4-result.md), [cause et diagnostic](IL-5.11-R6S-D4-diagnostic.md).

Le push et la PR corrective deviennent autorisés par ces résultats locaux ; READY_FOR_SECURITY_REVIEW reste conditionnel à la lecture des résultats GitHub et des nouveaux diagnostics. La PR #16 reste ouverte à1c9d20f et ses copies de helpers doivent converger avant sa fusion. Main reste a02b76e. Aucune fusion ni publication dans ce mandat.

## Historique conservé : rapport d’arrêt initial

# IL-5.11-R6S — Rapport final

**FAILED_QUALIFICATION.** La correction est candidate ; elle n’est pas READY_FOR_SECURITY_REVIEW. Arrêt au premier passage des tests négatifs conformément au §13 du mandat.

Les deux détournements historiques ont été reproduits avant correction dans une fixture isolée. La branche locale `fix/il511-r6s-evidence-helpers`, créée depuis main réel `a02b76e4c421e96e63406d7b10edc2b76a6056c1`, remplace les sorties prévisibles des trois helpers par des racines privées uniques, des créations exclusives et des opérations relatives à des descripteurs vérifiés. Cache npm privé ; source et outils explicitement vérifiés ; aucune suppression récursive de preuve. Les copies vulnérables de la PR documentaire #16 restent non fusionnées et nécessitent une convergence distincte.

Onze tests réels ont été exécutés : **dix succès et une erreur**, zéro skip. Les scénarios de liens racine/journal, fichiers préexistants, permissions, FIFO, concurrence16processus, non-suppression des ressources étrangères et les deux attaques historiques réussissent. D4 échoue dans la préparation Docker du répertoire d’UID étranger : chown exit1, puis restauration exit1 ; la vérification du refus n’est jamais atteinte. Le stderr Docker n’a pas été restitué par le harnais. Cause exacte non établie, aucune explication inventée ni relance opportuniste. Aucun tearDown en erreur et toutes les sentinelles vérifiées inchangées. [Résultats détaillés et limites](IL-5.11-R6S-security-tests.md).

Les étapes E–G ne sont pas exécutées après cet arrêt : ni rejeu complet des helpers, ni nouveaux tarballs, ni CI distante. Aucun push ou PR corrective créé ; commits et rapports sont disponibles localement pour reprise. Aucune fusion effectuée. Main et la PR #16 ne sont pas modifiés.

Comparaison statique fraîche : **41 membres npm identiques au reçu D2**, aucun changement de lockfile, export, type, contrat ou dépendance de production. Les empreintes du tarball attendu restent historiques ; elles ne sont pas présentées comme recalculées. SonarCloud reste historiquement FAILURE au dernier relevé intégré, avec états administratifs distincts des dispositions techniques ; aucun nouveau résultat scanner attribué à la branche.

[Qualification et reprise](IL-5.11-R6S-qualification.md), [inventaire](IL-5.11-R6S-path-inventory.md), [contrat](IL-5.11-R6S-output-contract.md), [disposition des diagnostics](IL-5.11-R6S-security-disposition.md). La réserve SMTP demeure limitée à alpha.3 ; elle ne couvre pas ce défaut d’outillage ou cet échec de qualification. Debian reste sur aa9057f224f4ae5cf80d777e3cb2fad092193fb1. Aucun npm publish, tag, image publiée, changement de protection/scanner, Runtime/Oxy-form/production ou OxymotionD0.
