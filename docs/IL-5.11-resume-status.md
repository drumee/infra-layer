# IL-5.11 — État après Release Review

**MERGED_POST_VALIDATION_FAILED**, relevé 2026-10-21T15:07:21+00:00. [PR #15](https://github.com/drumee/infra-layer/pull/15) fusionnée : **`a02b76e4c421e96e63406d7b10edc2b76a6056c1`**, arbre **`06198f583c37e9d79d00689823fc4cb01ef441c2`**. [Acceptation SMTP](IL-5.11-owner-risk-decision.md) enregistrée : SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3. La cause SMTP reste inconnue ; aucune garantie Internet ou récupération spool, SMTP_RECOVERY_UNQUALIFIED conservé.

R1–R4 PASS ; R5 fusion confirmée sans bypass. R6 : contrôles locaux et double package PASS, mais **aucun run/check GitHub au SHA intégré**. Workflow dispatch Quality refusé HTTP403 au PAT CLI somanos ; pas de nouvel essai avec autre authentification. Quality/CodeQL/Sonar post-fusion restent à vérifier. Le statut ne signifie pas que les tests locaux échouent ; il interdit de déclarer la validation post-fusion complète.

Package **41 fichiers / 101778 octets**, SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e`, SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` ; identique à D2. Source/harnais/entrées inchangés, acceptations lourdes D2 reprises par identité ; unitaires/contrats/sécurité PATH/package/lint/audits/consommateur fraîchement rejoués. La publication reste interdite et exige une décision distincte après clôture R6.

[Rapport de revue](IL-5.11-release-review.md), [handoff alpha.3](IL-5.11-alpha3-publication-handoff.md). Rapports D2/F antérieurs conservés comme états datés de leurs phases. Rapport post-fusion livré en branche documentaire séparée, aucune écriture directe main. Debian reste `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` ; aucun consommateur ou production modifié.
