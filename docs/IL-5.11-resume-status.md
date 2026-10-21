# IL-5.11-Resume — État après D2

Mise à jour : 2026-10-21T13:18:49+00:00.

**READY_FOR_OWNER_RISK_DECISION**. D est **D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY** ; tous les contrôles requis passent, mais la cause du timeout SMTP initial reste inconnue. Publication non autorisée, aucune acceptation implicite de cette réserve. [Rapport final complet](IL-5.11-resume-final-decision.md).

| Étape | Résultat |
| --- | --- |
| B | PASS — ReDoS corrigé, SHA256/RSA justifiés individuellement |
| C | PASS_WITH_VISIBILITY_LIMITATIONS — CodeQL résultat FAILURE contextuel, Sonar FAILURE, inventaires globaux HTTP 403 |
| D / D2 | D_QUALIFIED_WITH_RESIDUAL_UNCERTAINTY — 176 unitaires, 24 contrats inclus, Gateway 17/17, Services 17/17, Lifecycle 16/16, application réelle 87 assertions, Package/lint/audits/consommateur réussis |
| SMTP | INTERMITTENCE_NOT_REPRODUCED — campagne bornée 3 × 17/17 ; succès intégré supplémentaire ; échec initial et cause inconnue conservés |
| E | PASS préparation — alpha.3 absente, next alpha.2/latest alpha.1, somanos read-write confirmé, 2FA auth-and-writes, OIDC local indisponible |
| F | READY_FOR_OWNER_RISK_DECISION — décision explicite sur la réserve avant toute autorisation distincte de publication |

Main distant revérifié : `8f297d8f676706f052a24ce4e875d91b76555b91`. Source testée D2 **`dbc0be5c20029374c68bdf510dfadd7da079fcf6`**, 41 membres identiques à la source exécutable d19e62b. [PR #15](https://github.com/drumee/infra-layer/pull/15) en brouillon, ouverte et non fusionnée. Les commits de rapport ultérieurs ne modifient aucun membre npm.

Candidat non publié : **41 fichiers / 101778 octets**, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. Deux reconstructions identiques au reçu D précédent ; [reçu D2](evidence/IL-5.11-D2/D2-artifact-receipt.json). L’arrêt FAILED_QUALIFICATION antérieur reste historique ; D2 l’a remplacé par une qualification avec réserve explicite.

Aucune fusion/publication/tag ni modification Debian, Runtime, Oxy-form ou production. Debian conserve `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`. Tout réalignement et OF-01R attendent une distribution sélectionnée/qualifiée ; aucun Oxymotion D0.
