//Band Score Split.js
//Copyright © 2019 kitami.hibiki. All rights reserved.
const vWidth = 708; //画像表示サイズ幅
const vHeight = 1000; //画像表示サイズ幅
const cWidth = 4299; //画像処理時サイズ幅
const cHeight = 6071; //画像処理時サイズ高
const cvRatio = cHeight / vHeight; //cavasサイズ/表示サイズ係数

var scale = 1.0 // 拡大率(初期値)


var guide_L = vWidth * 0.05; //左側ガイド線位置(初期値)
var guide_R = vWidth - guide_L; //右側ガイド線位置(初期値)

var tvHeight = vHeight * 0.1 //トリミング枠縦幅(初期値)
var tvWidth = guide_R - guide_L //ガイド線間幅(初期値)
var offset_Y = 0;
var offset_X = 0;

var widthLock = false; //横幅ロックフラグ
var guideLeft = 10; //ガイド線左側のスペース
var Top_margin = vHeight * 0.05; //描画開始位置X（上部余白）

var title_h = 0;
var Para_interval = 15; //段落間隔
var outParaNum = 1; //出力領域段落カウント

const cvs = document.getElementById('in'); //inエリアcanvas
cvs.width = cWidth;
cvs.height = cHeight;
let out = document.getElementById('out'); //outエリアcanvas
out.width = cWidth;
out.height = cHeight;
const ctx_in = cvs.getContext('2d');
const ctx_out = out.getContext('2d');

var rangeInput_X1 = document.getElementById('rangeInput_X1');
var rangeInput_X2 = document.getElementById('rangeInput_X2');
var rangeInput_Y = document.getElementById('rangeInput_Y1');
var trimBoxList = document.getElementsByClassName('trimBox');
var OCRTextList = document.getElementsByClassName('OCRText');
var tboxNum = document.getElementById('trimboxNum'); //トリミング枠数
var selectingID = '';

//File input
var reader;
var file;
var fileNo = 0;
var objFile = document.getElementById("selectFile");
const img = new Image()

objFile.addEventListener("change", function(evt) {
    file = evt.target.files;
    reader = new FileReader();
    reader.readAsDataURL(file[0]);
    reader.onload = function() {
        load_img(reader.result);
    }
    ;
}, false);

function Load_Pre() {
    if (fileNo > 0) {
        fileNo--;
        reader.readAsDataURL(file[fileNo]);
    }
}
function Load_Next() {
    if (fileNo < file.length) {
        fileNo++;
        reader.readAsDataURL(file[fileNo]);
    }
}
function Input_Clear(){
	clearTrimBox();
	ctx_in.clearRect(0, 0, cWidth, cHeight)
	objFile.value = '';
}

window.onload = function() {
	rangeInput_X1.max = vWidth/2;
	rangeInput_X2.min = vWidth/2;
	rangeInput_X2.max = vWidth;

	rangeInput_X1.value = guide_L;
	rangeInput_X2.value = guide_R;

	document.getElementById('tboxX').value = 0;
	document.getElementById('tboxY').value = 0;
	document.getElementById('tvWidth').value = tvWidth;
    document.getElementById('tvHeight').value = tvHeight;
    tboxNum.value = 0;

    document.getElementById('Para_interval').value = Para_interval;
    document.getElementById('title_text').value = 'タイトル';
    load_img('./image/demo.jpg'); //DEBUG用
    //drawTrimBox('tbox_0',vHeight*0.1);
    drawGuideLine('guide_left','v',guide_L + 5);
    drawGuideLine('guide_right','v',guide_R - 5);
}

img.onload = function(_ev) {
    // 画像が読み込まれた
    scale = cWidth / img.width;
    draw_canvas();
    // 画像更新
    //console.log("load complete, scaling:"+ scale);
}

function load_img(dataUrl) {
	// 画像の読み込み
	//clearTrimBox()
	img.src = dataUrl
}

