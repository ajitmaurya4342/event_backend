import _ from 'lodash';
import moment from 'moment';

import { checkValidation } from '@/lib/checkValidation';
import { currentDateTime, dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

var bcrypt = require('bcryptjs');

export async function addEditEvent(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    event_cinema_id,
    event_name,
    event_start_date,
    event_end_date,
    event_age_limit,
    event_image_small,
    event_image_medium,
    event_image_large,
    event_short_description,
    event_long_description,
    event_tnc,
    event_seating_type,
    event_booking_active,
    event_is_private,
    event_is_active,
    event_id,
    event_sch_array,
    event_genre_ids,
    event_language_ids,
    sl_id,
  } = reqbody;
  const isUpdate = event_id ? true : false;
  let checkFields = [
    'event_cinema_id',
    'event_name',
    'event_start_date',
    'event_end_date',
    'event_short_description',
    'event_long_description',
    'event_booking_active',
    'event_seating_type',
    'event_is_private',
    'event_is_active',
  ];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  if (moment(event_end_date).isBefore(event_start_date)) {
    return res.send({
      status: false,
      message: 'Event Start Date should be less than Event End Date',
    });
  }
  //Validation of event Schedule array
  if (event_sch_array && event_sch_array.length) {
    for (let obj of event_sch_array) {
      let checkScArray = ['sch_date', 'sch_time', 'sch_is_active'];
      let resultSch = await checkValidation(checkScArray, obj);
      if (!resultSch.status) {
        return res.send(resultSch);
      }
      if (
        moment(obj.sch_date).isBetween(
          moment(event_start_date),
          moment(event_end_date),
        ) ||
        moment(obj.sch_date).isSame(event_start_date) ||
        moment(obj.sch_date).isSame(event_end_date)
      ) {
      } else {
        return res.send({
          status: false,
          message: 'Schedule Date Should be between Event Start Date and End Date',
        });
      }

      if (obj.sch_seat_type_array && obj.sch_seat_type_array.length) {
        for (let objSeatType of obj.sch_seat_type_array) {
          let checkSeatTypeArr = ['sct_id', 'available_seats', 'price_per_seat'];
          let resultSeatType = await checkValidation(checkSeatTypeArr, objSeatType);
          if (!resultSeatType.status) {
            return res.send(resultSeatType);
          }
        }
      }
    }
  }

  let checkCinemaExist = await global
    .knexConnection('ms_event')
    .select(['event_name'])
    .where(builder => {
      builder.where({ event_name, event_cinema_id });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('event_id', [event_id]);
      }
    });

  if (checkCinemaExist.length) {
    return res.status(200).json({
      message: 'Event Name Already Exist',
      status: false,
      Records: checkCinemaExist,
    });
  } else {
    let obj = {
      event_cinema_id: event_cinema_id || null,
      event_name: event_name || null,
      event_start_date: event_start_date || null,
      event_end_date: event_end_date || null,
      event_age_limit: event_age_limit || null,
      event_image_small: event_image_small || null,
      event_image_medium: event_image_medium || null,
      event_image_large: event_image_large || null,

      event_short_description: event_short_description || null,
      event_long_description: event_long_description || null,
      event_tnc: event_tnc || null,
      event_seating_type: event_seating_type || 'N',
      event_booking_active: event_booking_active || 'Y',
      event_is_private: event_is_private || 'N',
      event_is_active: event_is_active || 'Y',
      sl_id: sl_id || null,
      ...dataReturnUpdate(user_info, isUpdate),
    };
    let insert_event_id = null;
    if (isUpdate) {
      await global.knexConnection('ms_event').update(obj).where({ event_id });
      insert_event_id = event_id;
    } else {
      let insertNew = await global.knexConnection('ms_event').insert(obj);
      insert_event_id = insertNew[0];
    }

    if (event_genre_ids && event_genre_ids.length) {
      await global
        .knexConnection('event_genre')
        .where({
          event_id: insert_event_id,
        })
        .del();
      const genre_insert_array = event_genre_ids.reduce((acc, genre_id) => {
        acc.push({
          event_id: insert_event_id,
          genre_id,
        });
        return acc;
      }, []);
      await global.knexConnection('event_genre').insert(genre_insert_array);
    }

    if (event_language_ids && event_language_ids.length) {
      await global
        .knexConnection('event_language')
        .where({
          event_id: insert_event_id,
        })
        .del();
      const language_insert_array = event_language_ids.reduce((acc, lang_id) => {
        acc.push({
          event_id: insert_event_id,
          lang_id,
        });
        return acc;
      }, []);
      await global.knexConnection('event_language').insert(language_insert_array);
    }

    if (event_sch_array && event_sch_array.length) {
      for (let sch_array of event_sch_array) {
        let objSc = {
          event_id: insert_event_id,
          sch_date: sch_array.sch_date || null,
          sch_time: sch_array.sch_time || null,
          sch_max_capacity: sch_array.sch_max_capacity || null,
          sch_is_active: sch_array.sch_is_active || 'Y',
        };
        let schedule_insert_id = null;
        if (sch_array.event_sch_id) {
          schedule_insert_id = sch_array.event_sch_id;
          await global.knexConnection('event_schedule').update(objSc).where({
            event_sch_id: sch_array.event_sch_id,
          });
        } else {
          const insert_schedule = await global
            .knexConnection('event_schedule')
            .insert(objSc);
          schedule_insert_id = insert_schedule[0];
        }
        //
        if (sch_array.sch_is_active == 'N') {
          await global
            .knexConnection('event_sch_seat_type')
            .where({
              event_sch_id: schedule_insert_id,
            })
            .del();
        }

        if (sch_array.sch_seat_type_array && sch_array.sch_seat_type_array.length) {
          await global
            .knexConnection('event_sch_seat_type')
            .where({
              event_sch_id: schedule_insert_id,
            })
            .del();
          for (let seatT of sch_array.sch_seat_type_array) {
            let objSeat = {
              event_id: insert_event_id,
              event_sch_id: schedule_insert_id || null,
              sct_id: seatT.sct_id || null,
              available_seats: seatT.available_seats || null,
              price_per_seat: seatT.price_per_seat || null,
            };
            await global.knexConnection('event_sch_seat_type').insert(objSeat);
          }
        }
      }
    }

    // const deleteQuery = await global
    //   .knexConnection('event_schedule')
    //   .where({
    //     event_id: insert_event_id,
    //     sch_is_active: 'N',
    //   })
    //   .del();

    return res.send({
      status: true,
      message: `Event ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
      insert_event_id,
    });
  }
}

export const ExtraDetail = async ({
  isLanguageRequired = true,
  isGenreRequired = true,
  isSchduleArrayRequired = true,
  event_id,
  isDashboard = true,
  isWebsiteUser = false,
  currentDateTimeNew = null,
  event_sch_id = null,
}) => {
  let event_genre_ids = [];
  let event_language_ids = [];
  let event_sch_array = [];
  if (!event_id) {
    return {
      event_genre_ids,
      event_language_ids,
      event_sch_array,
    };
  }

  if (isLanguageRequired) {
    let languageArray = await global
      .knexConnection('event_language')
      .select('lang_id')
      .where({
        event_id,
      });

    event_language_ids = languageArray.reduce((acc, { lang_id }) => {
      acc.push(lang_id);
      return acc;
    }, []);
  }

  if (isGenreRequired) {
    let genreArray = await global
      .knexConnection('event_genre')
      .select('genre_id')
      .where({
        event_id,
      });

    event_genre_ids = genreArray.reduce((acc, { genre_id }) => {
      acc.push(genre_id);
      return acc;
    }, []);
  }

  if (isSchduleArrayRequired) {
    let filters = ``;
    if (isWebsiteUser) {
      filters = ` concat(sch_date,' ',sch_time)>='${currentDateTimeNew}'`;
    }
    let schedule_array = await global
      .knexConnection('event_schedule')
      .select(
        global.knexConnection.raw(
          `event_schedule.*,concat(event_schedule.sch_date,' ',sch_time) as sch_date_time`,
        ),
      )
      .where({
        event_id,
        sch_is_active: 'Y',
      })
      .whereRaw(filters)
      .where(builder => {
        if (event_sch_id) {
          builder.where({
            event_sch_id,
          });
        }
      })
      .orderBy('sch_date_time', 'ASC');

    for (let obj of schedule_array) {
      obj['sch_seat_type_array'] = [];
      obj['sch_date'] = currentDateTime(obj['sch_date'], 'YYYY-MM-DD');
      let seatType = await global.knexConnection('event_sch_seat_type').where({
        event_sch_id: obj.event_sch_id,
      });
      obj['sch_seat_type_array'] = [...seatType];
      event_sch_array.push(obj);
    }
  }
  return {
    event_genre_ids,
    event_language_ids,
    event_sch_array,
  };
};

export const EVENT_DATA = async reqbody => {
  const cinema_id = reqbody.cinema_id || null;
  const country_id = reqbody.country_id || null;
  const city_id = reqbody.city_id || null;
  const event_id = reqbody.event_id || null;
  const org_id = reqbody.org_id || null;
  const event_sch_id = reqbody.event_sch_id || null;
  const limit = reqbody.limit ? reqbody.limit : 100;
  const currentPage = reqbody.currentPage ? reqbody.currentPage : 1;
  const isWebsiteUser = reqbody['is_website_user'] || false;

  const EventList = await global
    .knexConnection('ms_event')
    .select([
      'ms_event.*',
      'ms_cities.city_name',
      'ms_countries.country_name',
      'ms_currencies.curr_code',
      'ms_time_zones.tz_name',
      'organizations.org_name',
      'ms_cinemas.country_id',
      'ms_cinemas.cinema_name',
      'ms_cinemas.cinema_email',
      'ms_cinemas.cinema_seat_release_time',
    ])
    .leftJoin('ms_cinemas', 'ms_cinemas.cinema_id', 'ms_event.event_cinema_id')
    .leftJoin('ms_cities', 'ms_cities.city_id', 'ms_cinemas.city_id')
    .leftJoin('ms_countries', 'ms_countries.country_id', 'ms_cinemas.country_id')
    .leftJoin('ms_currencies', 'ms_currencies.curr_id', 'ms_cinemas.currency_id')
    .leftJoin('ms_time_zones', 'ms_time_zones.tz_id', 'ms_cinemas.timezone_id')
    .leftJoin('organizations', 'organizations.org_id', 'ms_cinemas.org_id')
    .where(builder => {
      if (cinema_id) {
        builder.where('event_cinema_id', '=', cinema_id);
      }
      if (city_id) {
        builder.where('ms_cinemas.city_id', '=', city_id);
      }
      if (country_id) {
        builder.where('ms_cinemas.country_id', '=', country_id);
      }
      if (org_id) {
        builder.where('ms_cinemas.org_id', '=', org_id);
      }
      if (event_id) {
        builder.where('ms_event.event_id', '=', event_id);
      }
      if (reqbody.search) {
        builder.whereRaw(
          ` concat_ws(' ',cinema_name,cinema_email) like '%${reqbody.search}%'`,
        );
      }
    })
    .orderBy('event_id', 'desc')
    .paginate(pagination(limit, currentPage));
  let newArray = [];
  let scheduleStart = {
    days: 0,
    hours: 0,
    minute: 0,
    second: 0,
  };
  let currentDateTimeNew = currentDateTime(null, 'YYYY-MM-DD HH:mm:ss', null);

  if (EventList && EventList.data) {
    for (let obj of EventList.data) {
      obj['event_end_date'] = currentDateTime(obj['event_end_date'], 'YYYY-MM-DD');
      obj['event_start_date'] = currentDateTime(obj['event_start_date'], 'YYYY-MM-DD');
      currentDateTimeNew = currentDateTime(null, 'YYYY-MM-DD HH:mm:ss', obj.tz_name);
      let extraData = await ExtraDetail({
        event_id,
        isWebsiteUser,
        currentDateTimeNew,
        event_sch_id,
      });
      newArray.push({
        ...obj,
        ...extraData,
      });

      if (event_id && extraData.event_sch_array.length) {
        scheduleStart.second =
          moment(extraData.event_sch_array[0].sch_date_time).diff(
            moment(currentDateTimeNew),
            'seconds',
          ) % 60;
        scheduleStart.minute =
          moment(extraData.event_sch_array[0].sch_date_time).diff(
            moment(currentDateTimeNew),
            'minute',
          ) % 60;

        scheduleStart.days = moment(extraData.event_sch_array[0].sch_date_time).diff(
          moment(currentDateTimeNew),
          'days',
        );
        scheduleStart.hours =
          moment(extraData.event_sch_array[0].sch_date_time).diff(
            moment(currentDateTimeNew),
            'hour',
          ) % 24;
      }
    }
  }

  if (isWebsiteUser) {
    if (
      newArray[0] &&
      newArray[0]['event_sch_array'] &&
      newArray[0]['event_sch_array'].length
    ) {
      let array = [];

      newArray[0]['event_sch_array'].map(z => {
        let findIndex2 = array.findIndex(sch => {
          return sch.schedule_date == z.sch_date;
        });
        if (findIndex2 >= 0) {
          array[findIndex2]['schedule_array'].push({
            sch_time: z.sch_time,
            event_sch_id: z.event_sch_id,
            sch_date_time: z.sch_date_time,
            sch_date_unix: moment(z.sch_date_time).unix(),
          });
        } else {
          let obj = {
            schedule_date: z.sch_date,
            schedule_array: [
              {
                sch_time: z.sch_time,
                event_sch_id: z.event_sch_id,
                sch_date_time: z.sch_date_time,
                sch_date_unix: moment(z.sch_date_time).unix(),
              },
            ],
          };
          array.push(obj);
        }
      });
      for (let data of array) {
        data.schedule_array = _.orderBy(data.schedule_array, ['sch_date_unix', 'ASC']);
      }
      newArray[0]['schedule_date_array'] = array;
    }
  }

  return {
    message: 'Event List',
    status: true,
    Records: newArray,
    scheduleStart,
    currentDateTimeNew,
  };
};

export async function getEventList(req, res) {
  const reqbody = { ...req.query, ...req.body, ...req.params };
  reqbody['is_website_user'] = req['is_website_user'] || false;
  let getEventData = await EVENT_DATA(reqbody);
  return res.send({ ...getEventData });
}

const getActiveListData = async reqbody => {
  const cinema_id = reqbody.cinema_id || null;
  const country_id = reqbody.country_id || null;
  const city_id = reqbody.city_id || null;
  const event_id = reqbody.event_id || null;
  const org_id = reqbody.org_id || null;
  const limit = reqbody.limit ? reqbody.limit : 100;
  const currentPage = reqbody.currentPage ? reqbody.currentPage : 1;
  let currentDateTimeNew = currentDateTime(null, 'YYYY-MM-DD HH:mm');
  const EventListData = await global
    .knexConnection('event_schedule')
    .select([
      'ms_event.event_image_small',
      'event_image_medium',
      'event_image_large',
      'event_name',
      'event_short_description',
      'event_schedule.event_id',
      'event_start_date',
      'event_end_date',
      'ms_cinemas.cinema_name',
      'ms_cities.city_name',
    ])
    .leftJoin('ms_event', 'ms_event.event_id', 'event_schedule.event_id')
    .leftJoin('ms_cinemas', 'ms_cinemas.cinema_id', 'ms_event.event_cinema_id')
    .leftJoin('ms_cities', 'ms_cities.city_id', 'ms_cinemas.city_id')
    .leftJoin('ms_countries', 'ms_countries.country_id', 'ms_cinemas.country_id')
    .leftJoin('ms_currencies', 'ms_currencies.curr_id', 'ms_cinemas.currency_id')
    .leftJoin('ms_time_zones', 'ms_time_zones.tz_id', 'ms_cinemas.timezone_id')
    .leftJoin('organizations', 'organizations.org_id', 'ms_cinemas.org_id')
    .where(builder => {
      if (cinema_id) {
        builder.where('event_cinema_id', '=', cinema_id);
      }
      if (city_id) {
        builder.where('ms_cinemas.city_id', '=', city_id);
      }
      if (country_id) {
        builder.where('ms_cinemas.country_id', '=', country_id);
      }
      if (org_id) {
        builder.where('ms_cinemas.org_id', '=', org_id);
      }
      if (event_id) {
        builder.where('ms_event.event_id', '=', event_id);
      }
      if (reqbody.search) {
        builder.whereRaw(
          ` concat_ws(' ',cinema_name,cinema_email) like '%${reqbody.search}%'`,
        );
      }
    })
    .where({
      event_is_active: 'Y',
      sch_is_active: 'Y',
    })
    .whereRaw(`concat(sch_date,' ',sch_time)>='${currentDateTimeNew}'`)
    .orderBy('sch_date', 'desc')
    .groupBy('event_id')
    .paginate(pagination(limit, currentPage));

  let newRecords = [...EventListData.data];
  newRecords.map(z => {
    z['event_end_date'] = currentDateTime(z['event_end_date'], 'YYYY-MM-DD');
    z['event_start_date'] = currentDateTime(z['event_start_date'], 'YYYY-MM-DD');
  });
  return newRecords;
};

export async function getActiveEventList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const data = await getActiveListData(reqbody);
  return res.send({
    status: true,
    data,
  });
}
