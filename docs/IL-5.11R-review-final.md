# IL-5.11R-Review — Revue finale et vérification de la PR #12

Date de clôture : 2026-10-20T21:30:40+00:00. Dépôt : `drumee/infra-layer`.

**Statut final : MERGED_AND_SECURITY_VERIFIED**, pour la correction IL-5.11R et le commit canonique `077258ca3ef9c77d6d6d94f13ba190b7c0314f56`. Ce statut n’annonce ni zéro alerte globale ni une gate SonarCloud verte.

La PR #12 est effectivement fusionnée, R1–R6 sont PASS, les octets qualifiés sont intégrés et les contrôles Quality/CodeQL post-fusion réussissent. Les 18 anciens ID Sonar PATH sont tous **CLOSED / FIXED**, relus individuellement. Les 13 observations déjà examinées apparaissent sur main sous de nouveaux ID ; leurs dispositions techniques restent valables par identité exacte du code. Aucune annotation administrée ou risque nouveau accepté.

| Étape | Résultat final |
| --- | --- |
| R1 | PASS — HEAD exact, base et identité des sources vérifiés avant fusion |
| R2 | PASS — 13 dispositions individuelles ; états Sonar séparés des conclusions |
| R3 | PASS — contrats préservés, 171 tests et 12 scénarios avant fusion |
| R4 | PASS — Quality/CodeQL, politiques effectives et artefact exact |
| R5 | PASS — fusion normale via plugin GitHub, HEAD verrouillé |
| R6 | PASS — commit/arbre, 41 membres et empreintes, 171 tests, Quality/CodeQL et annotations post-fusion vérifiés |

Les sections R1–R4 décrivent les preuves avant fusion. Les nouvelles références canoniques figurent en R6 et dans le handoff. Aucune publication alpha.3, image ou tag ; aucun changement Debian, Server Runtime, Oxy-form ou production.

## État initial et provenance — R1 PASS

