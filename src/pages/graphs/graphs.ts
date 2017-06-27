import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import { ResultProvider } from "../../providers/result/result";
import { Result } from "../../models/result";


@IonicPage()
@Component({
  selector: 'page-graphs',
  templateUrl: 'graphs.html',
})
export class GraphsPage {
   @ViewChild('barCanvas') barCanvas;
    proba: Result[] = [];
    mpgChart: any; // mistakes per group
    mpgData=[1,2,3,4,5,6,7,8,9];
    mpgBackgroundColor = ["blue","blue","blue","blue","blue","blue","blue","blue","blue"];
    mpgborderColor = ["blue","blue","blue","blue","blue","blue","blue","blue","blue"];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public resultProvider: ResultProvider) {
  }

  ionViewDidLoad() {
   
     this.mpgChart = new Chart(this.barCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: ["AA,KK,QQ,AK", "JJ,TT", "99-22", "AQJs", "ATJ0", "A-2s", "KQJ", "KT-54s", "other"],
                datasets: [{
                    label: '# of Votes',
                    data: this.mpgData,
                    backgroundColor: this.mpgBackgroundColor,
                    borderColor: this.mpgborderColor,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
 
        });
  }

}
