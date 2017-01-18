import './style/home.scss';
import Rx from 'rxjs/Rx';
import Moment from 'moment';
import Storage from './components/storage';
import Geolocation from './components/geolocation';

const map = new AMap.Map('map',{
  zoom: 11
});
const infoWin = new AMap.InfoWindow({
  isCustom: true,
  offset: new AMap.Pixel(3, -38),
  showShadow: true,
  closeWhenClickMap: true
});

const mapEle = document.getElementById('map');

const MODE_TYPE_BUS = 'bus';
const MODE_TYPE_BIKE = 'bike';
const MODE_TYPE_ROUTE = 'route';
const MODE_TYPE_MULT = 'mult';

let autoCompleteList = [];

function changeMode(type) {
  switch (type) {
    case MODE_TYPE_BUS:
      initBus();
      break;
    case MODE_TYPE_BIKE:
      initBike();
      break;
    case MODE_TYPE_ROUTE:
      initRoute();
      break;
    case MODE_TYPE_MULT:
      initMult();
      break;
  }
}

function initBus() {
  const searchKey = document.getElementById('searchKey');
  const searchBtn = document.getElementById('searchBtn');
  const acListEle = document.getElementById('acList');
  const CSS_HIDE = 'hide';

  searchKey.setAttribute('placeholder', '搜索公交线路');

  // autocomplete
  Rx.Observable
    .fromEvent(searchKey, 'keyup')
    .filter(event => event.keyCode !== 13)
    .debounceTime(250)
    .pluck('target', 'value')
    .subscribe(value => {
      const ALL_LINE_LIST = new Storage('ALL_LINE_LIST').get();

      autoCompleteList = [];

      if (!value) {
        const results = document.querySelectorAll('.search-result');

        Array.from(results).forEach(result => {
          result.classList.add(CSS_HIDE);
        });

        map.clearMap();

      } else if (ALL_LINE_LIST.indexOf(value) > -1) {
        autoCompleteList.push({
          type: 'bus',
          value: `${value}路`,
          subValue: ''
        })
      }

      renderAutoComplete(autoCompleteList);
    });

}

