# IL-5.11R-F — Artefact local et provenance

Statut : **PASS**, candidat local non publié. Source de correction qualifiée : `71bd7b8b38345d61316771c07d76fece687af650`, PR #12 vers main, parent canonique `9e4166618ca519e5d9b9e58f5191d37c5fd56462`. Cette source n’est pas annoncée intégrée. Les commits de clôture documentaire n’affectent pas les membres npm ; le SHA canonique et les reçus définitifs devront être réévalués après revue/intégration.

## Identité recalculée

| Champ | Valeur |
| --- | --- |
| Package / version | @drumee/infra-layer / 0.1.0-alpha.3 |
| Fichiers | **41** ; internal/system-tools.js ajouté, absent des exports publics |
| Taille compressée / décompressée | **101 242 / 361 235 octets** |
| SHA256 npm | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| SRI npm | `sha512-BP1hSTOer0C7u118cixNtiJ/yOErtCFfEzQTjqZ6tP7bPTMDbXvWrJ24z8jNdKRjFRCTxjprpHxDZ5BUmWb2/Q==` |
| Archive source | https://codeload.github.com/drumee/infra-layer/tar.gz/71bd7b8b38345d61316771c07d76fece687af650 |
| SHA256 source | `a214c7e3c058f7b0cff0e422632105bc4a665814bc5cc7c11410c2ccc1d05f3c` |
| SRI source | `sha512-NBxKJUjJCtOv9dasnAFapcrioR+faJm2ZzhlmGmGD/2EEASmTOKnDmVRaIAarHVvWRDChblrzQtxQUkJpZq79Q==` |
| Licence / runtime | AGPL-3.0-only / Node >=22 |
| Dépendances de production | **Aucune** |

Les deux empreintes source/npm sont distinctes. L’ancienne empreinte `sha512-ZZIxqtHs…` identifie le candidat 40 fichiers et n’est jamais réutilisée pour les nouveaux octets. Le [reçu complet](evidence/IL-5.11R/F-artifact-receipt.json) contient les SHA256 des 41 fichiers et les comparaisons.

## Construction et consommateur

Clone distant propre, HEAD vérifié, installation npm ci verrouillée ; tests unitaires/contrats/lint/package rejoués. Deux commandes `npm pack --json --ignore-scripts --pack-destination <répertoire distinct>` produisent des archives comparées par cmp puis SHA256/SHA512 : **identiques octet par octet sur cet hôte qualifié**. Pas d’affirmation de reproductibilité entre machines ou versions npm. Git reste propre ; les .tgz, caches et consommateurs sont hors checkout.

L’archive source possède 274 membres, dont 236 fichiers : pas de lien ni de chemin dangereux, zéro différence avec le clone examiné. Les 41 membres du tarball sont tous réguliers, correspondent au Git et aux fichiers distribués exécutés pendant l’acceptation lourde sur 68000c5. Les déclarations index.d.ts/lifecycle/index.d.ts, exports et package-lock sont identiques à la base ; l’allowlist de packaging reste stricte. Aucune dépendance dev nécessaire au fonctionnement du package.

Le consommateur isolé installe exclusivement le tarball local, offline, scripts désactivés ; exports, composition, erreurs, préparation réelle et idempotence vérifiés, compilation stricte NodeNext passée. La preuve canonique rapporte huit assertions, sans activation. Un second consommateur distinct rejoue les quatre attaques sur les seuls sous-chemins publics installés : Docker/ss réels, émission TLS légitime et refus de la CA étrangère, zéro substitut exécuté. Aucun import de module d’un checkout voisin. [Reçu du consommateur](evidence/IL-5.11R/F-isolated-consumer.txt) et [attaques appariées](evidence/IL-5.11R/F-paired-security.json).

## Debian en lecture seule

Le profil minimal-application continue de verrouiller `aa9057f224f4ae5cf80d777e3cb2fad092193fb1` et l’ancien reçu 40 fichiers ; **aucun verrou n’a été modifié**. Comparaison : 30 anciens membres identiques, 10 membres modifiés et un membre privé ajouté. Interfaces/types restent compatibles ; l’opérateur Debian appelle le lifecycle sur l’hôte, où Docker/ss/OpenSSL et le plugin Compose système doivent satisfaire les nouvelles préconditions de permissions. Le runtime applicatif n’acquiert aucun service implicite.

Une mise à jour Debian devra sélectionner le commit intégré, recalculer le SRI de son archive source (ou du futur package publié selon décision distincte), étendre son inventaire à 41 membres et rejouer sa qualification. Le nouveau tarball ne peut pas être substitué sous l’ancien SRI. La présente compatibilité conceptuelle et le consommateur générique ne sont pas une nouvelle acceptation Debian. Pas de fusion, tag, npm publish ni publication d’image.

Commandes du consommateur canonique exécutées depuis la source propre :

```sh
IL5_APP_IMAGE=sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955 \
IL5_TSC=/tmp/drumee-il510-types/node_modules/typescript/bin/tsc \
node test/application/package-consumer.js
node test/security/installed-consumer.cjs /tmp/drumee-il511r-installed-consumer
```

L’image existante d44327e est une entrée immuable explicite du seul test de préparation, inspectée en lecture seule ; elle n’est pas adoptée comme installation et n’est ni démarrée ni supprimée par ce consommateur. Les images de l’acceptation applicative réelle ont été reconstruites dans leur projet possédé distinct. Le relevé public du registre conserve alpha.1/alpha.2 seulement, next=alpha.2 et latest=alpha.1 ; alpha.3 reste un candidat local. Aucun dist-tag n’est modifié.
