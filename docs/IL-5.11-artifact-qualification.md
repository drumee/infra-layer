# IL-5.11-D — État de la requalification de l’artefact

Statut : **NOT_EXECUTED — arrêt à B (BLOCKED_SECURITY)**. L’identité vérifiée en A ne suffit pas à déclarer la requalification D réussie.

## Contrôles réellement effectués avant l’arrêt

La [preuve A](IL-5.11-source-audit.md) vérifie à nouveau l’archive canonique, les 40 membres, les exports et le lockfile par identité, les empreintes SHA256/SRI, la comparaison par fichier avec Debian et un nouveau pack exactement identique au candidat IL-5.10. Package : 98 808 octets, SHA256 `7385ee7acbc6582746b2f8d8713ce174f7136e7531e7e57221df06a15c906a75`.

Un consommateur temporaire installe ce tarball exact hors ligne, scripts désactivés, pour les **quatre scénarios de sécurité B**. Cela démontre que la reproduction porte sur le package installé ; ce n’est pas la nouvelle qualification complète du consommateur, des types ou de la préparation.

## Contrôles non rejoués dans IL-5.11

`npm ci`, `npm test`, `npm run test:contracts`, `npm run lint`, les audits npm, `npm run test:package`, la double construction depuis une installation propre, les huit assertions du consommateur complet et sa compilation stricte : **non exécutés localement**, arrêt de la chaîne en B. Aucun scénario réseau, SMTP, lifecycle ou Chromium n’est rejoué. Aucun skip n’est présenté comme un succès.

IL-5.10 avait démontré 161 TAP (dont 24 contrats), les deux archives identiques, les audits sans vulnérabilité connue et le consommateur complet. Ces résultats et leurs limites restent dans le [rapport historique figé](https://github.com/drumee/infra-layer/blob/fcfe5b1c7188d60862af9251d630f97ef33269d3/docs/IL-5.10-D-alpha3-release-candidate.md). Ils ne constituent pas une acceptation des nouveaux risques évalués.

À la reprise, suivre D dans son entier après B et C satisfaisants. Si un durcissement modifie les fichiers distribués, sélectionner une nouvelle source examinée, reconstruire, calculer de nouvelles empreintes et requalifier les mécanismes concernés. Le verrou Debian n’est pas modifié dans cette mission.