function initMult() {
  const searchKey = document.getElementById('searchKey');
  const searchBtn = document.getElementById('searchBtn');
  const acListEle = document.getElementById('acList');
  const busListEle = document.getElementById('busList');
  const busDetailEle = document.getElementById('busDetail');
  const busStopEle = document.getElementById('busStop');
  const alarmWrapEle = document.getElementById('alarmWrap');
  const alarmBtn = document.getElementById('alarmBtn');
  const allLineBtn = document.getElementById('allLineBtn');
  const placeNearbyEle = document.getElementById('placeNearby');
  const placeToBtn = document.getElementById('placeToBtn');
  const placeFromBtn = document.getElementById('placeFromBtn');
  const CSS_SHOW = 'show';
  const CSS_HIDE = 'hide';
  const CSS_ACTIVE = 'active';

  // cacheAllLines();

  searchKey.setAttribute('placeholder', '搜索地点、公交、路线');

  // autocomplete
  Rx.Observable
    .fromEvent(searchKey, 'keyup')
    .filter(event => event.keyCode !== 13)
    .debounceTime(250)
    .pluck('target', 'value')
    // .switchMap(value => fetch(`http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`))
    .subscribe(value => {
      let url = `http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`;
      const ALL_LINE_LIST = new Storage('ALL_LINE_LIST').get();

      autoCompleteList = [];

      if (!value) {
        const results = document.querySelectorAll('.search-result');

        Array.from(results).forEach(result => {
          result.classList.add(CSS_HIDE);
        });

        map.clearMap();
        renderAutoComplete(autoCompleteList);
        return;
      }

      fetch(url).then(res => {
        if (res.ok) {
          res.json().then(data => {
            let pois = data.pois || [];

            if (pois.length > 0) {
              if (ALL_LINE_LIST.indexOf(value) > -1) {
                autoCompleteList.push({
                  type: 'bus',
                  value: `${value}路`,
                  subValue: ''
                })
              }
              pois.forEach(poi => {
                autoCompleteList.push({
                  type: 'place',
                  value: poi.name,
                  subValue: `${poi.cityname}${poi.adname}`
                });
              });
            }

            renderAutoComplete(autoCompleteList);

          })
        }
      });

    });

  // 查看结果
  Rx.Observable
    .fromEvent(acListEle, 'click')
    .pluck('target')
    .subscribe(target => {
      let type = target.getAttribute('data-type');
      let key = target.getAttribute('data-key');
      const results = document.querySelectorAll('.search-result');

      Array.from(results).forEach(result => {
        result.classList.add(CSS_HIDE);
      });

      map.clearMap();
      acListEle.classList.add(CSS_HIDE);
      searchKey.value = key;

      searchDetail(type, key, map);

    });

  // 点击搜索按钮
  Rx.Observable
    .fromEvent(searchBtn, 'click')
    .subscribe(target => {
      const item = acListEle.querySelector('.sr-item');

      if (item) {
        item.click();
      }

    });

  Rx.Observable
    .fromEvent(searchKey, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === 13)
    .subscribe(() => {
      const item = acListEle.querySelector('.sr-item');

      if (item) {
        item.click();
      }
    });

  // 查看全部站点
  Rx.Observable
    .fromEvent(busDetailEle, 'click')
    .pluck('target', 'classList')
    .filter(classList => classList.contains('js-show-all'))
    .subscribe(target => {
      busDetailEle.classList.add(CSS_HIDE);
      busStopEle.classList.remove(CSS_HIDE);
    });

  // 关闭全部站点
  Rx.Observable
    .fromEvent(busStopEle, 'click')
    .pluck('target', 'classList')
    .filter(classList => classList.contains('js-close'))
    .subscribe(target => {
      busDetailEle.classList.remove(CSS_HIDE);
      busStopEle.classList.add(CSS_HIDE);
    });

  // 查看站点详情
  const busDetail$ = Rx.Observable.fromEvent(busDetailEle, 'click');
  const busStop$ = Rx.Observable.fromEvent(busStopEle, 'click');

  Rx.Observable.merge(busDetail$, busStop$)
    .pluck('target')
    .filter(target => target.classList.contains('bc-main-item') || target.classList.contains('stop-item'))
    .subscribe(target => {
      const mainStopEle = document.getElementById('mainStop');
      const items = mainStopEle.querySelectorAll('.bc-main-item');
      const stopId = target.getAttribute('data-id');
      let busLine = new Storage('busLine').get();
      let bus = busLine.isReversed ? busLine.reverse : busLine.forward;
      let stop = bus.stops[stopId];

      Array.from(items).forEach(item => {
        if (stopId === item.getAttribute('data-id')) {
          item.classList.add(CSS_ACTIVE);
        } else {
          item.classList.remove(CSS_ACTIVE);
        }
      });

      busStopEle.classList.add(CSS_HIDE);
      busDetailEle.classList.remove(CSS_HIDE);
      renderStopDetail(stop);

    });

  // 反向查询
  Rx.Observable
    .fromEvent(busDetailEle, 'click')
    .pluck('target', 'classList')
    .filter(classList => classList.contains('ba-exchange'))
    .subscribe(target => {
      let storage = new Storage('busLine');
      let isReversed = !storage.get().isReversed;
      let busLine = storage.get();
      let bus = isReversed ? busLine.reverse : busLine.forward;

      busLine.isReversed = isReversed;
      storage.set(busLine);

      renderBusDetail(bus, map);
    });

  // 到站提醒
  Rx.Observable
    .fromEvent(busDetailEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('js-alarm'))
    .subscribe(target => {
      let busLine = new Storage('busLine').get();
      let bus = busLine.isReversed ? busLine.reverse : busLine.forward;
      let info = {
        name: document.getElementById('stopName').textContent,
        linename: bus.name,
        start_stop: bus.start_stop,
        end_stop: bus.end_stop
      }

      openAlarm(info);

    });

  Rx.Observable
    .fromEvent(busStopEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('js-alarm'))
    .subscribe(target => {
      let busLine = new Storage('busLine').get();
      let bus = busLine.isReversed ? busLine.reverse : busLine.forward;
      let info = {
        name: target.parentNode.textContent,
        linename: bus.name,
        start_stop: bus.start_stop,
        end_stop: bus.end_stop
      }

      openAlarm(info);
    });

  // 关闭到站提醒
  Rx.Observable
    .fromEvent(alarmWrapEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('js-alarm-close'))
    .subscribe(target => {
      alarmWrapEle.classList.remove(CSS_SHOW);
    });

  Rx.Observable
    .fromEvent(alarmBtn, 'click')
    .subscribe(target => {
      alarmWrapEle.classList.remove(CSS_SHOW);
    });

  // 提醒时间输入限制
  const alarmStartEle = document.getElementById('alarmStart');
  const alarmEndEle = document.getElementById('alarmEnd');

  const alarmStart$ = Rx.Observable.fromEvent(alarmStartEle, 'keyup');
  const alarmEnd$ = Rx.Observable.fromEvent(alarmEndEle, 'keyup');

  Rx.Observable.merge(alarmStart$, alarmEnd$)
    .pluck('target',)
    .subscribe(target => {
      target.value = target.value.replace(/\D*/g, '');
      target.value = target.value.replace(/^(\d{2})(\d{2})$/, '$1:$2');
    });

  // 查看相关线路
  Rx.Observable
    .fromEvent(allLineBtn, 'click')
    .pluck('target')
    .subscribe(target => {
      let key = target.getAttribute('data-key');
      let count = target.getAttribute('data-count');

      searchLines(key, count);
      busDetailEle.classList.add(CSS_HIDE);

    });

  // 列表双向
  Rx.Observable
    .fromEvent(busListEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('js-exchange'))
    .subscribe(target => {
      let index = target.getAttribute('data-index');
      let storage = new Storage('allLines');
      let lines = storage.get();

      lines[index].isReversed = !lines[index].isReversed;
      storage.set(lines);

      renderBusLines();

    });

  // 列表选择
  Rx.Observable
    .fromEvent(busListEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('bi-name'))
    .subscribe(target => {
      let key = target.getAttribute('data-key');

      searchDetail('bus', key, map);

      busListEle.classList.add(CSS_HIDE);
    });

  // 地物详情-附近车站切换
  Rx.Observable.fromEvent(placeNearbyEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('psi-title'))
    .subscribe(target => {
      const curItem = target.parentNode;
      const listEle = curItem.parentNode;
      const items = listEle.querySelectorAll('.pb-station-item');

      Array.from(items).forEach(item => {
        if (item === curItem && !item.classList.contains(CSS_ACTIVE)) {
          item.classList.add(CSS_ACTIVE);
        } else {
          item.classList.remove(CSS_ACTIVE);
        }
      });
    });

  // 地物详情-公交线路切换
  let linePath;
  let stopMarkers;
  Rx.Observable.fromEvent(placeNearbyEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('psi-line-item'))
    .subscribe(target => {
      const wrapEle = target.parentNode.parentNode.querySelector('.psi-line-detail');
      const items = target.parentNode.querySelectorAll('.psi-line-item');
      let key = target.textContent;
      let url = `http://restapi.amap.com/v3/bus/linename?s=rsv3&extensions=all&key=fbd79c02b1207d950a9d040483ef40e5&pageIndex=1&city=宁波&offset=1&keywords=${key}`;
      let tmpl = '';

      fetch(url).then(res => {
        if (res.ok) {
          res.json().then(data => {
            let lines = data.buslines || [];

            if (lines.length > 0) {
              let line = lines[0];
              let busLine = {
                name: line.name.replace(/\(\S*\)/g, ''),
                start_stop: line.start_stop,
                end_stop: line.end_stop,
                jam: 5,
                crowd: 3,
                on_time: 92,
                forward_time: '11:20',
                reverse_time: '11:20',
                path: line.polyline.split(';').map(poi => [poi.split(',')[0], poi.split(',')[1]]),
                stops: line.busstops
              };

              tmpl += `
                <div class="psi-detail-title">
                  <span class="psi-detail-name">${busLine.name}</span>
                  <span class="psi-detail-right">
                    <span class="dr-item">拥堵&emsp;${busLine.jam}</span>
                    <span class="dr-item">拥挤&emsp;${busLine.crowd}</span>
                    <span class="dr-item">准点率&emsp;${busLine.on_time}%</span>
                  </span>
                </div>
                <div class="psi-detail-content">
                  <span class="psi-line-stop start">${busLine.start_stop}</span>
                  <span class="psi-line-arrow"></span>
                  <span class="psi-line-stop end">${busLine.end_stop}</span>
                  <span class="psi-line-time forward">${busLine.forward_time}</span>
                  <span class="psi-line-time reverse">${busLine.reverse_time}</span>
                </div>
              `;

              wrapEle.innerHTML = tmpl;
              wrapEle.classList.add(CSS_SHOW);

              let stopPois = busLine.stops.map(stop => {
                let poi = str2poi(stop.location);

                return {
                  name: stop.name,
                  poi: [poi.lng, poi.lat]
                }
              });

              linePath = drawLine(map, busLine.path);
              stopMarkers = addMarkers(map, stopPois, 'circle');
              map.setFitView(linePath);

            } else {
              wrapEle.innerHTML = tmpl;
              wrapEle.classList.remove(CSS_SHOW);
            }

          })
        }
      });

      Array.from(items).forEach(item => {
        item.classList.remove(CSS_ACTIVE);
      })

      target.classList.add(CSS_ACTIVE);

      if (linePath && stopMarkers) {
        map.remove(stopMarkers.concat(linePath));
      }

    });

  // 地物详情－地图infoWin显示
  Rx.Observable
    .fromEvent(placeNearbyEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('psi-title') || target.classList.contains('pb-bike-item'))
    .subscribe(target => {
      let poi = str2poi(target.getAttribute('data-poi'));
      let name = target.getAttribute('data-name');
      let info = `
        <div class="map-info-wrap">
          <div class="map-info-title">${name}</div>
          <span class="map-info-close fa fa-times"></span>
        </div>
      `;

      infoWin.setContent(info);
      infoWin.open(map, [poi.lng, poi.lat]);
      map.setZoomAndCenter(16, [poi.lng, poi.lat])

    });

  // 地物详情－地图infoWin关闭
  Rx.Observable
    .fromEvent(mapEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('map-info-close'))
    .subscribe(target => {
      infoWin.close();
    });

  Rx.Observable
    .fromEvent(mapEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('map-marker-icon'))
    .subscribe(target => {
      let poi = str2poi(target.getAttribute('data-poi'));
      let name = target.getAttribute('data-name');
      let info = `
        <div class="map-info-wrap">
          <div class="map-info-title">${name}</div>
          <span class="map-info-close fa fa-times"></span>
        </div>
      `;

      infoWin.setContent(info);
      infoWin.open(map, [poi.lng, poi.lat]);
    });

  // 地物详情-路线规划
  const placeTo$ = Rx.Observable.fromEvent(placeToBtn, 'click');
  const placeFrom$ = Rx.Observable.fromEvent(placeFromBtn, 'click');

  Rx.Observable.merge(placeTo$, placeFrom$)
    .pluck('target')
    .subscribe(target => {
      const placeNameEle = document.getElementById('placeName');
      const planStartEle = document.getElementById('planStart');
      const planEndEle = document.getElementById('planEnd');
      let value = placeNameEle.textContent;
      let poi = target.getAttribute('data-poi');

      if (target.classList.contains('to')) {
        planEndEle.value = value;
        planEndEle.setAttribute('data-poi', poi);
      }

      if (target.classList.contains('from')) {
        planStartEle.value = value;
        planStartEle.setAttribute('data-poi', poi);
      }

      placeDetail.classList.add(CSS_HIDE);
      planWrapEle.classList.add(CSS_SHOW);
      map.clearMap();

    });

  // 路线规划
  const planWrapEle = document.getElementById('planWrap');
  const planCloseBtn = document.getElementById('planCloseBtn');
  const planSearchBtn = document.getElementById('planSearchBtn');
  const planExchangeBtn = document.getElementById('planExchangeBtn');
  const planStartEle = document.getElementById('planStart');
  const planEndEle = document.getElementById('planEnd');
  const planAcListEle = document.getElementById('planAcList');

  // autocomplete
  const planStartKeyup$ = Rx.Observable.fromEvent(planStartEle, 'keyup');
  const planEndKeyup$ = Rx.Observable.fromEvent(planEndEle, 'keyup');
  const planStartBlur$ = Rx.Observable.fromEvent(planStartEle, 'blur');
  const planEndBlur$ = Rx.Observable.fromEvent(planEndEle, 'blur');
  const planStartClick$ = Rx.Observable.fromEvent(planStartEle, 'click');
  const planEndClick$ = Rx.Observable.fromEvent(planEndEle, 'click');

  Rx.Observable.merge(planStartKeyup$, planEndKeyup$)
    .debounceTime(250)
    .pluck('target', 'value')
    // .switchMap(value => fetch(`http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`))
    .subscribe(value => {
      let url = `http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`;


      if (!value) {
        planAcListEle.innerHTML = '';
        planAcListEle.classList.remove(CSS_SHOW);
        return;
      }

      fetch(url).then(res => {
        if (res.ok) {
          res.json().then(data => {
            let pois = data.pois || [];
            let tmpl = '';

            pois.forEach(poi => {
              tmpl += `
                <li class="plan-ac-item" data-poi="${poi.location}" title="${poi.name}">
                  <span class="pai-icon fa fa-map-marker"></span>
                  <span class="pai-title">${poi.name}</span>
                  <span class="pai-sub-title">${poi.cityname}${poi.adname}</span>
                </li>
              `;
            });

            planAcListEle.innerHTML = tmpl;
            planAcListEle.classList.add(CSS_SHOW);

          });
        }
      });
    });

  Rx.Observable.merge(planStartBlur$, planEndBlur$)
    .subscribe(target => {
      setTimeout(() => {
        planAcListEle.classList.remove(CSS_SHOW);
      }, 150);
    });

  // 选择
  Rx.Observable
    .fromEvent(planAcListEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('plan-ac-item'))
    .subscribe(target => {
      let value = target.querySelector('.pai-title').textContent;
      let location = target.getAttribute('data-poi');

      if (!planStartEle.getAttribute('data-poi')) {
        planStartEle.value = value;
        planStartEle.setAttribute('data-poi', location);
        return;
      }

      if (!planEndEle.getAttribute('data-poi')) {
        planEndEle.value = value;
        planEndEle.setAttribute('data-poi', location);
        return;
      }

    });

  // 关闭
  Rx.Observable
    .fromEvent(planCloseBtn, 'click')
    .subscribe(target => {
      const panelEle = document.getElementById('panel');

      planStartEle.value = '';
      planStartEle.removeAttribute('data-poi');
      planEndEle.value = '';
      planEndEle.removeAttribute('data-poi');
      planAcListEle.innerHTML = '';
      panelEle.innerHTML = '';
      planWrapEle.classList.remove(CSS_SHOW);
    });

  // 交换起点和终点
  Rx.Observable
    .fromEvent(planExchangeBtn, 'click')
    .subscribe(target => {
      let startValue = planStartEle.value;
      let startPoi = planStartEle.getAttribute('data-poi');
      let endValue = planEndEle.value;
      let endPoi = planEndEle.getAttribute('data-poi');

      planStartEle.value = endValue;
      planStartEle.setAttribute('data-poi', endPoi);
      planEndEle.value = startValue;
      planEndEle.setAttribute('data-poi', startPoi);
    });

  // 搜索
  Rx.Observable
    .fromEvent(planSearchBtn, 'click')
    .subscribe(target => {
      //http://restapi.amap.com/v3/direction/transit/integrated?origin=116.379028,39.865042&destination=116.427281,39.903719&city=%E5%8C%97%E4%BA%AC%E5%B8%82&strategy=0&nightflag=0&extensions=all&s=rsv3&key=fbd79c02b1207d950a9d040483ef40e5&callback=jsonp_325878_

      let startPoi = planStartEle.getAttribute('data-poi');
      let endPoi = planEndEle.getAttribute('data-poi');

      AMap.service('AMap.Transfer',function(){
        let transfer = new AMap.Transfer({
          city: '宁波',
          map: map,
          panel: 'panel'
        });

        transfer.search([startPoi.split(',')[0], startPoi.split(',')[1]], [endPoi.split(',')[0], endPoi.split(',')[1]])

      })
    });
}

