import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Result } from "../../models/result";
import { CardProvider } from "../../providers/card/card";
import { CRProvider } from "../../providers/cr/cr";
import { CR } from "../../models/cr";


@IonicPage()
@Component({
  selector: 'page-campaign',
  templateUrl: 'campaign.html',
})
export class CampaignPage {
  campaign = false;
  results: Array<Result> = [];
  allCRs: Array<CR> = [];
  loaded = 0;
  limit = 10;
  goalCR = 3;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public cardProvider: CardProvider,
    public CRProvider: CRProvider,
    public CRProvider1: CRProvider) {
    storage.ready().then(() => {
      storage.get('toggleCampaign').then((val) => {
        if (val != null) { this.campaign = val; }
      })
    });
  }

  ionViewDidLoad() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.CRProvider.getCRs()
      .then(CRs => {
          console.log("Crs length: " + CRs.length);
          if (this.limit > CRs.length){this.limit = CRs.length;}
          for (let i = this.loaded; i < this.limit; i++) {
            this.allCRs.push(CRs[i]);
          }
          this.loaded = this.limit;
          loading.dismiss();
      }).catch(e => {
        console.log(e);
      });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.limit = this.limit + 300;
      this.CRProvider.getCRs()
        .then(CRs => {
          console.log("Crs length: " + CRs.length);
          if (this.limit > CRs.length){this.limit = CRs.length;}
          for (let i = this.loaded; i < this.limit; i++) {
            this.allCRs.push(CRs[i]);
          }
          this.loaded = this.limit;
        });
      infiniteScroll.complete();
    }, 2000);
  }

  saveToggleCampaign() {
    this.storage.set('toggleCampaign', this.campaign);
  }

  // sortCR(sort: string): void {
  //   let sortedCRs = this.allCRs.sort((a, b) => {
  //     if (a.noc == null || b.noc == null) { return 0; }
  //     if (sort === "asc") {
  //       return +a.noc - +b.noc;
  //     } else {
  //       return +b.noc - +a.noc;
  //     }
  //   });
  //   this.allCRs = sortedCRs;
  // }

}
