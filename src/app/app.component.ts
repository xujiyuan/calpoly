import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // declare variables
  reservedAvailable: number;
  regularAvailable: number;
  course: Object = {};
  report: Object = {};

  constructor(private http: HttpClient) {
    this.reservedAvailable = 0;
    this.regularAvailable = 0;

    if (this.http) {
      this.http.get('assets/course.json').subscribe(data => {
        if (data) {
          this.course = data;
          this.report = this.calculateAvailableSeats(null);
        }

      }, err => {
        console.log('Could not get the correct json file' + err);
      });
    }

  }

  calculateAvailableSeats(course) {
    let reserCollect = [];
    // add a parameter to function signature to isolate testing functionalities
    if (!course) {
      course = this.course;
    }
    if (course) {
      _.forEach(course['reservations'], (reservation) => {
        if (reserCollect && reserCollect.length > 0 && _.findKey(reserCollect, {'sequenceId': reservation.sequenceId})) {
          _.forEach(reserCollect, (item) => {
            if (new Date(course['currentEnrollment'].effectiveDate) > new Date(reservation.effectiveStartDate)
              && item.sequenceId === reservation.sequenceId
              && new Date(item.effectiveStartDate) < new Date(reservation.effectiveStartDate)) {
              console.log('Replace reservation with newer date');
              item.reservationCapacity = reservation.reservationCapacity;
            }
          });
        }
        else {
          if (new Date(course['currentEnrollment'].effectiveDate) > new Date(reservation.effectiveStartDate)) {
            reserCollect.push(reservation);
          }
        }
      });

      _.forEach(reserCollect, (item) => {
        this.reservedAvailable += item.reservationCapacity;
      });

      // console.log(this.reservedAvailable);
      // console.log(course['currentEnrollment'].reservedSeatsEnrolled);
      // console.log(course['currentEnrollment'].openSeatsEnrolled);
      //

      this.regularAvailable = course['enrollmentCapacity']
        - Math.max(this.reservedAvailable, course['currentEnrollment'].reservedSeatsEnrolled)
        - course['currentEnrollment'].openSeatsEnrolled;

      this.reservedAvailable = this.reservedAvailable - course['currentEnrollment'].reservedSeatsEnrolled > 0 ?
        this.reservedAvailable - course['currentEnrollment'].reservedSeatsEnrolled : 0;

      return {
        total: course['enrollmentCapacity'],
        reservedAvailable: this.reservedAvailable,
        regularAvailable: this.regularAvailable,
        reserveTaken: course['currentEnrollment'].reservedSeatsEnrolled,
        regularTaken: course['currentEnrollment'].openSeatsEnrolled
      };
    }
    return null;
  }
}
