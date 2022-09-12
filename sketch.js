
let map_data = `
012340
1ddgg1
2dwmg2
3mdgg3
4trdde
512345
`

let map_data2 = `
012345670
1ddggdwd1
2dwmgggg2
3mdgmwmg3
4trdddwd4
5ggggegg5
612345676
`

let map_data3= `
012345670
1ddggddd1
2dwmgrgg2
3mdggrmg3
4trdrddd4
5geggmgg5
612345676
`
let map_data4= `
012345670
1ddggddd1
2mwmgggg2
3mdgggmge
4trdrddd4
5ggggmgg5
612345676
`

let map_data5= `
01234567890
1ddggdddmg1
2dwmggggmg2
3mdgggmggg3
4trddddddd4
5ggggeggdd5
6ggmmggddm6
71234567897
`
let demo_map= `
01234567890
1dggggdttt1
2mgwwwgddr2
3dgggtddgg3
4drgmmrtgd4
5ddtmmmerm5
6dtmmtggdd6
01234567890
`

let mz = 10;
let cz = 50;


function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle){
  imageMode(CENTER);
  translate(img_x+img_width/2, img_y+img_width/2);
  rotate(-PI/180*img_angle);
  image(img, 0, 0, img_width, img_height);
  rotate(PI / 180 * img_angle);
  translate(-(img_x+img_width/2), -(img_y+img_width/2));
  imageMode(CORNER);
}


class WorldMap {

  constructor(map_data) {
    this.map_data = map_data;
    this.data = [];
    this.assets = {};
    this.rows = 0;
    this.cols = 0;
    this.goal = { x: -1, y: -1 };
    this.walkable = ['d', 'm', 'g', 'e'];
    this.costs = {
      e: 1, d: 1, g: 3, m: 6,
      r: 10000, t: 10000, w: 10000, b: 10000
    };
    this.setupMap();
    this.loadAssets();
  }

  setupMap() {
  
    let lines = this.map_data.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (line.length > 0) {
        this.data.push(line.split(''));
      }
    }
    this.rows = this.data.length;
    this.cols = this.data[0].length;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.data[i][j] == 'e') {
          this.goal = { x: j, y: i };
        }
      }
    }
  }

  loadAssets() {
    this.assets['d'] = loadImage('assets/dirt.png');
    this.assets['e'] = loadImage('assets/end.png');
    this.assets['g'] = loadImage('assets/grass.png');
    this.assets['m'] = loadImage('assets/mud.png');
    this.assets['r'] = loadImage('assets/rock.png');
    this.assets['t'] = loadImage('assets/tree.png');
    this.assets['w'] = loadImage('assets/water.png');
    this.assets['b'] = loadImage('assets/brick.png');
  }

  render() {
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < map.cols; j++) {
        let xpos = j * cz + mz;
        let ypos = i * cz + mz;
        fill(240);
        stroke(0);
        rect(xpos, ypos, cz, cz);
        fill(0);
        noStroke();
        //
        let a = 0;
        if (this.data[i][j] in this.assets) {
          if (this.data[i][j] == 'e') {
            rotate_and_draw_image(this.assets['b'], xpos, ypos, cz, cz, a);
          } else {
            rotate_and_draw_image(this.assets['d'], xpos, ypos, cz, cz, a);
          }
          rotate_and_draw_image(this.assets[this.data[i][j]], xpos, ypos, cz, cz, a);
        } else {
          rotate_and_draw_image(this.assets['b'], xpos, ypos, cz, cz, a);
          text(this.data[i][j], xpos, ypos, cz, cz);
        }
      }
    }
  }

  check_wall(x, y) {
    return !(this.walkable.includes(this.data[y][x]));
  }
}

class AgentState {
  constructor(x, y, o, assets) {
    this.x = x;
    this.y = y;
    this.o = o;
    this.angles = {n:180, e:90, s:0, w:270};
    if (!assets) {
      this.assets = {};
      this.loadAssets();
    } else {
      this.assets = assets;
    }

  }

