/**
 * Created by Fly on 2018/5/30.
 */

var oLevel = document.getElementById("level"),
    oStart = document.getElementById("level").getElementsByTagName("li"),
    oBox = document.getElementById("box"),
    oMap = document.getElementById("map"),
    oScore = document.getElementById("score"),
    oRes = document.getElementById("restart"),
    oFire = document.getElementById("fire"),
    allBiu = oFire.children;

//console.log(oStart);

//启动
exe();
function exe() {
    for (var i = 0 , length = oStart.length ; i < length; i++) {
        (function (i) {
            oStart[i].onclick = function (ev) {
                ev = ev || window.event;
                startGame(i,{
                    x : ev.clientX - oBox.offsetLeft,
                    y : ev.clientY - oBox.offsetTop
                });
            }
        })(i)
    }
}
//restart的点击
oRes.children[2].onclick = function () {
    cancelAnimationFrame(oMap.timer);
    oRes.style.display = "none";
    oLevel.style.display = "block";
    oScore.innerHTML = 0;
    oMap.innerHTML = "<div id='fire'></div>";
    oFire = document.getElementById("fire");
    allBiu = oFire.children;
};
//开始游戏
function startGame(level,pos) {
    // console.log(level)
    clear();
    runBG(level);
    var p = plane(level,pos);
    enemy(level,p);
    oBox.score = 0;
}
//执行隐藏关卡
function clear() {
    oScore.style.display = "block";
    oLevel.style.display = "none";
}
//背景选择与运动
function runBG(level) {
    oMap.style.backgroundImage = "url('img/bg_"+(level+1)+".jpg')";

    (function m() {
        oMap.bgY = oMap.bgY || 0;
        oMap.bgY++;
        oMap.style.backgroundPositionY = oMap.bgY + "px";
        oMap.timer = requestAnimationFrame(m);
    })()
}
//我方军机登场
function plane(level,pos) {
    //添加我军图片
    var oImg = new Image();
    oImg.src = "img/plane_0.png";
    oImg.width = 70;
    oImg.height = 70;
    oImg.className = "plane";
    oImg.style.left = pos.x - oImg.width/2 + "px";
    oImg.style.top = pos.y - oImg.height/2 + "px";
    oMap.appendChild(oImg);
    //获取边界值
    var leftMin = -oImg.width/2;
    leftMax = oMap.clientWidth - oImg.width/2;
    topMin = -oImg.height/2;
    topMax = oMap.clientHeight - oImg.height/2;
    //获取mousemove事件
    document.onmousemove = function (ev) {
        ev = ev || window.event;
        var left = ev.clientX - oBox.offsetLeft - oImg.width/2;
        Top = ev.clientY - oBox.offsetTop - oImg.height/2;
        left = Math.max(leftMin,left);
        left = Math.min(leftMax,left);
        Top = Math.max(topMin,Top);
        Top = Math.min(topMax,Top);
        //为军机坐标赋值
        oImg.style.left = left + "px";
        oImg.style.top = Top +"px"
    };
    fire(oImg,level);
    return oImg;
}
//我方军机发射子弹
function fire(oImg,level) {
    oBox.oBiuInterVal = setInterval(function () {
        createBiu()
    },[200,100,80,15][level]);
    //createBiu();
    //我军创建子弹
    function createBiu() {
        var oBiu = new Image();
        oBiu.src = "img/fire.png";
        oBiu.width = 30;
        oBiu.height = 30;
        oBiu.className = "biu";
        left = oImg.offsetLeft + oImg.width/2 - oBiu.width/2 - 1;
        Top = oImg.offsetTop - oBiu.height + 5;
        //console.log(left,Top);
        oBiu.style.left = left + "px";
        oBiu.style.top = Top + "px";
        oFire.appendChild(oBiu);
        //子弹运动
        function m() {
            if (oBiu.parentNode){
                var top = oBiu.offsetTop - 20;
                if (top < -oBiu.height){
                    oFire.removeChild(oBiu);
                }else{
                    oBiu.style.top = top +"px";
                    requestAnimationFrame(m);
                }
            }
        }
        setTimeout(function () {
            requestAnimationFrame(m)
        },20)
    }
}
//创建敌军
function enemy(level,oPlane) {
    var speed = [5,6,8,8][level];
    var num = 1;
    oBox.enemyInterVal = setInterval(function () {
        var index = num%30?1:0;//每三十架小飞机生成一架大飞机
        //生成敌军
        var oEnemy = new Image();
        oEnemy.index = index;
        oEnemy.src = "img/" + ["enemy_big","enemy_small"][index] + ".png";
        oEnemy.HP = [20,1][index];
        oEnemy.speed = speed + (Math.random()*0.6-0.3)*speed;
        oEnemy.speed *=index?1:0.5;
        oEnemy.width = [104,54][index];
        oEnemy.height = [80,40][index];
        oEnemy.className = "enemy";
        oEnemy.style.left = Math.random()*oBox.clientWidth - oEnemy.width/2 + "px";
        oEnemy.style.top = -oEnemy.height + "px";
        oMap.appendChild(oEnemy);//生成敌机
        num++;
        //敌军运动
        function e() {
            if (oEnemy.parentNode){
                var top = oEnemy.offsetTop;
                top +=oEnemy.speed;
                if (top > oBox.clientHeight){
                    oBox.score -=oEnemy.index?1:5;
                    oScore.innerHTML = oBox.score;
                    oMap.removeChild(oEnemy);//敌机飞出界面后清除
                }else{
                    oEnemy.style.top = top + "px";
                    //子弹碰撞
                    for (var i = allBiu.length - 1; i >= 0; i--) {
                        var objBiu = allBiu[i];
                        if ( coll(oEnemy,objBiu) ){
                            //console.log(1);
                            oFire.removeChild(objBiu);//与子弹碰撞后清除子弹
                            oEnemy.HP--;
                            if (!oEnemy.HP){
                                oBox.score += oEnemy.index?2:10;
                                oScore.innerHTML = oBox.score;
                                boom(oEnemy.offsetLeft,oEnemy.offsetTop,oEnemy.width,oEnemy.height,index?0:1);//敌军爆炸
                                oMap.removeChild(oEnemy);//与子弹碰撞后清除敌机
                                return;
                            }

                        }
                    }
                    //我军碰撞
                    if ( oPlane.parentNode && coll(oEnemy,oPlane) ){
                        //console.log(2);
                        boom(oEnemy.offsetLeft,oEnemy.offsetTop,oEnemy.width,oEnemy.height,index?0:2);//敌军爆炸图
                        boom(oPlane.offsetLeft,oPlane.offsetTop,oPlane.width,oPlane.height,2);//我军爆炸图
                        oMap.removeChild(oEnemy);//移除敌军
                        oMap.removeChild(oPlane);//移除我军
                        GameOver();
                        return;
                    }
                    requestAnimationFrame(e)
                }
            }

        }
        requestAnimationFrame(e)
    },[350,150,120,40][level]);

}
//爆炸图
function boom(l,t,w,h,i) {
    var oBoom = new Image();
    oBoom.src = "img/" + ["boom_small","boom_big","plane_0"][i] + ".png";
    oBoom.width = w;
    oBoom.height = h;
    oBoom.className = 'boom'+["","","2"][i];
    oBoom.style.left = l + "px";
    oBoom.style.top = t + "px";
    oMap.appendChild(oBoom);
    //console.log(oBoom.offsetLeft);
    setTimeout(function () {
        oBoom.parentNode && oMap.removeChild(oBoom);
    },[1200,1200,2500][i])
}


