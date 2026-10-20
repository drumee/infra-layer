# IL-5.11-B — Évaluation et arrêt de sécurité

Décision : **BLOCKED_SECURITY**. La source et l’artefact passent A ; B identifie un risque d’environnement non couvert par les acceptations du propriétaire. Aucune correction de code, acceptation implicite ni disposition Sonar n’est effectuée. Conformément à la règle d’arrêt « une décision de risque supplémentaire est nécessaire », les étapes C à F ne sont pas poursuivies comme qualification de release.

## Portée du constat

Les cinq S4036 du package recherchent Docker, ss ou OpenSSL dans le PATH hérité. Les arguments sont des tableaux ; aucune injection de shell hôte par RPC n’est démontrée. Les API opérationnelles sont explicitement réservées à un opérateur de confiance (README, rubrique Explicit lifecycle functions). La [revue IL-5.8](IL-5.8-security-review.md) maintenait déjà cette hypothèse pour le driver historique ; elle ne l’avait pas durcie ni fait accepter comme un des quatre faux positifs.

Un environnement de lancement contrôlé protège ces appels. En revanche, un exécutable substituable dans un élément du PATH peut s’exécuter avec les droits de l’opérateur et son accès Docker/clé TLS. Les protections de chemins de données, digests d’images et ownership ne contrôlent pas ce choix de programme. Les [règles Node de recherche des commandes](https://nodejs.org/download/release/latest-jod/docs/api/child_process.html) confirment cette utilisation du PATH ; S4036 référence CWE-426/427 dans les métadonnées conservées.

Il s’agit d’un risque **conditionnel réel**, pas d’une démonstration de compromission à distance ni d’une élévation de privilèges depuis un compte distinct. Le script de reproduction fournit lui-même le PATH hostile dans un répertoire privé ; il ne démontre pas qu’un tiers puisse modifier le PATH de l’installation Debian qualifiée. Cette distinction empêche de traiter les cinq cas comme vulnérabilités distantes confirmées, mais aussi de les classer automatiquement FALSE_POSITIVE. Ils sont **ACCEPTED_RISK_PENDING_OWNER**, ce qui n’enregistre aucune acceptation. Même réserve pour les 13 points PATH des anciens harnais, où le compte développeur peut posséder des droits Docker.

## Reproduction bornée sur le package exact

Le tarball recalculé en A est installé hors ligne, scripts désactivés, dans un consommateur neuf. La reproduction importe exclusivement ses sous-chemins publics ; ni mock de child_process ni import d’un checkout voisin. Les substituts ne font qu’écrire un marqueur et renvoyer une sortie constante. Aucun démon Docker contacté, aucun secret de production, aucun réseau, certificat de confiance système ou ressource préexistante modifiés.

```sh
npm install --offline --ignore-scripts --no-audit --no-fund \
  --cache /tmp/drumee-il511-npm-cache --prefix /tmp/drumee-il511-consumer \
  /tmp/drumee-il511-evidence/drumee-infra-layer-0.1.0-alpha.3.tgz
node docs/evidence/IL-5.11/path-probe.cjs /tmp/drumee-il511-consumer
```

Résultat : **4 scénarios de reproduction réussis**, pas des tests TAP ni une acceptation applicative :

1. `lifecycle/docker.js:8` exécute le substitut Docker.
2. `lifecycle/docker.js:49` exécute le substitut ss.
3. `capabilities/tls/index.js:9` exécute le substitut OpenSSL pendant une émission autorisée, puis signale TLS_CERTIFICATE_INVALID.
4. `capabilities/tls/index.js:19` refuse une CA étrangère avec l’OpenSSL système, puis retourne valid:true pour les mêmes fichiers lorsque le substitut OpenSSL renvoie zéro.

Le point `recovery.js:22` est évalué par inspection : chemin de dump DB derrière backup autorisé et état actif vérifié, mais même résolution Docker héritée. Aucun backup DB n’est simulé comme preuve réelle. [Script](evidence/IL-5.11/path-probe.cjs) et [résultats](evidence/IL-5.11/B-path-probe.json) sont conservés hors allowlist npm. Les clés jetables et marqueurs sont supprimés par finally.

Les premières exécutions ont rencontré EROFS sur le cache npm utilisateur, puis un échec de sous-processus dans le sandbox. L’installation a été reprise avec cache temporaire ; la reproduction autorisée hors sandbox a réussi. Ces essais d’environnement ne sont ni comptés comme preuves fonctionnelles réussies ni cachés comme skips. Aucun échec de test canonique n’est observé : ces suites ne sont pas rejouées après l’arrêt B.

## Décisions individuelles

### `AaFUM8xx2ckiDDba3qAT` — javascript:S5332

`test/application/plugins/qualification/worker.js:11` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **FALSE_POSITIVE_PROPOSED**.

SMTP de qualification : secure:false établit une connexion initiale convertie en STARTTLS obligatoire ; requireTLS:true, rejectUnauthorized:true, CA chargée explicitement et servername explicite. Absence de TLS, CA ou nom erroné et absence SASL refusés dans les preuves IL-5.8/IL-5.9-B. Adresses fixture.invalid et aucun envoi tiers. Même cas logique que AaFGj__57h-_7ZHL5nVs accepté par le propriétaire ; ID de main différent, statut Sonar toujours OPEN. Preuves historiques non rejouées ici.

### `AaE8TbnThgf3bSVnp8z4` — javascript:S4036

`test/lifecycle/run.js:21` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Inspection de collision d’image IL-3 : nom aléatoire fourni par le harnais ; exécutable Docker résolu avant toute vérification de collision. Compte développeur avec accès Docker, environnement hérité. Les labels ne protègent pas la sélection du programme.

### `AaE8TcJkhgf3bSVnp80B` — javascript:S4036

`lifecycle/recovery.js:22` ; sévérité Sonar **MINOR** ; **SHIPPED_RUNTIME** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Dump MariaDB pendant backup : projet et fichier préparés sont vérifiés ; destination exclusive 0600. Le programme hôte docker reste choisi via PATH. La commande shell interne est constante et lit le secret dans le conteneur. Aucun mot de passe en argument hôte. Portée kernel avec DB déclarée, non déclenchée par l’application sans DB. Inspection du flux seulement ; aucun dump réel rejoué.

### `AaE8TbpHhgf3bSVnp8z9` — javascript:S4036

`test/lifecycle/tracing-driver.js:6` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Driver de diagnostic de test : arguments Compose issus du prepared et ordre opérationnel, pas de shell hôte. Le binaire Docker peut être remplacé avant les contrôles ; le masquage des secrets dans stderr ne prévient pas cette exécution. Accès Docker et secrets de qualification du compte appelant.

### `AaE8TcJ8hgf3bSVnp80i` — javascript:S4036

`lifecycle/docker.js:8` ; sévérité Sonar **MINOR** ; **SHIPPED_RUNTIME** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Driver distribué central : arguments en tableau, socket Docker local fixe, labels/ownership et digests vérifiés en aval. Un programme substitué via PATH s’exécute avec les droits de l’opérateur avant ces vérifications. Le sous-chemin lifecycle/* est exporté et ce driver est celui par défaut des API de préparation/activation.

### `AaE8TcJ8hgf3bSVnp80m` — javascript:S4036

`lifecycle/docker.js:49` ; sévérité Sonar **MINOR** ; **SHIPPED_RUNTIME** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Observation des ports : arguments ss constants, résultat analysé avant activation. Le programme reste sélectionné par PATH et peut fausser l’observation ; l’inspection Docker additionnelle ne protège pas de l’exécution du substitut. Aucun shell hôte.

### `AaE6Nw2edL4i9l9HI8Cw` — javascript:S4036

`test/package-audit.js:21` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Création du tarball par npm pack : répertoire dépôt contrôlé et destination mkdtemp privée ; nom du programme npm non absolu. Accès aux fichiers de travail et à l’environnement développeur ; aucun script de publication appelé. Le confinement des fichiers ne contrôle pas le binaire sélectionné.

### `AaE6Nw2edL4i9l9HI8Cx` — javascript:S4036

`test/package-audit.js:24` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Installation du consommateur : tarball local nommé par npm pack ; --offline --ignore-scripts interdit réseau et scripts au vrai npm. Un substitut PATH s’exécute avant ces protections. Exécution dans un consommateur mkdtemp séparé, avec droits du développeur.

### `AaE6Nw1PdL4i9l9HI8CS` — javascript:S2612

`test/services/run.js:23` ; sévérité Sonar **MAJOR** ; **TEST_ONLY** ; décision **FALSE_POSITIVE_PROPOSED**.

mkdtemp sous os.tmpdir crée un nom exclusif ; chmod 0755 ouvre lecture/traversée mais pas écriture à autrui. Nécessaire aux processus de conteneur sous UID distinct. Secrets dans store/projections privés 0700/0600, contenu public de qualification jetable ; aucune donnée de production. Le parent de test n’est pas un répertoire partagé inscriptible et les noms ne sont pas réutilisés. Proposition contextuelle, sans disposition Sonar ni acceptation de risque générale.

### `AaE6Nw1PdL4i9l9HI8CT` — javascript:S4036

`test/services/run.js:29` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Collision des deux images de qualification services : tags dérivés du projet aléatoire, arguments Docker en tableau. Le test de collision peut lui-même exécuter un programme choisi par PATH avec accès Docker. Aucun contrôle de permissions du binaire à ce site.

### `AaE6Nw1PdL4i9l9HI8CU` — javascript:S4036

`test/services/run.js:51` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Collision des réseaux services : noms produits par le plan, refus des réseaux existants. La résolution Docker intervient avant le refus de collision ; le réseau privé et les labels n’authentifient pas le programme hôte.

### `AaE6Nw1PdL4i9l9HI8CW` — javascript:S4036

`test/services/run.js:79` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Diagnostic santé DNS dans le catch : conteneur dérivé du projet isolé, délai 15 s. Le chemin d’erreur peut également sélectionner un Docker substitué. Redaction ultérieure de la sortie, non du comportement du programme. Risque pour le compte de test, absent du tarball.

### `AaE6Nw1PdL4i9l9HI8CX` — javascript:S4036

`test/services/run.js:80` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Collecte des logs Compose dans le catch : projet et compose_file générés ; timeout et buffer bornés, secrets connus expurgés ensuite. Le programme est toujours recherché sur PATH et peut lire les fichiers accessibles au compte avant redaction.

### `AaE6Nw1FdL4i9l9HI8CN` — javascript:S5443

`test/support/service-inputs.js:3` ; sévérité Sonar **CRITICAL** ; **TEST_ONLY** ; décision **FALSE_POSITIVE_PROPOSED**.

serviceInputs est une fabrique pure : sa valeur /tmp/infra-services-fixture ne crée, n’ouvre ni ne modifie ce chemin. Les tests exécutant les services remplacent root par leur mkdtemp. Les appels unitaires par défaut composent des valeurs ou rendent dans un autre répertoire temporaire explicite. Un nouvel appel qui activerait ce défaut sans root privé imposerait une nouvelle analyse. Absence réelle du fichier dans le package vérifiée.

### `AaE6Nw4UdL4i9l9HI8Dz` — javascript:S4036

`capabilities/tls/index.js:9` ; sévérité Sonar **MINOR** ; **SHIPPED_RUNTIME** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Émission TLS locale : API autorisée, références de clés validées et fichiers privés ; OpenSSL est sélectionné par PATH lors de req/x509. Il reçoit des chemins de clés temporaires. Remplacement = exécution avec les droits de l’émetteur et accès potentiel à ces clés. La reproduction utilise seulement des clés jetables et un programme qui échoue.

### `AaE6Nw4UdL4i9l9HI8D1` — javascript:S4036

`capabilities/tls/index.js:19` ; sévérité Sonar **MINOR** ; **SHIPPED_RUNTIME** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Validation TLS : SAN, paire clé/certificat, dates et caractère CA sont vérifiés en Node ; la chaîne est déléguée à openssl verify. Un substitut retournant zéro permet un résultat valid:true pour une CA sans relation. Les entrées fichiers restent contrôlées ; la précondition hostile porte sur l’environnement de l’opérateur, pas sur la requête HTTP.

### `AaE6Nw2edL4i9l9HI8Cu` — javascript:S4036

`test/package-audit.js:8` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Inventaire npm pack --dry-run : dépôt fixe fourni par le test ; l’inventaire et les contrôles d’allowlist ne s’exécutent qu’après sélection de npm sur PATH. Un substitut compromet le développeur ou falsifie l’inventaire. Aucun npm publish dans ce contrôle.

### `AaE6Nw2UdL4i9l9HI8Cp` — javascript:S4036

`test/integration/run.js:29` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Collision du réseau gateway IL-1 : projet validé drumee-il1-test-*, réseau dédié. Le binaire Docker reste hérité ; la vérification d’ownership ultérieure ne protège pas contre sa substitution. Accès Docker du développeur.

### `AaE6Nw2UdL4i9l9HI8Cq` — javascript:S2612

`test/integration/run.js:30` ; sévérité Sonar **MAJOR** ; **TEST_ONLY** ; décision **FALSE_POSITIVE_PROPOSED**.

mkdtemp exclusif, puis 0755 pour traversée du conteneur gateway et lecture de fixtures publiques ; aucun droit d’écriture groupe/autres. Sessions et identités sont jetables ; ce chemin n’est pas un store de production. L’attaque exige de changer les préconditions de propriété ou les permissions de descendants sensibles. Pas de réutilisation d’un nom /tmp connu. Proposition limitée à ce test, sans neutraliser la règle S2612.

### `AaE6Nw2UdL4i9l9HI8Cr` — javascript:S4036

`test/integration/run.js:50` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Collision de l’image kernel de qualification : nom lié au projet validé ; aucun paramètre shell. Programme Docker non absolu, environnement hérité. Risque d’exécution locale dans le compte de qualification, non code applicatif livré.

### `AaE6Nw2UdL4i9l9HI8Cs` — javascript:S4036

`test/integration/run.js:92` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Après down, assertion d’absence du réseau : nom dédié et attente d’échec d’inspection. Un substitut Docker peut simuler le résultat ou exécuter une action étrangère. Ce contrôle de nettoyage n’authentifie pas l’exécutable.

### `AaE6Nw2UdL4i9l9HI8Ct` — javascript:S4036

`test/integration/run.js:93` ; sévérité Sonar **MINOR** ; **TEST_ONLY** ; décision **ACCEPTED_RISK_PENDING_OWNER**.

Nettoyage de l’image IL-1 : inspection conditionne la suppression du seul tag créé. L’inspection utilise encore PATH ; le périmètre de nettoyage ne borne pas les actions d’un substitut. Pas de destruction réelle exécutée dans IL-5.11.

### `AaE6Nwx8dL4i9l9HI8CM` — javascript:S5443

`test/support/inputs.js:3` ; sévérité Sonar **CRITICAL** ; **TEST_ONLY** ; décision **FALSE_POSITIVE_PROPOSED**.

inputs est une fabrique pure de vues de montage ; /tmp/drumee-il1-fixture n’est jamais alloué par cette fonction. Le parcours gateway lui passe le root de fixtures mkdtemp ; les tests unitaires emploient des sorties contrôlées. Aucun secret ni ressource existante adopté par la fabrique. Proposition contextuelle, non recommandation de déployer sous ce chemin prévisible.

## Conditions de reprise

Le propriétaire doit choisir explicitement entre une acceptation **bornée** de l’hypothèse d’opérateur/environnement de lancement de confiance, avec exigences de déploiement et limites documentées, ou un chantier de durcissement ciblé dans Infra Layer. Une acceptation ne doit pas être généralisée aux autres défauts de l’inventaire.

Le plus petit durcissement à examiner centraliserait la sélection de chemins absolus autorisés pour Docker/ss/OpenSSL, vérifierait propriétaire et permissions des exécutables et de leurs ancêtres, et définirait l’environnement enfant contrôlé. Il doit préserver les contrats publics, erreurs et ordres d’opération ; les variantes d’installation des outils demandent une décision explicite. Tests attendus : PATH hostile sans exécution du substitut, binaire/ancêtre inscriptible refusé, chaîne TLS étrangère refusée, puis suites canonique/lifecycle/TLS et nouveaux octets/SRI. Aucun de ces changements n’est réalisé dans cette mission documentaire.

Une décision ou correction satisfaisante permettrait de reprendre **C → D → E → F** sur la source alors sélectionnée. Les résultats antérieurs (161 TAP, 87 assertions et consommateur isolé) restent de l’historique, pas une preuve nouvelle de cette hypothèse de sécurité. La publication reste bloquée et nécessite, après qualification complète, une autorisation distincte.
