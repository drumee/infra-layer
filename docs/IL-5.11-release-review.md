# IL-5.11 — Release Review de PR #15

Rapport arrêté au **2026-10-21T15:07:21+00:00**. **MERGED_POST_VALIDATION_FAILED** : fusion confirmée et contrôles locaux post-fusion réussis, mais clôture R6 impossible faute de résultats GitHub Quality/CodeQL au commit intégré. Le déclenchement manuel Quality est refusé HTTP 403 au PAT CLI de somanos. Ce statut décrit une validation post-fusion incomplète, pas un échec des tests locaux ni une vulnérabilité nouvelle démontrée.

## R1 — Décision propriétaire : PASS

[Décision exacte et périmètre](IL-5.11-owner-risk-decision.md), commit documentaire **`bf14ab25c1963d623db4b7646b923f5c6b53b0b0`**, intégré par PR #15. Statut **SMTP_RESIDUAL_UNCERTAINTY_ACCEPTED_FOR_ALPHA3**. Cause du timeout initial inconnue, cascade 15 → 16, échec/rejeu/campagne et limites statistiques conservés. L’acceptation limitée à alpha.3 expérimentale n’est ni une correction, ni une acceptation de perte de messages/TLS faible/open relay, ni une garantie de délivrabilité Internet/restauration de spool. **SMTP_RECOVERY_UNQUALIFIED reste applicable.** Publication séparément interdite.

## R2 — Source et contrats : PASS

| Identité | Référence |
| --- | --- |
| Main avant fusion | `8f297d8f676706f052a24ce4e875d91b76555b91` |
| Source corrective initiale | `299fa3ea740f44aa76eaea52115e006464e4a345` |
| Source exécutable antérieure | `d19e62ba682dc2d781f5f941c7ba4b37e3a65053` |
| Source de qualification complète D2 | `dbc0be5c20029374c68bdf510dfadd7da079fcf6` |
| Livraison avant acceptation | `0436756ff5fd4ecd0483a0ba09e37ee33e6b8015` |
| HEAD final de PR avec acceptation | **`bf14ab25c1963d623db4b7646b923f5c6b53b0b0`** |
| Commit canonique fusionné | **`a02b76e4c421e96e63406d7b10edc2b76a6056c1`** |
| Arbre PR et fusion, identique | **`06198f583c37e9d79d00689823fc4cb01ef441c2`** |

AGENTS.md applicable recherché dans les ancêtres et l’arbre : absent. Checkout original préservé ; clones distants propres pour revue et vérification post-fusion. Main n’a pas évolué depuis la base D2. Comparaison D2 → HEAD final : **aucune différence hors docs**, y compris harnais, entrées, workflows, package.json, lockfile, exports, types et production. Les 41 membres sont vérifiés par empreinte et à la reconstruction, sans supposer leur identité. Aucun nouveau changement exécutable non qualifié. Aucun contrat public modifié après D2, aucune dépendance runtime.

## R3 — Sécurité et politique GitHub : PASS avec limites explicites

ReDoS : regex vulnérable remplacée par partition déterministe puis composants simples linéaires. Formats/digests, erreurs, caractères interdits, longueurs extrêmes et million de caractères borné couverts par les tests rejoués. Pas de dépendance ajoutée. Contrats historiques conservés, terminaisons de ligne invalides refusées conformément à B.

PATH : chemins Docker/ss/OpenSSL approuvés, root ownership, modes/liens/parents et configuration plugins Docker vérifiés, pas de fallback PATH, environnements enfants explicites et shell false. ACME vérifie son client et les entrées/environnements. **12 scénarios réels** du conteneur sécurité passent avant et après fusion ; aucun binaire ou droit hôte modifié. SHA256 et RSA-1024 conservent leurs dispositions techniques B ; elles sont distinctes de la réserve SMTP acceptée.

