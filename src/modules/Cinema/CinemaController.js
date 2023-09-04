import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

var bcrypt = require('bcryptjs');

export async function addEditCinema(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    org_id,
    country_id,
    city_id,
    timezone_id,
    currency_id,
    cinema_name,
    cinema_address,
    cinema_pincode,
    cinema_email,
    cinema_cont_per_name,
    cinema_cont_per_number,
    cinema_description,
    cinema_lat,
    cinema_long,
    cinema_seat_release_time,
    cinema_is_active,
    cinema_id,
  } = reqbody;
  const isUpdate = cinema_id ? true : false;
  let checkFields = [
    'org_id',
    'country_id',
    'timezone_id',
    'cinema_name',
    'cinema_address',
    'cinema_pincode',
    'city_id',
    'cinema_email',
    'cinema_cont_per_name',
    'cinema_is_active',
    'currency_id',
  ];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkCinemaExist = await global
    .knexConnection('ms_cinemas')
    .select(['cinema_name'])
    .where(builder => {
      builder.where({ cinema_name });
      builder.orWhere({ city_id: cinema_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('cinema_id', [cinema_id]);
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
      org_id: org_id || null,
      country_id: country_id || null,
      city_id: city_id || null,
      timezone_id: timezone_id || null,
      currency_id: currency_id || null,
      cinema_name: cinema_name || null,
      cinema_address: cinema_address || null,
      cinema_pincode: cinema_pincode || null,
      cinema_lat: cinema_lat || null,
      cinema_long: cinema_long || null,
      cinema_email: cinema_email || null,
      cinema_cont_per_name: cinema_cont_per_name || null,
      cinema_cont_per_number: cinema_cont_per_number || null,
      cinema_description: cinema_description || null,
      cinema_seat_release_time: cinema_seat_release_time || 10,
      cinema_is_active: cinema_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_cinemas').update(obj).where({ cinema_id });
    } else {
      obj['cinema_address'] = bcrypt.hashSync(cinema_address, 10);
      await global.knexConnection('ms_cinemas').insert(obj);
    }

    return res.send({
      status: true,
      message: `Cinema ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}

export async function getCinemaList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const cinema_id = reqbody.cinema_id || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const CinemaList = await global
    .knexConnection('ms_cinemas')
    .select([
      'ms_cinemas.*',
      'ms_cities.city_name',
      'ms_countries.country_name',
      'ms_currencies.curr_code',
      'ms_time_zones.tz_name',
      'organizations.org_name',
    ])
    .leftJoin('ms_cities', 'ms_cities.city_id', 'ms_cinemas.city_id')
    .leftJoin('ms_countries', 'ms_countries.country_id', 'ms_cinemas.country_id')
    .leftJoin('ms_currencies', 'ms_currencies.curr_id', 'ms_cinemas.currency_id')
    .leftJoin('ms_time_zones', 'ms_time_zones.tz_id', 'ms_cinemas.timezone_id')
    .leftJoin('organizations', 'organizations.org_id', 'ms_cinemas.org_id')
    .where(builder => {
      if (cinema_id) {
        builder.where('cinema_id', '=', cinema_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',cinema_name,cinema_email) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('cinema_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Cinema List',
    status: true,
    Records: CinemaList,
  });
}
