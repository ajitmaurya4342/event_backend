import moment from 'moment';

import { currentDateTime } from './lib/helper';

export const releaseSeats = async () => {
  let get_all_active_reserve_data = await global
    .knexConnection('ms_reservation')
    .select('r_id', 'created_at', 'seat_release_time', 'timezone_name')
    .where({
      is_reserved: 'Y',
      is_booked: 'N',
    })
    .groupBy('r_id');

  let releaseSeatId = [];
  if (get_all_active_reserve_data.length) {
    for (let allreserveSeats of get_all_active_reserve_data) {
      let formatName = 'YYYY-MM-DD HH:mm';
      let current_date_time = currentDateTime(
        null,
        formatName,
        allreserveSeats.timezone_name,
      );
      let releaseDateTime = moment(allreserveSeats.created_at)
        .add(allreserveSeats.seat_release_time || 10, 'minutes')
        .format(formatName);
      if (moment(releaseDateTime).isBefore(current_date_time)) {
        releaseSeatId.push(allreserveSeats.r_id);
      }
    }
  }
  if (releaseSeatId.length) {
    let updateAll = await global
      .knexConnection('ms_reservation')
      .update({
        is_reserved: 'N',
      })
      .whereIn('r_id', releaseSeatId);
  }
  console.log({ releaseSeatId: releaseSeatId.length });
};
