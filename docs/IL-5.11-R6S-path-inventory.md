# IL-5.11-R6S — Inventaire des chemins

Audit du 2026-10-21, UID 1000 (somanos). Main distant : `a02b76e4c421e96e63406d7b10edc2b76a6056c1`. PR #15 fusionnée ; PR #16 ouverte au `1c9d20f1cc315628cfd703199423c6efc873ff13`. Aucun AGENTS.md trouvé dans les ancêtres ou le clone. Branche corrective distincte ; checkout initial préservé.

| Chemin / opérations | Classe avant correction | Frontière et disposition prévue |
| --- | --- | --- |
| `/tmp/il511-D2-results`, trois helpers | UNTRUSTED_PATH | Parent partagé /tmp 1777 ; racine observée UID1000/0755 mais identité jamais exigée par les scripts. mkdir réutilisable et liens permettent une substitution. Remplacer par racine unique 0700 créée exclusivement. |
| Journaux unit/contracts/gateway/services/lifecycle/application/package/lint/audits/consumer, services-1..3.txt | UNTRUSTED_PATH | open(w) suit les liens et tronque. Créer relativement au descripteur privé, O_EXCL/O_NOFOLLOW/0600. |
| qualification-progress.json, services-1..3.json, campaign-summary.json, artifact-receipt.json | UNTRUSTED_PATH | write_text suit les liens, progress est réécrit. Snapshots progress immuables et reçu final exclusif. Aucun dossier historique en écriture. |
| pack-1, pack-2, tarballs et pack.json | UNTRUSTED_PATH | mkdir(exist_ok=True), npm écrit dans un enfant réutilisé. Enfants privés exclusifs, contrôle du nom et du type du tarball, lecture fd sans lien. |
| `/tmp/il511-D2-clean` | TRUSTED_EXISTING observé, non garanti par les anciens helpers | UID1000/0755, /tmp sticky. Exécute du JS et lit le lockfile ; source explicite obligatoire, chemin sans lien, ownership/modes contrôlés, HEAD/arbre propres enregistrés. Confiance dans checkout sélectionné et dépendances installées par lockfile, aucune sélection implicite d’un voisin. |
| `/tmp/drumee-il511r-npm-cache` | NEEDS_INVESTIGATION → supprimer cette dépendance | UID1000/0755 observé ; lectures et écritures npm non protégées par les anciens helpers. Créer un cache distinct dans chaque racine privée ; aucun nettoyage/réemploi du cache historique. |
| `/tmp/drumee-il510-types/.../tsc` | TRUSTED_EXISTING à vérifier explicitement | UID1000/0755 observé ; code Node passé comme argument, pas protégé par trustedExecutable. Vérifier composants, ownership, modes, liens et arbre du package TypeScript avant qualification. |
| `/tmp/drumee-il511r-nginx/.../nginx` | TRUSTED_EXISTING | UID1000/0755 observé ; déjà contrôlé par trustedExecutable dans le harnais. Vérification complémentaire des composants par le helper, sans relâcher le contrat existant. |
| Chrome, git, npm, node, Docker | TRUSTED_EXISTING | Outils système approuvés ; npm et python sont des liens système légitimes. Chemins absolus existants conservés ; contrôles IL-5.11R inchangés. |
| reçus D/D2, package.json, lockfile, membres npm | READ_ONLY_INPUT | Checkout explicitement sélectionné ; lecture uniquement. Tar traité en mémoire avec extractfile, jamais extractall ; noms/membres réguliers contrôlés et comparaison SHA par membre. |
| /proc/loadavg, meminfo, pressure ; Docker ps/stats/readback | READ_ONLY_INPUT | Mesures système / API locale ; aucune destination dérivée du contenu. Projet observé limité par regex. |
| image-validation-cost.py : cwd=/tmp | READ_ONLY_INPUT | Aucun fichier créé, Node absolu, imports depuis arbres absolus sélectionnés, environnement minimal et limites CPU/temps. Pas de primitive d’écriture ici ; outil inchangé. |
| PR #16 : verify.py, source-archive.py | UNTRUSTED_PATH, branche non fusionnée | Même mkdir réutilisable/open/write_text ; chemins argv ou /tmp fixes. Ne sont pas dans main et ne sont pas corrigés par cette branche. Convergence obligatoire avant fusion de #16 : utiliser le nouveau contrat, ne pas rejouer ces copies telles quelles. |
| PR #16 : temp-path-proof.py | PRIVATE_EXCLUSIVE | TemporaryDirectory unique 0700 ; sentinelles possédées, opérations dangereuses confinées intentionnellement au reproducer. |

Les deux primitives historiques ont été reproduites avant correction, dans une fixture privée automatiquement supprimée : journal symlink et racine symlink suivis. [Résultat](evidence/IL-5.11-R6S/baseline-reproduction.json), [provenance](evidence/IL-5.11-R6S/baseline-provenance.json). Aucun fichier réel de qualification ni système touché ; aucune compromission historique démontrée.

Après correction, les sorties/cache/enfants doivent être PRIVATE_EXCLUSIVE. L’UID système apparaît 65534 dans la projection filesystem de cet environnement (/, /usr, /tmp), contre UID0 sur l’hôte Linux habituel ; la confiance système est ancrée sur le descripteur de `/`, pas sur une constante acceptant arbitrairement tout UID étranger. Les descendants privés doivent appartenir exactement à l’UID exécutant.
