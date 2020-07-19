import {GTFSFileStream} from "./GTFSFileStream";
import {TransXChangeJourney} from "../transxchange/TransXChangeJourneyStream";
import {LocalDate, DateTimeFormatter} from "js-joda";

/**
 * Extract the calendars dates from the TransXChange journeys
 */
export class CalendarDatesStream extends GTFSFileStream<TransXChangeJourney> {
  private readonly datesSeen: Record<string, boolean> = {};
  private readonly dateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");

  protected header = "service_id,date,exception_type";

  protected transform(journey: TransXChangeJourney): void {
    if (!this.datesSeen[journey.calendar.id]) {
      this.datesSeen[journey.calendar.id] = true;

      this.pushDates(journey.calendar.excludes, Day.REMOVED, journey.calendar.id);
      this.pushDates(journey.calendar.includes, Day.ADDED, journey.calendar.id);
    }
  }

  private pushDates(dates: LocalDate[], type: Day, serviceId: number): void {
    for (const date of dates) {
      this.pushLine(serviceId, date.format(this.dateFormatter), type);
    }
  }

}

enum Day {
  ADDED = 1,
  REMOVED = 2
}