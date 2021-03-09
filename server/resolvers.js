const db = require('./db');
const Query = {    
    job: (root, args) => db.jobs.get(args.id), // DIRECTLY FETCHING ID:  job: (root, {id}) => db.jobs.get(id)
    company: (root, args) => db.companies.get(args.id),
    jobs: () => db.jobs.list()
};
const Job = {
    company: (job) => db.companies.get(job.companyId) 
};
const Company = {
    jobs: (company) => db.jobs.list().filter((job) => job.companyId === company.id)
};

const Mutation = {
    createJob: (root, {input}, {user}) => {
        /*console.log('user: ' + user);
        return null;*/
        // CHECK USER AUTH - BEFORE CREATING AN OBJECT
        if(!user) {
            throw new Error('Unauthorized')
        }

       const id =  db.jobs.create({...input, companyId: user.companyId});
         return db.jobs.get(id);
        
    }
}
module.exports = { Query, Job, Company, Mutation }; //to export an object