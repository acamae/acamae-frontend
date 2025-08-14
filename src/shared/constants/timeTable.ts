export interface DayTimeTableItem {
  id: string;
  start: string;
  end: string;
  active: boolean;
}

export interface DayTimeTable {
  id: string;
  dayKey: string;
  times: DayTimeTableItem[];
}

export const TIMETABLE: DayTimeTable[] = [
  {
    id: 'Mo',
    dayKey: 'user-profile.timetable.days.monday',
    times: [
      {
        id: 'Mo00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Mo01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Mo02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Mo03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Mo04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Mo05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'Tu',
    dayKey: 'user-profile.timetable.days.tuesday',
    times: [
      {
        id: 'Tu00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Tu01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Tu02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Tu03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Tu04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Tu05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'We',
    dayKey: 'user-profile.timetable.days.wednesday',
    times: [
      {
        id: 'We00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'We01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'We02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'We03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'We04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'We05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'Th',
    dayKey: 'user-profile.timetable.days.thursday',
    times: [
      {
        id: 'Th00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Th01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Th02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Th03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Th04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Th05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'Fr',
    dayKey: 'user-profile.timetable.days.friday',
    times: [
      {
        id: 'Fr00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Fr01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Fr02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Fr03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Fr04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Fr05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'Sa',
    dayKey: 'user-profile.timetable.days.saturday',
    times: [
      {
        id: 'Sa00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Sa01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Sa02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Sa03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Sa04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Sa05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
  {
    id: 'Su',
    dayKey: 'user-profile.timetable.days.sunday',
    times: [
      {
        id: 'Su00',
        start: '00:00',
        end: '04:00',
        active: false,
      },
      {
        id: 'Su01',
        start: '04:00',
        end: '08:00',
        active: false,
      },
      {
        id: 'Su02',
        start: '08:00',
        end: '12:00',
        active: false,
      },
      {
        id: 'Su03',
        start: '12:00',
        end: '16:00',
        active: false,
      },
      {
        id: 'Su04',
        start: '16:00',
        end: '20:00',
        active: false,
      },
      {
        id: 'Su05',
        start: '20:00',
        end: '00:00',
        active: false,
      },
    ],
  },
];
