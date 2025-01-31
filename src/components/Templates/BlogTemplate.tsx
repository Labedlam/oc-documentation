import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '../Layout/Layout'
import { graphql } from 'gatsby'
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer'

import {
  createStyles,
  Typography,
  Grid,
  Container,
  Theme,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginBlockStart: '2rem',
      marginBlockEnd: '4rem',
    },
    body: {},
  })
)

interface BlogComponentProps {
  data: {
    mdx: {
      body: string
      frontmatter: {
        title: string
        tags: string
        authors: string
        summary: string
        date: number
      }
    }
  }
}

function BlogComponent(props: BlogComponentProps) {
  const { data } = props
  const classes = useStyles(props)
  return (
    <Layout>
      <Container maxWidth="lg">
        <Grid container className={classes.container} spacing={3}>
          <Grid item xs={9}>
            <Helmet
              title={`OrderCloud Release Notes - ${data.mdx.frontmatter.apiVersion}`}
            />
            <div className={classes.body}>
              <Typography variant="h2" component="h1">
                {data.mdx.frontmatter.title}
              </Typography>
              <Typography component="span">
                <MDXRenderer>{data.mdx.body}</MDXRenderer>
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogByPath($nodeID: String!) {
    mdx(id: { eq: $nodeID }) {
      body
      frontmatter {
        title
        tags
        authors
        summary
        date
      }
    }
  }
`

export default BlogComponent
