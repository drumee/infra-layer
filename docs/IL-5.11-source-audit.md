# IL-5.11-A — Audit de la source canonique

Statut : **PASS** pour l’identité et la provenance, sans décision de sécurité ni autorisation de publication. Relevé du 19 octobre 2026 UTC (20 octobre à Paris).

## Révisions examinées

Le `main` distant reste `9e4166618ca519e5d9b9e58f5191d37c5fd56462` ; aucun commit ultérieur sur cette branche lors du relevé. GitHub confirme la PR #2 fusionnée avec ce SHA et son HEAD `aa9057f224f4ae5cf80d777e3cb2fad092193fb1`. Les arbres sont identiques : `83121b0357c4fc1fa2df6f6ffa49236fd5fa105e`. La PR documentaire #10 reste ouverte au HEAD `fcfe5b1c7188d60862af9251d630f97ef33269d3` ; ses rapports ne sont donc pas assimilés à du code intégré.

Travail dans un clone temporaire indépendant, branche `docs/il511-alpha3-release` créée sur le commit canonique. Les changements préexistants de Debian (deux changelogs et fichiers non suivis) sont préservés. Son checkout et ceux de Runtime/Oxy-form ne sont pas modifiés. Aucun AGENTS spécifique Infra Layer trouvé ; les instructions communes consultées sont conservées dans le dossier de travail IL-5.10.

## Vérification effective des octets

L’archive immuable téléchargée à nouveau est [celle du commit canonique](https://codeload.github.com/drumee/infra-layer/tar.gz/9e4166618ca519e5d9b9e58f5191d37c5fd56462). Ses 225 fichiers correspondent au checkout examiné. SHA256 source : `8bacfbc856cbf49d3722b1a22e78d5c520fdb45215bf96831e6e3326f7513468`. SRI source : `sha512-avsnkxzQulvLzyG7JNtXvvDygm0HTTtxdsv82TTEjx9RrIfQfut7xLwFmX7XGQDMa4Ht7g02tc9ENpPWrGEgyw==`.

Une nouvelle invocation `npm pack --json --ignore-scripts --pack-destination /tmp/drumee-il511-evidence` depuis cette source produit exactement les octets du candidat IL-5.10 conservé : 40 fichiers, 98 808 octets compressés. SHA256 npm recalculé : `7385ee7acbc6582746b2f8d8713ce174f7136e7531e7e57221df06a15c906a75`. SRI npm recalculé : `sha512-ZZIxqtHsFA0tCwAR6vcGa3iOttFYTkHCS4rKN4UtPApLPDkq41FJ0xJWKfWLEWVUlvM3JZldb1aGrhyKMiM9Pw==`.

Les 40 membres sont comparés individuellement au Git canonique et aux 40 SHA256 du reçu Debian `profiles/minimal-application/infra-source-lock.json` : zéro différence. Debian reste verrouillé sur `aa9057f...` ; son archive source possède sa propre empreinte, distincte du package npm et de l’archive du merge.

## Métadonnées et contrats

Package `@drumee/infra-layer@0.1.0-alpha.3`, CommonJS, AGPL-3.0-only, Node >=22 ; aucune dépendance de production. Exports root/lifecycle/capabilities et déclarations publiques inchangés, vérifiés par identité des fichiers. Les versions dev exactes de package.json concordent avec la racine du lockfile v3. Leur installation et leur audit ne sont pas déclarés rejoués à cette étape.

Outils de ce relevé : Node 22.22.0, npm 11.18.0, Git 2.39.5. Ce contrôle A ne remplace pas la reconstruction double et la qualification complète prévues à D.

## Preuves

[A-artifact.json](evidence/IL-5.11/A-artifact.json) contient l’allowlist réelle, les exports, les empreintes par fichier, la comparaison Debian et le SHA du lockfile ; [A-source.json](evidence/IL-5.11/A-source.json) décrit le téléchargement. Référence historique : [rapport IL-5.10-D figé](https://github.com/drumee/infra-layer/blob/fcfe5b1c7188d60862af9251d630f97ef33269d3/docs/IL-5.10-D-alpha3-release-candidate.md). La conclusion de sécurité est séparée dans [IL-5.11-B](IL-5.11-security-assessment.md).
