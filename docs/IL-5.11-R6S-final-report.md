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