//碰撞检测
function coll(obj1,obj2) {
    var T1 = obj1.offsetTop;
    B1 = T1 + obj1.clientHeight;
    L1 = obj1.offsetLeft;
    R1 = L1 + obj1.clientWidth;

    var T2 = obj2.offsetTop;
    B2 = T2 + obj2.clientHeight;
    L2 = obj2.offsetLeft;
    R2 = L2 + obj2.clientWidth;
    //console.log(1);

    return !(B1 < T2 || T1 > B2 || R1 < L2 || L1 > R2);
}
//游戏结束
function GameOver() {
    document.onmousemove = null;
    clearInterval(oBox.oBiuInterVal);
    clearInterval(oBox.enemyInterVal);
    restart();
}
//结算，重新开始
function restart() {
    oScore.style.display = "none";
    var s = oBox.score;
    var honor;
    if ( s < 0){
        honor = "菜抠脚"
    }else if ( s < 500){
        honor = "你适合开会员"
    }else if ( s < 800){
        honor = "渐入佳境"
    }else if ( s < 1100 ){
        honor = "初级打飞机";
    }else if ( s < 1400 ){
        honor = "中级打飞机";
    }else if ( s < 1700 ){
        honor = "高级打飞机";
    }else if ( s < 2000 ){
        honor = "撸管王";
    }else if ( s< 5000){
        honor = "吊炸天"
    }else{
        honor = "孤独求败！";
    }
    oRes.style.display = "block";
    oRes.children[0].children[0].innerHTML = s;
    oRes.children[1].children[0].innerHTML = honor;

}











