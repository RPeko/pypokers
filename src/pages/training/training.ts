import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CardProvider } from "../../providers/card/card";
import { Hand } from "../../models/hand";
import { Answer } from "../../models/answer";
import { ResultProvider } from "../../providers/result/result";
import { Result } from "../../models/result";
import { ResultsPage } from "../results/results";
import { Storage } from '@ionic/storage';
import { CRProvider } from "../../providers/cr/cr";
import { CR } from "../../models/cr";

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
  allCRs: Array<CR> = [];
  currentPlay = 0;
  currentHand: Hand;
  answerInfo: string;
  answerInfoClass: string;
  play_start: Date;
  hand_start: Date;
  resultsPage: any;
  card1ImgSrc = "";
  card2ImgSrc = "";
  dealPosition = "deal";
  campaign = false;
  campaign_noc = 3; // number of correct answer for each hand 
  igraUToku = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public cardProvider: CardProvider,
    public resultProvider: ResultProvider,
    public CRProvider: CRProvider,
    public toastCtrl: ToastController,
    public storage: Storage) {
    this.resultsPage = ResultsPage;
    storage.ready().then(() => {
      storage.get('toggleCampaign').then((val) => {
        if (val != null) { this.campaign = val; }
      });
      // storage.get('campaign_noc').then((val) => {
      //   if (val != null) { this.campaign_noc = val; }
      // });
    });
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
    this.CRProvider.getAllCRs().then(crs =>
      this.allCRs = crs);
  }

  begin() {
    this.igraUToku = true;
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
    for (let i = 1; i < this.position - 1; i++) {
      //   do {
      hand_i = this.allHands[this.getRandomHandIndex()];
      //   hasFirst = previousCards.findIndex(c => (c === (hand_i.rank1 + hand_i.suit1)));
      //   hasSecond= previousCards.findIndex(c => (c === (hand_i.rank2 + hand_i.suit2)));
      //   } while (hasFirst>-1 || hasSecond>-1)
      //   previousCards.push(hand_i.rank1 + hand_i.suit1);
      //   previousCards.push(hand_i.rank2 + hand_i.suit2);
      correctAnswer_i = this.getCorrectAnswer(hand_i);
      if (this.aby < 2) {
        if (correctAnswer_i === 'h' || correctAnswer_i === 'c') {
          this.aby = 2;
        }
      }
      if (correctAnswer_i === 'r' && this.aby < 3) {
        this.aby = 3;
      }
    }
    let index = this.getRandomHandIndex();
    let step = 0;
    this.currentHand = this.allHands[index];
    if (this.campaign && this.getNOC(this.currentHand) >= this.campaign_noc) {
      do {
        step++;
        if (index < 1325) {
          index++;
        } else {
          index = 0;
          // console.log("Index = 0!");
        }
        if (step == 1326) {
          this.campaign = false;
          this.answerInfo = "Campaign finished!";
          this.presentToast();
          break;
        }
        this.currentHand = this.allHands[index];
        // console.log("step:" + step + ", index:" + index);
      }
      while (this.getNOC(this.currentHand) >= this.campaign_noc || (step > 1325));

    }
    this.dealPosition = "deal n" + ((this.position + 1) % 9 + 1);
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
    if (res.answer === res.correct_answer) {
      let cr = this.allCRs.find(cr => (cr.hand.hand_id == this.currentHand.hand_id));
      if (cr && cr.noc) {
        cr.noc++;
        this.CRProvider.updateCR(cr);
      }
      res.class = "results-correct";
    } else {
      res.class = "results-not-correct";
    }
    this.resultProvider.createResult(res);
    if (a === correctAnswer) {
      this.answerInfo = "Hand " + this.currentPlay + "/" + this.hmh + ": Correct!";
      this.answerInfoClass = "correct";
    } else {
      this.answerInfo = "Hand " + this.currentPlay + "/" + this.hmh + ": Not correct! (" + this.cardProvider.getFullAnswer(correctAnswer) + ")";
      this.answerInfoClass = "not-correct";

    }
    if (this.currentPlay < this.hmh) {
      this.newHand();
    }
    else {
      this.igraUToku = false;
      this.currentPlay = 0;
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

  getCorrectAnswer(hand: Hand): string {
    for (let i = 0; i < this.allAnswers.length; i++) {
      let a = this.allAnswers[i];
      if (a.group === hand.group && a.aby == this.aby && a.position == this.position) {
        return a.answer;
      }
    }
    return 'f';
  }

  getRandomHandIndex() {
    return Math.floor(Math.random() * (this.allHands.length - 1));
  }

  getAby(aby: number) {
    return this.cardProvider.getAby(aby);
  }

  getEml(pos: number) {
    switch (pos) {
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

  getNOC(hand: Hand) {
    let cr = this.allCRs.find(cr => (cr.hand.hand_id == this.currentHand.hand_id));
    if (cr && cr.noc) {
      return cr.noc;
    } else {
      return 0;
    }
  }



}