- [PR #12](https://github.com/drumee/infra-layer/pull/12) OPEN, non draft, MERGEABLE ; état d’intégration UNSTABLE en raison du contrôle SonarCloud FAILURE.
- HEAD exact examiné : `6a06d26a69d4480d4afc280cef1dee9e2e585754`, identique au HEAD demandé. Aucun commit supplémentaire depuis cette référence.
- Base réelle avant fusion : `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. Ce commit est également le merge-base ; aucun changement de main intervenu avant la tentative.
- Source exécutable/package qualifiée : `71bd7b8b38345d61316771c07d76fece687af650`. Les trois commits suivants modifient uniquement 32 fichiers documentaires. Les 41 fichiers npm sont individuellement identiques à cette source, au HEAD examiné et à la source d’acceptation lourde `68000c593a7c9aad0f9e7989ad2f69857e59eba8`.
- Aucun `AGENTS.md` trouvé aux niveaux racine, home, github et dépôt, ni dans l’arbre Git du candidat.
- Les 11 commits sont non signés (`verification.reason=unsigned`). Aucun impératif de signature applicable identifié : GET branches/main retourne `protected:false`, `protection.enabled:false`, contexts/checks vides, enforcement `off` ; GET rules/branches/main retourne `[]`.
- Les trois stratégies de fusion sont disponibles ; merge commit retenu pour conserver les 11 commits et leur provenance.

La lecture détaillée des protections classiques et de branchProtectionRules GraphQL retourne HTTP 403. Elle n’est pas présentée comme une absence de politique. Les réponses effectives de la branche et des règles actives établissent séparément l’absence de protection applicable observée. Les permissions déclarées du compte incluent admin/push ; elles ne garantissent pas les droits du jeton sur l’opération de fusion.

## Matrice individuelle SonarCloud — R2 PASS

[Analyse PR](https://sonarcloud.io/dashboard?id=drumee_infra-layer&pullRequest=12), check `118684164614` au HEAD exact : **FAILURE**. API : **13 OPEN**, huit VULNERABILITY et cinq CODE_SMELL. Les 17 enregistrements bruts comprennent aussi quatre CLOSED historiques : ils ne sont pas comptés parmi les 13 ouverts. Gate `ERROR`, security rating du nouveau code `5` (E), exigence A. Aucun état administratif modifié.

Les décisions ci-dessous sont des dispositions techniques locales de cette revue autorisée ; elles ne sont pas des fermetures SonarCloud ni une acceptation de risque nouvelle.

| ID | Règle / emplacement au HEAD examiné | Disposition technique individuelle et preuve |
| --- | --- | --- |
| `AaFZl_1PcPSyTboN_x_L` | json:S6418 BLOCKER ; reçu F:26 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : SHA256 intégral du fichier source public `capabilities/secrets/index.js`, recalcul indépendant concordant ; détail ci-dessous. |
| `AaFZMuQhZ9JThwxqrsye` | S2612 ; system-tools-container.cjs:23 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : `/owned/open` chmod 0777 est l’entrée négative D3 ; le resolver refuse son descendant avant exécution. |
| `AaFZMuQhZ9JThwxqrsyf` | S2612 ; même fichier:24 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie publique 0755 sous ce parent 0777 ; rejet du parent et absence d’exécution de la copie. |
| `AaFZMuQhZ9JThwxqrsyg` | S2612 ; même fichier:28 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie chmod 0777 ; test du refus de l’exécutable lui-même. |
| `AaFZMuQhZ9JThwxqrsyh` | S2612 ; même fichier:32 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : copie 0755 puis chown 65534 ; test du refus d’un propriétaire étranger. Aucun programme étranger exécuté. |
| `AaFZMuQhZ9JThwxqrsyi` | S2612 ; même fichier:58 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : fixture `/usr/bin/docker` 0755 dans le tmpfs vide du conteneur ; aucune altération du Docker hôte, validation seulement. |
| `AaFZMuQhZ9JThwxqrsyj` | S2612 ; même fichier:64 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : plugin 0755 sous `/owned/plugins` protégé root, contrôle positif de résolution ; aucune invocation du plugin. |
| `AaFZMuQhZ9JThwxqrsyk` | S2612 ; même fichier:67 | **FALSE_POSITIVE_TECHNICALLY_CONFIRMED** : config Docker chmod 0666 après contrôle positif ; le resolver la refuse avant toute exécution. |
| `AaFZMuSQZ9JThwxqrsyl` | S9382 ; adapters/docker/services.js:29 | **STYLE_NON_BLOCKING** : await docker inspect dans la boucle de capacités ; observations séquentielles voulues, refus/continue/diagnostics conservés. Aucun résultat perdu ni erreur de flux constatée. |
| `AaFZMuM_Z9JThwxqrsyb` | S2681 ; test/lifecycle/run.js:15 | **STYLE_NON_BLOCKING** : seul le throw dépend du statut non nul ; return stdout doit être inconditionnel après succès. En cas d’échec, throw termine déjà le flux. |
| `AaFZMuM_Z9JThwxqrsyc` | S7723 ; même fichier:22 | **STYLE_NON_BLOCKING** : Error(message) et new Error(message) créent un objet Error équivalent ; le throw est conditionné par la collision d’image. |
| `AaFZMuH5Z9JThwxqrsyZ` | S2681 ; test/services/run.js:18 | **STYLE_NON_BLOCKING** : wrapper de commande ; throw conditionnel et retour de stdout après succès sont le flux attendu. |
| `AaFZMuH5Z9JThwxqrsya` | S2681 ; même fichier:52 | **STYLE_NON_BLOCKING** : seule la levée d’erreur est conditionnelle à la collision réseau ; affecter compose.networks après une absence de collision est voulu. |

Les sept fixtures ont été examinées individuellement dans [le code exact](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/test/security/system-tools-container.cjs) et dans [leur lanceur](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/test/security/run.js). Conteneur à nom aléatoire possédé, `--rm`, rootfs readonly, réseau none, source readonly, tmpfs privés `/owned`, `/usr/bin`, `/etc/docker`, aucun socket Docker monté, aucune clé de production, capabilities retirées sauf CHOWN, no-new-privileges et limites de ressources. Les permissions dangereuses ne touchent que ces fixtures. Aucun processus d’un autre job ne partage ces montages ; un attaquant nécessiterait la compromission du runner/daemon déjà autorité de confiance. Le scénario ne donne pas accès aux ressources possédées de l’hôte à un utilisateur non fiable. Le rejeu réel rapporte **12/12**, sans modification de binaire hôte.

### Vérification spécifique S6418

Fichier signalé : `docs/evidence/IL-5.11R/F-artifact-receipt.json`, ligne 26. La clé JSON est le chemin `capabilities/secrets/index.js` dans une table d’empreintes des 41 membres npm ; le mot « secrets » dans ce chemin ne rend pas sa valeur confidentielle.

Valeur signalée et recalculée :

```text
b872fa5cdd6868d0b89f17038aa445a8c709e675f4e82452fb7283647d48c432
```

Calcul : SHA256 des octets du [module source public](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/capabilities/secrets/index.js), avec `sha256sum capabilities/secrets/index.js` et vérification individuelle par hashlib.sha256. Correspondance exacte au reçu et aux trois sources mentionnées en R1. Aucune dérivation d’un mot de passe, clé, token ou credential ; aucune information de déploiement révélée par cette valeur. Le module manipule des secrets à l’exécution, mais son code source public n’est pas un secret. Le reçu n’est pas dans npm et la chaîne littérale de cette empreinte est absente des 41 membres distribués. L’exposition du checksum dans le dépôt public est intentionnelle et reproductible. Conclusion : faux positif techniquement confirmé, sans acceptation de risque.

## Garanties canoniques — R3 PASS

Revue du diff complet de production et de `internal/system-tools.js` : Docker, ss et OpenSSL ont des entrées fixes `/usr/bin`, sans fallback PATH. Le contrôle parcourt propriétaires root, écritures groupe/autres, parents, cibles et chaînes de liens ; le chemin final validé est exécuté. Chaque appel revalide. Docker utilise le socket local explicite, HOME=/ et DOCKER_CONFIG=/etc/docker ; configuration et plugins Compose/Buildx sont vérifiés. Les options sont nommées et shell:false/env imposés.

Les environnements enfants sont reconstruits : PATH fixe, locale C, pas de loader, réglage SSL ou configuration Docker hérités. Le client ACME absolu conserve les contrôles d’ownership, parents, permissions, liens et SHA256 ; il est rehaché avant chaque invocation. Seuls les chemins Cloudflare nécessaires sont ajoutés pour l’émission autorisée. Les trois outils système et Compose doivent exister aux chemins Debian approuvés, avec ancêtres et cibles protégés ; un autre chemin d’installation demande une qualification distincte.

Les déclarations `index.d.ts`, `lifecycle/index.d.ts`, exports npm et package-lock sont identiques à main. Aucune dépendance de production. Le resolver privé n’ajoute aucun export public. Les erreurs owning sont conservées, notamment DOCKER_LIFECYCLE_COMMAND_FAILED, PORT_OBSERVATION_UNAVAILABLE, TLS_CERTIFICATE_INVALID, TLS_CHAIN_INVALID et les erreurs ACME existantes.

Les mécanismes loopback, refus des ressources étrangères, ownership, ordre du cycle de vie, STARTTLS/SASL, séparation SMTP/DKIM et refus de restauration SMTP restent en place. La validation TLS utilise toujours OpenSSL réel et refuse la CA étrangère, le SAN incorrect, les dates/clés invalides. Aucun import de dépôt voisin : l’audit parcourt les require des membres npm et le consommateur utilise uniquement le package installé.

Rejeu au HEAD examiné :

- Installation verrouillée `npm ci --ignore-scripts --no-audit --no-fund --offline` avec cache de qualification existant : 127 packages.
- `npm test` : **171/171**, zéro échec/skip, dont les **24 contrats** déjà inclus ; outils réels, CA étrangère, socket ss et revalidation ACME couverts.
- `node test/security/run.js` : **12 scénarios réels** de permissions/liens/configurations, tous réussis.
- `npm run test:package` : allowlist 41 fichiers, zéro dépendance/import externe de production et **PACKED_CONSUMER_OK**.
- `npm run lint` : zéro erreur, 29 avertissements visibles, zéro nouvelle observation, baseline inchangée.

Premières tentatives locales conservées comme incidents d’environnement : tests lancés avant installation des dépendances et sous sandbox ; premier npm pack bloqué par son cache hors racine writable ; premier cache offline vide ENOTCACHED. Après installation verrouillée depuis le cache qualifié et exécution avec les droits de sockets requis, tous les contrôles ci-dessus passent. Aucun changement de code ou de règle pour les faire passer.

Les acceptations lourdes ne sont pas rejouées dans cette revue : preuves existantes liées à `68000c5`, avec identité indépendante des 41 fichiers exécutés. Gateway 17/17, services 17/17, lifecycle 16/16, acceptation applicative **87 assertions**, Nginx hôte/HTTPS CA-SAN réels, RPC accepté/refusé, boucle locale et refus LAN indépendant, SMTP/DKIM/STARTTLS/SASL et refus d’open relay. [Rapport d’acceptation](https://github.com/drumee/infra-layer/blob/6a06d26a69d4480d4afc280cef1dee9e2e585754/docs/evidence/IL-5.11R/E-application-report.json). Consommateur antérieur huit assertions/types stricts et quatre attaques appariées sur package installé documentés dans le dossier F. Ces preuves sont héritées par identité de fichiers, pas annoncées comme de nouvelles exécutions.

## GitHub et intégrité avant fusion — R4 PASS

| Contrôle au HEAD exact | Résultat / référence |
| --- | --- |
| Quality unit, contracts, eslint, dependencies, packaging | Cinq SUCCESS ; [run 39439085402](https://github.com/drumee/infra-layer/actions/runs/39439085402) |
| CodeQL natif Analyze javascript-typescript | SUCCESS ; [run 39439080342](https://github.com/drumee/infra-layer/actions/runs/39439080342) ; seul notice : migration ubuntu-latest vers Ubuntu 26 |
| Résultat PR CodeQL `118684343313` | SUCCESS ; « No new alerts in code changed by this pull request » ; zéro annotation effectivement relue |
| SonarCloud `118684164614` | **FAILURE**, 13 annotations OPEN ; aucune S4036 ouverte dans la vue PR examinée |
| Protections obligatoires observées | `protected:false`, enforcement off, contexts/checks vides, règles actives `[]` ; aucun contrôle désactivé par cette mission |

Workflow Quality : `contents:read`, checkout sans persistance de credentials, actions checkout/setup-node épinglées par SHA ; aucun changement de permission du jeton dans le diff. La préparation de la VM CI protège seulement le Node déjà installé dans le cache hébergé, avec gardes de contexte, ownership/liens et inventaire de contenu identique avant/après. Elle ne relâche pas le resolver. La lecture des paramètres Actions/workflow permissions par API retourne HTTP 403 ; ces paramètres globaux ne sont pas attestés.

Code Scanning et Dependabot globaux : **HTTP 403** revérifié. Le résultat PR CodeQL ne prouve pas l’absence de toute alerte globale. Le relevé antérieur de main contenait 227 annotations ouvertes. Leur état après intégration est vérifié séparément dans R6 ci-dessous ; aucune absence globale d’alerte n’est déduite du seul succès de CodeQL.

### Empreintes npm et source distinctes

Deux `npm pack --json --ignore-scripts` depuis le HEAD examiné, destinations différentes, Node 22.22.0/npm 11.18.0 : archives identiques octet par octet. Chaque membre régulier correspond au Git et aux SHA256 du reçu qualifié.

| Identité | Résultat recalculé |
| --- | --- |
| Version locale npm | `@drumee/infra-layer@0.1.0-alpha.3`, non publiée |
| Membres / taille npm | **41 / 101 242 octets** |
| SHA256 npm | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| SRI npm | `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==` |
| Archive source du HEAD PR | [codeload du HEAD](https://codeload.github.com/drumee/infra-layer/tar.gz/6a06d26a69d4480d4afc280cef1dee9e2e585754) ; 266 fichiers, zéro différence avec Git |
| SHA256 source HEAD PR | `c70c9fa084e07a20a7240f2bc5d2fd1082a76942965c402d6e57f22c2b051c7c` |
| SRI source HEAD PR | `sha512-LY7QDobxJTjWl1TLremafI56cjANPmukKJ1NjDSb0Sz3gHqudF4iNxuh0WeDqTiRwI0siit6u1vFOO07mKmbTw==` |

La nouvelle archive source inclut les documents de clôture ; son empreinte diffère légitimement de celle de `71bd7b8`. Son SRI ne remplace jamais le SRI npm. Ces empreintes concernent le HEAD de PR avant fusion ; l’identité distincte de l’archive du commit intégré est mesurée en R6 ci-dessous. Reproductibilité attestée sur cet hôte et cette toolchain uniquement.

## Fusion contrôlée — R5 PASS

Les premières tentatives utilisant le personal access token de `GH_TOKEN` sous l’identité `somanos` ont été refusées : `Resource not accessible by personal access token`. La lecture détaillée des protections exigeant `administration=read` était également refusée ; la création de PR documentaire par gh échouait. Aucun secret de jeton conservé. Le push Git en SSH n’attestait pas ces droits API. Les refus ont entraîné l’arrêt demandé, sans essai de contournement.

Le propriétaire a ensuite explicitement demandé l’utilisation du plugin. La connexion **GitHub** disponible dans Codex confirme `somanos`, ID `177176074`, et le rôle repository **admin** par sa lecture de permissions réussie. Ce résultat est distinct des permissions du personal access token local. La lecture de main confirme protected=false, aucune protection activée ni contexte obligatoire ; la liste des rulesets, parents inclus, est vide. Aucun réglage de permission ou de protection n’a été modifié. Le plugin n’offre pas l’administration détaillée des protections dans certaines connexions ; la preuve effective de branche et la liste des règles restent conservées.

HEAD et base relus immédiatement avant fusion : `6a06d26a69d4480d4afc280cef1dee9e2e585754` / `9e4166618ca519e5d9b9e58f5191d37c5fd56462`, inchangés. Cinq Quality SUCCESS et deux résultats CodeQL SUCCESS au HEAD exact ; Sonar FAILURE explicitement maintenu et non obligatoire dans la politique observée. La décision s’appuie sur les faux positifs individuellement démontrés, sans acceptation de risque implicite.

Une unique fusion a été demandée via le plugin GitHub, méthode `merge`, `expected_head_sha=6a06d26a69d4480d4afc280cef1dee9e2e585754`, sans option de contournement. Résultat GitHub : `merged:true`, `Pull Request successfully merged`.

- PR #12 : **CLOSED / merged=true**, fusion le **2026-10-20T21:24:57Z**.
- Commit intégré : **`077258ca3ef9c77d6d6d94f13ba190b7c0314f56`**.
- Parents : `9e4166618ca519e5d9b9e58f5191d37c5fd56462`, puis `6a06d26a69d4480d4afc280cef1dee9e2e585754`.
- Signature de fusion : GitHub `verification.verified=true`.
- La valeur antérieure `770e8f6cd4fa8361515f7b24ca2ccab40bb53914` n’était que le commit de test de la PR ouverte ; elle n’est pas la référence canonique.

[Preuve plugin et contrôles avant/après](evidence/IL-5.11R-review/plugin-integration.json). Le changement de connexion est expressément demandé par le propriétaire ; aucune protection GitHub contournée.

## Vérification post-fusion — R6 PASS

### Commit, arbre et octets

GitHub main et le fetch Git concordent sur `077258ca3ef9c77d6d6d94f13ba190b7c0314f56`. L’arbre **`51ceb7bf0e5275328c5c86475405b425fffcf301`** est intégralement identique à celui du HEAD PR examiné. Les corrections PATH, outils fixes, validations ownership/permissions/liens, environnements et revalidation ACME sont donc bien présentes, sans résolution de conflit ou changement non qualifié.

Les SHA256 des **41 fichiers npm** correspondent individuellement au reçu, au HEAD de PR, à `71bd7b8` et à la source d’acceptation lourde `68000c5`. Deux packs depuis un worktree isolé du commit intégré sont identiques, et identiques au tarball de la revue initiale. Aucun membre non régulier ni chemin dangereux. Installation verrouillée offline et **171/171 tests**, dont 24 contrats, zéro échec/skip, sur le commit intégré. Aucun changement de code pour la qualification post-fusion.

| Identité canonique | Valeur recalculée |
| --- | --- |
| Source intégrée | `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` |
| Version locale npm | `@drumee/infra-layer@0.1.0-alpha.3`, toujours non publiée |
| Membres / taille npm | **41 / 101 242 octets** |
| SHA256 npm | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| SRI npm | `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==` |
| Archive source intégrée | [codeload du commit intégré](https://codeload.github.com/drumee/infra-layer/tar.gz/077258ca3ef9c77d6d6d94f13ba190b7c0314f56) ; **266 fichiers**, zéro différence avec Git |
| SHA256 archive source intégrée | `dcd7c9a8a0a5e191056b636c9b793adc4796f701c83d0e1a4bea25ab9cfceeeb` |
| SRI archive source intégrée | `sha512-Syt/FYPnvPicSacaPE6rR50DapEXSFWv7Snmq8rONLAiSqLJdpYZkzhDavbtAH8EXnADjucfHub9KU6CVyBbuA==` |

L’archive source intégrée est différente de celle du HEAD PR malgré l’arbre identique ; son préfixe et ses métadonnées GitHub ne sont pas l’identité npm. Les trois identités ont été contrôlées séparément : fichiers identiques, archive GitHub différente, package npm identique. [Vérification complète et liste des 41 membres](evidence/IL-5.11R-review/postmerge-verification.json).

### Quality et CodeQL sur main

Tous les runs suivants portent exactement sur `077258ca3ef9c77d6d6d94f13ba190b7c0314f56` et sont terminés SUCCESS :

| Run | Résultat |
| --- | --- |
| [Quality 39500169039](https://github.com/drumee/infra-layer/actions/runs/39500169039) | unit, contracts, eslint, dependencies, packaging : cinq SUCCESS |
| [Push on main 39500168564](https://github.com/drumee/infra-layer/actions/runs/39500168564) | CodeQL JavaScript/TypeScript : analyse et publication SUCCESS |
| [CodeQL 39500179132](https://github.com/drumee/infra-layer/actions/runs/39500179132) | JavaScript/TypeScript, Actions et Upload Results : SUCCESS |

Les logs confirment l’exécution des analyses et l’envoi des résultats. Notices de runner/migration et messages de dépréciation/outillage restent visibles ; ils ne sont pas dissimulés. Les URLs autonomes d’annotations de check-runs sont rejetées par l’allowlist du fetch générique du plugin (`INVALID_ARGUMENT`, pas un refus d’authentification) : les logs de jobs et les **deux SARIF réellement téléchargés** via les outils dédiés sont examinés à leur place. Les SHA256 ZIP correspondent aux digests fournis par GitHub :

- Actions, artifact `12300370442` : `b49233dbb46a805efab53c969d8f243bd6b9afbfe3f27d213e1b249907243922` ; **zéro résultat SARIF**.
- JavaScript, artifact `12298899882` : `1a84be02acb92975227bb5eb1cc6734c8a3b71b41780c2a856787776355b97cb` ; **trois résultats SARIF** : `js/polynomial-redos` dans `lib/validation.js:90`, `js/insufficient-key-size` dans `test/unit/secrets.test.js:55`, `js/insufficient-password-hash` dans `lib/spec.js:32`.

Les trois fichiers sont individuellement identiques au main antérieur : aucun résultat SARIF dans le code modifié par IL-5.11R. Ces observations hors changement ne sont ni acceptées globalement ni déclarées fermées ; elles restent à reprendre dans l’inventaire sécurité. Le succès CodeQL ne signifie donc pas zéro alerte. Les inventaires globaux Code Scanning/Dependabot restent limités par les HTTP 403 précédemment constatés ; les SARIF du run courant ne sont pas assimilés à l’état administratif global. [Revue des SARIF et empreintes](evidence/IL-5.11R-review/postmerge-codeql-review.json).

### SonarCloud sur main et fermeture PATH

Nouvelle analyse **`4f9d8c8e-0d64-48f7-8499-d9797d555389`**, date **2026-10-20T21:25:04Z**, révision exacte `077258ca3ef9c77d6d6d94f13ba190b7c0314f56`. Check main **`118895613417` FAILURE**, gate **ERROR** : security rating E et reliability rating D sur une baseline previous_version du 14 octobre. **SonarCloud n’est pas vert.**

Les **18 anciens ID S4036** ont été recherchés explicitement : **18/18 CLOSED, resolution FIXED**. Ce constat n’est pas déduit de leur seule absence dans les OPEN. Aucune fermeture manuelle effectuée. [Réponse individuelle complète](evidence/IL-5.11R-review/postmerge-path-dispositions.json).

Main comporte désormais **211 OPEN** (13 VULNERABILITY, 16 BUG, 182 CODE_SMELL), contre 227 auparavant. Comparaison exacte des ID : 29 ne sont plus OPEN et 13 sont nouveaux sur main ; **les 13 nouveaux correspondent chacun à une des 13 annotations PR déjà revues**, par règle, fichier, ligne et message identiques. Aucun nouveau BUG introduit dans cet inventaire comparé. Les cinq autres VULNERABILITY sont historiques, conservées hors disposition de cette mission.

Les ID PR et main sont distincts ; les états Sonar restent **OPEN** pour les 13 lignes ci-dessous. Leur disposition technique locale découle de l’analyse R2 et de l’identité des octets, pas d’une mutation administrative :

| ID PR revu | Nouvel ID main | Règle / emplacement | Disposition technique locale |
| --- | --- | --- | --- |
| `AaFZl_1PcPSyTboN_x_L` | `AaFbNJFvv_dBCVdjM1HL` | json:S6418 ; `docs/evidence/IL-5.11R/F-artifact-receipt.json:26` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsye` | `AaFbNJFmv_dBCVdjM1HE` | javascript:S2612 ; `test/security/system-tools-container.cjs:23` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyf` | `AaFbNJFmv_dBCVdjM1HF` | javascript:S2612 ; `test/security/system-tools-container.cjs:24` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyg` | `AaFbNJFmv_dBCVdjM1HG` | javascript:S2612 ; `test/security/system-tools-container.cjs:28` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyh` | `AaFbNJFmv_dBCVdjM1HH` | javascript:S2612 ; `test/security/system-tools-container.cjs:32` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyi` | `AaFbNJFmv_dBCVdjM1HI` | javascript:S2612 ; `test/security/system-tools-container.cjs:58` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyj` | `AaFbNJFmv_dBCVdjM1HJ` | javascript:S2612 ; `test/security/system-tools-container.cjs:64` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuQhZ9JThwxqrsyk` | `AaFbNJFmv_dBCVdjM1HK` | javascript:S2612 ; `test/security/system-tools-container.cjs:67` | FALSE_POSITIVE_TECHNICALLY_CONFIRMED |
| `AaFZMuSQZ9JThwxqrsyl` | `AaFbNJGEv_dBCVdjM1HM` | javascript:S9382 ; `adapters/docker/services.js:29` | STYLE_NON_BLOCKING |
| `AaFZMuM_Z9JThwxqrsyb` | `AaFbNJFdv_dBCVdjM1HC` | javascript:S2681 ; `test/lifecycle/run.js:15` | STYLE_NON_BLOCKING |
| `AaFZMuM_Z9JThwxqrsyc` | `AaFbNJFdv_dBCVdjM1HD` | javascript:S7723 ; `test/lifecycle/run.js:22` | STYLE_NON_BLOCKING |
| `AaFZMuH5Z9JThwxqrsyZ` | `AaFbNJEov_dBCVdjM1HA` | javascript:S2681 ; `test/services/run.js:18` | STYLE_NON_BLOCKING |
| `AaFZMuH5Z9JThwxqrsya` | `AaFbNJEov_dBCVdjM1HB` | javascript:S2681 ; `test/services/run.js:52` | STYLE_NON_BLOCKING |

[Inventaire main](evidence/IL-5.11R-review/postmerge-sonar-main.json), [analyse/révision](evidence/IL-5.11R-review/postmerge-sonar-analyses.json), [gate](evidence/IL-5.11R-review/postmerge-sonar-gate.json), [mapping individuel](evidence/IL-5.11R-review/postmerge-sonar-mapping.json). Le faux positif S6418 concerne toujours le checksum du fichier public, et non un credential. Aucune nouvelle acceptation de risque SonarCloud.

## Handoff IL-5.11 et conditions Debian

- **Nouveau SHA canonique Infra Layer : `077258ca3ef9c77d6d6d94f13ba190b7c0314f56`**. Source PR examinée `6a06d26a69d4480d4afc280cef1dee9e2e585754`, source exécutable qualifiée `71bd7b8b38345d61316771c07d76fece687af650`, acceptation lourde `68000c593a7c9aad0f9e7989ad2f69857e59eba8`.
- Nouveau SRI **source intégrée** : `sha512-Syt/FYPnvPicSacaPE6rR50DapEXSFWv7Snmq8rONLAiSqLJdpYZkzhDavbtAH8EXnADjucfHub9KU6CVyBbuA==`. SRI **npm** : `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==`. Ils identifient deux archives distinctes. La liste et les SHA256 des 41 membres sont dans le reçu R6.
- Signatures/types/exports, erreurs owning, absence de dépendances de production et contrats loopback/ownership/TLS/SMTP/lifecycle préservés. Quality/CodeQL sur main réussissent ; les 18 PATH sont CLOSED/FIXED ; les 13 annotations Sonar ont leur mapping et disposition technique. La gate demeure en échec.
- Fermeture technique du blocage PATH vérifiée ; reprendre **IL-5.11-B → IL-5.11-C → IL-5.11-D → IL-5.11-E → IL-5.11-F** en vérifiant ces références. La publication alpha.3 nécessite une autorisation distincte.
- Debian conserve **`aa9057f224f4ae5cf80d777e3cb2fad092193fb1`** et son ancien reçu 40 fichiers. Aucun verrou ni fichier Debian modifié. Futur réalignement séparé vers le commit intégré et son nouveau SRI source, inventaire 41 membres, prérequis Docker/ss/OpenSSL/Compose système protégés, avec requalification des images et acceptations réelles. Les anciennes preuves Debian ne valent pas qualification de ce nouvel alignement.
- Limites résiduelles : autorité root/outils système/runner, compte de qualification déjà compromis et fenêtre stat/exec TOCTOU ; reproductibilité attestée seulement sur l’hôte/toolchain qualifiés ; inventaires globaux GitHub partiellement inaccessibles ; trois résultats SARIF dans du code inchangé et alertes Sonar historiques à reprendre sans acceptation globale.
- **SMTP_RECOVERY_UNQUALIFIED** maintenu ; pas de restauration de spool SMTP ou de délivrabilité Internet nouvelle. Les acceptations lourdes antérieures (gateway 17/17, services 17/17, lifecycle 16/16, application 87 assertions, Nginx hôte/HTTPS, RPC, LAN indépendant, SMTP/DKIM/STARTTLS/SASL) sont héritées par identité des fichiers ; seules les vérifications R6 décrites sont de nouvelles exécutions.
- Aucune publication npm/image/tag, modification Server Runtime/Oxy-form, opération production/oxymot.fr ou Oxymotion D0.

## Conservation documentaire et preuves

Rapport sur la branche dédiée **`docs/il511r-review-final`** ; intégration documentaire par PR distincte, sans ajout direct à main. Cette branche contient exclusivement le rapport et ses preuves, aucune modification exécutable. La [PR documentaire #13](https://github.com/drumee/infra-layer/pull/13) est ouverte, non draft et non fusionnée, créée avec le plugin GitHub. Elle cible le main intégré ; aucune intégration documentaire directe à main.

Preuves avant fusion : [contrôles](evidence/IL-5.11R-review/github-check-runs.json), [Quality](evidence/IL-5.11R-review/quality-run.json), [Sonar PR](evidence/IL-5.11R-review/sonar-issues.json), [gate PR](evidence/IL-5.11R-review/sonar-gate.json), [171 tests](evidence/IL-5.11R-review/unit.txt), [12 scénarios](evidence/IL-5.11R-review/container.json), [packaging](evidence/IL-5.11R-review/package.txt), [lint](evidence/IL-5.11R-review/lint.txt), [reçu historique READY_FOR_MERGE](evidence/IL-5.11R-review/verification.json). Ces preuves historiques ne sont pas réétiquetées comme post-fusion.

Preuves nouvelles : [connexion/fusion/CI](evidence/IL-5.11R-review/plugin-integration.json), [arbre/empreintes/41 fichiers](evidence/IL-5.11R-review/postmerge-verification.json), [171 tests post-fusion](evidence/IL-5.11R-review/postmerge-unit.txt), [CodeQL SARIF](evidence/IL-5.11R-review/postmerge-codeql-review.json), [mapping Sonar](evidence/IL-5.11R-review/postmerge-sonar-mapping.json), [18 PATH CLOSED/FIXED](evidence/IL-5.11R-review/postmerge-path-dispositions.json), [ancien inventaire main](evidence/IL-5.11R-review/premerge-sonar-main.json), [refus antérieurs du jeton local](evidence/IL-5.11R-review/resume-access.json).
