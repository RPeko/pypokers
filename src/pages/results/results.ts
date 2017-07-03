import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Result } from "../../models/result";
import { CardProvider } from "../../providers/card/card";
import { Play } from "../../models/play";
import { TrainingPage } from "../training/training";
import { ResultProvider } from "../../providers/result/result";
import { GraphsPage } from "../graphs/graphs";
import { ActionSheetController } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {
  results:Result[];
  plays:Play[] = [];
  trainingPage:any;
  graphsPage:any;
  mpgGraphLabels = ["AA,KK,QQ,AK", "JJ,TT", "99-22", "AQJs", "ATJ0", "A-2s", "KQJ", "KT-54s", "other"];
  mpdGraphLabels=["all passed", "checked", "raised"];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public resultProvider: ResultProvider,
              public cardProvider: CardProvider,
              public actionSheetCtrl: ActionSheetController) {
        this.trainingPage = TrainingPage;
        this.graphsPage = GraphsPage;
  }

  ionViewDidLoad() {
   this.getResults();
  }

  getResults(){
  this.resultProvider.getAllResults().then((data) => {
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
    this.results.forEach(res => this.resultProvider.deleteResult(res));
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

 presentActionSheet() {
   let actionSheet = this.actionSheetCtrl.create({
     title: 'Select:',
     buttons: [
       {
         text: 'Mistakes % per group',
         role: '',
         handler: () => {
           this.navCtrl.push(this.graphsPage, {
             graphMainLabel: "Mistakes % per group",
             graphLabels: this.mpgGraphLabels,
             graphData: this.getMPGData(),
           });
         }
       },
           {
         text: 'Mistakes per position',
         role: '',
         handler: () => {
           this.navCtrl.push(this.graphsPage, {
             graphMainLabel: "Mistakes per position",
             graphLabels: ["UTG",	"UTG+1",	"UTG+2",	"UTG+3",	"UTG+4",	"Hijack",	"Cutoff",	"SB",	"BB"],
             graphData: this.getMPPData(),
           });
         }
       },
      {
         text: 'Mistakes % per players decisions',
         role: '',
         handler: () => {
           this.navCtrl.push(this.graphsPage, {
             graphMainLabel: "Mistakes % per players decisions",
             graphLabels: this.mpdGraphLabels,
             graphData: this.getMPDData(),
           });
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('Cancel clicked');
         }
       }
     ]
   });
   actionSheet.present();
 }
// mistakes per group
 getMPGData(){
   this.mpgGraphLabels  = ["AA,KK,QQ,AK", "JJ,TT", "99-22", "AQJs", "ATJ0", "A-2s", "KQJ", "KT-54s", "other"];
   let mpgData = [0,0,0,0,0,0,0,0,0];
   let allPerGroup = [0,0,0,0,0,0,0,0,0];
   let mistakesPerGroup = [0,0,0,0,0,0,0,0,0];
   let group: any;
   
   for (let i = 0; i < this.results.length; i++){  
        group = this.results[i].hand.group;
        if (group == null || group == undefined){group=9;}
        if (allPerGroup[group -1] !== undefined){
            allPerGroup[group -1]++;
          }
        if (this.results[i].answer !== this.results[i].correct_answer){
            if (mistakesPerGroup[group -1] !== undefined){
              mistakesPerGroup[group -1]++; 
            }
        }
      for (let i = 0; i < allPerGroup.length; i++){
        if (allPerGroup[i] == 0){
          allPerGroup[i] = 1;
          this.mpgGraphLabels[i] = this.mpgGraphLabels[i] + " (0/0)";}
          mpgData[i] = mistakesPerGroup[i]/allPerGroup[i];
      }
   }
   return mpgData;
 }
// mistakes per position
 getMPPData(){
   let mppData = [0,0,0,0,0,0,0,0,0];
   let positions = [3,4,5,6,7,8,9,1,2];
   let index: any;
   for (let i = 0; i < this.results.length; i++){
      if (this.results[i].answer !== this.results[i].correct_answer){
          let position: any;
          position = this.results[i].position;
          index = positions.findIndex(index => (index == position)); 
          if (mppData[index] !== undefined){
            mppData[index]++; 
          }
      }
   }
   return mppData;
 }
 
 //Mistakes based on other players decision
 getMPDData(){
   let mpdData = [0,0,0];
   let allAby = [0,0,0];
   let mistakesAby = [0,0,0];
   this.mpdGraphLabels=["all passed", "checked", "raised"];

   for (let i = 0; i < this.results.length; i++){
   let aby:any;
   aby = this.results[i].aby;
          if (allAby[aby-1] !== undefined){
                      allAby[aby-1]++;
                  }
      if (this.results[i].answer !== this.results[i].correct_answer){ 
          if (mistakesAby[aby-1] !== undefined){
              mistakesAby[aby-1]++;
          }
      }
   }
   if (allAby[0]==0){
     allAby[0]=1;
     this.mpdGraphLabels[0]="all passed (0/0)";}
   if (allAby[1]==0){
     allAby[1]=1;
    this.mpdGraphLabels[0]="checked (0/0)";}
   if (allAby[2]==0){allAby[2]=1;
    this.mpdGraphLabels[0]="raised (0/0)"}
   mpdData[0] = mistakesAby[0]/allAby[0];
   mpdData[1] = mistakesAby[1]/allAby[1];
   mpdData[2] = mistakesAby[2]/allAby[2];
   return mpdData;
 }

}
