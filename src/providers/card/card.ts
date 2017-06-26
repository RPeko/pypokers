import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from "rxjs/Observable";
import { Hand } from "../../models/hand";
import { Answer } from "../../models/answer";


@Injectable()
export class CardProvider {
error:string;

  constructor(public http: Http) {
  }

  getAllHands(): Observable<Hand[]>{
    return this.http.get("assets/data/hands.json")
                    .map((res:Response) => <Hand[]> res.json())
                    .catch(this.handleError);
  }

   private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    getAllAnswers(): Observable<Answer[]>{
    return this.http.get("assets/data/answers.json")
                    .map((res:Response) => <Answer[]> res.json())
                    .catch(this.handleError);
  }

   getFullAnswer(a: string) {
    switch (a) {
      case 'r':
        return 'raise';
      case 'h':
        return 'check';
      case 'c':
        return 'call';
      default:
        return 'fold';
    }
  }

  getAby(n:number){
    switch (n) {
      case 1:
      return 'all pass';
      case 2:
      return 'checked';
      case 3:
      return 'raised';
      default:
      return '';
    }
  }

equalHands(h1: Hand, h2: Hand) {
    if (h1.rank1 === h2.rank1 && h1.suit1 === h2.suit1 && h1.rank2 === h2.rank2 && h1.suit2 === h2.suit2) {
      return true;
    } else {
      return false;
    }
  }
}
