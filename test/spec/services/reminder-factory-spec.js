'use strict';

ddescribe('Factory: reminder-factory', function () {

  // load the service's module
  beforeEach(module('lmisChromeApp'));

  // instantiate factory
  var reminderFactory, $filter, utility;

  beforeEach(inject(function (_reminderFactory_, _$filter_, _utility_) {
    reminderFactory = _reminderFactory_;
    $filter = _$filter_;
    utility = _utility_;
  }));

  it('as a user, i expect reminderFactory to be defined ', function () {
    expect(reminderFactory).toBeDefined();
  });

  it('as a user, daily reminder should return empty array cause daily event already exist', function () {
    var listOfEvents = [
      {
        'uuid': 1,
        'stockCountDate': new Date(),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date('2014-05-04'),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date('2014-05-06'),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getDailyReminder(listOfEvents, eventDateKey);
    expect(reminderList.length).toBe(0);

  });

  it('as a user, i want daily reminder to return an array of todays date if daily event does' +
      ' not exist for today', function () {
    var listOfEvents = [
      {
        'uuid': 1,
        'stockCountDate': new Date('2014-12-03'),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date('2014-05-04'),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date('2014-05-06'),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getDailyReminder(listOfEvents, eventDateKey);
    expect(reminderList.length).toBe(1);
    var today = $filter('date')(new Date(), 'yyyy-MM-dd');
    var reminderDate = $filter('date')(reminderList[0], 'yyyy-MM-dd');
    expect(today).toEqual(reminderDate);
  });

  it('as a user, i want daily reminder to return an array of given DailyReminder date if daily event does not exist ' +
      'for given daily reminder date', function () {
    var expectedDailyReminderDate = new Date('2014-08-04')
    var listOfEvents = [
      {
        'uuid': 1,
        'stockCountDate': new Date('2014-12-03'),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date('2014-05-04'),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date('2014-05-06'),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getDailyReminder(listOfEvents, eventDateKey, expectedDailyReminderDate);
    expect(reminderList.length).toBe(1);

    expectedDailyReminderDate = $filter('date')(expectedDailyReminderDate, 'yyyy-MM-dd');
    var reminderDate = $filter('date')(reminderList[0], 'yyyy-MM-dd');

    expect(expectedDailyReminderDate).toEqual(reminderDate);
    var today = $filter('date')(new Date(), 'yyyy-MM-dd');
    expect(today).not.toEqual(reminderDate);
  });

  it('as a user, i want monthly reminder to return empty array if monthly event ' +
      'already exist in event list', function () {
    var monthlyEventLists = [
      {
        'uuid': 1,
        'stockCountDate': new Date(),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date('2014-05-04'),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date('2014-05-06'),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getMonthlyReminder(monthlyEventLists, eventDateKey);
    expect(reminderList).toEqual([]);
  });

  it('as a user, i expect getMonthlyReminder to return an array of monthlyReminder date, ' +
      'if no monthly event is in the list', function () {
    var today = new Date();
    var monthlyEventLists = [
      {
        'uuid': 1,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getMonthlyReminder(monthlyEventLists, eventDateKey);
    expect(reminderList.length).toBe(1);
  });

  it('as a user,  i expect returned monthly reminder date to be 1, month to be current month and year = current year, ' +
      'if not given', function () {
    var today = new Date();
    var monthlyEventLists = [
      {
        'uuid': 1,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var reminderList = reminderFactory.getMonthlyReminder(monthlyEventLists, eventDateKey);
    expect(reminderList.length).toBe(1);
    var monthlyReminderDate = $filter('date')(reminderList[0], 'yyyy-MM-dd');
    var expectedMonthlyReminderDate = $filter('date')(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
    expect(monthlyReminderDate).toBe(expectedMonthlyReminderDate);
  })

  it('as a user, i want monthly reminder date to equal the given monthly reminder date', function () {
    var today = new Date();
    var monthlyEventLists = [
      {
        'uuid': 1,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
        'facility': '1234-900881'
      }
    ];
    var eventDateKey = 'stockCountDate';
    var monthlyReminderDate = new Date(today.getFullYear(), today.getMonth(), 12);

    var reminderList = reminderFactory.getMonthlyReminder(monthlyEventLists, eventDateKey, monthlyReminderDate);
    expect(reminderList.length).toBe(1);

    var monthlyReminderDate = $filter('date')(reminderList[0], 'yyyy-MM-dd');
    var expectedMonthlyReminderDate = $filter('date')(monthlyReminderDate, 'yyyy-MM-dd');

    expect(monthlyReminderDate).toBe(expectedMonthlyReminderDate);

  });

  it('as a user, i expect monthly reminder to be empty when called with a given monthly reminder date and monthly ' +
      'event exists for given monthly reminder dates month, year but different from given monthly reminder day date',
      function () {

        var today = new Date();
        var monthlyEventLists = [
          {
            'uuid': 1,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
            'facility': '1234-900881'
          },
          {
            'uuid': 2,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            'facility': '1234-900881'
          },
          {
            'uuid': 3,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
            'facility': '1234-900881'
          }
        ];
        var eventDateKey = 'stockCountDate';
        var monthlyReminderDate = new Date(today.getFullYear(), today.getMonth(), 12);

        var reminderList = reminderFactory.getMonthlyReminder(monthlyEventLists, eventDateKey, monthlyReminderDate);
        expect(reminderList.length).toBe(0);

      });

  it('as a user, i want weekly reminder to return given current week reminder date, if today >= given week ' +
      'reminder date and weekly event does not exist.',
      function () {
        var today = new Date();
        var expectedWeeklyReminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);//previous day
        var weeklyEventList = [
          {
            'uuid': 1,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
            'facility': '1234-900881'
          },
          {
            'uuid': 2,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 7, today.getDate() + 1),
            'facility': '1234-900881'
          },
          {
            'uuid': 3,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
            'facility': '1234-900881'
          }
        ];

        var eventDateKey = 'stockCountDate';
        var weeklyReminderDateList = reminderFactory.getWeeklyReminder(weeklyEventList, eventDateKey, expectedWeeklyReminderDate);
        expectedWeeklyReminderDate = $filter('date')(expectedWeeklyReminderDate, 'yyyy-MM-dd');
        var weeklyReminderDate = $filter('date')(weeklyReminderDateList[0], 'yyyy-MM-dd');
        expect(expectedWeeklyReminderDate).toEqual(weeklyReminderDate);

      });

  it('as a user, i expect weekly reminder to return empty array if weekly event exist for a given week and ' +
      'today >= given weekly reminder date', function () {
    var today = new Date();
    var expectedWeeklyReminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);//previous day
    var weeklyEventList = [
      {
        'uuid': 1,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        'facility': '1234-900881'
      },
      {
        'uuid': 2,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        'facility': '1234-900881'
      },
      {
        'uuid': 3,
        'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
        'facility': '1234-900881'
      }
    ];

    var eventDateKey = 'stockCountDate';
    var weeklyReminderDateList =
        reminderFactory.getWeeklyReminder(weeklyEventList, eventDateKey, expectedWeeklyReminderDate);

    expect(weeklyReminderDateList.length).toBe(0);
  });

  it('as a user, i expect weekly reminder to return previous week reminder date if given weekly reminder date ' +
      ' is not yet due i.e given weekly reminder date is GT today and there is not event for previous week',
      function () {
        var today = new Date();
        var reminderDay = 5;//friday
        var todayWeekInfo = utility.getWeekRangeByDate(today, reminderDay);


        var weeklyEventList = [
          {
            'uuid': 1,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
            'facility': '1234-900881'
          },
          {
            'uuid': 2,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
            'facility': '1234-900881'
          },
          {
            'uuid': 3,
            'stockCountDate': new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()),
            'facility': '1234-900881'
          }
        ];

        var eventDateKey = 'stockCountDate';
        var weeklyReminderDateList =
            reminderFactory.getWeeklyReminder(weeklyEventList, eventDateKey, expectedWeeklyReminderDate);

        expect(weeklyReminderDateList.length).toBe(0);
      });

});