  loadAssets() {
    this.assets['a'] = loadImage('assets/agent.png')
  }

  actions() {
    return ['moveF', 'turnL', 'turnR'];
  }

  cost() {
    let tile = map.data[this.y][this.x];
    return map.costs[tile];
  }

  transition(action) {
    let x = this.x;
    let y = this.y;
    let o = this.o;
    console.log(`111 : (${x},${y})  direction : ${o}`);
    console.log(action);
    if(action){
      if(action === 'moveF'){
        if( o === 'n'){y--}
        else if( o === 'e'){x++} 
        else if( o === 'w'){x--} 
        else if( o === 's'){y++} 
      }
      if(action === 'turnL'){
        // if( o === 'n'){x--; o = 'w'}
        // else if( o === 'e'){y--; o = 'n'} 
        // else if( o === 'w'){y++; o = 's'} 
        // else if( o === 's'){x++; o = 'e'} 
        if( o === 'n'){o = 'w'}
        else if( o === 'e'){ o = 'n'} 
        else if( o === 'w'){o = 's'} 
        else if( o === 's'){o = 'e'} 
      }
      if(action === 'turnR'){
        // if( o === 'n'){x++; o = 'e'}
        // else if( o === 'e'){y++; o = 's'}
        // else if( o === 'w'){y--; o = 'n'} 
        // else if( o === 's'){x--; o = 'w'} 
        if( o === 'n'){o = 'e'}
        else if( o === 'e'){o = 's'}
        else if( o === 'w'){o = 'n'} 
        else if( o === 's'){o = 'w'} 
      }
    }

console.log(`222 : (${x},${y})  direction : ${o}`);

    if (!map.check_wall(x, y)) {
      return new AgentState(x, y, o, this.assets);
    } else {
      return new AgentState(this.x, this.y, o, this.assets);
    }
  }

  render() {
    let xpos = this.x * cz + mz;
    let ypos = this.y * cz + mz;
    rotate_and_draw_image(
      this.assets['a'],
      xpos + cz / 5,
      ypos + cz / 4,
      cz / 1.5,
      cz / 2,
      this.angles[this.o]);
  }


  manhattan(x0, y0, x1, y1, o) {
    let directionCost = getDirectionCost(x0, y0, x1, y1, o);
    console.log(x0,y0,x1,y1, o);
    console.log(Math.abs(this.x - map.goal.x) +  Math.abs(this.y - map.goal.y)+directionCost*3);
    return Math.abs(this.x - map.goal.x) +  Math.abs(this.y - map.goal.y)+(directionCost);
  }

  euclidean(x0, y0, x1, y1, o) {
    let directionCost = getDirectionCost(x0, y0, x1, y1, o);
    return  Math.round(Math.sqrt(Math.pow(Math.abs(this.x - map.goal.x), 2) + Math.pow(Math.abs(this.y - map.goal.y), 2)))+(directionCost);
  }

  heuristic(type) {
    console.log(type);
    if(type === "euclidean"){ 
    return this.euclidean(this.x, this.y, map.goal.x, map.goal.y, this.o);
    } else if(type === "manhattan") return this.manhattan(this.x, this.y, map.goal.x, map.goal.y, this.o);
  }

  

  isGoal(){
      if(this.x === map.goal.x && this.y === map.goal.y){
        return true
      } return false
  }

}



class SearchNode {
  constructor(state, parent, action, heuristic='manhattan') {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.x = this.state.x;
    this.y = this.state.y;
    this.o = this.state.o;
    this.good = true
    if (parent) {
      this.g = parent.g + state.cost();
    } else {
      this.g = state.cost();
    }
    this.h = state.heuristic(heuristic)
    this.f = this.g + this.h;
  }

  value() {
    return this.f;
  }



  get_path() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node.action);
      node = node.parent;
    }
    return path.reverse();
  }

  get_path_nodes() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node);
      node = node.parent;
    }
    path.push(node);
    return path.reverse();
  }
}

class Explorer {
  constructor(start) {
    this.start = start;
    this.root = { node: this.start, children: [] };
    this.data = [];
    this.expand(this.root.node, this.root.children);
  }

