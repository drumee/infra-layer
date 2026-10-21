# IL-5.11 — Reprise des contrôles post-fusion

Relevé **2026-10-21T16:08:58+00:00**, main **`a02b76e4c421e96e63406d7b10edc2b76a6056c1`**, inchangé.

**MERGED_POST_VALIDATION_FAILED maintenu pour un nouveau motif de revue.** Le blocage de disponibilité CI est levé : Quality et CodeQL sont maintenant disponibles et réussis au SHA intégré. La lecture Sonar révèle toutefois un défaut confirmé de gestion des sorties dans les helpers Python de preuve. Il n’est pas couvert par l’acceptation SMTP et n’est pas accepté implicitement. Aucun octet npm ni réglage de sécurité modifié.

## CI post-fusion désormais établie

[Quality 39625251359](https://github.com/drumee/infra-layer/actions/runs/39625251359) : créé 2026-10-21T15:23:40Z, terminé 15:24:00Z, **cinq jobs SUCCESS** (unit, contracts, eslint, dependencies, packaging). Les étapes skipped propres aux autres cases de la matrice sont conditionnelles ; les cinq commandes prévues sont bien exécutées par leur job respectif.

[CodeQL 39625521356](https://github.com/drumee/infra-layer/actions/runs/39625521356), événement dynamic « Push on main » : créé 15:25:22Z, terminé 15:26:55Z. JS/TS et Actions **SUCCESS**, checkout du SHA exact, upload des résultats et traitement **complete** dans les logs des deux jobs. Les annotations natives sont uniquement deux notices de migration ubuntu-latest vers Ubuntu 26, pas des diagnostics de code. Aucun artefact SARIF téléchargeable dans ce run ; lectures administratives des alertes et analyses encore **HTTP403 security_events=read**. Succès de l’analyse et absence de vulnérabilité globale restent distincts. La fixture RSA-1024 conserve sa disposition B, sans clôture administrative ; aucun nouveau check PR « CodeQL » n’est inventé sur main.

Le refus historique de workflow dispatch Quality HTTP403 est conservé. Cette reprise n’a **pas** retenté le dispatch : les runs existaient déjà à sa première lecture. Leur cause de déclenchement tardif n’est pas attribuée à un changement de jeton ou une action de Codex. [Métadonnées et jobs exacts](evidence/IL-5.11-release-review/ci-resume/github.json), [upload JS](evidence/IL-5.11-release-review/ci-resume/codeql-js-upload.txt), [upload Actions](evidence/IL-5.11-release-review/ci-resume/codeql-actions-upload.txt), [accès Security](evidence/IL-5.11-release-review/ci-resume/security-read.json).

## SonarCloud et nouveau défaut de preuve

Sonar reste **FAILURE** (Security Rating E / Reliability D sur nouveau code). Dernière analyse du 2026-10-21T15:41:23+0000, révision explicitement **a02b76e** : **236 OPEN**, **26 IDs nouveaux** par rapport au relevé B à 213 ; trois anciens IDs sont absents de cette vue ouverte, sans prétendre une clôture administrative vérifiée. Le journal d’analyse mentionne le profil Python « Sonar way comprehensive » ; aucun profil ou règle n’a été modifié par cette reprise. [Révision Sonar](evidence/IL-5.11-release-review/ci-resume/sonar-analysis.json), [métadonnées du relevé](evidence/IL-5.11-release-review/ci-resume/sonar-snapshot-metadata.json).

Les helpers `docs/evidence/IL-5.11-D2/qualify.py`, `campaign.py` et `artifact.py` utilisent une sortie prévisible `/tmp/il511-D2-results`. Les ouvertures ordinaires et `mkdir(exist_ok=True)` ne garantissent pas une racine privée exclusive, l’ownership ou le refus de liens préexistants. Si un utilisateur local non fiable peut précréer un répertoire de sortie accessible et y placer un lien, l’opérateur qui rejoue le helper peut écrire hors de la sortie attendue. Menace locale sur l’intégrité du runner/preuves ; pas un accès réseau au package npm.

**Reproduction bornée confirmée**, exclusivement dans un TemporaryDirectory privé appartenant au test : un journal symlink remplace un fichier sentinelle hors du sous-répertoire de sortie ; une racine de sortie symlink est suivie par mkdir/write. Tous les fichiers de la reproduction sont supprimés. Aucune écriture sur les vrais chemins de qualification, dépôt, système ou service. [Script](evidence/IL-5.11-release-review/ci-resume/temp-path-proof.py), [résultat](evidence/IL-5.11-release-review/ci-resume/temp-path-proof.json). Cette reproduction démontre la primitive de redirection, pas une exploitation ou compromission des campagnes historiques.

Ces scripts de preuve ont été ajoutés pendant D2. La comparaison antérieure « aucune différence hors docs » reste exacte mais ne suffisait pas à considérer les fichiers Python sous docs comme inertes ou sûrs à rejouer. Je n’avais pas sécurisé leur racine de sortie prévisible. Aucune correction n’est présentée comme intégrée et aucune nouvelle acceptation de risque n’est demandée par défaut. Le package npm et ses 41 membres restent inchangés ; les preuves binaires enregistrées ne sont pas prétendues corrompues.

## Dispositions individuelles des nouveaux diagnostics

| ID | Règle | Fichier / ligne | Disposition |
| --- | --- | --- | --- |
| `AaFfIGkaiVCHHK7y-ruR` | json:S6418 | `docs/evidence/IL-5.11-D2/D2-artifact-receipt.json:26` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGkFiVCHHK7y-ruE` | python:S5443 | `docs/evidence/IL-5.11-D2/artifact.py:3` | **NEEDS_INVESTIGATION** |
| `AaFfIGkFiVCHHK7y-ruF` | python:S5443 | `docs/evidence/IL-5.11-D2/artifact.py:3` | **CONFIRMED_DEFECT** |
| `AaFfIGkFiVCHHK7y-ruG` | python:S5443 | `docs/evidence/IL-5.11-D2/artifact.py:5` | **NEEDS_INVESTIGATION** |
| `AaFfIGkFiVCHHK7y-ruI` | pythonsecurity:S6096 | `docs/evidence/IL-5.11-D2/artifact.py:14` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGkFiVCHHK7y-ruH` | pythonsecurity:S2083 | `docs/evidence/IL-5.11-D2/artifact.py:18` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGj5iVCHHK7y-rt-` | python:S5443 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **NEEDS_INVESTIGATION** |
| `AaFfIGj5iVCHHK7y-rt_` | python:S5443 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **CONFIRMED_DEFECT** |
| `AaFfIGj5iVCHHK7y-ruA` | python:S5443 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **NEEDS_INVESTIGATION** |
| `AaFfIGj5iVCHHK7y-ruB` | python:S5443 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGj5iVCHHK7y-ruC` | python:S1313 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **TEST_CONFIGURATION_CONTEXT_CHECKED** |
| `AaFfIGj5iVCHHK7y-ruD` | python:S5443 | `docs/evidence/IL-5.11-D2/qualify.py:2` | **NEEDS_INVESTIGATION** |
| `AaFfIGj5iVCHHK7y-rt9` | python:S1192 | `docs/evidence/IL-5.11-D2/qualify.py:5` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGkPiVCHHK7y-ruK` | python:S5443 | `docs/evidence/IL-5.11-D2/campaign.py:2` | **NEEDS_INVESTIGATION** |
| `AaFfIGkPiVCHHK7y-ruL` | python:S5443 | `docs/evidence/IL-5.11-D2/campaign.py:2` | **CONFIRMED_DEFECT** |
| `AaFfIGkPiVCHHK7y-ruM` | python:S5443 | `docs/evidence/IL-5.11-D2/campaign.py:5` | **NEEDS_INVESTIGATION** |
| `AaFfIGkPiVCHHK7y-ruP` | python:S1515 | `docs/evidence/IL-5.11-D2/campaign.py:10` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGkPiVCHHK7y-ruQ` | python:S1515 | `docs/evidence/IL-5.11-D2/campaign.py:11` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGkPiVCHHK7y-ruO` | python:S1515 | `docs/evidence/IL-5.11-D2/campaign.py:12` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGkPiVCHHK7y-ruJ` | python:S1192 | `docs/evidence/IL-5.11-D2/campaign.py:13` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGkPiVCHHK7y-ruN` | python:S1515 | `docs/evidence/IL-5.11-D2/campaign.py:17` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGjkiVCHHK7y-rt8` | javascript:S1313 | `test/application/consumer-refusals.cjs:18` | **TEST_CONFIGURATION_CONTEXT_CHECKED** |
| `AaFfIGjdiVCHHK7y-rt7` | javascript:S2681 | `test/services/capture.js:15` | **STYLE_ONLY_CONTEXT_CHECKED** |
| `AaFfIGk8iVCHHK7y-ruT` | json:S6418 | `docs/evidence/IL-5.11-resume/D-artifact-receipt.json:28` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGksiVCHHK7y-ruS` | python:S5443 | `docs/evidence/IL-5.11-resume/image-validation-cost.py:22` | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** |
| `AaFfIGiWiVCHHK7y-rt6` | javascript:S6353 | `lib/validation.js:95` | **STYLE_ONLY_CONTEXT_CHECKED** |

Les trois CONFIRMED_DEFECT signalent le même mécanisme sur les sorties. Les autres chemins temporaires source/cache/TypeScript marqués NEEDS_INVESTIGATION ne sont pas acceptés globalement. Le Nginx est vérifié par trustedExecutable et le probe ReDoS utilise cwd=/tmp sans création de fichier/lookup relatif : dispositions contextuelles distinctes. Les deux S6418 correspondent exactement au SHA256 public recalculé de capabilities/secrets/index.js, pas à un credential. S6096 ne fait aucune extraction vers le filesystem ; S2083 écrit un chemin constant et sérialise le contenu en données, sans supprimer le défaut séparé de racine symlink. Les closures sont rejointes avant itération suivante, les IP sont des entrées explicites de test, et le guard de taille capture retourne avant écriture en cas d’excès. Justifications complètes par ID dans [la matrice JSON](evidence/IL-5.11-release-review/ci-resume/sonar-new-dispositions.json).

Aucun nouveau diagnostic VULNERABILITY de cet ensemble ne vise un membre npm ; le changement lib/validation.js est une observation stylistique sur [0-9]. Cela ne permet pas d’accepter un défaut des helpers exécutés par le runner. Aucun état Sonar/CodeQL modifié ou déclaré vert artificiellement.

## Décision et reprise nécessaire

**R6 non clos**, malgré CI post-fusion PASS. Le défaut des helpers doit être traité séparément : sorties privées créées exclusivement, validation des racines/ownership/modes/liens, écritures refusant les liens et tests négatifs correspondants, puis requalification adaptée. Les copies de helpers livrées dans la PR documentaire doivent aussi être examinées pour ce même schéma. Aucune nouvelle fusion ou modification de main dans cette reprise ; toute intégration corrective exige une revue/autorisation appropriée.

La réserve SMTP acceptée ne s’étend pas à ce défaut d’intégrité d’outillage. Les empreintes npm/source et les tests déjà établis restent consignés ; aucune publication, tag, image, latest, Debian, Runtime, Oxy-form, production ou Oxymotion D0.
