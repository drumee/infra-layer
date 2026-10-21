# IL-5.11-Resume — Qualification d’artefact D

**Contrôle D : FAIL — FAILED_QUALIFICATION. Publication bloquée.** L’identité binaire est démontrée, mais la suite nécessaire Services échoue. L’ordre séquentiel a arrêté les vérifications suivantes ; aucune acceptation lourde ancienne n’est substituée au contrôle actuel défaillant.

## Source sélectionnée et clone propre

Source qualifiée jusqu’au point d’arrêt : **`d19e62ba682dc2d781f5f941c7ba4b37e3a65053`**, après B et C, depuis le main réellement observé `8f297d8f676706f052a24ce4e875d91b76555b91`. Clone distant distinct `/tmp/il511-resume-clean`, branche dédiée, HEAD vérifié et `git status --porcelain=v1 --untracked-files=all` vide avant installation, construction et après les opérations. Les rapports finaux ultérieurs sont documentaires et hors npm ; aucun changement de code distribué après cette sélection.

Node **22.22.0**, npm **11.18.0**. Installation `npm ci --ignore-scripts --no-audit --no-fund --offline` avec cache de qualification existant ; lockfile inchangé. Types index.d.ts/lifecycle/index.d.ts, exports, version 0.1.0-alpha.3 et dépendances pins inchangés ; aucune dépendance de production ajoutée. Le correctif et les métadonnées de provenance sont commis, aucun source non suivi utilisé pour construire.

## Résultats des commandes nécessaires

| Vérification | Résultat réel |
| --- | --- |
| npm test | **176/176**, 0 échec/skip ; 24 contrats inclus |
| npm run test:contracts | **24/24**, 0 échec/skip |
| npm run test:gateway | **17/17**, dont Chromium réel, services natifs et reconnexion WebSocket ; nettoyage confirmé |
| npm run test:services | **15/17**, deux échecs détaillés ci-dessous ; exit 1 |
| npm run test:lifecycle | **NON EXÉCUTÉ**, arrêt après Services |
| npm run test:application | **NON EXÉCUTÉ**, arrêt après Services |
| npm run test:package | **NON EXÉCUTÉ**, arrêt après Services |
| npm run lint depuis clone propre | **NON EXÉCUTÉ** après arrêt ; lint C réussi à code distribué identique, ne pas l’annoncer comme cette nouvelle exécution |
| Consommateur isolé de préparation et types | Exécuté indépendamment pendant les suites : **8 assertions**, strict NodeNext, préparation réelle idempotente, exports, aucune activation ; même SRI exact |
| Scénarios supplémentaires de refus dans le consommateur installé | **NON EXÉCUTÉS**, à terminer lors de la reprise |

## Arrêt SMTP et limite de diagnostic

- **Test 15**, `test/services/services.test.js:137`, « Postfix queue survives capture outage and mail container recreation, then retries locally without key regeneration » : **ETIMEDOUT**, **Greeting never received**, durée 5301 ms.
- **Test 16**, même fichier:143, « controlled relay verifies STARTTLS trust and authenticates outbound to an isolated capture alias » : **fetch failed**, ERR_TEST_FAILURE, durée 30 ms.

Le test 15 arrête volontairement le service capture avant l’envoi destiné à rester en file ; une exception peut empêcher son redémarrage plus bas dans ce test. Le test 16 commence par lire cette capture. Un échec en cascade est donc compatible avec le flux du harnais ; la cause initiale du timeout SMTP n’est **pas établie**. Aucune attribution démontrée au correctif de validation d’image, à Server Runtime, Debian ou une vulnérabilité exploitable. Aucune hypothèse transformée en PASS.

Le processus de qualification s’arrête dès l’exit 1 de Services. Pas de relance jusqu’à obtenir du vert, pas de timeout augmenté, test supprimé, mock, règle désactivée ou ancien résultat présenté comme nouveau. Aucune correction extérieure tentée. Si une investigation ultérieure démontre un défaut Infra Layer, le propriétaire pourra le traiter dans une reprise bornée ; si un composant canonique externe doit changer, appliquer BLOCKED_CANONICAL.

Le harnais confirme le nettoyage du projet Services `drumee-il2-test-1a3edee9` et Gateway `drumee-il1-test-5fb3fa7d`. Lecture Docker après arrêt : aucun conteneur ni réseau restant portant leurs labels de projet. Aucun nettoyage global ni ressource étrangère supprimée. Le consommateur n’a activé aucun service et a supprimé son répertoire temporaire.

