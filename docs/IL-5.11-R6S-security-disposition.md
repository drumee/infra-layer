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
