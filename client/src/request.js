import { getAccessToken, isLoggedIn } from "./auth";

const ENDPOINTURL = 'http://localhost:9000/graphql'

// LOAD LIST OF JOBS
export async function loadJobs() {
    const query = `
    {
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
    const {jobs} = await graphqlRequest(query);    
    return jobs;
}

// LOAD SINGLE JOB
export async function loadJob(id) {
    const query = `
        query JobQuery($id: ID!){
            job(id: $id) {
                title
                id
                description
                company {
                    id
                    name
                    description
                }
            }
        }`;
    const {job} = await graphqlRequest(query, {id}); // const data = await graphqlRequest(query, {id}); - access to data.job but {job} is a syntax to extract data in it
     return job;
 }

export async function createJob(input) {
    const mutation = `
        mutation CreateJob($input: CreateJobInput){
            job: createJob(input: $input) {
                title
                id            
                company {
                    name
                    id
                }
            }
        }`
    const {job} = await graphqlRequest(mutation, {input}); 
     return job;
}

 export async function loadCompany(id) {
    const query =`query companyQuery($id: ID!){
        company(id: $id) {
          name
          description
          jobs {
            id
            title
          }
        }
      }`;
      const { company } = await graphqlRequest(query, {id});
      return company;
 }

// COMMON FUNCTION TO MAKE A REQUEST IN GRAPHQL
 async function graphqlRequest(query, variables={}) {
    const request = {
        method: 'POST',
        headers: {'content-type' : 'application/json' },
        body: JSON.stringify({
           query, 
           variables           
        })
    }
    // CHECK USER AUTH
    if(isLoggedIn()) {
        request.headers['authorization'] = 'Bearer ' + getAccessToken();
    }
    const response = await fetch(ENDPOINTURL, request)
     const responseBody = await response.json();
     // ERROR HANDLING - EXTRACT AN ERROR IF ANY
     if(responseBody.errors) { 
        const msg = responseBody.errors.map((err) => err.message).join('\n');
        throw new Error(msg);
     }
     return responseBody.data;
 }