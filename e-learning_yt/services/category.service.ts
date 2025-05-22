import { gql } from '@apollo/client';

export const CATEGORY_QUERIES = {
  GET_ALL: gql`
    query GetCategories {
      categories {
        data {
          id
          attributes {
            name
            slug
          }
        }
      }
    }
  `,
  
  GET_BY_SLUG: gql`
    query GetCategoryBySlug($slug: String!) {
      categories(filters: { slug: { eq: $slug } }) {
        data {
          id
          attributes {
            name
            slug
            courses {
              data {
                id
                attributes {
                  title
                  description
                  price
                  image {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
}; 