[Log Services complet](evidence/IL-5.11-resume/D-services-failed.txt) (deux espaces de fin de ligne retirés pour la présentation Git ; SHA256 brut et suffixes réversibles dans [D-log-integrity.json](evidence/IL-5.11-resume/D-log-integrity.json)), [arrêt structuré](evidence/IL-5.11-resume/D-stop.json), [ordre/exit codes/durées](evidence/IL-5.11-resume/D-suites.json).

## Identité de package vérifiée, sans approbation de release

Deux `npm pack --json --ignore-scripts --pack-destination <destination distincte>` depuis le clone propre sont identiques octet par octet. Tous les membres sont réguliers, chemins sûrs, fichiers byte-identiques au checkout propre, ensemble exactement égal aux 41 membres du reçu IL-5.11R. L’audit canonique test:package demeure non exécuté : ne pas en déduire une qualification globale d’absence de secrets complète.

| Champ | Nouveau candidat local, non publiable en l’état |
| --- | --- |
| Package/version | @drumee/infra-layer / 0.1.0-alpha.3 |
| Membres / octets compressés | **41 / 101778** |
| SHA256 npm recalculé | `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` |
| SRI npm recalculé | `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` |
| SHA256 IL-5.11R antérieur | `f2fd950e1f54634fa97b9e74ccd3ceb8dfdb15cb3e8a08c0c46489704432ac9c` |
| Comparaison | **Différent**, valeurs antérieures non réutilisables pour ces octets |

Les trois membres modifiés sont `lib/validation.js`, `CHANGELOG.md`, `PROVENANCE.md` ; les 38 autres sont identiques au reçu IL-5.11R. Le tarball de préparation/typage reconstruit dans le consommateur possède exactement le nouveau SRI : installation offline et scripts désactivés, sans require depuis un dépôt voisin dans le programme consommateur. Son image immuable explicitement identifiée `sha256:d44327e37d37c612257822684a870d05d7f90fdae649b2dcbfb8e9f0566e7955` est inspectée/utilisée seulement pour la préparation, sans activation ni suppression. Ce n’est pas une nouvelle acceptation applicative de cette image.

[Reçu et SHA256 des 41 fichiers](evidence/IL-5.11-resume/D-artifact-receipt.json), [consommateur/types](evidence/IL-5.11-resume/D-consumer.txt), [176 tests](evidence/IL-5.11-resume/D-unit.txt), [contrats](evidence/IL-5.11-resume/D-contracts.txt), [Gateway](evidence/IL-5.11-resume/D-gateway.txt), [installation](evidence/IL-5.11-resume/D-install.txt).

## Acceptation réelle et contrôle D

Les anciennes acceptations applicatives 87 assertions, lifecycle 16/16 et Services 17/17 sont historiques. Elles restent des preuves IL-5.11R, **pas** une compensation de l’échec actuel ni un feu vert du nouveau candidat. La fermeture technique PATH demeure acquise, les tests unitaires de substitution ont été rejoués ; les chemins fonctionnels/SMTP requis doivent néanmoins être requalifiés.

**D FAIL**. Reproductibilité npm et provenance source sont établies ; qualification fonctionnelle/sécurité définitive incomplète et en échec. Aucun SRI d’archive source post-merge nouveau n’est inventé : la PR n’est pas fusionnée. La reprise doit diagnostiquer le timeout initial, revoir l’indépendance/cleanup des tests, puis rejouer les suites nécessaires depuis une source propre explicitement sélectionnée. Toute correction distribuée exige un nouveau reçu. Ne pas poursuivre E comme contrôle réussi.

## Rejeu Services explicitement demandé après l’arrêt

Sur demande du propriétaire (« relance le test »), la même commande a été réexécutée depuis le même clone propre et le même commit `d19e62ba682dc2d781f5f941c7ba4b37e3a65053`, sans modification de code ou de délais. **17/17 PASS, zéro échec/skip**, dont les quatre tests SMTP/DKIM 13–16. Projet jetable `drumee-il2-test-bf78037e`, nettoyage confirmé par le harnais.

Le premier échec 15/17 reste conservé ; ce succès ultérieur ne démontre pas sa cause ni la résolution d’une éventuelle intermittence. La qualification D complète n’est pas validée par ce seul rejeu : les suites suivantes et E n’ont pas été reprises. Les conclusions et dates du premier arrêt ci-dessus restent historiques, sans substitution d’un résultat par l’autre.

[Log du rejeu](evidence/IL-5.11-resume/D-services-rerun-1.txt), [source, résultat et empreinte](evidence/IL-5.11-resume/D-services-rerun-1.json).
