import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

@Injectable()
export class DbProvider {
  data: any;
  db: any;
  // remote: any;

  constructor() {
    this.db = new PouchDB('db_pypokers');
  }

  getResults() {
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.db.allDocs({
        include_docs: true
      }).then((result) => {
        this.data = [];
        result.rows.map((row) => {
          this.data.push(row.doc);
        });
        resolve(this.data);
        this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
          this.handleChange(change);
        });
      }).catch((error) => {
        console.log(error);
      });
    });
  }

  createResult(result) {
    this.db.post(result);
  }

  updateResult(result) {
    this.db.put(result).catch((err) => {
      console.log(err);
    });
  }

  deleteResult(result) {
    this.db.remove(result).catch((err) => {
      console.log(err);
    });
  }


  handleChange(change) {
    let changedDoc = null;
    let changedIndex = null;
    this.data.forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }
    });

    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
    }
    else {

      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
      }

      //A document was added
      else {
        this.data.push(change.doc);
      }

    }

  }

}