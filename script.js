//添加节点。。。。。。
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");

//渲染上下文变量,只能填2d
const ctx = canvas.getContext("2d");

let grade = 0; //分数变量
let tempStart = 0;
let tempEnd = 0;
let tempChangeValue = 0;
let slidingLongnew = 0;
//行列
const bricksRowCount = 9;
const bricksColumnCount = 5;

//创建球体
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10, //直径
  speed: 4,
  dx: -4, //x轴，负数代表左边，整数代表右边
  dy: 4, //y轴，负数代表下降，整数代表上升
};

//创建挡板
const plank = {
  x: canvas.width / 2 - 40, //减去自身长度一半
  y: canvas.height - 20,
  speed: 12,
  w: 80,
  h: 10,
  dx: 0,
};

//创建单个方块
const brickInfo = {
  w: 70,
  h: 20,
  offsetX: 45,
  offsetY: 60,
  visible: true,
  padding: 10,
};

//创建方块群
const bricks = [];

for (let i = 0; i < bricksRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < bricksColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX; //因为每个方块都有padding不用两边都有，否则中间会多一倍
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo }; //{}里面填写的是数组中每个元素的信息
    // '...'扩展运算符ES6 用于展开对象和数组信息，不能用于多重嵌套得对象和数组
  }
}
// console.log({...brickInfo})

//绘制小球
function drawball() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2); //绘制圆形：x，y，直径，起始角，结束角2个180°
  ctx.fillStyle = "red"; //填充颜色
  ctx.fill(); //填充当前绘图（路径）
  ctx.closePath();
}

//绘制挡板
function drawplank() {
  ctx.beginPath();
  ctx.rect(plank.x, plank.y, plank.w, plank.h); //绘制方形：x，y，宽，高
  ctx.fillStyle = "#0095dd"; //填充颜色
  ctx.fill(); //填充当前绘图（路径）
  ctx.closePath();
}

//绘制分数
function drawgrade() {
  ctx.font = "italic bold 20px arial"; //Arial字体，italic斜体
  ctx.fillText(`得分：${grade}`, canvas.width - 100, 30); //因为有变量所有要用模板符号`` ,后面两个值是x和y定位
}

//绘制方块群
function drawbricks() {
  bricks.forEach((row) => {
    row.forEach((col) => {
      ctx.beginPath();
      ctx.rect(col.x, col.y, col.w, col.h);
      ctx.fillStyle = col.visible ? "#9c5e2c" : "transparent"; //有color属性的值可以用transparent来指定全透明色彩。
      ctx.fill();
      ctx.closePath();
    });
  });
}

//动画函数
//移动挡板动画
function movePlank(e) {
  plank.x += plank.dx;

  //设置边界
  if (plank.x + plank.w > canvas.width) {
    plank.x = canvas.width - plank.w;
  }
  if (plank.x < 0) {
    plank.x = 0;
  }
}

//撞击球体动画
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  //设置画布反弹边界
  //左右
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1; //相反数，相当于反弹
  }

  //上下
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    //圆的原点在圆心
    ball.dy *= -1; //相反数，相当于反弹
  }

  //设置挡板反弹边界
  //把挡板用边界包起来，来实现碰撞区域
  if (
    ball.y + ball.size > plank.y && //挡板顶部
    ball.x - ball.size > plank.x && //挡板左边
    ball.x + ball.size < plank.x + plank.w && //挡板右边
    ball.y - ball.size < plank.y + plank.w //挡板底部
  ) {
    ball.dy = -ball.speed; //让它重新上升就好，因为原本的状态是下降
  }

  //设置撞击砖块效果
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        //把砖块用边界包起来，来实现碰撞区域
        if (
          ball.y + ball.size > brick.y && //砖块顶部
          ball.x - ball.size > brick.x && //砖块左侧
          ball.x + ball.size < brick.x + brick.w && //砖块右侧
          ball.y - ball.size < brick.y + brick.h
        ) {
          //砖块底侧
          ball.dy *= -1;
          brick.visible = false; //消除砖块
          increaseGrade(); //增加分数
        }
      }
    });
  });

  //挡板没有接住小球
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    grade = 0;
  }
}

//增加得分
function increaseGrade() {
  grade++;
  if (grade / (bricksRowCount * bricksColumnCount) == 1) {
    showAllBricks();
  }
}

//重新展示所有砖块
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      brick.visible = true;
    });
  });
}

//所有绘制函数
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //清除整个画布，实现页面刷新
  drawball();
  drawplank();
  drawgrade();
  drawbricks();
}

//创建update函数，更新所有绘制函数和动画
function update() {
  //动画函数
  movePlank();
  moveBall();

  //所有的绘制函数
  draw();

  //这个方法是，每次浏览器执行的时候都要重绘动画和绘制函数
  requestAnimationFrame(update);
}

update();

//键盘函数
function keydown(e) {
  // console.log(e.key)
  if (e.key == "ArrowRight" || e.key == "Right") {
    plank.dx = plank.speed;
  } else if (e.key == "ArrowLeft" || e.key == "left") {
    plank.dx = -plank.speed;
  }
}
function keyup(e) {
  // console.log(e.key)
  if (
    e.key == "ArrowRight" ||
    e.key == "Right" ||
    e.key == "ArrowLeft" ||
    e.key == "left"
  ) {
    plank.dx = 0;
  }
}

//触摸屏滑动事件

function ontouchstsart(e) {
  let touch = e.touches[0];
  let startPos = touch.pageX;
  tempStart = startPos;
  console.log(tempStart);
  console.log(plank.x);
}

function ontouchmove(e) {
  e.preventDefault();
  let touch = e.touches[0];
  let endPos = touch.pageX;
  tempEnd = endPos;
  tempChangeValue = Math.abs(tempEnd) - Math.abs(tempStart);
  let slidingLongold = Math.abs(tempChangeValue);
  slidingLongChange = slidingLongnew - slidingLongold;
  if (tempChangeValue < 0) {
    plank.x += slidingLongChange;
  } else if (tempChangeValue > 0) {
    plank.x -= slidingLongChange;
  }
  //记录新值
  slidingLongnew = slidingLongold;
  let a = new Array();
  a[0] = tempStart;
  a[1] = tempEnd;
  a[2] = slidingLongChange;
  console.log(a);
  return false;
}

function ontouchend(e) {
  if (tempEnd) {
    plank.dx = 0;
    tempChangeValue = 0;
    slidingLongnew = 0;
  }
}

//事件监听

document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);
document.addEventListener("touchstart", ontouchstsart);
document.addEventListener("touchmove", ontouchmove, { passive: false });
document.addEventListener("touchend", ontouchend);
// document.onselectstart = function(){return false;};

openBtn.addEventListener("click", () => {
  rules.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  rules.classList.remove("show");
});