function init() {
  const asideListEle = document.querySelector('.aside-list');

  Rx.Observable
    .fromEvent(asideListEle, 'click')
    .pluck('target')
    .filter(target => target.classList.contains('aside-item'))
    .subscribe(target => {
      const items = asideListEle.querySelectorAll('.aside-item');
      const type = target.getAttribute('data-type');

      Array.from(items).forEach(item => {
        item.classList.remove('active');
      });

      target.classList.add('active');

      changeMode(type);

    });

  // 点击地图隐藏autocomplete
  Rx.Observable
    .fromEvent(mapEle, 'click')
    .subscribe(() => {
      autoCompleteList = [];
      renderAutoComplete(autoCompleteList);
    });

  changeMode(MODE_TYPE_BUS);

}

function renderAutoComplete(list) {
  const listEle = document.getElementById('acList');
  const CSS_HIDE = 'hide';
  let items = list || [];
  let html = '';

  if (items.length === 0) {
    listEle.classList.add(CSS_HIDE);
  } else {
    listEle.classList.remove(CSS_HIDE);
  }

  items.forEach(item => {
    let type = getIconName(item.type);

    html += `
      <li class="sr-item" data-type="${item.type}" data-key="${item.value}">
        <span class="sr-icon"><i class="fa fa-${type}"></i></span>
        <span class="sr-title">${item.value}</span>
        <span class="sr-sub-title">${item.subValue}</span>
      </li>
    `;
  });

  listEle.innerHTML = html;

}

