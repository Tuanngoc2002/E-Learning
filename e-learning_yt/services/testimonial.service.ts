import { gql } from '@apollo/client';

export const TESTIMONIAL_QUERIES = {
  GET_ALL: gql`
    query GetTestimonials {
      testimonials {
        data {
          id
          attributes {
            name
            role
            content
            avatar {
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
  `
}; 