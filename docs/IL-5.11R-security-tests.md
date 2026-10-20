# IL-5.11R-D/E — Tests de sécurité et qualification réelle

Statut : **PASS** sur les mécanismes examinés ; décision humaine distincte dans la [disposition](IL-5.11R-security-disposition.md). Source du package et des tests finaux : `71bd7b8b38345d61316771c07d76fece687af650`. Les acceptations Docker lourdes ont été exécutées sur le clone propre de `68000c593a7c9aad0f9e7989ad2f69857e59eba8` : les **41 fichiers distribués sont identiques** à 71bd7b8. Les ajouts intermédiaires sont les diagnostics du harnais, la préparation CI et des tests ; les commandes fonctionnelles, entrées et politiques exécutées sont conservées. Le reçu d’artefact démontre cette identité ; les validations courtes et le consommateur installé sont rejoués sur 71bd7b8. Aucun résultat ancien IL-5.10 n’est présenté comme une nouvelle exécution.

## D1–D8

| Cas | Preuve et résultat |
| --- | --- |
| D1 PATH hostile | Substituts docker/ss/openssl temporaires : zéro marqueur exécuté ; outils approuvés réellement appelés |
| D2 Outils approuvés absents | /usr/bin vide dans le namespace d’un conteneur sans réseau : refus ENOENT pour les trois outils, aucun fallback vers le PATH contenant les substituts |
| D3 Répertoire / fichier inscriptible | Refus d’un parent 0777, fichier 0777 et propriétaire étranger sur le système de fichiers réel du conteneur |
| D4 Symlinks | Lien root-owned vers cible sûre accepté ; parent d’entrée inscriptible, cible dangereuse, cycle et cible absente refusés |
| D5 TLS falsifié | Même CA étrangère qu’IL-5.11 : TLS_CHAIN_INVALID malgré faux OpenSSL renvoyant zéro ; certificat légitime accepté et nom incompatible refusé |
| D6 Docker substitué | Véritable Docker appelé ; PATH et options.env hostiles ignorés ; shell:true et métacaractères ne créent aucun marqueur |
| D7 ss substitué | Véritable socket 127.0.0.1 observé ; le driver installé refuse le port occupé malgré le substitut produisant une sortie vide |
| D8 Environnement enfant | Variables privées et paramètres de chargeur/SSL/Docker arbitraires absents ; configuration Docker système et plugins protégés vérifiés ; aucune exception sur le runner |

Commandes ciblées : `node --test test/unit/system-tools.test.js test/unit/il58-harness-safety.test.js`, `npm run test:system-tools`, puis `node test/security/installed-consumer.cjs /tmp/drumee-il511r-installed-consumer`. Les tests de sécurité TAP sont inclus dans le total unitaire, pas additionnés. Le conteneur exécute **12 scénarios** de métadonnées ; le consommateur installé rejoue **4 scénarios** appariés aux reproductions initiales. Ce sont des scénarios, pas 12 ou 4 assertions TAP supplémentaires.

Les namespaces /owned, /usr/bin et /etc/docker sont des tmpfs du conteneur jetable ; aucun binaire hôte remplacé. Source montée readonly, réseau none, rootfs readonly, capacités supprimées sauf CHOWN nécessaire au test de propriétaire étranger ; suppression automatique --rm. Les fichiers dangereux ne sont pas exécutés. Les clés de TLS sont générées pour ces tests, privées, puis supprimées. Les quatre reproductions initiales positives restent dans [A-before-path.json](evidence/IL-5.11R/A-before-path.json) ; la neutralisation sur le tarball exact est dans [F-paired-security.json](evidence/IL-5.11R/F-paired-security.json).

Un test supplémentaire modifie le client ACME jouet après son contrôle de version et son hash initial : la réexécution autorisée est refusée avant le marqueur, sans réseau ni compte ACME réel. La garde du script de préparation CI refuse son lancement hors VM dédiée avant toute mutation de /opt.

## Résultats finaux, sans recouvrement artificiel

| Commande / parcours | Résultat réellement obtenu |
| --- | --- |
| npm test | **171 TAP**, zéro échec/skip ; dont 10 nouveaux tests de durcissement/garde CI |
| npm run test:contracts | **24 TAP**, sous-ensemble des 171 |
| npm run test:gateway | **17 TAP**, zéro échec/skip, dont un scénario réel Chromium |
| npm run test:services | **17 TAP**, zéro échec/skip |
| npm run test:lifecycle | **16 TAP**, zéro échec/skip |
| npm run test:lifecycle:gateway | **4 scénarios** HTTPS/renouvellement/jobs, sans affirmation de kernel complet |
| npm run test:application | **87 assertions fonctionnelles**, 11 groupes, zéro échec/skip |
| npm run test:package | Allowlist 41, contrôle imports/secrets et consommateur root installé : PASS |
| npm run lint | Zéro erreur, **29 avertissements historiques visibles**, zéro diagnostic nouveau ; baseline inchangée |
| npm audit --omit=dev / --include=dev | Zéro vulnérabilité connue lors du relevé, pas une preuve générale de sûreté |
| Consommateur npm isolé complet | **8 assertions fonctionnelles**, préparation privée réelle et idempotente sans activation ; types stricts NodeNext / TypeScript 5.9.3 |

La suite gateway réutilise le Runtime/LETC et les primitives canoniques avec ses stores de contrat isolés : ce n’est pas une nouvelle qualification SQL/Finder du kernel complet. Le scénario Chromium appartient déjà aux 17 TAP. Aucun total regroupant ces catégories ni les reprises successives n’est annoncé.

## Réseau, SMTP et cycle de vie observés

Acceptation applicative réellement exécutée :

```sh
IL5_NETWORK_CLIENT=testbox IL5_LAN_ADDRESS=192.168.5.201 \
IL5_HOST_NGINX=/tmp/drumee-il511r-nginx/extracted/usr/sbin/nginx \
npm run test:application
```

Nginx 1.22.1 extrait du paquet Debian `1.22.1-9+deb12u10` uniquement sous /tmp ; SHA256 du .deb `cc7ae36d024f602861eeefe64656d14481b3bd224d81f8d69f789de49f16375a`. Aucun service système ou certificat de confiance installé. HTTPS vérifie réellement la CA et le SAN application.test ; `/-/svc/qualification.ping` réussit et le RPC protégé retourne 403. Docker et ss observent 127.0.0.1 seulement. Le client LAN indépendant testbox (192.168.5.202) obtient la route témoin puis ECONNREFUSED sur le runtime de 192.168.5.201 : le refus ne repose pas sur la configuration seule.

Préparation, readiness, stop/start, échec de démarrage, SIGKILL réel, récupération explicite, rollback, refus de ressources étrangères et de prepared altéré, sauvegarde complète et restauration isolée **sans SMTP** passent. La suite lifecycle exerce aussi le dump SQL cohérent avec le Docker approuvé. SMTP/DKIM reste privé : STARTTLS et nom/CA vérifiés, SASL, refus d’open relay, file et secrets conservés lors de la panne applicative, readiness facultative/requise distincte et SMTP_RECOVERY_UNQUALIFIED effectif. Aucune remise Internet ni restauration de spool SMTP qualifiée.

[Rapport applicatif](evidence/IL-5.11R/E-application-report.json), [ledger des commandes et logs](evidence/IL-5.11R/qualification-ledger.json). Les projets de tests sont nettoyés par leurs harnais ; aucune suppression d’installation inconnue. Les échecs intermédiaires de montage noexec et de CI restent documentés dans le ledger et le rapport final, sans skip de substitution.