  expand(node, children) {
    let actions = node.state.actions();
    children.splice(0, children.length)
    for (let i = 0; i < actions.length; i++) {
      let child = node.state.transition(actions[i]);
      if (child.x == node.x && child.y == node.y && child.o == node.o) {
        continue;
      }
      let childNode = new SearchNode(child, node, actions[i], htype);
      children.push({ node: childNode, children: [] });
    }
  }

  explorer(key) {
    let d = this.data[key];
    this.expand(d.node, d.children);
    history.splice(0, history.length);
    let nodes =  d.node.get_path_nodes();
    for(let i = 0; i < nodes.length; i++) {
      history.push(nodes[i]);
    }
    state = history[history.length - 1].state
    redraw();
    // this.renderSearchTree();
  }

  renderSearchTree() {
    let st = '';
    st = '<h3> Exploration Mode:</h3>';
    this.data.splice(0, this.data.length);
    st += '<div class="search-box"><ul>';
    st += this.renderNode(explorer.root.node, explorer.root.children);
    st += '</ul>';
    let explored_count = 0;
    let frontier_count = 0;
    for (let i = 0; i < explorer.data.length; i++) {
      if (explorer.data[i].children.length == 0) {
        // console.log(explorer.data[i].node.state);
        frontier_count += 1;
      } else {
        explored_count += 1;
      }
    }

    st += '</div>';
    st += '<h3>Explored: ' + explored_count + ' | Frontier: ' + frontier_count + '</h3>';
    divSearchTree.html(st);

    let all_li = selectAll('div.search-item');
    for (let i = 0; i < all_li.length; i++) {
      let key = all_li[i].attribute('data');
      all_li[i].mouseClicked(this.explorer.bind(this, key));
    }

  }


  renderNode(node, children) {
    let st = '';
     st = `<li><div class="search-item" data="${this.data.length}" data-f="${node.f}" data-node="(${node.x},${node.y})">`;
    if (node.action) {
      st += node.action + ' -> ';
    } else {
      st += 'S -> ';
    }
    st += node.x + ',' + node.y + ',' + node.o;
    fill(0, 0, 0);
    if (children.length == 0){
      st += ' <em>(g: ' + node.g + ')</em> ';
      st += ' <em>(g: ' + node.g + ', h: ' + node.h + ', f: '+node.f+')</em> '
      fill(0, 255, 0);
    }
    st += '</div><ul>';

    let xpos = node.x * cz + mz;
    let ypos = node.y * cz + mz;
    circle(xpos + cz / 2, ypos + cz / 2, 5);
    this.data.push({node: node, children: children});
    
    for (let i = 0; i < children.length; i++) {
      st += this.renderNode(children[i].node, children[i].children);
    }
    st += '</ul></li>';
    return st;
  }
}









// modified QueueElement & PriorityQueue  from https://www.delftstack.com/howto/javascript/priority-queue-javascript/
class QueueElement {
  constructor(element, priority, key) {
      this.element = element;
      this.priority = priority;
      this.key = key
  }
}
class PriorityQueue {
  constructor() {
      this.queueItems = [];
  }
  enqueueFunction(element, priority, key) {
      let queueElement = new QueueElement(element, priority, key);
      let contain = false;

      for (let i = 0; i < this.queueItems.length; i++) {
         
          if (this.queueItems[i].priority > queueElement.priority) {
              this.queueItems.splice(i, 0, queueElement);
              contain = true;
              break;
          }
      }
      /* if the input element has the highest priority push it to end of the queue */
      if (!contain) {
          this.queueItems.push(queueElement);
      }
  }
  dequeueFunction() {
      /* returns the removed element from priority queue. */
      if (this.isPriorityQueueEmpty()) {
          return "No elements present in Queue";
      }
      return this.queueItems.shift();
  }
  front() {
      /* returns the highest priority queue element without removing it. */
      if (this.isPriorityQueueEmpty()) {
          return "No elements present in Queue";
      }
      return this.queueItems[0];
  }
  rear() {
      /* returns the lowest priority queue element without removing it. */
      if (this.isPriorityQueueEmpty()) {
          return "No elements present in Queue";
      }
      return this.queueItems[this.queueItems.length - 1];
  }
  isPriorityQueueEmpty() {
      /* Checks the length of an queue */
      return this.queueItems.length === 0;
  }
  /* prints all the elements of the priority queue */
  printPriorityQueue() {
      let queueString = []
      for (let i = 0; i < this.queueItems.length; i++){
        queueString.push({
          "node" : `(${this.queueItems[i].element.x},${this.queueItems[i].element.y},${this.queueItems[i].element.o})`,
           "fcost" :  this.queueItems[i].priority,
           "index" : [i]
        })
      }
        return queueString;
  }
  getKeys(){
    let keyList = []
      for (let i = 0; i < this.queueItems.length; i++)
        keyList.push(this.queueItems[i].key)
      return keyList;
  }
  getSize(){
    return this.queueItems.length
  }
}



