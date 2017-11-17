import {TestBed, async} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {HttpClientModule} from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
    this.course = {
      enrollmentCapacity: 100,
      reservations: [
        {
          reservationCapacity: 25,
          sequenceId: '1',
          effectiveStartDate: '2017-12-01'
        },
        {
          reservationCapacity: 25,
          sequenceId: '2',
          effectiveStartDate: '2017-12-01'
        }
      ],
      currentEnrollment: {
        effectiveDate: '2017-12-03',
        reservedSeatsEnrolled: 20,
        openSeatsEnrolled: 10
      }
    };
    this.app = new AppComponent(null); // We do not test HTTP transcation therefore give null should be fine
    this.app.course = this.course;

  }));
  // customized unit tests
  it('Make sure the constructor correctly build the variables', async(() => {
    expect(this.app.reservedAvailable).toEqual(0);
    expect(this.app.regularAvailable).toEqual(0);
  }));

  it('should default the total enrollment seats to 100 from test data', async(() => {
    expect(this.app.calculateAvailableSeats(this.course).total).toEqual(100);
  }));

  it('should default the total regular available seats to 40 from test data', async(() => {
    expect(this.app.calculateAvailableSeats(this.course).regularAvailable).toEqual(40);
  }));

  it('should default the total reserved available seats to 30 from test data', async(() => {
    expect(this.app.calculateAvailableSeats(this.course).reservedAvailable).toEqual(30);
  }));

  it('should default the total reserved taken seats to 20 from test data', async(() => {
    expect(this.app.calculateAvailableSeats(this.course).reserveTaken).toEqual(20);
  }));

  it('should default the total regular taken seats to 10 from test data', async(() => {
    expect(this.app.calculateAvailableSeats(this.course).regularTaken).toEqual(10);
  }));

  it('should not calculate reservations that is not effect yet', async(() => {
    const testCourse = Object.assign(this.course); // make a deep copy of course object
    testCourse['reservations'][0].effectiveStartDate = '2019-12-01';
    const report = this.app.calculateAvailableSeats(testCourse);

    expect(report.reservedAvailable).toEqual(5);
    expect(report.reserveTaken).toEqual(20);
    expect(report.total).toEqual(100);
    expect(report.regularAvailable).toEqual(65);
    expect(report.regularTaken).toEqual(10);

  }));

  it('should work with additional reservations ', async(() => {
    const testCourse = Object.assign(this.course); // make a deep copy of course object
    testCourse['reservations'].push(
      {
        reservationCapacity: 10,
        sequenceId: '3',
        effectiveStartDate: '2017-11-01'
      }
    );
    const report = this.app.calculateAvailableSeats(testCourse);
    expect(report.reservedAvailable).toEqual(40);
    expect(report.reserveTaken).toEqual(20);
    expect(report.total).toEqual(100);
    expect(report.regularAvailable).toEqual(30);
    expect(report.regularTaken).toEqual(10);
  }));

  it('should work when enrolled reserved seats are more than available reserved seats', async(() => {
    const testCourse = Object.assign(this.course); // make a deep copy of course object
    testCourse['reservations'].push(
      {
        reservationCapacity: 0,
        sequenceId: '3',
        effectiveStartDate: '2017-11-01'
      },
      {
        reservationCapacity: 0,
        sequenceId: '1',
        effectiveStartDate: '2017-12-02'
      },
      {
        reservationCapacity: 0,
        sequenceId: '2',
        effectiveStartDate: '2017-12-02'
      },
    );
    const report = this.app.calculateAvailableSeats(testCourse);
    expect(report.reservedAvailable).toEqual(0);
    expect(report.reserveTaken).toEqual(20);
    expect(report.total).toEqual(100);
    expect(report.regularAvailable).toEqual(70);
    expect(report.regularTaken).toEqual(10);
  }));


});