function draw_canvas() {
    // 画像更新
    ctx_in.fillStyle = 'rgb(255, 255, 255)'
    //inエリア背景
    ctx_in.fillRect(0, 0, cWidth, cHeight)
    // 背景を塗る
    ctx_in.drawImage(img,0,0,img.width,img.height,0,0,img.width*scale,img.height*scale)
    ctx_in.lineWidth = 2;
}

var divbox = {
	borderWidth : 1,
	borderColor : 'aqua',
	className : 'divbox',
	id : '',

	draw: function(x,y,width,height) {
	var elem = document.createElement('div');
			elem.className = this.className;
			elem.style.left = x + 'px';
			elem.style.top = y + 'px';
			elem.style.width = width + 'px';
			elem.style.height = height + 'px';
			if(this.id !='') elem.id = this.id;
			if(this.className == '') elem.style.border = this.borderWidth+'px solid '+this.borderColor;
			if(this.className == 'trimBox') {
				elem.addEventListener('click', selectTrimBox, false);
				elem.addEventListener('mousedown', initMove, false);
			}
			document.getElementById('inputDiv').appendChild(elem);
	}
}

function selectTrimBox(e) {
	console.log("selectTrimBox:"+ e.target.id);
	//前選択した要素のclassを解除
	if(selectingID != undefined && selectingID != ''){
		var selectedElem = document.getElementById(selectingID);
		var hasPre = false;

		if(selectedElem != undefined)
			hasPre = selectedElem.classList.contains('selecting');

		if(hasPre)
			selectedElem.classList.remove('selecting');
	}
	//現在選択した要素のclassを追加
	selectingID = e.target.id;
	document.getElementById(selectingID).classList.add('selecting');
}

var moveElem;
function initMove(e) {
   move_start_y = e.clientY;
   moveElem = event.target;
   window.addEventListener('mousemove', move, false);
   window.addEventListener('mouseup', stopMove, false);
}
function move(e) {
	var topVal = parseInt(moveElem.style.top);
	var moveLength = Math.round(e.clientY - move_start_y);
	moveElem.style.top = (parseInt(topVal) + moveLength) + "px";
	move_start_y = e.clientY;
}
function stopMove(e) {
    window.removeEventListener('mousemove', move, false);
    window.removeEventListener('mouseup', stopMove, false);
}

 //トリミング領域描画
function drawTrimBox(id,PositionY) {
	divbox.id = id
	divbox.className = 'trimBox'
	divbox.draw(guide_L-guideLeft,PositionY,tvWidth+guideLeft,tvHeight)
	selectingID = id;
	tboxNum.value ++;
}

//ガイド線描画
function drawGuideLine(id,type,positon) {
	divbox.className = 'guide ' + type
	divbox.id = id
	if (type == 'h')
		divbox.draw(0,positon,vWidth,0)
	else
		divbox.draw(positon,0,0,vHeight)
}

 //トリミング領域削除/追加
function deleTrimBox(deleID) {
	if(!deleID)
		deleID = selectingID

	elem = document.getElementById(deleID)
	elem.parentNode.removeChild(elem)
	tboxNum.value --

	if(selectingID==deleID)
		selectingID = ''
}
function addTrimBox() {
	drawTrimBox('trimBox_'+ tboxNum.value,vHeight*0.1);
}

 //画像出力
function download() {
    var filename = 'download.png';
    var downloadLink = document.getElementById('hiddenLink');

    if (out.msToBlob) {
        var blob = out.msToBlob();
        window.navigator.msSaveBlob(blob, filename);
    } else {
		//downloadLink.href = out.toDataURL('image/png');
		dataURI = out.toDataURL('image/png');
		download2(dataURI,filename);
		
        //downloadLink.download = filename;
        //downloadLink.click();
    }
}

function dataURItoBlob(dataURI) {
	const b64 = atob(dataURI.split(',')[1])
	const u8 = Uint8Array.from(b64.split(""), e => e.charCodeAt())
	return new Blob([u8], {type: "image/png"})
}

function download2(dataURI, filename){
	const blob = dataURItoBlob(dataURI)
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.download = filename
	a.href = url
	a.click()
	
	// ダウンロードの時間がわからないので多めに 最低 3s,  1MiB / sec として
	// 終わった頃に revoke する
	setTimeout(() => {
		URL.revokeObjectURL(url)
	}, Math.max(5000, 1000 * dataURI.length / 1024 * 1024))
}

 //画像トリミング
