# Current corrective maintenance status

PR #17 is integrated as75ac104ddce8700b406ba839cfe1b8bfe6d6f477 and its integrated tree/package have been verified. PR #16 utilities have converged onto private exclusive outputs and explicitly verified inputs, with independent regression and functional qualification. See [the current review](IL-5.11-R6S-review.md), [PR16 inventory](IL-5.11-R6S-PR16-convergence-inventory.md) and [PR16 qualification](IL-5.11-R6S-PR16-qualification.md). Final post-merge verification remains a separate gate. Publication is not authorized and current authenticated npm reads returnHTTP401; the handoff records that limitation.

## Historical report — original content retained

The following report and its linked machine-readable records describe their original executions and are preserved as historical evidence. Their old status labels are not new CI or current qualification claims.

# IL-5.11 — Release Review de PR #15

Rapport actualisé au **2026-10-21T16:08:58+00:00**. **MERGED_POST_VALIDATION_FAILED maintenu pour un nouveau motif.** Les runs Quality/CodeQL post-fusion sont désormais réussis et publiés. La revue Sonar révèle un défaut confirmé de sortie temporaire symlink dans les scripts Python de preuve D2, non couvert par l’acceptation SMTP. Le package npm reste inchangé. [Reprise et dispositions individuelles](IL-5.11-postmerge-security-followup.md).

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

## R6 — CI rétablie, revue d’outillage non close

Les validations locales, l’arbre, les deux packages et l’archive GitHub restent vérifiés au SHA intégré. Les cinq jobs [Quality 39625251359](https://github.com/drumee/infra-layer/actions/runs/39625251359) passent. Les analyses [CodeQL 39625521356](https://github.com/drumee/infra-layer/actions/runs/39625521356) JS/TS et Actions passent ; checkout exact, upload et traitement des résultats terminés. Les seules annotations de ces jobs sont des notices sur l’image ubuntu-latest. Inventaires administratifs encore HTTP403 : aucune absence globale d’alerte affirmée.

Le relevé initial sans run et le refus de dispatch HTTP403 au PAT somanos restent [historiques](evidence/IL-5.11-release-review/postmerge-ci-blocker.json). Les runs sont apparus ensuite, créés à 15:23:40Z et 15:25:22Z ; la reprise n’a pas tenté un nouveau dispatch ni changé d’authentification/règle. La cause du décalage n’est pas attribuée.

**Nouveau blocage :** SonarCloud reste FAILURE et son analyse liée au SHA intégré expose 26 nouveaux IDs. Une reproduction privée confirme que les helpers de preuve à sortie prévisible sous /tmp suivent des liens préexistants et peuvent détourner l’écriture de journaux. Trois annotations concernent ce même défaut ; sept autres chemins restent à examiner. Deux hashes publics et les alertes d’extraction/traversée de contenu ont des faux positifs contextuels démontrés individuellement. Aucune nouvelle acceptation de risque ou fermeture administrative. [Analyse complète et matrice des 26](IL-5.11-postmerge-security-followup.md).

Les conclusions R1–R4 ci-dessus consignent la revue avant fusion sous les preuves alors disponibles ; elles ne valent pas acceptation du défaut maintenant observé. Le dossier doit être réévalué pour l’outillage Python sous docs, même absent de npm. **MERGED_AND_RELEASE_CANDIDATE_VERIFIED n’est pas atteint**. La fusion reste réelle et les octets npm restent ceux qualifiés ; aucune compromission historique des preuves n’est démontrée. Correction/requalification distincte nécessaire avant clôture R6 et décision de publication.

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

[Handoff alpha.3](IL-5.11-alpha3-publication-handoff.md) : références intégrées, droits npm déjà vérifiés et datés, 2FA/canal next, procédure et arrêts. Il ne constitue pas un feu vert de publication : R6 reste non clos à cause du défaut d’outillage et la publication demande une décision distincte. Le présent rapport est livré sur une branche documentaire issue du commit intégré avec PR distincte ; aucune écriture documentaire directe dans main.

Debian conserve **aa9057f224f4ae5cf80d777e3cb2fad092193fb1**. Futur réalignement avec images/parcours requalifiés ; OF-01R conditionné à la distribution sélectionnée/qualifiée, relais réel/DNS/réception/délivrabilité restent à examiner. Aucun Runtime/Oxy-form/production modifié, publication npm/image, tag, latest déplacé ou Oxymotion D0. Les échecs SMTP historiques et leurs horodatages restent référencés, non dupliqués. Logs frais et normalisations réversibles : [intégrité](evidence/IL-5.11-release-review/log-integrity.json).