function resetToHistoryIndex(index) {
  state = history[index].state;
  history = history.slice(0, index + 1);
  redraw();
}

function renderHistory(){
  let his = '<h3> History: </h3>';
  his += '<ol>';
  let totalE = 0;
  for (let i = 0; i < history.length; i++) {
    if (history[i].action){
      his += '<li>' + history[i].action + ' -> ';
    } else {
      his += '<li> S -> ';
    }
    his += history[i].state.x + ',' + history[i].state.y + ',' + history[i].state.o + ' | ';
    his += 'energy: ' + history[i].state.cost();
    totalE += history[i].state.cost();
    if (map.data[history[i].state.y][history[i].state.x] == 'e') {
      his += ' |🏁';
    }
    his += '<span>⎌</span>'
    his + '</li>';
    ellipse(history[i].state.x*cz+mz+25, history[i].state.y*cz+mz+25, 10, 10); // rect(x, y, width, height)

  }
  his += '</ol>';
  his += '<h3>Steps: ' + history.length + ' | Total Energy: ' + totalE + ' </h3>';
  divElement.html(his);
  let all_li = selectAll('div.history ol li');
  for (let i = 0; i < all_li.length; i++) {
    all_li[i].mouseClicked(resetToHistoryIndex.bind(this, i));
  }
}


let map;
let state;
let history = [];
let divElement;
let btnDown;
let btnUp;
let btnLeft;
let btnRight;
let initState;
let htype;
function preload(map_=map_data) {
  
  map = new WorldMap(map_);
  console.log(map);
  initState = {x: 1 , y: 1, o: 's'};
  state = new AgentState(initState.x, initState.y, initState.o);
  let start = new SearchNode(state, null, null)
  explorer = new Explorer(start)
  history.push({state, action: null});

}

function setup() {
  console.log(map.cols, map.cols);
  canvas = createCanvas(cz * map.cols + mz * 2, cz * map.rows + mz * 2);
  divElement = createDiv();
  divElement.addClass('history')
  divElement.position(cz * map.cols + mz * 2, 0);
  divSearchTree = createDiv();
  divSearchTree.addClass('search-tree')
  divSearchTree.position(0, cz * map.rows + mz * 2)

  divElement2 = createDiv();
  divElement2.position(630,map.rows + mz*30)
  divElement2.html('<h3 class="al">Select  Algorithm :</h3>');

  selAlg = createSelect();
  selAlg.position(650, cz * map.rows + mz * 8 );
  selAlg.option('UCS');
  selAlg.option('greedy');
  selAlg.option('A*');
  selAlg.selected('A*');
  selAlg.changed(mySelectEvent);

  selH = createSelect();
  selH.position(740, cz * map.rows + mz * 8 );
  selH.option('manhattan');
  selH.option('euclidean');
  selH.changed(selectH);


  selMap = createSelect();
  selMap.position(650, cz * map.rows + mz * 20 );
  selMap.option('map_data');
  selMap.option('map_data2');
  selMap.option('map_data3');
  selMap.option('map_data4');
  selMap.option('map_data5');
  selMap.option('demo_map');
  selMap.changed(selectMap);



  btnSearch = createButton('Search');
  btnSearch.position(650, cz * map.rows + mz * 12 );
  btnSearch.mousePressed(function () {search(selAlg.value(), selH.value())});

  btnClear = createButton('Clear');
  btnClear.position(740, cz * map.rows + mz * 12 );
  btnClear.mousePressed(function () {Clear()});
 
  redraw();
  noLoop();

}

