import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { CardProvider } from "../card/card";
import { CR } from "../../models/cr";

//Campaign results
@Injectable()
export class CRProvider {
  data: any;
  db: any;
  remote: any;

  constructor(public cardProvider: CardProvider) {
    this.db = new PouchDB('db_pp_cr');
    this.getCRs().then(allCRs => {
      if (allCRs.length !== 1326) {
        for (let i = 0; i < allCRs.length; i++) {
          this.deleteCR(allCRs[i]);
        }
        this.cardProvider.getAllHands().subscribe(
          allHands => {
            for (let k = 0; k < allHands.length; k++) {
              let cr = new CR();
              cr.hand = allHands[k];
              cr.noc = 0;
              cr._id = "" + (100000 + cr.hand.hand_id);
              this.db.post(cr);
            }
          }
        );
      }
    });
    // this.synchronize();
  }

  synchronize(){
     this.remote = new PouchDB(`http://127.0.0.1:5984/db_pypokers_cr`);
        PouchDB.sync(this.db, this.remote, {
          live: true,
          heartbeat: false,
          timeout: false,
          retry: true
        });
  }

  getCRs() {
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.db.allDocs({include_docs: true}).then((CRs) => {
        this.data = [];
        CRs.rows.map((row) => {
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

  createCR(cr) {
      this.db.post(cr);
    }

  updateCR(cr) {
    this.db.put(cr).catch((err) => {
      console.log(err);
    });
  }

  deleteCR(cr) {
    this.db.remove(cr).catch((err) => {
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