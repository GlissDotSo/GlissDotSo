module.exports = {
  titleSuffix: " | Gliss",
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null,
  darkMode: true,
  footer: true,
  footerText: `${new Date().getFullYear()}`,
  footerEditLink: null,
  head: ({ title, meta }) => {
    return (
      <>
        <title>{title}</title>
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
        {meta.tag && <meta name="keywords" content={meta.tag} />}
        {meta.author && <meta name="author" content={meta.author} />}
      </>
    );
  },
};
