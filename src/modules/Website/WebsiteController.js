import { checkValidation } from '@/lib/checkValidation';
import { currentDateTime } from '@/lib/helper';
import { EVENT_DATA } from '@/modules/Event/EventController';

const uuidv4 = require('uuid/v4');

var bcrypt = require('bcryptjs');

const checkPriceData = (seatLayoutData, price_array) => {
  let price_data = {
    status: true,
    records: [],
  };
  seatLayoutData.map(seatData => {
    let checkPrice = price_array.filter(priceData => {
      return (
        String(priceData.groupId) == String(seatData.seatGroupId) &&
        String(seatData.seatPrice) == String(priceData.price)
      );
    });
    if (checkPrice.length == 0 && !price_data.status) {
      price_data.records.push(seatData);
      price_data.status = true;
    }
  });
  return price_data;
};

export const addReservationSeat = async (req, res) => {
  let reqbody = req.body;
  const { user_info } = req;
  const { event_sch_id, event_id, selectedSeatsArray } = reqbody;

  let checkFields = ['event_sch_id', 'event_id', 'selectedSeatsArray'];

  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let arrayData = [];
  for (let seatsObj of selectedSeatsArray) {
    let checkFieldsAr = [
      'seatGroupId',
      'seatPrice',
      'seatType',
      'seatRowName',
      'seatColName',
    ];
    let result2 = await checkValidation(checkFieldsAr, seatsObj);
    if (!result2.status) {
      return res.send(result2);
    }
    let checkAlready = await global.knexConnection('ms_reservation').where({
      is_reserved: 'Y',
      seat_name: seatsObj.seatRowName + seatsObj.seatColName,
      seat_group_id: seatsObj.seatGroupId,
    });

    if (checkAlready.length) {
      return res.send({
        status: false,
        message: 'Seat Already Reserved',
      });
    }
    arrayData.push({
      seat_group_id: seatsObj.seatGroupId,
      seat_type: seatsObj.seatType,
      seat_name: seatsObj.seatRowName + seatsObj.seatColName,
      row_name: seatsObj.seatRowName,
      column_name: seatsObj.seatColName,
      seat_price: seatsObj.seatPrice,
    });
  }

  let reservation_id = uuidv4();
  let event_data_all = await EVENT_DATA({
    event_id,
  });
  let event_data = event_data_all.Records;
  if (!event_data.length) {
    return res.send({
      status: false,
      message: "Event Doesn't Exist",
    });
  }

  let event_data_sch = await global
    .knexConnection('event_schedule')
    .where({ event_sch_id });

  if (!event_data_sch.length) {
    return res.send({
      status: false,
      message: "Schedule Doesn't Exist",
    });
  }

  let seatLayoutData = await global
    .knexConnection('ms_seat_layout')
    .select('price_data')
    .where({
      sl_id: event_data[0].sl_id,
    });

  if (!seatLayoutData.length) {
    return res.send({
      status: false,
      message: "Seat Layout Doesn't Exist",
    });
  }

  let priceArray = seatLayoutData[0].price_data
    ? JSON.parse(seatLayoutData[0].price_data)
    : [];

  let checkPrice = checkPriceData(selectedSeatsArray, priceArray || []);

  if (!checkPrice.status) {
    return res.send({
      status: false,
      message: 'Price Unmatched',
      checkPrice,
      priceArray,
    });
  }

  let currentDateTimeNew = currentDateTime(
    null,
    'YYYY-MM-DD HH:mm',
    event_data[0].tz_name,
  );

  let duplicateData = {
    reservation_id,
    event_sch_id,
    event_id,
    is_seat_layout_exist: event_data[0].event_seating_type,
    created_at: currentDateTimeNew,
    timezone_name: event_data[0].tz_name,
    created_by: user_info ? user_info.user_id : null,
  };

  let insertData = [];

  arrayData.map(z => {
    let obj = {
      ...z,
      ...duplicateData,
    };
    insertData.push(obj);
  });

  let insert2 = await global.knexConnection('ms_reservation').insert(insertData);

  return res.send({
    status: true,
    reservation_id,
    insert2,
  });
};
