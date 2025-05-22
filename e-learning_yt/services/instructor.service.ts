import { gql } from '@apollo/client';

export const INSTRUCTOR_QUERIES = {
  GET_ALL: gql`
    query GetInstructors {
      instructors {
        data {
          id
          attributes {
            name
            bio
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
  `,
  
  GET_BY_ID: gql`
    query GetInstructorById($id: ID!) {
      instructor(id: $id) {
        data {
          id
          attributes {
            name
            bio
            avatar {
              data {
                attributes {
                  url
                }
              }
            }
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