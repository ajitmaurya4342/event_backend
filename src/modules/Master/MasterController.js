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
    country_flag_upload,
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
      country_flag_upload: country_flag_upload || null,
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
  let country_is_active = reqbody.country_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;
  const isWebsiteUser = req['is_website_user'] || false;
  if (isWebsiteUser) {
    country_is_active = 'Y';
  }

  const CountryList = await global
    .knexConnection('ms_countries')
    .select([
      'country_name',
      'country_code',
      'country_mob_code',
      'country_is_active',
      'country_flag_upload',
      'country_id',
    ])
    .where(builder => {
      if (country_id) {
        builder.where('country_id', '=', country_id);
      }
      if (country_is_active) {
        builder.where('country_is_active', '=', country_is_active);
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
      country_id: country_id || null,
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
  const city_is_active = reqbody.city_is_active || null;
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
      if (city_is_active) {
        builder.where('city_is_active', '=', city_is_active);
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
    message: 'City List',
    status: true,
    Records: CountryList,
  });
}

export async function addEditLanguages(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { lang_name, lang_is_active, lang_iso2, lang_iso3, lang_id } = reqbody;
  const isUpdate = lang_id ? true : false;
  let checkFields = ['lang_name', 'lang_is_active'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkLanguageExist = await global
    .knexConnection('ms_languages')
    .select(['lang_name', 'lang_is_active'])
    .where(builder => {
      builder.where({ lang_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('lang_id', [lang_id]);
      }
    });

  if (checkLanguageExist.length) {
    return res.status(200).json({
      message: 'Language Already Exist',
      status: false,
      Records: checkLanguageExist,
    });
  } else {
    let obj = {
      lang_name: lang_name || null,
      lang_iso2: lang_iso2 || null,
      lang_iso3: lang_iso3 || null,
      lang_is_active: lang_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_languages').update(obj).where({ lang_id });
    } else {
      await global.knexConnection('ms_languages').insert(obj);
    }

    return res.send({
      status: true,
      message: `Language ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getLanguageList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const lang_id = reqbody.lang_id || null;
  let lang_is_active = reqbody.lang_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;
  const isWebsiteUser = req['is_website_user'] || false;
  if (isWebsiteUser) {
    lang_is_active = 'Y';
  }

  const LanguageList = await global
    .knexConnection('ms_languages')
    .select(['lang_iso2', 'lang_iso3', 'lang_name', 'lang_id', 'lang_is_active'])
    .where(builder => {
      if (lang_id) {
        builder.where('lang_id', '=', lang_id);
      }
      if (lang_is_active) {
        builder.where('lang_is_active', '=', lang_is_active);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',lang_name,lang_iso2,lang_iso3) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('lang_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Language List',
    status: true,
    Records: LanguageList,
  });
}

export async function addEditGenre(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { genre_name, genre_is_active, genre_id } = reqbody;
  const isUpdate = genre_id ? true : false;
  let checkFields = ['genre_name', 'genre_is_active'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkGenreExist = await global
    .knexConnection('ms_genre')
    .select(['genre_name', 'genre_is_active'])
    .where(builder => {
      builder.where({ genre_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('genre_id', [genre_id]);
      }
    });

  if (checkGenreExist.length) {
    return res.status(200).json({
      message: 'Genre Already Exist',
      status: false,
      Records: checkGenreExist,
    });
  } else {
    let obj = {
      genre_name: genre_name || null,
      genre_is_active: genre_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_genre').update(obj).where({ genre_id });
    } else {
      await global.knexConnection('ms_genre').insert(obj);
    }

    return res.send({
      status: true,
      message: `Genre ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getGenreList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const genre_id = reqbody.genre_id || null;
  const genre_is_active = reqbody.genre_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const GenreList = await global
    .knexConnection('ms_genre')
    .select(['genre_name', 'genre_id', 'genre_is_active'])
    .where(builder => {
      if (genre_id) {
        builder.where('genre_id', '=', genre_id);
      }
      if (genre_is_active) {
        builder.where('genre_is_active', '=', genre_is_active);
      }
      if (req.query.search) {
        builder.whereRaw(` concat_ws(' ',genre_name) like '%${req.query.search}%'`);
      }
    })
    .orderBy('genre_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Genre List',
    status: true,
    Records: GenreList,
  });
}

export async function addEditSeatType(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { seat_class_name, sct_is_active, sct_id } = reqbody;
  const isUpdate = sct_id ? true : false;
  let checkFields = ['seat_class_name', 'sct_is_active'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkSeatTypeExist = await global
    .knexConnection('ms_seat_class_type')
    .select(['seat_class_name', 'sct_is_active'])
    .where(builder => {
      builder.where({ seat_class_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('sct_id', [sct_id]);
      }
    });

  if (checkSeatTypeExist.length) {
    return res.status(200).json({
      message: 'Seat Type Already Exist',
      status: false,
      Records: checkSeatTypeExist,
    });
  } else {
    let obj = {
      seat_class_name: seat_class_name || null,
      sct_is_active: sct_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_seat_class_type').update(obj).where({ sct_id });
    } else {
      await global.knexConnection('ms_seat_class_type').insert(obj);
    }

    return res.send({
      status: true,
      message: `Seat Type ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getSeatTypeList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const sct_id = reqbody.sct_id || null;
  const sct_is_active = reqbody.sct_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const SeatTypeList = await global
    .knexConnection('ms_seat_class_type')
    .select(['seat_class_name', 'sct_id', 'sct_is_active'])
    .where(builder => {
      if (sct_id) {
        builder.where('sct_id', '=', sct_id);
      }
      if (sct_is_active) {
        builder.where('sct_is_active', '=', sct_is_active);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',seat_class_name) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('sct_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Seat Type List',
    status: true,
    Records: SeatTypeList,
  });
}

export async function addEditCurrency(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { curr_code, curr_is_active, curr_id, curr_name } = reqbody;
  const isUpdate = curr_id ? true : false;
  let checkFields = ['curr_code', 'curr_is_active', 'curr_name'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkCurrencyExist = await global
    .knexConnection('ms_currencies')
    .select(['curr_code', 'curr_is_active'])
    .where(builder => {
      builder.where({ curr_code });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('curr_id', [curr_id]);
      }
    });

  if (checkCurrencyExist.length) {
    return res.status(200).json({
      message: 'Currency Already Exist',
      status: false,
      Records: checkCurrencyExist,
    });
  } else {
    let obj = {
      curr_code: curr_code || null,
      curr_name: curr_name || null,
      curr_is_active: curr_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_currencies').update(obj).where({ curr_id });
    } else {
      await global.knexConnection('ms_currencies').insert(obj);
    }

    return res.send({
      status: true,
      message: `Currency ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });
  }
}
export async function getCurrencyList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const curr_id = reqbody.curr_id || null;
  const curr_is_active = reqbody.curr_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const CurrencyList = await global
    .knexConnection('ms_currencies')
    .select(['curr_code', 'curr_name', 'curr_id', 'curr_is_active'])
    .where(builder => {
      if (curr_id) {
        builder.where('curr_id', '=', curr_id);
      }
      if (curr_is_active) {
        builder.where('curr_is_active', '=', curr_is_active);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',curr_code,curr_name) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('curr_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Currency List',
    status: true,
    Records: CurrencyList,
  });
}

export async function addEditBanner(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { bannerArray, country_id } = reqbody;
  let checkFields = ['bannerArray', 'country_id'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let arrayBanner = [];

  for (let objBanner of bannerArray) {
    let checkFields2 = ['event_id', 'order'];
    let result2 = await checkValidation(checkFields2, objBanner);
    if (!result2.status) {
      return res.send(result2);
    }
    arrayBanner.push({
      event_id: objBanner.event_id,
      order: objBanner.order,
      country_id,
    });
  }

  let delete2 = await global
    .knexConnection('ms_banner')
    .where({
      country_id,
    })
    .del();
  await global.knexConnection('ms_banner').insert(arrayBanner);
  return res.send({
    status: true,
    message: `Banner Updated Successfully`,
    arrayBanner,
  });
}

export async function getBannerList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const b_id = reqbody.b_id || null;
  const event_id = reqbody.event_id || null;
  const country_id = reqbody.country_id || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const BannerList = await global
    .knexConnection('ms_banner')
    .leftJoin('ms_event', 'ms_event.event_id', 'ms_banner.event_id')
    .select([
      'ms_banner.*',
      'event_name',
      'event_short_description',
      'event_image_medium',
      'event_image_large',
    ])
    .where(builder => {
      if (b_id) {
        builder.where('b_id', '=', b_id);
      }
      if (event_id) {
        builder.where('event_id', '=', event_id);
      }
      if (country_id) {
        builder.where('country_id', '=', country_id);
      }
      if (req.query.search) {
        builder.whereRaw(` concat_ws(' ',event_name) like '%${req.query.search}%'`);
      }
    })
    .orderBy('order', 'asc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Banner List',
    status: true,
    Records: BannerList,
  });
}

export async function addEditSeatLayout(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const { seat_layout_name, seat_layout_data, sl_id, seat_count, priceArray } = reqbody;
  const isUpdate = sl_id ? true : false;
  let checkFields = ['seat_layout_name', 'seat_layout_data', 'priceArray'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkCurrencyExist = await global
    .knexConnection('ms_seat_layout')
    .select(['seat_layout_name'])
    .where(builder => {
      builder.where({ seat_layout_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('sl_id', [sl_id]);
      }
    });

  if (checkCurrencyExist.length) {
    return res.status(200).json({
      message: 'Seat Layout Name Already Exist',
      status: false,
      Records: checkCurrencyExist,
    });
  } else {
    let obj = {
      seat_layout_name: seat_layout_name || null,
      seat_layout_data: seat_layout_data ? JSON.stringify(seat_layout_data) : null,
      price_data: seat_layout_data ? JSON.stringify(priceArray) : null,
      seat_count: seat_count || 0,
      // ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('ms_seat_layout').update(obj).where({ sl_id });
    } else {
      await global.knexConnection('ms_seat_layout').insert(obj);
    }

    return res.send({
      status: true,
      message: `Seat Layout ${isUpdate ? 'Updated' : 'Created'} Successfully`,
    });
  }
}
export async function getSeatLayoutList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const sl_id = reqbody.sl_id || null;
  const curr_is_active = reqbody.curr_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;
  let seat_layout_select = ['sl_id', 'seat_layout_name', 'seat_count'];
  if (sl_id) {
    seat_layout_select.push('seat_layout_data');
  }
  const SeatLayoutList = await global
    .knexConnection('ms_seat_layout')
    .select(seat_layout_select)
    .where(builder => {
      if (sl_id) {
        builder.where('sl_id', '=', sl_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',seat_layout_name) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('sl_id', 'desc')
    .paginate(pagination(limit, currentPage));

  if (SeatLayoutList && SeatLayoutList.data && sl_id) {
    SeatLayoutList.data.map(z => {
      z['seat_layout_data'] = JSON.parse(z.seat_layout_data);
    });
  }

  return res.send({
    message: 'Seat Layout List',
    status: true,
    Records: SeatLayoutList,
  });
}

export async function getTimeZoneList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const tz_id = reqbody.tz_id || null;
  const curr_is_active = reqbody.curr_is_active || null;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const TimeZoneList = await global
    .knexConnection('ms_time_zones')
    .select(['tz_name', 'tz_id'])
    .where(builder => {
      if (tz_id) {
        builder.where('tz_id', '=', tz_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',tz_name,curr_name) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('tz_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Time Zone List',
    status: true,
    Records: TimeZoneList,
  });
}
