# IL-5.11-R6S — Revue des diagnostics de la PR17

**Les29annotations au HEAD0f8d80c ont une disposition technique individuelle. SonarCloud reste FAILURE**, Security Rating E sur nouveau code ; aucun état administratif modifié. Le [relevé intégral](evidence/IL-5.11-R6S-D4/F-sonar-PR17/issues.json) et la [matrice motivée par ID](evidence/IL-5.11-R6S-D4/F-dispositions/dispositions.json) sont conservés.

Dix annotations sont des faux positifs techniquement établis (hashes publics, chemins protégés et contrôle de noms/dir_fd), neuf observations de style n’altèrent pas les résultats. **Dix autres sont caractérisées uniquement dans le contexte des exécutions enregistrées** : copies de diagnostic avec chemins fixés vers le clone et les preuves sélectionnés, contrôlés et possédés. Ce ne sont pas des lanceurs autonomes sûrs pour un chemin arbitraire sur un nouvel hôte. Ne pas reclasser ces dix cas en faux positifs génériques ; toute reprise doit vérifier le clone et les dossiers de preuves avant de les importer/lire. Le contrat des trois helpers corrigés n’utilise plus de checkout implicite ni de cache global prévisible.

Les deux S6418 sont exactement le SHA256 public recalculé de capabilities/secrets/index.js : `b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432`. Rien ne stocke ou vérifie ici un mot de passe. Les S8707 traversent component()/open_trusted et les opérations fd : noms simples sans slash/point/double-point/NUL, parents absolus vérifiés sans lien, UID/modes et créations exclusives. D4 exige le refus métier et les tests de liens/../primitives historiques réussissent ; ce sont les contrôles effectifs, pas un changement de ligne Sonar, qui fondent la disposition.

Les S5778 ne masquent pas d’erreur : une seule opération est sélectionnée par itération D4, le type et message UNTRUSTED_OWNER sont exigés. Les deux autres contextes vérifient les primitives historiques puis toutes les sentinelles. S108 est un fichier npmrc volontairement vide créé0600/exclusif et fermé par contexte. Les doublons de commandes/with restent de style, sans changer le code pour l’apparence du scanner.

| ID | Règle | Emplacement | Disposition technique |
| --- | --- | --- | --- |
| `AaFgWKi-d7jkqQWKhJ3-` | json:S6418 | `IL-5.11-R6S-D4/E-artifact/artifact-receipt.json:26` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKjFd7jkqQWKhJ4E` | python:S5443 | `IL-5.11-R6S-D4/export-proof.py:3` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjFd7jkqQWKhJ4F` | python:S5443 | `IL-5.11-R6S-D4/export-proof.py:8` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjFd7jkqQWKhJ4H` | pythonsecurity:S8707 | `IL-5.11-R6S-D4/export-proof.py:9` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKjFd7jkqQWKhJ4G` | python:S9154 | `IL-5.11-R6S-D4/export-proof.py:17` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKi9d7jkqQWKhJ39` | python:S5443 | `IL-5.11-R6S-D4/sonar-read.py:3` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjDd7jkqQWKhJ4A` | python:S5443 | `IL-5.11-R6S-D4/validate-proof.py:3` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjDd7jkqQWKhJ4B` | python:S5443 | `IL-5.11-R6S-D4/validate-proof.py:7` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjDd7jkqQWKhJ4C` | python:S5443 | `IL-5.11-R6S-D4/validate-proof.py:7` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKjDd7jkqQWKhJ4D` | python:S5443 | `IL-5.11-R6S-D4/validate-proof.py:7` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKgLd7jkqQWKhJ37` | python:S5443 | `IL-5.11-R6S-D4/diagnose.py:3` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKgLd7jkqQWKhJ38` | python:S5443 | `IL-5.11-R6S-D4/diagnose.py:11` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKgLd7jkqQWKhJ35` | python:S1192 | `IL-5.11-R6S-D4/diagnose.py:20` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKgLd7jkqQWKhJ36` | python:S1192 | `IL-5.11-R6S-D4/diagnose.py:29` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKjBd7jkqQWKhJ3_` | python:S5443 | `IL-5.11-R6S-D4/run-proof.py:3` | CONTEXT_CHECKED_RECORDED_RUN_ONLY |
| `AaFgWKlFd7jkqQWKhJ4T` | python:S5778 | `test/security/evidence_helpers_test.py:164` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKlCd7jkqQWKhJ4S` | json:S6418 | `IL-5.11-R6S/static-distributed-comparison.json:21` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKlFd7jkqQWKhJ4U` | python:S5778 | `test/security/evidence_helpers_test.py:272` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKlFd7jkqQWKhJ4V` | python:S5778 | `test/security/evidence_helpers_test.py:277` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKk5d7jkqQWKhJ4I` | python:S1192 | `IL-5.11-D2/qualify.py:12` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKk_d7jkqQWKhJ4K` | python:S5443 | `IL-5.11-D2/secure_evidence.py:71` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4L` | python:S5443 | `IL-5.11-D2/secure_evidence.py:122` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4O` | pythonsecurity:S8707 | `IL-5.11-D2/secure_evidence.py:128` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4Q` | pythonsecurity:S8707 | `IL-5.11-D2/secure_evidence.py:129` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4P` | pythonsecurity:S8707 | `IL-5.11-D2/secure_evidence.py:157` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4R` | pythonsecurity:S8707 | `IL-5.11-D2/secure_evidence.py:173` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4M` | python:S5443 | `IL-5.11-D2/secure_evidence.py:205` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFgWKk_d7jkqQWKhJ4J` | python:S1192 | `IL-5.11-D2/secure_evidence.py:212` | STYLE_ONLY_CONTEXT_CHECKED |
| `AaFgWKk_d7jkqQWKhJ4N` | python:S108 | `IL-5.11-D2/secure_evidence.py:227` | STYLE_ONLY_CONTEXT_CHECKED |

