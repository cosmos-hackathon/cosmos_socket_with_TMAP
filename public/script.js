
const socket = io();

var map, marker, markerLayer;
// 페이지가 로딩이 된 후 호출하는 함수입니다.
function initTmap() {
	// map 생성
	// Tmap.map을 이용하여, 지도가 들어갈 div, 넓이, 높이를 설정합니다.
	map = new Tmap.Map({
		div: 'map_div', // map을 표시해줄 div
		width: '100%', // map의 width 설정
		height: '50vh' // map의 height 설정
	});
	map.setCenter(new Tmap.LonLat(126.985065, 37.566269).transform("EPSG:4326", "EPSG:3857"), 16);//맵 중심좌표 설정
	markerLayer = new Tmap.Layer.Markers();//마커 레이어 생성
	map.addLayer(markerLayer);//map에 마커 레이어 추가
	map.events.register("mouseup", map, onClick);//마우스 버튼을 떼었을때 발생하는 이벤트 등록 

	var cLL = map.getCenter();//중심 좌표 받아오기
	var size = new Tmap.Size(60, 100);//아이콘 크기
	var offset = new Tmap.Pixel(-(size.w / 2), -size.h);//아이콘 중심점
	var icon = new Tmap.Icon('img/sample.gif', size, offset);//마커 아이콘 설정
	marker = new Tmap.Marker(cLL, icon);//마커 생성
	markerLayer.addMarker(marker);//레이어에 마커 추가=
};
// 픽셀값을 받아 좌표로 변환해주고 마커를 마커레이어에 추가해주는 함수입니다.
function addMarker(x, y) {

	var ll = map.getLonLatFromPixel(new Tmap.Pixel(x, y));//Pixel 값을 LonLat 값으로 변환
	var size = new Tmap.Size(24, 38);//아이콘 크기
	var offset = new Tmap.Pixel(-(size.w / 2), -size.h);//아이콘 중심점
	var icon = new Tmap.Icon('img/full-truck-load-1-612826.gif', size, offset);//마커에 사용할 아이콘 설정
	var marker = new Tmap.Marker(ll, icon);//마커 생성
	//markerLayer.addMarker(marker);//레이어에 마커 추가
	var answer = confirm("Do you really want to report?");
	if (answer) {
		// 이벤트 전송	
		socket.emit('LonLat', ll)
	}
}

socket.on('verification', (ll) => {
	popup()
})

socket.on('receivemarker', (ll) => {
	console.log("Hello")
	var size = new Tmap.Size(24, 38);//아이콘 크기
	var offset = new Tmap.Pixel(-(size.w / 2), -size.h);//아이콘 중심점
	var icon = new Tmap.Icon('img/full-truck-load-1-612826.gif', size, offset);//마커에 사용할 아이콘 설정
	var marker = new Tmap.Marker(ll, icon);//마커 생성
	markerLayer.addMarker(marker);//레이어에 마커 추가
})

// 마우스 버튼을 떼었을 때 발생하는 이벤트 함수입니다.
function onClick(e) {
	var CP = {};
	try {
		CP.x = e.clientX - e.currentTarget.offsets[0] + e.currentTarget.scrolls[0];
		CP.y = e.clientY - e.currentTarget.offsets[1] + e.currentTarget.scrolls[1];
	} catch (error) {
		//IE7,8 scroll값 추가
		CP.x = e.clientX - Tmap.Control.Space.prototype.view_divLeft(map.div) + document.documentElement.scrollLeft;
		CP.y = e.clientY - Tmap.Control.Space.prototype.view_divTop(map.div) + document.documentElement.scrollTop;
	}
	addMarker(CP.x, CP.y);//레이어에 마커 추가

}
// '보이기' 버튼을 클릭하면 마커레이어를 보여주는 함수입니다.
function show() {
	markerLayer.setVisibility(true); // 레이어의 화면 표출 여부
}
// '숨기기' 버튼을 클릭하면 표출된 마커레이어를 숨겨주는 함수입니다.
function hide() {
	markerLayer.setVisibility(false);
}

function popup() {
	var layer = document.getElementsByClassName('popup')[0];
	layer.style.display = "inline-block";
}

function popout() {
	var layer = document.getElementsByClassName('popup')[0];
	layer.style.display = "none";
	layer.childNodes[1].removeAttribute('src');
	layer.childNodes[1].setAttribute('src', 'img/overloaded_truck.jpg')
}

function accept() {
	console.log('accept');
	var layer = document.getElementsByClassName('popup')[0];
	layer.childNodes[1].removeAttribute('src');
	layer.childNodes[1].setAttribute('src', 'img/loading.gif')

	var uid = document.getElementById("uid").value;
	console.log(uid)

	socket.emit('accept', uid);
}

function deny() {
	console.log('deny');
	popout();
}

const money = document.getElementById("money");

socket.on('balance', body => {
	popout();
	var uid = document.getElementById("uid").value;
	console.log(body)
	for (var i = 0; i < body.users.length; i++) {
		var data = body.users[i];
		console.log(data['name'], uid)
		if (data['name'] === uid) {
			money.innerHTML = data['balance'];
		}
	}
})