function getIconName(type) {
  let name = '';

  switch (type) {
    case 'bus':
      name = 'bus';
      break;
    case 'place':
      name = 'map-marker';
      break;
    default:
      name = 'bus';
  }

  return name;
}

function formatTime(time) {
  if (time.length !== 4) {
    return '';
  } else {
    return time.replace(/^(\d{2})/, '$1:');
  }
}

function searchLines(key, count) {
  let url = `http://restapi.amap.com/v3/bus/linename?s=rsv3&extensions=all&key=fbd79c02b1207d950a9d040483ef40e5&pageIndex=1&city=宁波&offset=${count}&keywords=${key}`;

  fetch(url).then(res => {
    if (res.ok) {
      res.json().then(data => {
        let lines = data.buslines || [];
        let length = lines.length;
        let lineArr = [];
        let storage = new Storage('allLines');

        for (let i = 0; i < length; i += 2) {
          let forward = lines[i];
          let reverse = lines[i + 1];
          let f_start = formatTime(forward.start_time);
          let f_end = formatTime(forward.end_time);
          let r_start = formatTime(reverse.start_time);
          let r_end = formatTime(reverse.end_time);

          lineArr.push({
            isReversed: false,
            forward: {
              name: forward.name.replace(/\(\S*\)/g, ''),
              start_stop: forward.start_stop,
              end_stop: forward.end_stop,
              time: f_start && f_end ? `${f_start}-${f_end}` : '',
              price: forward.basic_price === forward.total_price ? `${forward.basic_price}元` : `${forward.basic_price}-${forward.total_price}元`,
              intervals: '7-10分钟'
            },
            reverse: {
              name: reverse.name.replace(/\(\S*\)/g, ''),
              start_stop: reverse.start_stop,
              end_stop: reverse.end_stop,
              time: r_start && r_end ? `${r_start}-${r_end}` : '',
              price: reverse.basic_price === reverse.total_price ? `${reverse.basic_price}元` : `${reverse.basic_price}-${reverse.total_price}元`,
              intervals: '7-10分钟'
            }
          });
        }

        storage.set(lineArr);
        renderBusLines();

      });
    }
  });

}

