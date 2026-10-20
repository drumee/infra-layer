# IL-5.11-B — Inventaire de sécurité

Relevé public complet : **227 OPEN**, dont **23 VULNERABILITY**, **16 BUG** et **188 CODE_SMELL**. Une page ps=500 contient les 227 ID distincts : aucune pagination perdue ni doublon d’ID. Analyse principale `28046d0a-a86b-4cdb-a0fa-955718a9e3d3`, 19 octobre 2026 12:46:50 UTC, révision `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. Le résultat de gate est **ERROR**, avec new_security_rating 2 et new_reliability_rating 4 ; ces métriques de période ne remplacent pas l’inventaire global. Les états ne sont pas modifiés.

La liste des alertes est obtenue par lecture publique de l’API [issues](https://sonarcloud.io/api/issues/search?componentKeys=drumee_infra-layer&resolved=false&ps=500). L’analyse et le gate sont conservés séparément. Pas de contournement des restrictions 401/403. L’API des règles exigeait organization=drumee ; la première requête sans organisation a retourné 400. Les métadonnées récupérées comprennent noms, messages, sévérités et standards ; aucune description longue absente n’est inventée.

## Présence réelle dans l’artefact

Chaque fichier est confronté aux 40 membres du tarball recalculé en A, puis à son SHA256 Git. Aucune alerte n’est classée LEGACY_NOT_SHIPPED ou UNKNOWN : tous les chemins correspondent soit à un membre distribué, soit à un test effectivement absent. L’âge d’un code distribué ne le rend pas hors périmètre.

| Catégorie Sonar | Distribué | Test absent du package |
| --- | ---: | ---: |
| VULNERABILITY | 5 | 18 |
| BUG | 14 | 2 |
| CODE_SMELL | 159 | 29 |

Au total : 178 annotations dans des fichiers distribués et 49 dans les tests. Les cinq vulnérabilités distribuées concernent des fonctions exécutables ; les contrats distribués restent identifiés individuellement dans le JSON. Le fichier de test SMTP peut être copié dans une image de qualification : TEST_ONLY signifie absent du package npm, pas sans risque dans l’environnement de test.

## Les 23 vulnérabilités

Tous les statuts Sonar initiaux et finaux de cette revue sont **OPEN**. La colonne Décision désigne l’évaluation locale, pas une disposition enregistrée dans Sonar. ACCEPTED_RISK_PENDING_OWNER signifie **risque non accepté à ce jour**. La justification détaillée par ID figure dans [l’évaluation](IL-5.11-security-assessment.md).

| ID | Règle | Sévérité Sonar | Fichier:ligne | Exposition | Décision |
| --- | --- | --- | --- | --- | --- |
| `AaFUM8xx2ckiDDba3qAT` | javascript:S5332 | MINOR | `test/application/plugins/qualification/worker.js:11` | TEST_ONLY | FALSE_POSITIVE_PROPOSED |
| `AaE8TbnThgf3bSVnp8z4` | javascript:S4036 | MINOR | `test/lifecycle/run.js:21` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE8TcJkhgf3bSVnp80B` | javascript:S4036 | MINOR | `lifecycle/recovery.js:22` | SHIPPED_RUNTIME | ACCEPTED_RISK_PENDING_OWNER |
| `AaE8TbpHhgf3bSVnp8z9` | javascript:S4036 | MINOR | `test/lifecycle/tracing-driver.js:6` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE8TcJ8hgf3bSVnp80i` | javascript:S4036 | MINOR | `lifecycle/docker.js:8` | SHIPPED_RUNTIME | ACCEPTED_RISK_PENDING_OWNER |
| `AaE8TcJ8hgf3bSVnp80m` | javascript:S4036 | MINOR | `lifecycle/docker.js:49` | SHIPPED_RUNTIME | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2edL4i9l9HI8Cw` | javascript:S4036 | MINOR | `test/package-audit.js:21` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2edL4i9l9HI8Cx` | javascript:S4036 | MINOR | `test/package-audit.js:24` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw1PdL4i9l9HI8CS` | javascript:S2612 | MAJOR | `test/services/run.js:23` | TEST_ONLY | FALSE_POSITIVE_PROPOSED |
| `AaE6Nw1PdL4i9l9HI8CT` | javascript:S4036 | MINOR | `test/services/run.js:29` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw1PdL4i9l9HI8CU` | javascript:S4036 | MINOR | `test/services/run.js:51` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw1PdL4i9l9HI8CW` | javascript:S4036 | MINOR | `test/services/run.js:79` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw1PdL4i9l9HI8CX` | javascript:S4036 | MINOR | `test/services/run.js:80` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw1FdL4i9l9HI8CN` | javascript:S5443 | CRITICAL | `test/support/service-inputs.js:3` | TEST_ONLY | FALSE_POSITIVE_PROPOSED |
| `AaE6Nw4UdL4i9l9HI8Dz` | javascript:S4036 | MINOR | `capabilities/tls/index.js:9` | SHIPPED_RUNTIME | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw4UdL4i9l9HI8D1` | javascript:S4036 | MINOR | `capabilities/tls/index.js:19` | SHIPPED_RUNTIME | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2edL4i9l9HI8Cu` | javascript:S4036 | MINOR | `test/package-audit.js:8` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2UdL4i9l9HI8Cp` | javascript:S4036 | MINOR | `test/integration/run.js:29` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2UdL4i9l9HI8Cq` | javascript:S2612 | MAJOR | `test/integration/run.js:30` | TEST_ONLY | FALSE_POSITIVE_PROPOSED |
| `AaE6Nw2UdL4i9l9HI8Cr` | javascript:S4036 | MINOR | `test/integration/run.js:50` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2UdL4i9l9HI8Cs` | javascript:S4036 | MINOR | `test/integration/run.js:92` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nw2UdL4i9l9HI8Ct` | javascript:S4036 | MINOR | `test/integration/run.js:93` | TEST_ONLY | ACCEPTED_RISK_PENDING_OWNER |
| `AaE6Nwx8dL4i9l9HI8CM` | javascript:S5443 | CRITICAL | `test/support/inputs.js:3` | TEST_ONLY | FALSE_POSITIVE_PROPOSED |

