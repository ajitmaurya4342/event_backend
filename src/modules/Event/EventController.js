import moment from 'moment';

import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
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
  } = reqbody;
  const isUpdate = event_id ? true : false;
  let checkFields = [
    'event_cinema_id',
    'event_name',
    'event_end_date',
    'event_start_date',
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
      let checkScArray = ['sch_date', 'sch_time', 'sch_max_capacity', 'sch_is_active'];
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
    .select(['event_image_small'])
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
      message: 'Cinema Name Already Exist',
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

        if (sch_array.sch_seat_type_array && sch_array.sch_seat_type_array.length) {
          for (let seatT of sch_array.sch_seat_type_array) {
            await global
              .knexConnection('event_sch_seat_type')
              .where({
                event_sch_id: schedule_insert_id,
              })
              .del();
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

    await global
      .knexConnection('event_schedule')
      .where({
        event_id: insert_event_id,
        sch_is_active: 'N',
      })
      .del();

    return res.send({
      status: true,
      message: `Event ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
      insert_event_id,
    });
  }
}

export async function getEventList(req, res) {}
