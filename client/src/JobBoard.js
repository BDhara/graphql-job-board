import React, { Component } from 'react';
import { JobList } from './JobList';
//const { jobs } = require('./fake-data');
import { loadJobs } from './request';

export class JobBoard extends Component {
  // to make job stateful
  constructor(props) {
    super(props);
    this.state = { jobs: []};
  }

  //it will be called effectively when component is loaded on page
  async componentDidMount() {
    const jobs = await loadJobs();
    this.setState({jobs});
  }

  render() {
    const {jobs} = this.state;
    return (
      <div>
        <h1 className="title">Job Board</h1>
        <JobList jobs={jobs} />
      </div>
    );
  }
}