Au HEAD final, les cinq Quality passent sur PR (**39618137322**) et push (**39618268450**). Un ancien push **39618254389 annulé** reste visible avec ses jobs incomplets/annulés : aucune dissimulation, nouveaux runs courants successifs réussis. Analyses CodeQL JS/TS et Actions SUCCESS, résultats publiés ; **check CodeQL 119284456291 FAILURE**, une alerte high RSA-1024 négative, commentaire au HEAD exact `test/unit/secrets.test.js:65`, alerte #8. Aucune fermeture ni faux vert. **SonarCloud FAILURE** au HEAD PR. Inventaires globaux Security historiquement HTTP 403, pas d’inventaire vide prétendu. [Preuves GitHub pré-fusion](evidence/IL-5.11-release-review/premerge/github.json).

Identité connecteur **somanos**, rôle repo admin rapporté ; ce rôle ne prouve pas les grants du jeton. Branch resource : protected=false ; rulesets incluant parents : liste vide, revérifiés immédiatement avant fusion. Lecture détaillée de protection classique **HTTP403 Resource not accessible by integration**, conservée comme limite ; endpoint rules/branches non exposé par le fetch. Aucun contrôle obligatoire observé imposant CodeQL/Sonar vert, ni règle de signature imposée observée. Méthode merge commit autorisée par le dépôt. Aucun paramètre d’override/admin-bypass demandé, aucune règle, workflow ou scanner modifié.

## R4 — Qualification finale : PASS

Nouvelles exécutions au HEAD final dans un clone propre : installation verrouillée scripts désactivés, **unitaires 176/176** dont 24 contrats, contrats séparés **24/24**, sécurité des outils **12 scénarios réels**, packaging, lint **0 erreur / 29 avertissements historiques / 0 nouveau**, audits production/développement **0 vulnérabilité connue**, consommateur **8 + 37 assertions** et types stricts. Aucun nouveau scénario SMTP lourd exécuté : Gateway **17/17**, Services **17/17**, campagne **3 × 17/17**, Lifecycle **16/16** et application réelle **87 assertions** sont **repris par identité D2**, avec code/harnas/entrées inchangés ; ils ne sont pas présentés comme nouvellement exécutés.

Deux tarballs reconstruits depuis le HEAD final : **41 fichiers / 101778 octets**, tous contenus identiques au reçu D2. SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` ; SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==`. Exports, types et lockfile inchangés, dépendances runtime vides. [Reçu pré-fusion](evidence/IL-5.11-release-review/premerge/receipt.json), logs et empreintes dans le même dossier.

## R5 — Fusion : CONFIRMÉE

