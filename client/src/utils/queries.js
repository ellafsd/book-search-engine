import { gql } from '@apollo/client';
//Pulling in the component from the resolvers
export const QUERY_ME = gql`
{
    me {
        _id
        username
        email
        savedBooks {
            bookId
            authors
            image
            description
            title
            link
        }
    }
}
`;