import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TrainingPage } from "../training/training";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  trainingPage : any;
  constructor(public navCtrl: NavController) {
  this.trainingPage = TrainingPage;
  }

}