Les trois anciens défauts de destination D2 sont techniquement corrigés et qualifiés ; aucun état CLOSED/FIXED Sonar non observé n’est annoncé. La vue PR contient les diagnostics du diff, pas l’inventaire global. CodeQL : analyses JS/TS+Actions et contrôle de résultat SUCCESS, aucune nouvelle alerte dans le code modifié selon ce contrôle ; **aucune couverture Python prétendue**. Inventaires globaux Code Scanning et Dependabot fraîchement HTTP403 avec le PAT ; protection classique HTTP403 avec l’intégration. [Accès observés](evidence/IL-5.11-R6S-D4/G-security-access/access.json). Main protected=false et rulesets incluant parents vides à la lecture, sans changement de politique.

Les limites root/sameUID et de confiance dans le filesystem restent celles du contrat. Aucun risque SMTP supplémentaire accepté ; aucune portée Internet delivery/spool ajoutée. Les copies vulnérables de #16 restent à faire converger avant leur intégration ; cette PR ne les fusionne pas.

## Rapports précédents conservés

# IL-5.11-R6S — Réexamen après qualification D4/E

Les défauts de sorties des trois helpers sont **TECHNICALLY_FIXED_AND_LOCALLY_QUALIFIED** : racines exclusives privées, écritures fd, D1/D2/D10 et D4 réellement réussis. Les anciens chemins NEEDS_INVESTIGATION source/cache/TS sont désormais caractérisés : source explicite vérifiée propre, cache privé par exécution, TS explicite avec contrôle de composants/arbre ; Nginx garde ses protections IL-5.11R. Les exécutions E réelles réussissent sans permissions assouplies ni dépendance ajoutée.

La lecture publique Sonar main effectuée pendant cette reprise confirme la même analyse a02b76e :236OPEN, date15:41:23Z. Sonar demeure FAILURE ; aucun état fermé annoncé. [Snapshot frais de lecture, analyse inchangée](evidence/IL-5.11-R6S-D4/F-sonar-main/http-receipts.json). Les résultats PR corrective restent à lire après push.

D4 n’est ni un mock ni une acceptation de risque : le défaut est celui de son montage de préparation, corrigé en conservant CAP_CHOWN seule. Les conditions sameUID/root de l’output-contract restent explicites. Les scripts de diagnostic copiés dans les preuves retracent les commandes effectivement exécutées sur le clone explicitement choisi /tmp/il511-r6s ; ils ne constituent pas un mécanisme de sélection automatique d’un checkout étranger. Toute reproduction sur un autre hôte doit sélectionner/vérifier son checkout et ses préconditions Docker avant exécution. Aucun rootless/userns universel n’est revendiqué ; précondition non satisfaite = D4_SETUP_FAILED.

## Dispositions historiques et résultat administratif distinct

# IL-5.11-R6S — Disposition de sécurité