function selectMap(){
  let newmap ;
  let value = selMap.value();
  let alg = selAlg.value();
  htype = selH.value()
  if(selMap.value() === "map_data"){ newmap = map_data}
  if(selMap.value() === "map_data2"){ newmap = map_data2}
  if(selMap.value() === "map_data3"){ newmap = map_data3}
  if(selMap.value() === "map_data4"){ newmap = map_data4}
  if(selMap.value() === "map_data5"){ newmap = map_data5}
  if(selMap.value() === "demo_map"){ newmap = demo_map}



  canvas.remove();
  divSearchTree.remove();
  divElement.remove();
  divElement2.remove();
  selH.remove();
  selAlg.remove();
  selMap.remove();
  btnSearch.remove();
  btnClear.remove();
  map = new WorldMap(newmap)
  setup();
  selH.selected(htype);
  selMap.selected(value);
  selAlg.selected(alg);

  start = new SearchNode(state, null, null, htype)
  explorer = new Explorer(start)
  explorer.renderSearchTree()
  loop();
  setTimeout(()=>{ noLoop()
  }, 300)
}

function mySelectEvent() {
  let selItem = selAlg.value();
  if(selItem  != 'UCS'){
    selH.show()
  }   else  selH.hide()

}

function selectH(){
  htype = selH.value()
  let alg = selAlg.value();

  canvas.remove();
  divSearchTree.remove();
  divElement.remove();
  divElement2.remove();
  selH.remove();
  selAlg.remove();
  selMap.remove();
  btnSearch.remove();
  btnClear.remove();
  setup();
  selH.selected(htype);
  selAlg.selected(alg);

  start = new SearchNode(state, null, null, htype)
  explorer = new Explorer(start)
  explorer.renderSearchTree()
  }


function draw() {
  background(220);
  map.render();
  state.render();
  renderHistory();
  explorer.renderSearchTree();
  // p.style('font-size', '24px');
  // p.style('font-size', '24px');
  // console.log(`state : (${state.x},${state.y})  direction : ${state.o}`);
}

function keyReleased() {
  let action = 0;
  if (keyCode === UP_ARROW) {
    action = 'moveF';
  } else if (keyCode === DOWN_ARROW) {
    action = 'moveF';
  } else if (keyCode === LEFT_ARROW) {
    action = 'turnL';
  } else if (keyCode === RIGHT_ARROW) {
    action = 'turnR';
  }
  transition(action)
}

