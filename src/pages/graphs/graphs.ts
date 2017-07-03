import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';

@IonicPage()
@Component({
  selector: 'page-graphs',
  templateUrl: 'graphs.html',
})
export class GraphsPage {
   @ViewChild('barCanvas') barCanvas;
    chart: any;
    graphMainLabel:any;
    graphLabels: any;
    graphData: any;
    graphBackgroundColor: any;
    graphBorderColor: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
     this.graphLabels = this.navParams.get('graphLabels');
     this.graphData  = this.navParams.get('graphData');
     this.graphBackgroundColor  = this.getColors(this.graphData);
     this.graphBorderColor  = this.graphBackgroundColor;
     this.graphMainLabel  = this.navParams.get('graphMainLabel');
     
     this.chart = new Chart(this.barCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: this.graphLabels,
                datasets: [{
                    label: this.graphMainLabel,
                    data: this.graphData,
                    backgroundColor: this.graphBackgroundColor,
                    borderColor: this.graphBorderColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
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

  getColors(data:any[]){
  let colors=[];
  let min = Math.min.apply(Math, data);
  let max = Math.max.apply(Math, data);
  for (let i=0; i < data.length; i++){
    if (data[i] > 8/10*max){
      colors.push("red");
    } else if (data[i]<11/10*min) {
      colors.push("darkgreen");
    } else {
      colors.push("green");
    }
  }
  return colors;
 }      

}
