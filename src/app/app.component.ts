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
    // this.course = JSON.parse('course.json');

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
    // add a parameter to function signature to isolate testing functionalities
    if (!course) {
      course = this.course;
    }
    if (course) {
      this.regularAvailable = course['enrollmentCapacity'];

      _.forEach(course['reservations'], (reservation) => {
        if (new Date(course['currentEnrollment'].effectiveDate) > new Date(reservation.effectiveStartDate)) {
          this.reservedAvailable += reservation.reservationCapacity;
          reservation.status = 'Active';
        }
        else {
          reservation.status = 'Inactive';
        }


      });
      this.regularAvailable = this.regularAvailable - (this.reservedAvailable + course['currentEnrollment'].openSeatsEnrolled);
      this.reservedAvailable = this.reservedAvailable - course['currentEnrollment'].reservedSeatsEnrolled;

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
