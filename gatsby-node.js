const path = require(`path`);

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'esnext',
  },
});

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
        tags: group(field: frontmatter___tag) {
          fieldValue
        }
      }
    }
  `);

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  const mdPostTemplate = path.resolve('src/templates/MdTemplate.tsx');

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: mdPostTemplate,
    });
  });

  const tagListTemplate = path.resolve('src/templates/TagListTemplate.tsx');
  result.data.allMarkdownRemark.tags.forEach(tag => {
    createPage({
      path: `/tags/${tag.fieldValue}`,
      component: tagListTemplate,
      context: {
        tagName: tag.fieldValue,
      },
    });
  });
};