Revue technique COMMENT **5601594509** ancrée au HEAD final ; aucune auto-approbation de pair prétendue sous l’identité de l’auteur. PR sortie du brouillon, état relu. Immédiatement avant fusion : HEAD/base, mergeable=true, règles et derniers Quality/analyses revérifiés. Fusion ordinaire par merge commit avec **expected_head_sha**, sans override ni changement d’authentification pour contourner une règle. GitHub confirme merged=true pour [PR #15](https://github.com/drumee/infra-layer/pull/15), merge SHA **`a02b76e4c421e96e63406d7b10edc2b76a6056c1`**.

Parents : **`8f297d8f676706f052a24ce4e875d91b76555b91`**, **`bf14ab25c1963d623db4b7646b923f5c6b53b0b0`**. Signature du commit de fusion : GitHub **verified=true, reason=valid**. L’arbre fusionné est exactement celui du HEAD examiné. Aucune opération de retour arrière tentée ni présumée autorisée.

## R6 — Vérification post-fusion : INCOMPLÈTE / échec de clôture

Nouveau clone propre de main au SHA exact. Deux nouveaux packages identiques au candidat et aux reconstructions pré-fusion ; 41 contenus vérifiés. Unitaires, contrats, 12 scénarios PATH réels, package, lint, deux audits et consommateur/types rejoués : tous PASS. ReDoS/PATH et décision propriétaire présents dans l’arbre. [Reçu post-fusion](evidence/IL-5.11-release-review/postmerge/receipt.json).

**Aucun run Actions ni check au SHA intégré n’est visible**, confirmé par connecteur et lectures REST CLI (total_count=0). Les derniers runs main visibles concernent l’ancien 8f297d8 ; ils ne sont pas substitués. Quality et CodeQL restent déclarés actifs, mais la cause de l’absence de déclenchement automatique n’est pas établie. Aucun nouveau résultat CodeQL ou Sonar sur main ne peut être annoncé ; aucun inventaire administratif de nouvelles alertes n’est certifié.

Tentative unique de déclenchement du workflow Quality existant, sans modifier sa définition : `gh workflow run quality.yml --repo drumee/infra-layer --ref main`. Identité CLI confirmée : **somanos**. Réponse **HTTP403 Resource not accessible by personal access token**, endpoint `POST /repos/drumee/infra-layer/actions/workflows/388454157/dispatches`. L’API requiert [Actions en écriture pour un jeton fin](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event). Les grants détaillés du jeton ne sont pas énumérés ; le refus prouve qu’il n’autorise pas cette opération, sans déterminer si grant absent ou autre restriction du jeton. Aucun essai avec autre authentification après le refus, aucun changement de permissions, configuration de scanner ou commit artificiel sur main pour provoquer un run.

[Blocage précis](evidence/IL-5.11-release-review/postmerge-ci-blocker.json), [état GitHub post-fusion](evidence/IL-5.11-release-review/postmerge/github.json). **MERGED_AND_RELEASE_CANDIDATE_VERIFIED n’est pas atteint.** Reprise administrative nécessaire : obtenir les contrôles Quality et l’analyse native CodeQL publiée au SHA intégré via un opérateur/accès déjà autorisé, examiner diagnostics et Sonar, puis clore R6. Toute nouvelle défaillance significative est évaluée indépendamment de l’acceptation SMTP. La fusion reste réelle ; son annulation demanderait une opération distincte autorisée.

## Identités source et npm, séparées

| Identité | Valeur vérifiée |
| --- | --- |
| Commit Git canonique | `a02b76e4c421e96e63406d7b10edc2b76a6056c1` |
| Arbre Git | `06198f583c37e9d79d00689823fc4cb01ef441c2` |
| Archive source GitHub | **667195 octets**, 359 fichiers Git comparés aux blobs |
| SHA256 archive source | `3516e0adf79a610b6b8891f81a710d23df7293dad3de3e274bf3d6f5c487cc34` |
| SRI archive source | `sha512-ouj5Bttkrd1+3B/1x4qhBv4gEpGaaXNXLRlqVkYuLUkXQnpE+F1PYrtDYK167suxkLNU9bWzkPmw1JTPdgREKg==` |
| Package npm | **41 fichiers / 101778 octets**, version 0.1.0-alpha.3 |
| SHA256 npm | `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` |
| SRI npm | `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` |

[Archive source exacte](https://github.com/drumee/infra-layer/archive/a02b76e4c421e96e63406d7b10edc2b76a6056c1.tar.gz), HTTP200, URL résolue et reçu dans [source-archive-receipt.json](evidence/IL-5.11-release-review/source-archive-receipt.json). Chaque chemin/bloc Git est vérifié, aucune archive GitHub supposée identique à celle du HEAD PR. Cette empreinte source ne remplace jamais le SRI npm. Les membres npm restent identiques à D2 ; les anciennes empreintes IL-5.11R f2fd950e…/BP1h… désignent un autre package historique.

## R7 — Handoff préparé, publication BLOQUÉE

[Handoff alpha.3](IL-5.11-alpha3-publication-handoff.md) : références intégrées, droits npm déjà vérifiés et datés, 2FA/canal next, procédure et arrêts. Il ne constitue pas un feu vert de publication : R6 manque et la publication demande une décision distincte. Le présent rapport est livré sur une branche documentaire issue du commit intégré avec PR distincte ; aucune écriture documentaire directe dans main.

Debian conserve **aa9057f224f4ae5cf80d777e3cb2fad092193fb1**. Futur réalignement avec images/parcours requalifiés ; OF-01R conditionné à la distribution sélectionnée/qualifiée, relais réel/DNS/réception/délivrabilité restent à examiner. Aucun Runtime/Oxy-form/production modifié, publication npm/image, tag, latest déplacé ou Oxymotion D0. Les échecs SMTP historiques et leurs horodatages restent référencés, non dupliqués. Logs frais et normalisations réversibles : [intégrité](evidence/IL-5.11-release-review/log-integrity.json).
