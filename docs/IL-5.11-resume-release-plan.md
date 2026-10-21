# IL-5.11-Resume — Préparation de publication E

**E : NON EXÉCUTÉE APRÈS ARRÊT D. Publication BLOQUÉE.** Cette mission n’atteint pas READY_FOR_PUBLICATION_AUTHORIZATION. La suite Services a échoué et les règles d’arrêt interdisent de transformer la poursuite E en qualification autorisable.

## État réellement vérifié

Package local `@drumee/infra-layer@0.1.0-alpha.3`, licence AGPL-3.0-only, publishConfig.access public et tag next, aucune dépendance runtime, aucun script prepublish/prepublishOnly/prepack/prepare/publish/postpublish déclaré dans package.json. Les builds D ont explicitement ignoré les scripts. Le nouveau tarball a SHA256 `c503d31c44f6da34ccce7702b20fb82b462c82596cfb7677f10945ccd7cd6f4e` et SRI `sha512-R3Y1X1Cw6lFddrets7hDFAcWRhHUYPw/XAYtLxnHZcXvataHcgjrrlh04lqk4Esxfx5fkcKMvvvhqcsTqpe2MA==` ; il n’est **pas approuvé pour publication**, malgré sa reproductibilité.

Non consultés après arrêt : existence actuelle de alpha.3 sur le registre, dist-tags actuels, identité du compte npm, ACL package/organisation, portée et contraintes du token/2FA, configuration trusted publisher/OIDC et provenance réellement utilisable. **Permissions npm : UNVERIFIED.** Aucun refus de permission npm n’est démontré : les accès n’ont pas été testés, ce n’est pas un inventaire vide ni une absence supposée de version. Si une reprise E ne permet pas de vérifier ces droits, elle devra conclure BLOCKED_RELEASE_PERMISSIONS. Le blocage actuel prioritaire demeure FAILED_QUALIFICATION en D.

Le canal prévu reste **next**. Ne pas déplacer latest, activer de publication automatique, créer un tag ou publier une image. Ne pas publier pour vérifier les droits et ne pas considérer un dry-run comme une preuve de droit serveur.

## Plan à exécuter seulement après résolution de D

1. Sélectionner et figer la source corrigée ; reconstruire/qualifier tous les parcours et le tarball exact ; scanner les membres et secrets, vérifier les hooks, métadonnées et provenance. Si fusion future, mesurer l’identité source réelle séparément de l’archive npm.
2. Consulter `npm view @drumee/infra-layer versions --json` et `npm view @drumee/infra-layer dist-tags --json` ; enregistrer la date et vérifier la disponibilité de 0.1.0-alpha.3. Ne pas écraser une version existante.
3. Vérifier le compte par npm whoami et les permissions serveur sur le package/organisation, sans exposer de token ; vérifier les exigences d’authentification/2FA et la capacité de provenance dans l’environnement prévu. Ne pas modifier les accès ou trusted publishers sans autorisation séparée.
4. Présenter au propriétaire un reçu figé, les résultats, les réserves C, les conditions de provenance et une commande reproductible. Le gabarit suivant est **non autorisé et non exécuté** ; son chemin doit désigner un futur artefact effectivement qualifié, jamais le candidat défaillant de cette mission.

```sh
npm publish "$IL511_QUALIFIED_TARBALL" --access public --tag next --ignore-scripts
```

La provenance ne sera activée qu’après validation de son mécanisme réellement disponible ; aucune attestation OIDC locale ou publication de provenance n’est revendiquée ici. L’ajout éventuel de --provenance et l’environnement de publication doivent figurer dans une future commande explicitement autorisée. Aucun script de publication automatique n’est ajouté.

## Vérification post-publication à préparer

Après autorisation distincte et publication contrôlée : consulter la version exacte et son dist.integrity, vérifier next et l’identité inchangée de latest, télécharger le tarball depuis le registre dans un répertoire neuf, recalculer SHA256 et SRI SHA512 et les comparer au reçu préautorisé. Installer cette archive avec scripts désactivés dans un consommateur isolé, vérifier exports/types stricts et les contrats de préparation/refus, puis enregistrer la traçabilité vers le commit source et l’attestation effective. Ne pas utiliser un SRI de source GitHub pour cette comparaison npm.

Toutes ces étapes demeurent planifiées, **non exécutées**. Aucune publication, tag, dist-tag, modification Debian/Runtime/Oxy-form ou opération de production.
