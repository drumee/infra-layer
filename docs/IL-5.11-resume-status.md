# IL-5.11 — État après reprise de la Release Review

**MERGED_POST_VALIDATION_FAILED**, relevé 2026-10-21T16:08:58+00:00. PR #15 fusionnée, main **a02b76e4c421e96e63406d7b10edc2b76a6056c1** inchangé. Acceptation SMTP limitée enregistrée ; aucune publication autorisée.

Quality **39625251359** et CodeQL **39625521356** post-fusion sont maintenant **SUCCESS**, avec upload/traitement des analyses terminé. Le premier blocage CI et son refus HTTP403 restent historiques ; aucun nouveau dispatch tenté, puisque les runs existaient déjà à la reprise. SonarCloud reste **FAILURE** ; inventaire administratif CodeQL encore HTTP403.

La revue des 26 nouveaux IDs Sonar révèle un **défaut confirmé dans les helpers Python de preuve** : sorties /tmp prévisibles, liens préexistants suivis à l’écriture. Reproduction bornée dans des fichiers temporaires possédés, sans toucher aux ressources réelles. Les 41 membres npm et leurs empreintes restent inchangés ; aucune compromission de preuve observée, aucune nouvelle acceptation de risque.

**R6 reste non clos** pour ce nouveau motif. [Suivi de sécurité et dispositions](IL-5.11-postmerge-security-followup.md), [rapport complet](IL-5.11-release-review.md), [handoff](IL-5.11-alpha3-publication-handoff.md). Correction et requalification de l’outillage requises séparément avant décision de publication. Aucun changement de code, règle/scanner, main, Debian/Runtime/Oxy-form/production, npm/tag/image/latest ou Oxymotion D0 pendant cette reprise.