## Autres annotations

Les 204 autres annotations sont préservées individuellement avec message, ligne, règle, sévérité, empreinte source, exposition et révision dans [B-security-inventory.json](evidence/IL-5.11/B-security-inventory.json). Les 14 BUG distribués sont 12 S2871 (tri) et deux S6324 (caractères de contrôle dans des validateurs). Les deux BUG de test sont S2189 (boucles d’attente). Les 188 CODE_SMELL comprennent notamment 65 S2681, 21 S3776, 17 S3358, 13 S6582 et 12 S9382. Aucun de ces groupes n’est accepté globalement.

S2871 impose de vérifier les éléments comparés et l’ordre canonique : substituer localeCompare peut modifier la sérialisation. Les S6324 doivent être lus dans les validateurs pour distinguer rejet explicite de contrôles et contrôles involontaires. S2189 nécessite de lire les notifications asynchrones et délais ; une boucle n’est pas jugée infinie sur le seul message. S2681/S3776 signalent aussi une difficulté de revue dans les chemins sensibles. L’alerte S8786 de `lib/validation.js:90` mérite une analyse de coût et des bornes d’entrée avant toute conclusion globale. Leur synthèse n’est pas une certification de fiabilité, et une éventuelle acceptation ne suit pas de leur ancienneté.

L’inventaire est cohérent avec les totaux IL-5.10 (227/23). Les quatre faux positifs approuvés en IL-5.8 sont des cas logiques précis : ils ne valent pas acceptation des 18 alertes PATH ni des autres familles. Aucun score global GitHub Security n’est déduit de cette lecture Sonar.
