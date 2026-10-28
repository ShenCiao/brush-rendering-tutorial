// Reuse the docs plugin's parsed front matter; each MD/MDX file is the source of truth.
module.exports = function () {
  return {
    name: "gallary-index",
    async allContentLoaded({ allContent, actions }) {
      const content = allContent["docusaurus-plugin-content-docs"].gallary;
      const artworks = content.loadedVersions[0].docs
        .filter(
          (doc) =>
            doc.frontMatter.artwork &&
            !doc.frontMatter.unlisted &&
            !doc.frontMatter.draft,
        )
        .map((doc) => ({
          id: doc.id,
          path: doc.permalink,
          title: doc.title,
          thumbnail: doc.frontMatter.thumbnail,
          order: doc.frontMatter.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
      actions.setGlobalData({ artworks });
    },
  };
};
