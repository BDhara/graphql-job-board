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
    const response = await fetch(ENDPOINTURL, {
         method: 'POST',
         headers: {'content-type' : 'application/json' },
         body: JSON.stringify({
            query, 
            variables           
         })
     })
     const responseBody = await response.json();
     // ERROR HANDLING - EXTRACT AN ERROR IF ANY
     if(responseBody.errors) { 
        const msg = responseBody.errors.map((err) => err.message).join('\n');
        throw new Error(msg);
     }
     return responseBody.data;
 }