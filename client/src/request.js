import { ApolloClient, HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost' // APOLLO-BOOST IS TO USE FOR APOLLO CLIENT
import { getAccessToken, isLoggedIn } from "./auth";
import gql from 'graphql-tag'

const ENDPOINTURL = 'http://localhost:9000/graphql'

// TO SET AN AUTHORIZATION HEADER IN APOLLO CLIENT USING APOLLO LINK
const authLink = new ApolloLink((operation, forward) => {
    if (isLoggedIn()) {
        operation.setContext({
            headers: {
                'authorization': 'Bearer ' + getAccessToken()
            }
        })
    }
    return forward(operation);
})

// SETUP AN APOLLO CLIENT FOR CACHING
// APOLLO LINK TAKES AN ARRAY FOR MULTIPLE LINK: HERE AUTH HEADER AND URL
const client = new ApolloClient({
    link: ApolloLink.from([
        authLink,
        new HttpLink({ uri: ENDPOINTURL })]),
    cache: new InMemoryCache() // SETUP A LOCALSTORAGE FOR THIS APP
})

const jobDetailFragment = gql`
fragment JobDetail on Job {
    title
      id
      description
      company {
        id
        name
        description
      }
  }
`;

const jobsQuery = gql`
    query{
        jobs {
        id                    
        title                    
        company {
                name
                id
                description
            }
        }
    }`;
const jobQuery = gql`
    query JobQuery($id: ID!){
        job(id: $id) {
            ...JobDetail
        }        
    }
    ${jobDetailFragment}
    `;
const createJobMutation = gql`
    mutation CreateJob($input: CreateJobInput){
        job: createJob(input: $input) {
            ...JobDetail
        }        
    }
    ${jobDetailFragment}
    `
const companyQuery = gql`query companyQuery($id: ID!){
    company(id: $id) {
        name
        description
        jobs {
            id
            title
        }
    }    
}`;

// LOAD LIST OF JOBS
export async function loadJobs() {
    const { data: { jobs } } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache' }) // call for caching on call to load jobs
    //const { jobs } = await graphqlRequest(query);
    return jobs;
}

// LOAD SINGLE JOB
export async function loadJob(id) {
    const { data: { job } } = await client.query({ query: jobQuery, variables: { id } })
    //const { job } = await graphqlRequest(query, { id }); // const data = await graphqlRequest(query, {id}); - access to data.job but {job} is a syntax to extract data in it
    return job;
}

export async function createJob(input) {
    const { data: { job } } = await client.mutate({
        mutation: createJobMutation,
        variables: { input },
        update: (cache, { data }) => {  // UPDATE CALLS AFTER MUTATION IS DONE TO AVOID CALL ON SERVER AGAIN TO GET A JOB          
            cache.writeQuery({ // WE HAVE ACCESS TO CACHE DIRECTLY, 
                query: jobQuery,
                variables: { id: data.job.id },
                data
            })
        }
    })
    //const { job } = await graphqlRequest(mutation, { input });
    return job;
}

export async function loadCompany(id) {
    const { data: { company } } = await client.query({ query: companyQuery, variables: { id } })
    //const { company } = await graphqlRequest(query, { id });
    return company;
}


/*
// REMOVED AFTER USING APOLLO CLIENT TO SEND A QUERY ON GRAPHQL AND PROVIDE FEATURES LIKE CACHING
// COMMON FUNCTION TO MAKE A REQUEST IN GRAPHQL
async function graphqlRequest(query, variables = {}) {
    const request = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            query,
            variables
        })
    }
    // CHECK USER AUTH
    if (isLoggedIn()) {
        request.headers['authorization'] = 'Bearer ' + getAccessToken();
    }
    const response = await fetch(ENDPOINTURL, request)
    const responseBody = await response.json();
    // ERROR HANDLING - EXTRACT AN ERROR IF ANY
    if (responseBody.errors) {
        const msg = responseBody.errors.map((err) => err.message).join('\n');
        throw new Error(msg);
    }
    return responseBody.data;
}
*/