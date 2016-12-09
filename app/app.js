import './style/home.scss';
import Rx from 'rxjs/Rx';

const init = () => {
  let map = new AMap.Map('map',{
    zoom: 11
  });

  // search
  const mapEle = document.getElementById('map');
  const searchKey = document.getElementById('searchKey');
  const searchBtn = document.getElementById('searchBtn');
  const acListEle = document.getElementById('acList');
  const CSS_HIDE = 'hide';
  let autoCompleteList = [];

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
            value: '12路',
            subValue: '浙江省宁波市'
          },
          {
            type: 'place',
            value: '创新128',
            subValue: '浙江省宁波市'
          }
        ]
      } else {
        autoCompleteList = [];
      }

      renderAutoComplete(autoCompleteList);

    });

  Rx.Observable
    .fromEvent(mapEle, 'click')
    .subscribe(() => {
      autoCompleteList = [];
      renderAutoComplete(autoCompleteList);
    });

  Rx.Observable
    .fromEvent(acListEle, 'click')
    .pluck('target')
    .subscribe(target => {
      let type = target.getAttribute('data-type');
      let key = target.getAttribute('data-key');

      searchDetail(type, key);

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

const searchDetail = (type, key) => {
  if (type === 'bus') {
    let url = `http://restapi.amap.com/v3/bus/linename?s=rsv3&extensions=all&key=fbd79c02b1207d950a9d040483ef40e5&pageIndex=1&city=宁波&offset=2&keywords=${key}`;

    fetch(url).then(res => {
      if (res.ok) {
        res.json().then(data => {
          console.log(data)
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





init();