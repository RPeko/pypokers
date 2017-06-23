import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbProvider } from "../../providers/db/db";
import { Result } from "../../models/result";
import { CardProvider } from "../../providers/card/card";
import { Play } from "../../models/play";
import { TrainingPage } from "../training/training";

@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {
  results:Result[];
  plays:Play[] = [];
  trainingPage:any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public dbProvider: DbProvider,
              public cardProvider: CardProvider) {
        this.trainingPage = TrainingPage;
  }

  ionViewDidLoad() {
   this.getResults();
  }

  getResults(){
  this.dbProvider.getResults().then((data) => {
        data.sort((a,b) =>{
          if (a.time_stamp == null || b.time_stamp == null){ return 0;}
          return  +b.time_stamp - +a.time_stamp;
        });
          this.results = data;
          this.results.forEach(res =>{
              let strDate = res.play_stamp.toISOString(); 
              let index = this.plays.findIndex(p => (p.play_ts === strDate)); 
              if (index < 0){ 
                  let play = new Play();
                  play.play_ts = strDate;
                  play.results = [];
                  play.results.push(res);
                  this.plays.push(play);
              } else {
                this.plays[index].results.push(res)   
              }
          });
      });
  }

  getFullAnswer(a:string){
    return this.cardProvider.getFullAnswer(a);
  }


  clearAllResults(){
    this.results.forEach(res => this.dbProvider.deleteResult(res));
 }

 getAby(aby:number){
   return this.cardProvider.getAby(aby);
 }

 toogle(play:Play){
   if (play.show){
     play.show = false;
   } else {
     play.show = true;
   }
 }
}