function searchDetail(type, key, map) {
  if (type === 'bus') {
    let url = `http://restapi.amap.com/v3/bus/linename?s=rsv3&extensions=all&key=fbd79c02b1207d950a9d040483ef40e5&pageIndex=1&city=宁波&offset=2&keywords=${key}`;

    fetch(url).then(res => {
      if (res.ok) {
        res.json().then(data => {
          let lines = data.buslines || [];
          let busLine = {};
          let storage = new Storage('busLine');

          if (lines.length === 2) {
            let forward = lines[0];
            let reverse = lines[1];
            let f_start = formatTime(forward.start_time);
            let f_end = formatTime(forward.end_time);
            let r_start = formatTime(reverse.start_time);
            let r_end = formatTime(reverse.end_time);

            busLine = {
              isReversed: false,
              forward: {
                name: forward.name.replace(/\(\S*\)/g, ''),
                start_stop: forward.start_stop,
                end_stop: forward.end_stop,
                time: f_start && f_end ? `${f_start}-${f_end}` : '',
                price: forward.basic_price === forward.total_price ? `${forward.basic_price}元` : `${forward.basic_price}-${forward.total_price}元`,
                intervals: '7-10分钟',
                jam: 5,
                crowd: 3,
                on_time: 92,
                path: forward.polyline.split(';').map(poi => [poi.split(',')[0], poi.split(',')[1]]),
                stops: forward.busstops,
                mainStops: [0, 4, 7, 10]
              },
              reverse: {
                name: reverse.name.replace(/\(\S*\)/g, ''),
                start_stop: reverse.start_stop,
                end_stop: reverse.end_stop,
                time: r_start && r_end ? `${r_start}-${r_end}` : '',
                price: reverse.basic_price === reverse.total_price ? `${reverse.basic_price}元` : `${reverse.basic_price}-${reverse.total_price}元`,
                intervals: '7-10分钟',
                jam: 4,
                crowd: 4,
                on_time: 93,
                path: reverse.polyline.split(';').map(poi => [poi.split(',')[0], poi.split(',')[1]]),
                stops: reverse.busstops,
                mainStops: [0, 4, 7, 10]
              }
            }
          }

          storage.set(busLine);
          renderBusDetail(busLine.forward, map);

          let count = data.count % 2 === 0 ? data.count : data.count - 1;
          const allLineBtn = document.getElementById('allLineBtn');

          if (count > 2) {
            allLineBtn.setAttribute('data-key', key);
            allLineBtn.setAttribute('data-count', count);
            allLineBtn.classList.add('show');
          } else {
            allLineBtn.classList.remove('show');
          }

        })
      }
    })
  }

  if (type === 'place') {
    let url = `http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=1&s=rsv3&keywords=${key}`;

    fetch(url).then(res => {
      if (res.ok) {
        res.json().then(data => {
          let poi = data.pois[0] || null;

          if (poi) {
            renderPlaceDetail(poi, map);
          }

        });
      }
    })
  }
}

function renderBusLines() {
  const lines = new Storage('allLines').get();
  const busListEle = document.getElementById('busList');
  const lineListEle = document.getElementById('lineList');
  const CSS_HIDE = 'hide';
  let tmpl = '';

  lines.forEach((line, index) => {
    let bus = line.isReversed ? line.reverse : line.forward;

    tmpl += `
      <li class="bus-item">
        <div class="bi-name" data-key="${bus.name}">
          <p class="bn-main">${bus.name}</p>
          <p class="bn-sub"></p>
        </div>
        <div class="bi-abs">
          <p class="ba-row name">
            <span class="ba-start">${bus.start_stop}</span>
            <span class="ba-exchange fa fa-exchange js-exchange" data-index="${index}"></span>
            <span class="ba-end">${bus.end_stop}</span>
          </p>
          <p class="ba-row">首末班：<span>${bus.time}</span></p>
          <p class="ba-row">发车间隔：<span>${bus.intervals}</span></p>
          <p class="ba-row">票价：<span>${bus.price}</span></p>
        </div>
      </li>
    `;
  });

  lineListEle.innerHTML = tmpl;
  busListEle.classList.remove(CSS_HIDE);

}

function renderBusDetail(busLine, map) {
  const busDetailEle = document.getElementById('busDetail');
  const bdHeadEle = document.getElementById('bdHead');
  const bdLabelEle = document.getElementById('bdLabel');
  const mainStopEle = document.getElementById('mainStop');
  const busStopListEle = document.getElementById('busStopList');
  const CSS_HIDE = 'hide';
  let headTmpl = '';
  let labelTmpl = '';
  let mainStopTmpl = '';
  let allStopsTmpl = '';

  map.clearMap();

  headTmpl = `
    <div class="bh-name">
      <p class="bn-main">${busLine.name}</p>
      <p class="bn-sub"></p>
    </div>
    <div class="bh-abs">
      <p class="ba-row">${busLine.start_stop}</p>
      <span class="ba-exchange fa fa-exchange"></span>
      <p class="ba-row">${busLine.end_stop}</p>
      </p>
    </div>
  `;

  labelTmpl = `
    <li class="bd-label-item">首末班<span class="li-value">${busLine.time}</span></li>
    <li class="bd-label-item">发车间隔<span class="li-value">${busLine.intervals}</span></li>
    <li class="bd-label-item">票价<span class="li-value">${busLine.price}</span></li>
    <li class="bd-label-item">拥堵<span class="li-value">${busLine.jam}</span></li>
    <li class="bd-label-item">拥挤<span class="li-value">${busLine.crowd}</span></li>
    <li class="bd-label-item">准点率<span class="li-value">${busLine.on_time}%</span></li>
  `;

  busLine.mainStops.forEach((stopIndex, index) => {
    let style = index === 0 ? 'active' : '';

    mainStopTmpl += `
      <li class="bc-main-item ${style}" title="${busLine.stops[stopIndex].name}" data-id="${stopIndex}">${busLine.stops[stopIndex].name}</li>
    `;

    if (index === 0) {
      renderStopDetail(busLine.stops[stopIndex]);
    }

  });

  busLine.stops.forEach((stop, index) => {
    allStopsTmpl += `<li class="stop-item" data-id="${index}">${stop.name}<span class="si-op fa fa-bell js-alarm" titile="到站提醒"></span></li>`;
  })

  bdHeadEle.innerHTML = headTmpl;
  bdLabelEle.innerHTML = labelTmpl;
  mainStopEle.innerHTML = mainStopTmpl;
  busStopListEle.innerHTML = allStopsTmpl;

  busDetailEle.classList.remove(CSS_HIDE);

  let stopMarkers = busLine.stops.map(stop => {
    let poi = str2poi(stop.location);

    return {
      name: stop.name,
      poi: [poi.lng, poi.lat]
    }
  });

  let line = drawLine(map, busLine.path);
  addMarkers(map, stopMarkers, 'circle');

  map.setFitView(line);
}

