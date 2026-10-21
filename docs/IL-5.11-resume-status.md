# IL-5.11-Resume — État consolidé alpha.3

Mise à jour : 2026-10-21T10:27:59+00:00.

**Qualification globale incomplète ; publication BLOQUÉE.** Dernier arrêt formel : `FAILED_QUALIFICATION`. Dernier résultat Services : **17/17 PASS** après le rejeu demandé ; aucun nouveau contrôle D complet ni contrôle E n’a suivi. [Rapport complet et décision](IL-5.11-resume-final-decision.md).

| Étape | État |
| --- | --- |
| B | **PASS**, ReDoS corrigé, SHA256/RSA négatif justifiés |
| C | **PASS_WITH_VISIBILITY_LIMITATIONS**, Quality réussis, analyses CodeQL réussies mais check de résultat FAILURE contextuel, inventaires HTTP 403, Sonar FAILURE |
| D | **INCOMPLET** ; 176 unitaires, 24 contrats, Gateway 17/17, Services 17/17 au rejeu, consommateur 8 assertions ; Lifecycle/Application/Package/lint D et refus supplémentaires manquants |
| E | **NON EXÉCUTÉE**, identité/droits npm et version/dist-tags non vérifiés |
| F | **Publication BLOQUÉE**, READY_FOR_PUBLICATION_AUTHORIZATION non atteint |

## Références actuelles

- Main distant revérifié : `8f297d8f676706f052a24ce4e875d91b76555b91` (PR #14).
- PR #12 : `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` ; PR #13 : `729b755e49f22c220b0cd1a42f619261ba9ce260`.
- Correctif analysé C : `299fa3ea740f44aa76eaea52115e006464e4a345` ; clone propre testé D : `d19e62ba682dc2d781f5f941c7ba4b37e3a65053`.
- Branche `feat/il511-resume-final-qualification`, [PR #15 en brouillon](https://github.com/drumee/infra-layer/pull/15), non fusionnée. Aucun correctif candidat intégré à main.
- Candidat local non publié : `@drumee/infra-layer@0.1.0-alpha.3`, **41 membres / 101778 octets**.
- SHA256 npm : `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`.
- SRI npm : `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`.

Les anciennes empreintes f2fd950e… / sha512-BP1h… appartiennent à IL-5.11R. Le correctif ReDoS modifie les octets distribués : elles ne désignent plus ce candidat. Liste exhaustive dans le [reçu D](evidence/IL-5.11-resume/D-artifact-receipt.json). L’état initial de PR #14 reste consultable dans l’historique Git, distinct de cet état consolidé.

## Reprise

Préserver les deux essais Services (15/17 initial, 17/17 au rejeu) et caractériser la fiabilité du timeout initial dont la cause n’est pas établie. Terminer les contrôles D manquants depuis une source propre figée, puis E et une nouvelle décision F. Aucun succès historique ne remplace une acceptation nécessaire du nouveau candidat.

Debian reste épinglé sur `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`. Aucune publication, tag, fusion automatique, modification de consommateur/production ni Oxymotion D0.
