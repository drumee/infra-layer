# IL-5.11-Resume — Couverture GitHub Security C

**Contrôle C : PASS_WITH_VISIBILITY_LIMITATIONS.** Aucun inventaire vide ni CodeQL globalement vert n’est revendiqué. La nouvelle annotation CodeQL a un contexte négatif techniquement démontré ; les accès administratifs globaux restent limités.

Base observée : `8f297d8f676706f052a24ce4e875d91b76555b91`. Source corrective analysée : `299fa3ea740f44aa76eaea52115e006464e4a345`. [PR de qualification #15](https://github.com/drumee/infra-layer/pull/15), initialement en brouillon pour permettre les scans avant la construction définitive. Aucun merge automatique.

## Résultats effectivement relus

| Contrôle | Source / résultat |
| --- | --- |
| Cinq jobs Quality sur main | unit/contracts/eslint/dependencies/packaging SUCCESS au SHA de base ; run 39561694473 |
| Quality candidat push et PR | cinq jobs SUCCESS dans chacun des runs 39566123710 et 39566453396, SHA 299fa3e exact |
| CodeQL candidat JavaScript/TypeScript et Actions | analyses SUCCESS, run 39566450567, résultats publiés |
| Check de résultat CodeQL candidat 119109926219 | **FAILURE**, « 1 new alert including 1 high severity security vulnerability » ; annotation réelle dans test/unit/secrets.test.js:65 |
| ESLint local | 0 erreur, 29 avertissements historiques, 0 nouveau ; règles et baseline inchangées |
| npm audit --omit=dev | 0 vulnérabilité connue ; aucune dépendance de production |
| npm audit --include=dev | 0 vulnérabilité connue dans le lockfile courant |
| Unitaires locaux | 176/176, dont 24 contrats ; 0 échec/skip |
| SonarCloud | main et PR FAILURE ; état conservé, aucune modification de règle/exclusion ou fermeture |

Les jobs d’exécution CodeQL et le check des résultats sont distingués : ne pas transformer l’exécution réussie en check de sécurité réussi. Le nouveau résultat [CodeQL #8](https://github.com/drumee/infra-layer/security/code-scanning/8) signale RSA-1024 généré dans le test additionnel qui vérifie précisément son refus pour les quatre types et la rotation. Ce contexte a été testé en B ; aucun octet de clé faible n’est commis, la fixture n’est pas distribuée, le processus est jetable et nettoyé. Disposition technique **FALSE_POSITIVE_TECHNICALLY_CONFIRMED / TEST_NEGATIVE_CONFIRMED**, sans mutation administrative ni acceptation de risque. Le check reste FAILURE. Aucun test négatif n’est supprimé ou affaibli pour embellir le scanner.

Les SARIF accessibles de la qualification IL-5.11R (run 39500179132, artefacts 12300370442 et 12298899882, empreintes et résultats dans le rapport intégré) sont des preuves historiques, pas le SARIF de 299fa3e. Ils documentent zéro résultat Actions et les trois diagnostics B. La liste d’artefacts du run natif candidat 39566450567 est **vide** : aucun SARIF actuel téléchargeable n’est inventé. Les checks, scans publiés et commentaire d’annotation PR restent disponibles ; la correction ReDoS repose aussi sur l’analyse de complexité et les reproductions bornées, pas sur une prétendue clôture administrative CodeQL.

## Accès aux inventaires globaux

Le plugin GitHub sert à lire les refs, runs/checks, commentaires et artefacts et à ouvrir la PR. Son fetch générique n’expose pas toutes les familles GitHub Security. La consultation REST avec l’identité CLI existante `somanos` / personal access token GH_TOKEN confirme :

- Code Scanning `/code-scanning/alerts` : **HTTP 403**, Resource not accessible by personal access token ; permission annoncée par l’endpoint `security_events=read`.
- Dependabot `/dependabot/alerts` : **HTTP 403**, même message ; permission annoncée `vulnerability_alerts=read`.

Les en-têtes sont les permissions acceptées par ces endpoints, pas l’inventaire des grants du jeton. Aucun changement de grant ni contournement. Les réponses et request IDs sont dans [C-security-access.json](evidence/IL-5.11-resume/C-security-access.json). Le compte peut avoir un rôle repository admin sans que ce jeton dispose de toutes les lectures ; ne pas assimiler le rôle aux scopes API. L’état administratif global, les historiques et les alertes hors analyse accessible restent inconnus.

Cette limite ne laisse pas le risque du package sans caractérisation : absence de dépendances runtime, audits des versions verrouillées, sources et frontières des diagnostics B relues, contrôles du candidat et preuves adversariales. Les qualifications réelles D restent incomplètes. Une future conclusion favorable devrait conserver ces **limitations** ; aucune conclusion de publication ni inventaire global certifié vide ne découle de C seul. Si les contrôles D révèlent un défaut significatif, la conclusion C n’autorise pas à le tolérer.

## Configuration de surveillance

`.github/dependabot.yml`, version 2, couvre npm à `/`, npm à `/test/application`, et github-actions à `/`, chaque semaine lundi avec limites de PR respectives 5/3/3. Ce fichier ne prouve pas les droits de consultation de l’inventaire ni l’absence d’alertes. Les PR de version automatiques ne sont pas assimilées à des vulnérabilités démontrées.

Quality conserve `contents:read`, checkout sans persistance de credentials, actions épinglées et matrice indépendante unit/contracts/eslint/dependencies/packaging. Aucun workflow de publication automatique ajouté. Le durcissement du Node hébergé reste distinct de la politique de résolution runtime.

## SonarCloud comme preuve historique

SonarCloud n’est plus l’outil de qualité opérationnel retenu pour IL-5 selon la mission. Il reste inchangé et visible. Ses 213 OPEN du main observé, les dispositions des 13 annotations PR #12, les deux reçus publics additionnels et les 18 PATH CLOSED/FIXED sont traités en B avec preuves référencées. Aucun des 227 anciens diagnostics n’est accepté par groupe au seul motif de son ancienneté.

## Contrôle C et suite

**PASS_WITH_VISIBILITY_LIMITATIONS** : contrôles Quality/audits/lint satisfaisants, analyse CodeQL réalisée, nouveau diagnostic RSA négatif caractérisé, risque ReDoS corrigé/testé. Réserves : check de résultat CodeQL FAILURE contextuel, SARIF candidat non disponible comme artefact, inventaires administratifs HTTP 403, Sonar toujours FAILURE. Ces limites devront apparaître dans F et dans la demande d’autorisation de publication. Aucun feu vert administratif de scanner n’est simulé. Poursuite D autorisée techniquement, sans publication ni fusion.

[Snapshot des résultats et de l’annotation](evidence/IL-5.11-resume/C-github-checks.json), [audit production](evidence/IL-5.11-resume/C-audit-production.json), [audit développement](evidence/IL-5.11-resume/C-audit-development.json), [lint](evidence/IL-5.11-resume/C-lint.txt), [176 tests](evidence/IL-5.11-resume/C-unit.txt).

## Périmètre de cette consolidation

Rapport relu le 2026-10-21T10:27:59+00:00. Les résultats ci-dessus restent ceux du SHA C et du snapshot référencé ; aucune nouvelle analyse Security ou clôture administrative n’est revendiquée lors de cette régénération. Main a été revérifié à `8f297d8f676706f052a24ce4e875d91b76555b91`, PR #15 ouverte en brouillon et non fusionnée. Dernier Services **17/17 PASS**, qualification D toujours incomplète ; E non exécutée. [Rapport complet et décision](IL-5.11-resume-final-decision.md).