function renderStopDetail(stop) {
  const stopNameEle = document.getElementById('stopName');
  const stopContentEle = document.getElementById('stopContent');
  let contentTmpl = '';

  stop.start_time = '07:00';
  stop.end_time = '21:00';
  stop.coming_time = '11:20|11:25';
  stop.buses = ['2路', '3路', '14路', '15路'];
  stop.subways = [{
    name: '轨道交通一号线',
    stop: '高桥－北仑',
    time: '08:15-22:30'
  }];
  stop.bikes = [
    {
      name: '天一广场东门口',
      distance: '25',
      remain: 15,
      total: 30
    },
    {
      name: '开明街5号',
      distance: '505',
      remain: 1,
      total: 30
    },
    {
      name: '天一广场北二门',
      distance: '615',
      remain: 31,
      total: 60
    }
  ]

  contentTmpl += `
    <div class="bc-time">
      <span class="time-item">
        <span class="time-key">首班</span>
        <span class="time-value">${stop.start_time}</span>
      </span>
      <span class="time-item">
        <span class="time-key">末班</span>
        <span class="time-value">${stop.end_time}</span>
      </span>
    </div>
    <div class="bc-coming">
      <span class="name">即将到站</span>
      <span class="time">${stop.coming_time.split('|')[0]}</span>
      <span class="time">${stop.coming_time.split('|')[1]}</span>
    </div>
  `;

  if (stop.buses.length > 0) {
    contentTmpl += `
      <div class="bc-block">
        <div class="block-title bus"><i class="fa fa-bus"></i></div>
        <ul class="block-list">
    `;

    stop.buses.forEach(bus => {
      contentTmpl += `<li class="block-bus-item">${bus}</li>`;
    });

    contentTmpl += '</ul></div>';
  }

  if (stop.subways.length > 0) {
    contentTmpl += `
      <div class="bc-block">
        <div class="block-title subway"><i class="fa fa-subway"></i></div>
        <ul class="block-list">
    `;

    stop.subways.forEach(subway => {
      contentTmpl += `<li class="block-subway-item">${subway.name}(${subway.stop}&emsp;${subway.time})</li>`;
    });

    contentTmpl += '</ul></div>';
  }

  if (stop.bikes.length > 0) {
    contentTmpl += `
      <div class="bc-block">
        <div class="block-title bike"><i class="fa fa-bicycle"></i></div>
        <ul class="block-list">
    `;

    stop.bikes.forEach(bike => {
      contentTmpl += `
        <li class="block-bike-item">
          <span class="bi-name">${bike.name}</span>
          <span class="bi-dis">${bike.distance}米</span>
          <span class="bi-num">${bike.remain}/${bike.total}</span>
        </li>
      `;
    });

    contentTmpl += '</ul></div>';
  }

  // console.log(stop)
  stopNameEle.textContent = stop.name;
  stopContentEle.innerHTML = contentTmpl;

}

function drawLine(map, path) {
  return new AMap.Polyline({
    map: map,
    path: path,
    strokeColor: '#12a6e8',
    strokeWeight: 5
  });
}

function addMarkers(map, markerList, type = 'default') {
  let markers = [];
  let marker;
  let option = {
    map: map
  };

  // switch (type) {
  //   case 'circle':
  //     option.content = '<div class="map-marker-circle"></div>';
  //     option.offset = new AMap.Pixel(-3, -6);
  //     break;
  //   case 'bus':
  //     option.content = '<div class="map-marker-icon bus"><i class="fa fa-bus"></i></div>';
  //     option.offset = new AMap.Pixel(-5, -28);
  //     option.animation = 'AMAP_ANIMATION_DROP';
  //     break;
  //   case 'subway':
  //     option.content = '<div class="map-marker-icon subway"><i class="fa fa-subway"></i></div>';
  //     option.offset = new AMap.Pixel(-5, -28);
  //     option.animation = 'AMAP_ANIMATION_DROP';
  //     break;
  //   case 'bike':
  //     option.content = '<div class="map-marker-icon bike"><i class="fa fa-bicycle"></i></div>';
  //     option.offset = new AMap.Pixel(-5, -28);
  //     option.animation = 'AMAP_ANIMATION_DROP';
  //     break;
  //   case 'taxi':
  //     option.content = '<div class="map-marker-icon taxi"><i class="fa fa-taxi"></i></div>';
  //     option.offset = new AMap.Pixel(-5, -28);
  //     option.animation = 'AMAP_ANIMATION_DROP';
  //     break;
  //   case 'car':
  //     option.content = '<div class="map-marker-icon car"><i class="fa fa-car"></i></div>';
  //     option.offset = new AMap.Pixel(-5, -28);
  //     option.animation = 'AMAP_ANIMATION_DROP';
  //     break;
  // }

  markerList.forEach(marker => {

    switch (type) {
      case 'circle':
        option.content = `<div class="map-marker-circle" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"></div>`;
        option.offset = new AMap.Pixel(-3, -6);
        option.position = marker.poi;
        break;
      case 'bus':
        option.content = `<div class="map-marker-icon bus" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"><i class="fa fa-bus"></i></div>`;
        option.offset = new AMap.Pixel(-5, -28);
        option.animation = 'AMAP_ANIMATION_DROP';
        option.position = marker.poi;
        break;
      case 'subway':
        option.content = `<div class="map-marker-icon subway" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"><i class="fa fa-subway"></i></div>`;
        option.offset = new AMap.Pixel(-5, -28);
        option.animation = 'AMAP_ANIMATION_DROP';
        option.position = marker.poi;
        break;
      case 'bike':
        option.content = `<div class="map-marker-icon bike" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"><i class="fa fa-bicycle"></i></div>`;
        option.offset = new AMap.Pixel(-5, -28);
        option.animation = 'AMAP_ANIMATION_DROP';
        option.position = marker.poi;
        break;
      case 'taxi':
        option.content = `<div class="map-marker-icon taxi" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"><i class="fa fa-taxi"></i></div>`;
        option.offset = new AMap.Pixel(-5, -28);
        option.animation = 'AMAP_ANIMATION_DROP';
        option.position = marker.poi;
        break;
      case 'car':
        option.content = `<div class="map-marker-icon car" data-name="${marker.name}" data-poi="${marker.poi.join(',')}"><i class="fa fa-car"></i></div>`;
        option.offset = new AMap.Pixel(-5, -28);
        option.animation = 'AMAP_ANIMATION_DROP';
        option.position = marker.poi;
        break;
    }

    markers.push(new AMap.Marker(option));
  });

  return markers;
}