function doTrim() {
    if (outParaNum == 1) {
        // 背景
        ctx_out.fillStyle = 'white';
		//ctx_out.fillStyle = '#f1f1f1' //DEBUG用
        ctx_out.fillRect(0, 0, cWidth, cHeight);
        // 表題
        var titleText = document.getElementById('title_text').value;
        if (titleText.length > 0) {
            ctx_out.font = cWidth / 25 + "px serif";
            ctx_out.fillStyle = 'black';
            var textWidth = ctx_out.measureText(titleText).width;
            ctx_out.fillText(titleText, (cWidth - textWidth) / 2, Top_margin * cvRatio);
            title_h = 20;
		} else {
			title_h = 0;
		}
    }

    for (var elem of trimBoxList) {
        //console.log("描画回数:" + outParaNum);

        var nextY = paraY1(outParaNum) + tvHeight;
        if (nextY > vHeight) {
            window.alert('ページ末尾に到達しました');
            break;
        }
        //画面位置to実際位置座標変換係数　
		rate = 1 / scale * cvRatio;
        //入力部
        sx = parseInt(elem.style.left) * rate;
        sy = parseInt(elem.style.top) * rate;
        sWidth = parseInt(elem.style.width) * rate;
        sHeight = parseInt(elem.style.height) * rate;
        //出力部
        dx = (vWidth-tvWidth -guideLeft) / 2 * cvRatio;
        dy = paraY1(outParaNum) * cvRatio;
        dWidth = sWidth * scale;
        dHeight = sHeight * scale;

        ctx_out.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        outParaNum++;
    }
}
 //n段目から描画位置Y1を計算
function paraY1(n) {
    if (n == 1)
        return Top_margin + title_h
    else
        return Top_margin + title_h + n*Para_interval + (n - 1) * tvHeight
}

function rangeXChange(Xn,val) {
	if(Xn==1){
		guide_L = parseInt(val);
		document.getElementById('guide_left').style.left = parseInt(val)+3 + 'px';
	} else {
		guide_R = parseInt(val);
		document.getElementById('guide_right').style.left = parseInt(val)-4 + 'px';
	}
	tvWidth = guide_R - guide_L;

	for (var elem of trimBoxList) {
        //左端変更時
        if(Xn==1){
            guide_L = parseInt(val);
            elem.style.left = guide_L + 'px';
            if(widthLock){
				guide_R = guide_L+tvWidth;
				document.getElementById('rangeInput_X2').value = guide_R;
            } else {
				tvWidth = guide_R - guide_L;
				elem.style.width = tvWidth + 'px';
				guideLeft = 0;
			}
        }
      //右端変更時
        if (Xn == 2) {
            guide_R = parseInt(val);
            if (widthLock) {
                guide_L = guide_R - tvWidth;
                elem.style.left = guide_L + 'px';
                document.getElementById('rangeInput_X1').value = guide_L;
            } else {
                tvWidth = guide_R - guide_L;
				realWidth = tvWidth + guideLeft
				elem.style.width = realWidth + 'px';
            }
        }
	}
}


function rangeYChange(val) {
	trimBoxList_now = document.querySelectorAll('.trimBox');
	for (var elem of trimBoxList_now) {
		// console.log("tboxElem:"+ elem.id);
	    var origin_Y = parseInt(elem.style.top) + offset_Y;
	    var topVal = origin_Y - parseInt(val);
	    elem.style.top = topVal + 'px';
	}
	offset_Y = parseInt(val);
}

function tvHeightChange(val) {
	trimBoxList_now = document.querySelectorAll('.trimBox');
	for (var elem of trimBoxList_now) {
		var topVal = parseInt(elem.style.top)
        var hChange = parseInt(val - tvHeight) / 2;
		elem.style.height = parseInt(val) + 'px';
		elem.style.top = topVal-hChange + 'px';
	}
    tvHeight = parseInt(val);
}

