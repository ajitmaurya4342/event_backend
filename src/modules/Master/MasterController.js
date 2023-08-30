import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

var bcrypt = require('bcryptjs');

export async function addEditCountries(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    country_name,
    country_code,
    country_mob_code,
    country_is_active,
    country_id,
  } = reqbody;
  const isUpdate = country_id ? true : false;
  let checkFields = [
    'country_name',
    'country_code',
    'country_mob_code',
    'country_is_active',
  ];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkCountryExist = await global
    .knexConnection('ms_countries')
    .select(['country_name', 'country_code', 'country_mob_code', 'country_is_active'])
    .where(builder => {
      builder.where({ country_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('country_id', [country_id]);
      }
    });

  if (checkCountryExist.length) {
    return res.status(200).json({
      message: 'Country Already Exist',
      status: false,
      Records: checkCountryExist,
    });
  } else {
    let obj = {
      country_name: country_name || null,
      country_code: country_code || null,
      country_mob_code: country_mob_code || null,
      country_is_active: country_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_countries').update(obj).where({ country_id });
    } else {
      await global.knexConnection('ms_countries').insert(obj);
    }

    return res.send({
      status: true,
      message: `User ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getCountryList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const country_id = reqbody.country_id || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const CountryList = await global
    .knexConnection('ms_countries')
    .select([
      'country_name',
      'country_code',
      'country_mob_code',
      'country_is_active',
      'country_id',
    ])
    .where(builder => {
      if (country_id) {
        builder.where('country_id', '=', country_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',country_name,country_code) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('country_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Country List',
    status: true,
    Records: CountryList,
  });
}

export async function addEditCities(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { city_name, city_is_active, country_id, city_id } = reqbody;
  const isUpdate = city_id ? true : false;
  let checkFields = ['city_name', 'city_is_active', 'country_id'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkCityExist = await global
    .knexConnection('ms_cities')
    .select(['city_name', 'city_is_active'])
    .where(builder => {
      builder.where({ city_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('city_id', [city_id]);
      }
    });

  if (checkCityExist.length) {
    return res.status(200).json({
      message: 'City Already Exist',
      status: false,
      Records: checkCityExist,
    });
  } else {
    let obj = {
      city_name: city_name || null,
      city_is_active: city_is_active || 'Y',
      country_id: country_id || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_cities').update(obj).where({ city_id });
    } else {
      await global.knexConnection('ms_cities').insert(obj);
    }

    return res.send({
      status: true,
      message: `City ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getCityList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const country_id = reqbody.country_id || null;
  const city_id = reqbody.city_id || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const CountryList = await global
    .knexConnection('ms_cities')
    .leftJoin('ms_countries', 'ms_countries.country_id', 'ms_cities.country_id')
    .select([
      'city_name',
      'city_is_active',
      'country_name',
      'ms_countries.country_id',
      'city_id',
    ])
    .where(builder => {
      if (country_id) {
        builder.where('ms_countries.country_id', '=', country_id);
      }
      if (city_id) {
        builder.where('city_id', '=', city_id);
      }
      if (req.query.search) {
        builder.whereRaw(` concat_ws(' ',city_name,) like '%${req.query.search}%'`);
      }
    })
    .orderBy('country_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Country List',
    status: true,
    Records: CountryList,
  });
}