function openAlarm(info) {
  const alarmWrapEle = document.getElementById('alarmWrap');
  const alarmInfoEle = document.getElementById('alarmInfo');
  const alarmStartEle = document.getElementById('alarmStart');
  const alarmEndEle = document.getElementById('alarmEnd');
  const CSS_SHOW = 'show';
  let tmpl = '';
  let startTime = Moment().format('HH:mm');
  let endTime = Moment().add(10, 'm').format('HH:mm');

  tmpl = `
    <div class="an-stop">
      <span>${info.name}</span>
    </div>
    <div class="an-line">
      <p>${info.linename}</p>
      <p class="al-stop">(${info.start_stop}－${info.end_stop})</p>
    </div>
  `;

  alarmInfoEle.innerHTML = tmpl;
  alarmStartEle.value = startTime;
  alarmEndEle.value = endTime;
  alarmWrapEle.classList.add(CSS_SHOW);
}

function renderPlaceDetail(place, map) {
  const placeDetailEle = document.getElementById('placeDetail');
  const placeNameEle = document.getElementById('placeName');
  const placeToBtn = document.getElementById('placeToBtn');
  const placeFromBtn = document.getElementById('placeFromBtn');
  const placeNearbyEle = document.getElementById('placeNearby');
  const busStationListEle = document.getElementById('p_busStationList');
  const subwayStationListEle = document.getElementById('p_subwayStationList');
  const CSS_HIDE = 'hide';
  const position = str2poi(place.location);
  let busStopTmpl = '';
  let nearbyTmpl = '';

  getNearBy(position)
    .subscribe(resArr => {
      let promiseArr = [];

      resArr.forEach(res => {
        if (res.ok) {
          promiseArr.push(Rx.Observable.fromPromise(res.json()));
        }
      });

      Rx.Observable.forkJoin(promiseArr)
        .subscribe(dataArr => {
          let tmpl;
          let markers;
          let taxiMarkers;
          let carMarkers;

          console.log(dataArr)
          dataArr.forEach((data, index) => {
            switch(index) {
              case 0:
                ({ tmpl, markers } = getNearbyBus(data.pois));
                nearbyTmpl += tmpl;
                addMarkers(map, markers, 'bus');
                break;
              case 1:
                ({ tmpl, markers } = getNearbySubway(data.pois));
                nearbyTmpl += tmpl;
                addMarkers(map, markers, 'subway');
                break;
              case 2:
                ({ tmpl, markers } = getNearbyBike(data.list));
                nearbyTmpl += tmpl;
                addMarkers(map, markers, 'bike');
                break;
              case 3:
                ({ tmpl, taxiMarkers, carMarkers} = getNearbyCar(data.list));
                nearbyTmpl += tmpl;
                addMarkers(map, taxiMarkers, 'taxi');
                addMarkers(map, carMarkers, 'car');
                break;
            }
          });

          placeNameEle.textContent = place.name;
          placeNameEle.setAttribute('title', place.name);
          placeToBtn.setAttribute('data-poi', place.location);
          placeFromBtn.setAttribute('data-poi', place.location);
          placeNearbyEle.innerHTML = nearbyTmpl;
          placeDetailEle.classList.remove(CSS_HIDE);

        });
    })

  let marker = new AMap.Marker({
    map: map,
    position: [position.lng, position.lat],
    animation: 'AMAP_ANIMATION_DROP'
  });

  let circle = new AMap.Circle({
    map: map,
    center: [position.lng, position.lat],
    strokeColor: "#004e79",
    strokeOpacity: 0.2,
    strokeWeight: 1,
    fillColor: "#7cc8f3",
    fillOpacity: 0.2,
    radius: 500
  });

  map.setFitView(circle);
}

function getNearBy(poi) {
  const location = Geolocation.mars2Gps(poi);
  const busUrl = `http://restapi.amap.com/v3/place/around?s=rsv3&location=${poi.lng},${poi.lat}&key=fbd79c02b1207d950a9d040483ef40e5&radius=500&offset=5&page=1&city=宁波&keywords=公交站`;
  const subwayUrl = `http://restapi.amap.com/v3/place/around?s=rsv3&location=${poi.lng},${poi.lat}&key=fbd79c02b1207d950a9d040483ef40e5&radius=500&offset=5&page=1&city=宁波&keywords=地铁站`;
  const bikeUrl = `http://122.227.209.115:8008/bicycle/site_nearby?operId=0&location=${location.lng},${location.lat}&limit=5&radius=500`;
  const carUrl = `http://122.227.209.115:8008/bicycle/site_nearby?operId=0&location=${location.lng},${location.lat}&limit=10&radius=500`;
  const fetchBus$ = Rx.Observable.fromPromise(fetch(busUrl));
  const fetchSubway$ = Rx.Observable.fromPromise(fetch(subwayUrl));
  const fetchBike$ = Rx.Observable.fromPromise(fetch(bikeUrl));
  const fetchCar$ = Rx.Observable.fromPromise(fetch(carUrl));

  return Rx.Observable.forkJoin(fetchBus$, fetchSubway$, fetchBike$, fetchCar$);
}

