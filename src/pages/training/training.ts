import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CardProvider } from "../../providers/card/card";
import { Hand } from "../../models/hand";
import { Answer } from "../../models/answer";
import { DbProvider } from "../../providers/db/db";
import { Result } from "../../models/result";
import { ResultsPage } from "../results/results";
// import { Hand } from "../../models/hand";

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {
  data: any;
  hmh = 10; // how many hands
  position: number;
  aby: number; // action before you
  allHands: Array<Hand> = [];
  allAnswers: Array<Answer> = [];
  currentPlay = 0;
  currentHand: Hand;
  answerInfo: string;
  answerInfoClass:string;
  play_start: Date;
  hand_start: Date;
  resultsPage:any;
  card1ImgSrc = "";
  card2ImgSrc = "";
  dealPosition = "deal";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public cardProvider: CardProvider,
    public dbProvider: DbProvider,
    public toastCtrl: ToastController) {
    this.resultsPage = ResultsPage;
  }

  ionViewDidLoad() {
    this.cardProvider.getAllHands()
      .subscribe(hands => {
        this.allHands = hands;
      });
    this.cardProvider.getAllAnswers()
      .subscribe(answers => {
        this.allAnswers = answers;
      });
  }

  begin() {
    this.currentPlay = 0;
    this.play_start = new Date();
    this.answerInfo = "";
    this.newHand();
  }

  newHand(): void {
    let hand_i: Hand;
    let correctAnswer_i;
    // let previousCards: Array<String>=[];
    // let hasFirst = -1;
    // let hasSecond = -1;
    this.currentPlay = this.currentPlay + 1;
    this.hand_start = new Date();
    this.position = Math.floor(Math.random() * 9) + 1;
    this.aby = 1;
    for (let i = 1; i < this.position - 1; i++){
    //   do {
      hand_i = this.getRandomHand();
    //   hasFirst = previousCards.findIndex(c => (c === (hand_i.rank1 + hand_i.suit1)));
    //   hasSecond= previousCards.findIndex(c => (c === (hand_i.rank2 + hand_i.suit2)));
    //   } while (hasFirst>-1 || hasSecond>-1)
    //   previousCards.push(hand_i.rank1 + hand_i.suit1);
    //   previousCards.push(hand_i.rank2 + hand_i.suit2);
      correctAnswer_i = this.getCorrectAnswer(hand_i);
      if (this.aby < 2){
        if (correctAnswer_i === 'h' || correctAnswer_i === 'c') {
          this.aby = 2;
        }
      }
      if (correctAnswer_i === 'r' && this.aby<3){
         this.aby = 3;
      }
    }
    this.currentHand = this.getRandomHand();
    this.dealPosition = "deal n" + ((this.position + 1)%9 + 1);
    this.card1ImgSrc = "assets/img/cards/" + this.currentHand.rank1 + this.currentHand.suit1 + ".svg";
    this.card2ImgSrc = "assets/img/cards/" + this.currentHand.rank2 + this.currentHand.suit2 + ".svg";
  }

  answered(a: string): void {
    let correctAnswer: string;
    let res = new Result();
    let currentTime = new Date();

    correctAnswer = this.getCorrectAnswer(this.currentHand);
    res.hand = this.currentHand;
    res.aby = this.aby;
    res.position = this.position;
    res.eml = this.getEml(this.position);
    res.answer = a;
    res.correct_answer = correctAnswer;
    res.play_stamp = this.play_start;
    res.time_stamp = this.hand_start;
    res.pass_time = +currentTime - +this.hand_start;
    if (res.answer === res.correct_answer){
      res.class = "results-correct";
    } else {
      res.class = "results-not-correct";
    }
    this.dbProvider.createResult(res);
    if (a === correctAnswer) {
      this.answerInfo = "Hand " + this.currentPlay + "/" + this.hmh +  ": Correct!";
      this.answerInfoClass = "correct";
    } else {
      this.answerInfo = "Hand " + this.currentPlay + "/" + this.hmh + ": Not correct! (" + this.cardProvider.getFullAnswer(correctAnswer) + ")";
      this.answerInfoClass ="not-correct";

    }
    if (this.currentPlay < this.hmh) {
      this.newHand();
    }
    else {
      this.currentPlay = this.currentPlay + 1;
      this.answerInfo = "The end!";
      this.answerInfoClass = "";

    }
    this.presentToast();
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: this.answerInfo,
      duration: 1000,
      position: 'top',
      cssClass: 'toast-' + this.answerInfoClass
    });
    toast.present();
  }

  getCorrectAnswer(hand:Hand): string {
    for (let i = 0; i < this.allAnswers.length; i++) {
      let a = this.allAnswers[i];
      if (a.group === hand.group && a.aby == this.aby && a.position == this.position) {
        return a.answer;
      }
    }
    return 'f';
  }

  getRandomHand() {
    let random = Math.floor(Math.random() * (this.allHands.length - 1));
    return this.allHands[random];
  }

getAby(aby:number){
   return this.cardProvider.getAby(aby);
 }

 getEml(pos:number){
   switch(pos){
     case 1: return "early (UTG)"
     case 2: return "middle (UTG+1)"
     case 3: return "middle (UTG+2)"
     case 4: return "middle (UTG+3)"
     case 5: return "late (UTG+4)"
     case 6: return "late (hijack)"
     case 7: return "late (cut-off)"
     case 8: return "early (SB)"
     case 9: return "early (BB)"
     default: return "";
   }
 }
}
