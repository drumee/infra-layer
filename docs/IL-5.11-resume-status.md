# IL-5.11-Resume — reprise de qualification alpha.3 (état initial)

Status: **IN_PROGRESS — NOT_AUTHORIZED_FOR_PUBLICATION**.

## Références canoniques

- Infra Layer `main` initial: `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` (fusion IL-5.11R, PR #12).
- Revue de fusion: PR #13, dossier `docs/IL-5.11R-review-final.md`.
- npm candidat corrigé, *non publié*: `@drumee/infra-layer@0.1.0-alpha.3`, 41 membres, 101242 octets.
- SHA256 npm historique qualifié: `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c`.
- SRI npm historique qualifié: `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==`.
- Archive source du commit intégré: SRI `sha512-Syt/FYPnvPicSacaPE6rR50DapEXSFWv7Snmq8rONLAiSqLJdpYZkzhDavbtAH8EXnADjucfHub9KU6CVyBbuA==`; ce SRI n'est **pas** le SRI npm.

Ces valeurs sont des références de preuves antérieures, pas le résultat d'une nouvelle reconstruction effectuée par cette reprise.

## B — revue de sécurité : premières constatations

- Les 18 anciens diagnostics Sonar PATH sont documentés CLOSED/FIXED au moment de la revue de fusion ; leurs tests adversariaux avaient été qualifiés. Un nouveau relevé global reste nécessaire.
- Les 13 diagnostics Sonar de la PR #12 ont des dispositions techniques individuelles en PR #13. Leur état administratif reste distinct et SonarCloud est resté FAILURE.
- Le SARIF CodeQL de `main` recense trois résultats sur fichiers inchangés, **non acceptés par extension**.
  1. `js/polynomial-redos`, `lib/validation.js:90` : expression régulière de validation d'image Docker à examiner sur chaînes longues/malformées. Nécessite tests de complexité bornés et revue du flux d'entrée.
  2. `js/insufficient-key-size`, `test/unit/secrets.test.js:55` : RSA-1024 créé intentionnellement dans le test `weak imported keys ... are rejected`, dont l'assertion attend `SECRET_CORRUPTED`. Contexte de test négatif établi par lecture de la source ; vérifier qu'aucune clé faible n'est acceptée ni persistée avant conclusion.
  3. `js/insufficient-password-hash`, `lib/spec.js:32` : `digest(value)` calcule un SHA-256 de données/JSON canoniques. Il faut vérifier les usages de la fonction et l'absence d'emploi comme dérivation de mot de passe avant de proposer un faux positif.
- CodeQL et Quality du commit intégré ont été exécutés avec succès ; ce résultat ne signifie pas zéro alerte globale.

## C — GitHub Security : limitations

Inventaires administratifs complets Code Scanning et Dependabot historiquement HTTP 403. Ne pas convertir un inventaire inaccessible en inventaire vide. Les résultats SARIF du run sont des preuves d'analyse, pas de l'état administratif des alertes.

## D — artefact

**NOT_REQUALIFIED_THIS_MISSION** : rebuild double, nouveau npm pack et consommateur isolé avec types doivent être rejoués à la source sélectionnée. Les preuves IL-5.11R sont disponibles mais restent historiques.

## E — préparation npm

**NOT_STARTED** : disponibilité de `0.1.0-alpha.3`, droits du publieur, OIDC/provenance, canal `next` et absence de scripts publiants doivent être vérifiés. Aucune publication, tag ou dist-tag ne doit être déclenché.

## F — décision

**PENDING**. Aucune autorisation de publication implicite. Reprendre B (y compris la caractérisation de `js/polynomial-redos`), C, D, E, puis fournir une matrice de décision et un rapport final avec preuves et réserves.

## Périmètre d'arrêt

Ne modifier ni Debian (toujours épinglé sur `aa9057f`), ni Server Runtime, ni Oxy-form, ni production. Ne pas fusionner cette branche documentaire automatiquement. Ne pas lancer Oxymotion D0.