function getNearbyBus(stopList) {
  let tmpl = '';
  let poi;
  let markers = [];
  let name;

  if (stopList.length === 0) {
    return { tmpl, markers };
  }

  tmpl = `
    <div class="pb-block">
      <div class="pb-title">
        <i class="fa fa-bus"></i>
        <span class="pb-name">公交站</span>
      </div>
      <div class="pb-content">
        <ul class="pb-station-list">
  `;

  stopList.forEach(stop => {
    poi = str2poi(stop.location);
    name = stop.name.replace('(公交站)', '');

    markers.push({
      name: name,
      poi: [poi.lng, poi.lat]
    });

    tmpl += `
      <li class="pb-station-item">
        <p class="psi-title" data-poi="${stop.location}" data-name="${name}">
          <span class="psi-name"><i class="psi-icon fa fa-caret-right"></i>${name}</span>
          <span class="psi-dis">${stop.distance}米</span>
        </p>
        <div class="psi-content">
          <ul class="psi-line-list">
    `;

    stop.address.split(';').forEach(busname => {
      tmpl += `<li class="psi-line-item">${busname.replace(/\.*/g, '')}</li>`;
    });

    tmpl += `
          </ul>
          <div class="psi-line-detail">
          </div>
        </div>
      </li>
    `;
  });

  tmpl += `
        </ul>
      </div>
    </div>
  `;

  return { tmpl, markers };
}

function getNearbySubway(stopList) {
  let tmpl = '';
  let poi;
  let markers = [];
  let name;

  if (stopList.length === 0) {
    return { tmpl, markers };
  }

  tmpl = `
    <div class="pb-block">
      <div class="pb-title">
        <i class="fa fa-subway"></i>
        <span class="pb-name">地铁站</span>
      </div>
      <div class="pb-content">
        <ul class="pb-station-list">
  `;

  stopList.forEach(stop => {
    poi = str2poi(stop.location);
    name = stop.name.replace('(地铁站)', '');

    markers.push({
      name: name,
      poi: [poi.lng, poi.lat]
    });

    tmpl += `
      <li class="pb-station-item">
        <p class="psi-title" data-poi="${stop.location}" data-name="${name}">
          <span class="psi-name"><i class="psi-icon fa fa-caret-right"></i>${name}</span>
          <span class="psi-dis">${stop.distance}米</span>
        </p>
        <div class="psi-content">
          <ul class="psi-line-list">
    `;

    stop.address.split(';').forEach(busname => {
      tmpl += `<li class="psi-line-item">${busname.replace(/\.*/g, '')}</li>`;
    });

    tmpl += `
          </ul>
          <div class="psi-line-detail">
          </div>
        </div>
      </li>
    `;
  });

  tmpl += `
        </ul>
      </div>
    </div>
  `;

  return { tmpl, markers };
}

function getNearbyBike(stopList) {
  let tmpl = '';
  let poi;
  let markers = [];

  if (stopList.length === 0) {
    return { tmpl, markers };
  }

  tmpl = `
    <div class="pb-block">
      <div class="pb-title">
        <i class="fa fa-bicycle"></i>
        <span class="pb-name">公共自行车点</span>
      </div>
      <div class="pb-content">
        <ul class="pb-bike-list">
  `;

  stopList.forEach(stop => {
    poi = Geolocation.gps2Mars(str2poi(stop.locationText));

    markers.push({
      name: stop.stopName,
      poi: [poi.lng, poi.lat]
    });

    tmpl += `
      <li class="pb-bike-item" data-poi="${poi.lng},${poi.lat}" data-name="${stop.stopName}">
        <span class="pbi-name"><i class="pbi-icon fa fa-map-marker"></i>${stop.stopName}</span>
        <span class="pbi-dis">${stop.distance}米</span>
        <span class="pbi-num">${stop.current4Get}/${stop.maxCapacity}</span>
      </li>
    `;
  });

  tmpl += `
        </ul>
      </div>
    </div>
  `;

  return { tmpl, markers };
}

function getNearbyCar(stopList) {
  let tmpl = '';
  let poi;
  let taxiMarkers = [];
  let carMarkers = [];

  if (stopList.length <= 5) {
    return { tmpl, taxiMarkers, carMarkers };
  }

  stopList.forEach((stop, index) => {
    if (index > 5) {
      poi = Geolocation.gps2Mars(str2poi(stop.locationText));

      if (index % 2 === 0) {
        taxiMarkers.push({
          name: '浙BT1234',
          poi: [poi.lng, poi.lat]
        });
      } else {
        carMarkers.push({
          name: '浙B45678',
          poi: [poi.lng, poi.lat]
        });
      }
    }

  });

  tmpl = `
    <div class="pb-block">
      <div class="pb-title">
        <i class="fa fa-car"></i>
        <span class="pb-name">召车</span>
      </div>
      <div class="pb-content">
        <div class="pb-car-block">
          <div class="pcb-item">
            <span class="pcb-label"><i class="pcb-icon fa fa-taxi"></i>出租车</span>
            <span class="pcb-value">${taxiMarkers.length}</span>
          </div>
          <div class="pcb-item">
            <span class="pcb-label"><i class="pcb-icon fa fa-car"></i>网约车</span>
            <span class="pcb-value">${carMarkers.length}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return { tmpl, taxiMarkers, carMarkers };
}

function str2poi(str) {
  return {
    lng: +str.split(',')[0],
    lat: +str.split(',')[1]
  }
}

function cacheAllLines() {
  let url = 'http://122.227.209.115:8008/bus/lines?operId=0&time=1';

  fetch(url).then(res => {
    if (res.ok) {
      res.json().then(data => {
        let dataList = data.list || [];
        let lineSet = new Set();
        let storage = new Storage('ALL_LINE_LIST');
        let lineList = [];

        dataList.map(data => data.replace(/[\u4e00-\u9fa5\s（）]+/g, '').replace(/\-$/, ''))
                .filter(value => !!value)
                .forEach(value => {
                  lineSet.add(value);
                });

        for (let item of lineSet) {
          lineList.push(item);
        }

        storage.set(lineList);

      });
    }
  })
}

init();