function transition(action) {
  if (state.actions().includes(action)) {
    state = state.transition(action);
    history.push({state, action});
    redraw();
  }
}
function Clear(){
location.reload();
}

 async function search(Algorithm, heuristic){
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
    console.log("start searching!", Algorithm, heuristic);
    btnSearch.attribute('disabled', '');
    selMap.attribute('disabled', '');
    selH.attribute('disabled', '');
    selAlg.attribute('disabled', '');

    let frontierPQ = new PriorityQueue();
    let exploredSet = []
    initExplored = `(${initState.x},${initState.y},${initState.o})`;
    exploredSet.push(initExplored)

    if(Algorithm === 'A*'){

      explorer.data.forEach((e,index) => {
        let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
          if(!exploredSet.includes(childNode)){
            frontierPQ.enqueueFunction(e.node , e.node.value(), index );
          }
        });
        console.log(exploredSet);
        let frontier = frontierPQ.printPriorityQueue();
        console.log(frontier);
        // let pickNode = frontierPQ.dequeueFunction()
        // console.log(pickNode);
        let pickNode
        let j = 0 ;
        while(!state.isGoal() ){
          if(frontier.length > 0 ){
            pickNode = frontierPQ.dequeueFunction()
            childNode = `(${pickNode.element.x},${pickNode.element.y},${pickNode.element.o})`
             key = getKey(pickNode);
            explorer.explorer(key)
            exploredSet.push(childNode)

            let flist = frontier.map(a => a.node); // get frontier value array list
            explorer.data.forEach((e,index) => { // add new node to frontier
              let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
                if(!exploredSet.includes(childNode)){
                  if(flist.includes(childNode)){
                    getfrotier = frontier.find(e=> e.node === childNode )
                    if(e.node.f < getfrotier.fcost){
                      frontier = frontier.filter(e=>{ return e != getfrotier })
                      frontierPQ.enqueueFunction(e.node , e.node.value(), index );
                      frontier = frontierPQ.printPriorityQueue();
                      return
                    }
                    return
                  }
                  frontierPQ.enqueueFunction(e.node , e.node.value(), index );
                }
              });
              frontier = frontierPQ.printPriorityQueue();
            // explored.push(selectNode.attribute('data-node') )
            // frontier = frontier.filter(e =>{ return e != selectNode.attribute('data-node') })
        
            console.log("frontier : ", frontier);
            console.log("explored : ", exploredSet);
            await sleep(100)
            j++

          }else { console.log("no solution") 
          return } 
        }
        if(state.isGoal()){ 
          goalDiv = createDiv();
          goalDiv.position( 635,cz* map.rows + mz*15)
          goalDiv.html(`<h3 class="goal"> we found the goal ! 🏁 with iteration ="${j}" </h3>`);
        }

    }

    if(Algorithm === 'UCS'){

      explorer.data.forEach((e,index) => {
        let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
          if(!exploredSet.includes(childNode)){
            frontierPQ.enqueueFunction(e.node , e.node.g, index );
          }
        });
        console.log(exploredSet);
        let frontier = frontierPQ.printPriorityQueue();
        console.log(frontier);
        // let pickNode = frontierPQ.dequeueFunction()
        // console.log(pickNode);
        let pickNode
        let j = 0 ;
        while(!state.isGoal() ){
          if(frontier.length > 0 ){
            pickNode = frontierPQ.dequeueFunction()
            childNode = `(${pickNode.element.x},${pickNode.element.y},${pickNode.element.o})`
             key = getKey(pickNode);
            explorer.explorer(key)
            exploredSet.push(childNode)

            let flist = frontier.map(a => a.node); // get frontier value array list

            explorer.data.forEach((e,index) => { // add new node to frontier
              let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
                if(!exploredSet.includes(childNode)){
                  if(flist.includes(childNode)){
                    getfrotier = frontier.find(e=> e.node === childNode )
                    if(e.node.g < getfrotier.fcost){
                      frontier = frontier.filter(e=>{ return e != getfrotier })
                      frontierPQ.enqueueFunction(e.node , e.node.g, index );
                      frontier = frontierPQ.printPriorityQueue();
                      return
                    }
                    return
                  }
                  frontierPQ.enqueueFunction(e.node , e.node.g, index );
                }
              });
              console.log(exploredSet);
              frontier = frontierPQ.printPriorityQueue();
            // explored.push(selectNode.attribute('data-node') )
            // frontier = frontier.filter(e =>{ return e != selectNode.attribute('data-node') })
        
            console.log("frontier : ", frontier);
            console.log("explored : ", exploredSet);
            await sleep(100)
            j++

          }else { console.log("no solution") 
          return } 
        }
        if(state.isGoal()){ 
          goalDiv = createDiv();
          goalDiv.position( 635,cz* map.rows + mz*15)
          goalDiv.html(`<h3 class="goal"> we found the goal ! 🏁 with iteration ="${j}" </h3>`);
        }


    }
    
    if(Algorithm === 'greedy'){

      explorer.data.forEach((e,index) => {
        let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
          if(!exploredSet.includes(childNode)){
            frontierPQ.enqueueFunction(e.node , e.node.h, index );
          }
        });
        console.log(exploredSet);
        let frontier = frontierPQ.printPriorityQueue();
        console.log(frontier);
        // let pickNode = frontierPQ.dequeueFunction()
        // console.log(pickNode);
        let pickNode
        let j = 0 ;
        while(!state.isGoal() ){
          if(frontier.length > 0 ){
            pickNode = frontierPQ.dequeueFunction()
            childNode = `(${pickNode.element.x},${pickNode.element.y},${pickNode.element.o})`
             key = getKey(pickNode);
            explorer.explorer(key)
            exploredSet.push(childNode)

            let flist = frontier.map(a => a.node); // get frontier value array list

            explorer.data.forEach((e,index) => { // add new node to frontier
              let childNode = `(${e.node.x},${e.node.y},${e.node.o})`
                if(!exploredSet.includes(childNode)){
                  if(flist.includes(childNode)){
                    getfrotier = frontier.find(e=> e.node === childNode )
                    if(e.node.h < getfrotier.fcost){
                      frontier = frontier.filter(e=>{ return e != getfrotier })
                      frontierPQ.enqueueFunction(e.node , e.node.h, index );
                      frontier = frontierPQ.printPriorityQueue();
                      return
                    }
                    return
                  }
                  frontierPQ.enqueueFunction(e.node , e.node.h, index );
                }
              });
              console.log(exploredSet);
              frontier = frontierPQ.printPriorityQueue();
            // explored.push(selectNode.attribute('data-node') )
            // frontier = frontier.filter(e =>{ return e != selectNode.attribute('data-node') })
        
            console.log("frontier : ", frontier);
            console.log("explored : ", exploredSet);
            await sleep(100)
            j++

          }else { console.log("no solution") 
          return } 
        }
        if(state.isGoal()){ 
          goalDiv = createDiv();
          goalDiv.position( 635,cz* map.rows + mz*15)
          goalDiv.html(`<h3 class="goal"> we found the goal ! 🏁 with iteration ="${j}" </h3>`);
        }


    }


}