**Qualification arrêtée en D ; pas de nouvelle analyse SonarCloud/CodeQL à la branche corrective.** Les états administratifs ne sont pas modifiés.

Le relevé de référence est celui de main a02b76e, analyse SonarCloud du 2026-10-21T15:41:23+0000, enregistré dans la PR #16 (`1c9d20f1cc315628cfd703199423c6efc873ff13`) : 236 OPEN, SonarCloud FAILURE. Ces nombres sont historiques, pas un nouveau relevé sur le correctif. Le rapport et les matrices de #16 restent dans cette branche non fusionnée et n’ont pas été réécrits.

| Diagnostics de référence | Disposition sur cette branche |
| --- | --- |
| S5443 sorties artifact `AaFfIGkFiVCHHK7y-ruF`, qualify `AaFfIGj5iVCHHK7y-rt_`, campaign `AaFfIGkPiVCHHK7y-ruL` | CONFIRMED_DEFECT ; correction candidate par racine privée/exclusive et écritures fd. Les deux primitives passent D1/D2/D10 ; **qualification globale incomplète**, aucune clôture administrative. |
| S5443 source artifact `...ruE`, qualify `...rt-`, campaign `...ruK` | Chemin implicite supprimé ; source explicite, vérification composants ownership/modes/liens et HEAD propre. TRUSTED_EXISTING sous responsabilité de sélection de l’opérateur. Exécution des helpers encore non requalifiée. |
| S5443 cache artifact `...ruG`, qualify `...ruA`, campaign `...ruM` | Cache fixe supprimé ; chaque exécution crée un enfant privé exclusif. Aucun cache historique supprimé/réutilisé. Requalification métier en attente. |
| S5443 TypeScript qualify `...ruD` | Entrée explicite, composants vérifiés et arbre du package sans liens/écriture tierce. Aucun changement du contrat npm/types ; qualification réelle en attente. |
| S5443 Nginx qualify `...ruB` | Justification historique : trustedExecutable du harnais ; vérification supplémentaire des composants ajoutée, sans assouplissement. |
| S5443 probe ReDoS `...ruS` | READ_ONLY_INPUT : cwd/tmp mais pas d’écriture, Node absolu et imports d’arbres explicitement sélectionnés ; script inchangé. |
| S6096 artifact `...ruI` | extractfile lit en mémoire ; aucune extraction disque. Contrôle des noms/régularité conservé, doublons refusés. Le défaut distinct de destination reste traité séparément. |
| S2083 artifact `...ruH` | Nom du reçu constant et données sérialisées ; aucune dérivation de chemin depuis le contenu. Ne constituait pas une justification des ouvertures vulnérables de la racine. |
| S6418 `...ruR`, `...ruT` | Empreinte SHA256 publique de capabilities/secrets/index.js, disposition historique justifiée ; aucun état fermé annoncé et aucune nouvelle preuve de recalcul dans cette mission. |
| S1515 closures campaign `...ruP/Q/O/N` | Observation déplacée dans une fonction avec arguments explicites ; thread rejoint. Aucun nouveau résultat Sonar supposé. |
| S1192 campaign/qualify, S1313 qualify/consumer, S2681 capture, S6353 validation | Observations stylistiques/configuration historiquement examinées, pas acceptation globale. IP désormais fournie explicitement au helper. Aucun membre distribué ou harnais JS modifié pour l’apparence du scanner. |

Les préfixes `...` renvoient aux IDs complets de la matrice dans PR #16 ; les trois défauts confirmés sont identifiés intégralement ci-dessus. Le nouvel emplacement d’une ligne ne démontre pas une correction : la preuve attendue comprend les tests négatifs complets et les productions métier, encore bloqués.

CodeQL existant couvre JavaScript/TypeScript et Actions. Aucun coverage Python n’est revendiqué pour ce nouveau module/tests ; tests Python réels ajoutés au contrôle packaging prévu. Inventaires administratifs Code Scanning/Dependabot historiquement partiellement HTTP403 ; aucune absence d’alerte globale déduite. Ni règle désactivée, ni exclusion, ni alerte fermée.

PR #16 contient encore verify.py et source-archive.py avec des sorties vulnérables et non fusionnées. Cette branche issue de main ne contient pas ces copies : elles devront converger vers le contrat sécurisé avant toute fusion/rejeu. Ne pas présenter leur correction comme acquise.
