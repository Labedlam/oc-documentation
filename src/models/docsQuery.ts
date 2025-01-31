export interface DocsQuery {
  mdx: {
    body: string
    fileAbsolutePath: string
    frontmatter: {
      title: string
    }
  }
  allMdx: {
    totalCount: number
    edges: [
      {
        node: {
          id: string
          fileAbsolutePath: string
          headings: [
            {
              value: string
            }
          ]
          frontmatter: {
            section: string
            title: string
            hidden?: boolean
          }
        }
      }
    ]
  }
}