function getKey(node){

  let key
  explorer.data.forEach((e,index) => { // add new node to frontier
    if(e.node === node.element){
      key = index ;
    }
    });
    return key

}


function getDirectionCost(x0, y0, x1, y1, o){

  if(x1 > x0 && y1 > y0 ){ // se
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 0.5}
    else if(o === 'w'){directionCost = 1}
    else if(o === 's'){directionCost = 0.5}
  }
  if(x1 < x0 && y1 < y0 ){ // sw
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 1}
    else if(o === 'w'){directionCost = 0.5}
    else if(o === 's'){directionCost = 0.5}
  }
  if(x1 > x0 && y1 < y0 ){ // ne
    if(o === 'n'){directionCost = 0.5}
    else if(o === 'e'){directionCost = 0.5}
    else if(o === 'w'){directionCost = 1}
    else if(o === 's'){directionCost = 1}
  }   
   if(x1 < x0 && y1 > y0 ){ // sw
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 1}
    else if(o === 'w'){directionCost = 0.5}
    else if(o === 's'){directionCost = 0.5}
  }
  if(x1 === x0 && y1 > y0 ){  //s
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 1}
    else if(o === 'w'){directionCost = 1}
    else if(o === 's'){directionCost = 0}
  }
  if(x1 === x0 && y1 < y0 ){  //n
    if(o === 'n'){directionCost = 0}
    else if(o === 'e'){directionCost = 1}
    else if(o === 'w'){directionCost = 1}
    else if(o === 's'){directionCost = 1}
  }
  if(x1 > x0 && y1 === y0 ){  //e
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 0}
    else if(o === 'w'){directionCost = 1}
    else if(o === 's'){directionCost = 1}
  }
  if(x1 < x0 && y1 === y0 ){  //w
    if(o === 'n'){directionCost = 1}
    else if(o === 'e'){directionCost = 1}
    else if(o === 'w'){directionCost = 0}
    else if(o === 's'){directionCost = 1}
  }
  return directionCost;
}

