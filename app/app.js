import './style/home.scss';
import Rx from 'rxjs/Rx';
import Moment from 'moment';
import Storage from './components/storage'

const init = () => {
  let map = new AMap.Map('map',{
    zoom: 11
  });

  const mapEle = document.getElementById('map');
  const searchKey = document.getElementById('searchKey');
  const searchBtn = document.getElementById('searchBtn');
  const acListEle = document.getElementById('acList');
  const busDetailEle = document.getElementById('busDetail');
  const busStopEle = document.getElementById('busStop');
  const alarmWrapEle = document.getElementById('alarmWrap');
  const CSS_SHOW = 'show';
  const CSS_HIDE = 'hide';
  const CSS_ACTIVE = 'active';
  let autoCompleteList = [];

  // autocomplete
  Rx.Observable
    .fromEvent(searchKey, 'keyup')
    .debounceTime(250)
    .pluck('target', 'value')
    // .switchMap(value => fetch(`http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`))
    .subscribe(res => {
      // if (res.ok) {
      //   res.json().then(data => {
      //     console.log(data)
      //   })
      // }

      if (!!res) {
        autoCompleteList = [
          {
            type: 'bus',
            value: `${res}路`,
            subValue: '浙江省宁波市'
          },
          {
            type: 'place',
            value: '创新128',
            subValue: '浙江省宁波市'
          }
        ]
      } else {
        const results = document.querySelectorAll('.search-result');
        
        Array.from(results).forEach(result => {
          result.classList.add(CSS_HIDE);
        });
        
        autoCompleteList = [];
        map.clearMap();
      }

      renderAutoComplete(autoCompleteList);

    });

  // 点击地图隐藏autocomplete
  Rx.Observable
    .fromEvent(mapEle, 'click')
    .subscribe(() => {
      autoCompleteList = [];
      renderAutoComplete(autoCompleteList);
    });

  // 查看结果
  Rx.Observable
    .fromEvent(acListEle, 'click')
    .pluck('target')
    .subscribe(target => {
      let type = target.getAttribute('data-type');
      let key = target.getAttribute('data-key');

      searchDetail(type, key, map);

      acListEle.classList.add(CSS_HIDE);

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
  
}

const renderAutoComplete = list => {
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

const getIconName = type => {
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

const searchDetail = (type, key, map) => {
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

            busLine = {
              isReversed: false,
              forward: {
                name: forward.name.replace(/\(\S*\)/g, ''),
                start_stop: forward.start_stop,
                end_stop: forward.end_stop,
                time: `${forward.start_time.replace(/^(\d{2})/, '$1:')}-${forward.end_time.replace(/^(\d{2})/, '$1:')}`,
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
                time: `${reverse.start_time.replace(/^(\d{2})/, '$1:')}-${reverse.end_time.replace(/^(\d{2})/, '$1:')}`,
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
        })
      }
    })
  }

  if (type === 'place') {
    let url = `http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=1&s=rsv3&keywords=${key}`;

    fetch(url).then(res => {
      if (res.ok) {
        res.json().then(data => {
          console.log(data)
        })
      }
    })
  }
}

const renderBusDetail = (busLine, map) => {
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
    allStopsTmpl += `<li class="stop-item" data-id="${index}">${stop.name}<span class="si-op fa fa-bell js-alarm"></span></li>`;
  })

  bdHeadEle.innerHTML = headTmpl;
  bdLabelEle.innerHTML = labelTmpl;
  mainStopEle.innerHTML = mainStopTmpl;
  busStopListEle.innerHTML = allStopsTmpl;

  busDetailEle.classList.remove(CSS_HIDE);

  let stopMarkers = busLine.stops.map(stop => [stop.location.split(',')[0], stop.location.split(',')[1]]);

  let line = drawLine(map, busLine.path);
  addMarkers(map, stopMarkers);

  map.setFitView(line);
}

const renderStopDetail = stop => {
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

const drawLine = (map, path) => {
  return new AMap.Polyline({
    map: map,
    path: path,
    strokeColor: '#12a6e8',
    strokeWeight: 5
  });
}

const addMarkers = (map, poiList, type) => {

  poiList.forEach(poi => {
    new AMap.Marker({
      map: map,
      position: poi,
      content: '<div class="map-marker-circle"></div>',
      offset: new AMap.Pixel(-3, -3)
    })
  })

}

const openAlarm = info => {
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

init();