function paraIntervalChange(val) {
    Para_interval = val;
}
function widthLockChange(elem) {
    if(elem.checked)
        widthLock = true;
    else
        widthLock = false;
    //console.log("widthLock:" + widthLock);
}
 //出力領域クリア
function clean_img() {
    ctx_out.clearRect(0, 0, cWidth, cHeight)
    outParaNum = 1
	title_h = 0
}
 //トリミング枠全削除
function clearTrimBox() {
	//ctx_in.clearRect(0, 0, cWidth, cHeight);

	trimBoxList_now = document.querySelectorAll('.trimBox');
	for (var elem of trimBoxList_now) {
		elem.parentNode.removeChild(elem);
	}
	tboxNum.value = 0;

	OCRTextList_now = document.querySelectorAll('.OCRText');
	for (var elem of OCRTextList_now) {
		elem.parentNode.removeChild(elem);
	}
}

//以下、OCR関連
var language = "eng";
var instList = new Array();
var checkedList = new Array();

var worker = new Tesseract.createWorker({
  logger: progressUpdate
});

function instSelect(elem){
	var instNo = elem.value
	var instElem = document.getElementById('instList_'+instNo)

	if(elem.checked && !checkedList.includes(instNo)) {
		var y = parseInt(instElem.style.top) + parseInt(instElem.style.height)/2 - tvHeight/2
		tboxId = 'tbox_instNo_'+ instNo
		drawTrimBox(tboxId,y)
		checkedList.push(instNo)
	}
	if(!elem.checked && checkedList.includes(instNo)){
		index = checkedList.indexOf(instNo)
		checkedList.splice(index,1)
		tboxId = 'tbox_instNo_'+ instNo
		deleTrimBox(tboxId)
	}
}

function getInputCanvas() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
	var useWidth = img.width * guide_L / vWidth;
    canvas.width = useWidth;
    canvas.height = img.height;
    ctx.drawImage(img,0,0,useWidth,img.height,0,0,useWidth,img.height);
    //document.getElementById('outputDiv').appendChild(canvas);
    return canvas;
}

async function startOCR(){
	var input = getInputCanvas();
	await worker.load();
	await worker.loadLanguage(language);
	await worker.initialize(language);
	await worker.setParameters({
	    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.{()'
	  });
	const { data } = await worker.recognize(input);
	result(data);
}

function result(res){
	console.log('result was:', res)
	progressUpdate({ status: 'done', data: res })

	//結果配列から単語単位で取り出す
	instList = new Array();
	var index = 0;
	res.words.forEach(function(w){
		var b = w.bbox;
		isWord = w.text.match(/[a-z]/gi);
		if(isWord){
			divbox.id = "instList_" + index
			instList.push(w.text)
			divbox.className = 'OCRText'
			index++

			var imgToView = 1*scale/cvRatio;
			var x =(b.x0)*imgToView
			var y =(b.y0)*imgToView
			var width = (b.x1-b.x0)*imgToView
			var hieght = (b.y1-b.y0)*imgToView

			if(guideLeft<width)
				guideLeft = width

			divbox.draw(x, y, width, hieght)
		}
	})

	if(instList.length > 0){
		resultArea = document.getElementById('result');
		resultArea.innerHTML='認識結果:';
		instList.forEach(
				function (value, index){
				var chkboxstr = '<input type="checkbox" oninput="instSelect(this)" value="' + index + '" id="ckbox_' + index + '">'
				+ '<label>' + value + '</label>';
				resultArea.insertAdjacentHTML('beforeend',chkboxstr);
						}
				);
	}
}

function progressUpdate(packet){
	var statusText = document.getElementById('statusText');
	var progressbar = document.getElementById('progressbar');
	var log = document.getElementById('log');

	statusText.innerHTML = packet.status;
	if('progress' in packet){
		progressbar.value = packet.progress;
	}

/*
	if(packet.status == 'done'){
		var pre = document.createElement('pre')
		pre.appendChild(document.createTextNode(packet.data.text))
		line.innerHTML = ''
		log.appendChild(pre)
	}
*/

}
