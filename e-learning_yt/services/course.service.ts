import { gql } from '@apollo/client';

export const COURSE_QUERIES = {
  GET_ALL: gql`
    query GetCourses {
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
            category {
              data {
                attributes {
                  name
                }
              }
            }
            instructor {
              data {
                attributes {
                  name
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
        }
      }
    }
  `,
  
  GET_BY_ID: gql`
    query GetCourseById($id: ID!) {
      course(id: $id) {
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
            category {
              data {
                attributes {
                  name
                }
              }
            }
            instructor {
              data {
                attributes {
                  name
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
        }
      }
    }
  `
}; 