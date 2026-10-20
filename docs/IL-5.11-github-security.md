# IL-5.11-C — État de la qualification GitHub Security

Statut : **NOT_EXECUTED — arrêt à B (BLOCKED_SECURITY)**. Ce document réserve la reprise ; il ne prétend pas qualifier de nouveau CodeQL, ESLint, Dependabot ou les audits.

L’[évaluation B](IL-5.11-security-assessment.md) nécessite une décision concernant la confiance dans l’environnement de lancement. Le mandat impose de ne poursuivre C qu’après levée de cette condition.

Les preuves IL-5.10 restent consultables dans le [rapport de candidat figé](https://github.com/drumee/infra-layer/blob/fcfe5b1c7188d60862af9251d630f97ef33269d3/docs/IL-5.10-D-alpha3-release-candidate.md) et son reçu : Quality cinq jobs réussis ; analyse CodeQL sur main exécutée et publiée ; contrôle PR sans nouvelle alerte dans le code modifié. L’inventaire global Code Scanning et celui de Dependabot étaient inaccessibles (HTTP 403). Ces données historiques ne démontrent ni zéro alerte globale ni absence des risques PATH examinés à B.

À la reprise : relever les analyses réelles sur la source retenue, lire les annotations accessibles, vérifier la dernière exécution Quality et les audits ; constater les droits actuels sans contourner un refus. La réussite d’un job CodeQL, la publication SARIF, la lecture de toutes les alertes et leur disposition sont des capacités distinctes. Aucune équivalence complète avec SonarCloud n’est présumée. Aucune protection ou règle n’a été modifiée.

La livraison documentaire déclenche les workflows habituels sans les neutraliser : au relevé du HEAD `564a603...`, les cinq jobs Quality sont SUCCESS et Analyze est IN_PROGRESS. Voir le [rapport de livraison](IL-5.11-final-decision.md). Ce constat ne fournit pas l’inventaire global des alertes ni une nouvelle décision de sécurité sur la source canonique.
