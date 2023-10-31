import moment from 'moment';

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

const checkPriceDataWithoutSL = (seatLayoutData, price_array) => {
  let price_data = {
    status: true,
    records: [],
  };
  seatLayoutData.map(seatData => {
    let checkPrice = price_array.filter(priceData => {
      return (
        String(priceData.sct_id) == String(seatData.seatTypeId) &&
        String(seatData.seatPrice) == String(priceData.price_per_seat)
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
      event_sch_id: event_sch_id,
    });

    if (checkAlready.length) {
      return res.send({
        status: false,
        message: 'Seat Already Reserved',
        checkAlready,
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
    'YYYY-MM-DD HH:mm:ss',
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
    seat_release_time: event_data[0].cinema_seat_release_time || 10,
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
  });
};

export const addReservationSeatWithoutSeatlayout = async (req, res) => {
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
    let checkFieldsAr = ['seatTypeId', 'seatPrice', 'seatType', 'noOfSeats'];
    let result2 = await checkValidation(checkFieldsAr, seatsObj);
    if (!result2.status) {
      return res.send(result2);
    }

    arrayData.push({
      seat_type_id: seatsObj.seatTypeId,
      seat_type: seatsObj.seatType,
      no_of_seats: seatsObj.noOfSeats,
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

  let priceArray = await global
    .knexConnection('event_sch_seat_type')
    .select('sct_id', 'price_per_seat')
    .where({
      event_sch_id,
    });

  if (!priceArray.length) {
    return res.send({
      status: false,
      message: "Seat Layout Doesn't Exist",
    });
  }

  let checkPrice = checkPriceDataWithoutSL(selectedSeatsArray, priceArray || []);

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
    'YYYY-MM-DD HH:mm:ss',
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
    seat_release_time: event_data[0].cinema_seat_release_time || 10,
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
  });
};

export const getReservationSeat = async (req, res) => {
  let reqbody = { ...req.body, ...req.params };
  const { reservation_id } = reqbody;
  let Booking_time = 10;

  let checkFields = ['reservation_id'];

  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let getReservationDetail = await global.knexConnection('ms_reservation').where({
    reservation_id,
    is_reserved: 'Y',
  });
  if (!getReservationDetail.length) {
    return res.send({
      status: false,
      Records: `Seat Released or Booked`,
    });
  }
  let currentDateTimeNew = currentDateTime(
    null,
    'YYYY-MM-DD HH:mm:ss',
    getReservationDetail[0].timezone_name,
  );
  let obj = {
    seat_name: [],
    totalprice: 0,
    minutes: 0,
    seconds: 0,
    reserved_time: '',
    release_time: '',
    currentDateTime: currentDateTimeNew,
  };

  let event_data = await EVENT_DATA({
    event_id: getReservationDetail[0].event_id,
    event_sch_id: getReservationDetail[0].event_sch_id,
  });

  getReservationDetail.map(z => {
    obj.seat_name.push(z.seat_name);
    obj.totalprice += +parseFloat(z.seat_price);
    obj.reserved_time = moment(z.created_at).format('YYYY-MM-DD HH:mm:ss');
    obj.release_time = moment(z.created_at)
      .add(z.seat_release_time || Booking_time, 'minutes')
      .format('YYYY-MM-DD HH:mm:ss');
  });

  obj.seconds =
    moment(obj.release_time).diff(moment(obj.currentDateTime), 'seconds') % 60;
  obj.minutes =
    moment(obj.release_time).diff(moment(obj.currentDateTime), 'minutes') % 60;

  event_data.Records[0] = {
    ...event_data.Records[0],
    ...obj,
  };
  return res.send({
    status: true,
    Records: [...event_data.Records],
    getReservationDetail,
  });
};

export const resetReserveTime = async (req, res) => {
  let reqbody = { ...req.body, ...req.params };
  const { reservation_id } = reqbody;

  let checkFields = ['reservation_id'];

  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let getReservationDetail = await global.knexConnection('ms_reservation').where({
    reservation_id,
    is_reserved: 'Y',
  });
  if (!getReservationDetail.length) {
    return res.send({
      status: false,
      Records: `Seat Released or Booked`,
    });
  }
  let currentDateTimeNew = currentDateTime(
    null,
    'YYYY-MM-DD HH:mm:ss',
    getReservationDetail[0].timezone_name,
  );

  let update_obj = {
    created_at: currentDateTimeNew,
    updated_at: currentDateTimeNew,
  };

  await global
    .knexConnection('ms_reservation')
    .update({
      ...update_obj,
    })
    .where({
      reservation_id,
    });

  return res.send({
    status: true,
    Records: 'Timer Reset',
  });
};

export const releaseSeats = async (req, res) => {
  let reqbody = { ...req.body, ...req.params };
  const { reservation_id } = reqbody;

  let checkFields = ['reservation_id'];

  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let getReservationDetail = await global.knexConnection('ms_reservation').where({
    reservation_id,
    is_reserved: 'Y',
  });
  if (!getReservationDetail.length) {
    return res.send({
      status: false,
      Records: `Seat Released or Booked`,
    });
  }
  let currentDateTimeNew = currentDateTime(
    null,
    'YYYY-MM-DD HH:mm:ss',
    getReservationDetail[0].timezone_name,
  );

  let update_obj = {
    is_reserved: 'N',
  };

  await global
    .knexConnection('ms_reservation')
    .update({
      ...update_obj,
    })
    .where({
      reservation_id,
    });

  return res.send({
    status: true,
    Records: 'Seat Released',
    update_obj,
  });
};

export const allReserveSeatBySchedule = async (req, res) => {
  let reqbody = { ...req.body, ...req.params };
  const { event_sch_id } = reqbody;

  let checkFields = ['event_sch_id'];

  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let getReservationDetail = await global
    .knexConnection('ms_reservation')
    .select(['seat_name', 'seat_type', 'seat_group_id', 'column_name', 'row_name'])
    .where({
      event_sch_id,
      is_reserved: 'Y',
    });

  return res.send({
    status: true,
    Records: [...getReservationDetail],
    message: 'All Reserve Seat',
  });
};
