import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
results: Array<Result>=[];
allCRs: Array<CR>=[];
goalCR = 3;

  constructor(public navCtrl: NavController,
              public navParams: NavParams, 
              public storage: Storage,
              public cardProvider:CardProvider,
              public CRProvider:CRProvider) {
    storage.ready().then(() => {
      storage.get('toggleCampaign').then((val) => {
        if (val != null) { this.campaign = val; }
      })
    });  
  }

  ionViewDidLoad() {
    this.CRProvider.getAllCRs()
      .then(CRs => this.allCRs = CRs );
  }

   saveToggleCampaign() {
    this.storage.set('toggleCampaign', this.campaign);
  }

  sortCR(sort: string): void{
    let sorted = this.allCRs.sort((a,b) =>{
          if (a.noc == null || b.noc == null){ return 0;}
          if (sort === "asc"){
            return  +a.noc - +b.noc;
          } else {
            return  +b.noc - +a.noc;}
        });
    this.allCRs = sorted;
  }
}
