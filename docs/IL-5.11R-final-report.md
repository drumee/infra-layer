# IL-5.11R — Rapport final

Statut : **READY_FOR_SECURITY_REVIEW**. Ce statut concerne la correction proposée dans [Infra Layer #12](https://github.com/drumee/infra-layer/pull/12), pas une autorisation de fusion ou de publication alpha.3. Source de package qualifiée : `71bd7b8b38345d61316771c07d76fece687af650` ; parent canonique : `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. Les commits documentaires de clôture ne changent pas les octets distribués.

## Contrôles par étape

| Étape | Résultat |
| --- | --- |
| A | PASS : cinq sites distribués, treize sites test et chemins connexes inventoriés ; quatre attaques reproduites avant correction |
| B | PASS : contrat privé sur entrées système fixes, ownership/permissions/liens contrôlés et environnement minimal ; limites root/UID/TOCTOU explicites |
| C | PASS : signatures/types/exports et lock conservés ; Docker, ss, OpenSSL, observateurs et ACME durcis ; aucune dépendance de production |
| D | PASS : D1–D8, douze scénarios de fichiers réels et quatre attaques appariées sur le package installé neutralisées |
| E | PASS : tests canoniques, acceptation réelle, consommateur/types et cinq jobs Quality ; CodeQL exécuté/publé et résultat PR relu |
| F | PASS : clone propre distant, deux tarballs identiques, 41 membres et nouvelles empreintes vérifiées |
| G | Revue technique complète du périmètre PATH ; états Sonar/CodeQL et réserves humaines conservés |

## Modifications

`internal/system-tools.js` reste hors exports publics et ne recherche aucun outil dans le PATH appelant. Docker/ss/OpenSSL utilisent les entrées /usr/bin protégées ; les symlinks et ancêtres sont contrôlés, pas seulement le chemin final. Docker n’adopte pas la configuration CLI du HOME appelant ni ses plugins. Les options d’exécution transmises sont nommées explicitement, sans shell ni environnement arbitraire. OpenSSL continue de vérifier réellement chaîne, nom, dates et clé ; le client ACME explicite est revérifié par SHA256 avant chaque invocation.

Les lanceurs de qualification passent par le helper existant renforcé. npm est lié au Node courant vérifié ; le PATH enfant contient seulement son répertoire approuvé et /usr/bin:/bin. Le runner GitHub avait /opt et des ancêtres du cache en 0777 : la préparation CI retire ces droits dans la seule VM dédiée, avec garde hors CI, contrôle d’ownership et hash de contenu avant/après identique. La politique du resolver et les règles GitHub ne sont pas modifiées. Les permissions de production et les secrets de déploiement ne sont pas changés.

## Résultats, comptés séparément

- **TAP unitaires : 171/171** ; contrats : **24/24**, inclus dans les 171.
- **TAP d’intégration : gateway 17/17 ; services 17/17 ; lifecycle 16/16**. Zéro échec/skip dans les exécutions finales.
- **Acceptation applicative : 87 assertions**, avec Nginx hôte, HTTPS CA/SAN, RPC public accepté/protégé 403, publication loopback et client LAN indépendant (route témoin réussie puis runtime ECONNREFUSED).
- **Navigateur : un scénario Chromium réel**, déjà inclus dans la suite gateway ; aucune nouvelle qualification Finder/kernel complet annoncée.
- **Autres preuves : 12 scénarios fichiers en conteneur, quatre scénarios HTTPS/jobs, huit assertions de consommateur installé avec types stricts, quatre scénarios d’attaques appariées**. Pas de total additionnant des catégories ou des reprises.
- **ESLint : 0 erreur, 29 avertissements historiques visibles, 0 nouveau**. Baseline originale inchangée. Audits npm production et développement : zéro vulnérabilité connue au relevé.

Le stop/start, la panne de démarrage, le SIGKILL, la reprise explicite, le rollback et les refus d’ownership passent. La restauration applicative est qualifiée sans SMTP ; **SMTP_RECOVERY_UNQUALIFIED reste effectif**. STARTTLS/SASL/DKIM, refus d’open relay, absence de publications inutiles et conservation de file/secrets lors d’une panne applicative sont observés. Aucune délivrabilité Internet ni restauration du spool SMTP revendiquée.

## Artefact

Candidat local `@drumee/infra-layer@0.1.0-alpha.3`, **41 fichiers**, **101 242 octets**, Node >=22, AGPL-3.0-only, aucune dépendance de production.

SHA256 npm : `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c`.

SRI npm : `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==`.

Le SRI distinct de l’archive source, sa liste de membres et tous les SHA256 sont dans le [rapport F](IL-5.11R-artifact-qualification.md). Reproductibilité vérifiée sur l’hôte qualifié uniquement. L’ancien candidat 40 fichiers et l’ancien SRI ne désignent pas ces octets.

## Échecs intermédiaires conservés

La première fixture de permissions avait un tmpfs noexec : son exécutable de contrôle positif a été correctement refusé. Le montage de test a été rendu explicitement exécutable, sans assouplir le validateur. Les erreurs de syntaxe de rédaction et la première alerte de lint ont été corrigées avant les validations finales ; aucune suppression de test ou de règle.

La première CI packaging a échoué sur /usr/bin/npm absent ; la suivante a rejeté /opt root:root 0777 et provoqué trois échecs unitaires ainsi que le refus de packaging. La règle n’a pas été contournée : l’installation Node de la VM est maintenant préparée, puis soumise au même validateur. Le [reçu CI](evidence/IL-5.11R/E-ci-toolchain-preparation.json) démontre des octets identiques avant/après. L’alerte medium initiale CodeQL sur le forwarding d’options Docker est conservée, avec son remplacement explicite et les preuves négatives. Les [états intermédiaires et logs](evidence/IL-5.11R/qualification-ledger.json) ne sont pas remplacés par le seul succès final.

## Contrôles et réserves

Les cinq jobs Quality de 71bd7b8 sont SUCCESS. CodeQL result check **118649409874** : SUCCESS, **No new alerts in code changed by this pull request**, zéro annotation relue. Cela ne signifie pas zéro alerte globale : Code Scanning/Dependabot restent HTTP 403.

**SonarCloud reste actif et en FAILURE** : 12 annotations PR ouvertes, dont sept S2612 de fixtures isolées et cinq de lisibilité ; aucune S4036 ouverte dans le diff examiné. Les 18 anciens ID PATH restent OPEN sur main tant que la correction n’est pas intégrée et réanalysée. Les sept contextes de tests sont présentés pour revue, sans nouvelle décision de faux positif ou d’acceptation au nom du propriétaire. Voir [la matrice G](IL-5.11R-security-disposition.md).

## Dépôts consommateurs et reprise

Debian, Server Runtime et Oxy-form sont restés en lecture seule. Debian conserve aa9057f et son reçu 40 fichiers ; ses changements locaux préexistants sont préservés. Les APIs sont compatibles conceptuellement et le consommateur générique passe ; la mise à jour du verrou et la requalification Debian restent un chantier distinct, avec prérequis Compose système protégé. Aucun ancien contrôle Debian n’a été neutralisé ni relancé artificiellement comme nouvelle preuve.

Après revue et éventuelle intégration : sélectionner le nouveau SHA canonique et ses empreintes définitives, reprendre IL-5.11-B puis C/D/E et la décision de publication distincte. La correction ne vaut pas acceptation des autres alertes historiques. Oxy-form reste soumis à sa reprise propre et à la qualification de sa distribution/SMTP ; aucun OF-01R accepté ou D0 déclaré.

**Aucune fusion, publication npm/image/tag, installation permanente, modification de production, d’oxymot.fr ou exécution Oxymotion D0.**

## Dossier

[Inventaire A](IL-5.11R-executable-inventory.md), [contrat B](IL-5.11R-trust-contract.md), [tests D/E](IL-5.11R-security-tests.md), [artefact F](IL-5.11R-artifact-qualification.md), [disposition G](IL-5.11R-security-disposition.md). Les commandes exactes, sources et limites sont conservées ; aucun test simulé n’est présenté comme acceptation réelle.
