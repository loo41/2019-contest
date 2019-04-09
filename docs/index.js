window.onload = function() {
  const sokoban = getNode('#sokoban') // 盒子
  const taxNode = getNode('.tax')
  const reset = getNode('.reset')
  const taxOption = getNode('.tax-option')
  let SIZE = 60 // 尺寸定义
  let nodeData = [] // 保存节点
  let sokobanData = [] // 深度复制一份当前关卡数据
  let tax // 当前关卡
  let type // 端类型

  // 判断端类型 true 为移动端
  (function () {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
      return type = true
    }
    type = false
  })()


  // 获取节点
  function getNode(node) {
    return document.querySelector(node)
  }

  // 初始化
  function init(data, index) {
    clear()
    tax = index
    data = sokobanData = JSON.parse(JSON.stringify(data[index]))
    setSize()
    const fragment = document.createDocumentFragment()
    data.map.forEach(item => {
      for (let i = 0, len = item.length; i < len; i++) {
        const node = document.createElement('div')
        switch(item[i]) {
          case 0:
            node.className = 'none'
            break;
          case 1:
            node.className = 'wall'
            break;
          case 2:
            node.className = 'target'
            break;
          default:
            node.className = 'bg'
        }
        taxNode.innerText = `当前关卡 ${index + 1}`
        node.style.cssText = `height: ${SIZE}${type? 'vw': 'px'}; width: ${SIZE}${type? 'vw': 'px'}`
        nodeData.push(node)
        fragment.appendChild(node)
      }
    })
    taxOption.selectedIndex = index
    nodeData[(data.people.y * data.map[0].length) + data.people.x].className = 'person'
    data.dot.forEach((item) => {
      nodeData[(item.y * data.map[0].length) + item.x].className = 'box'
    })
    sokoban.appendChild(fragment)
  }

  // 绑定事件
  function evt() {
    console.log('pp')
    if (type) {
      // m
      let startX, startY
      document.addEventListener('touchstart', function(e){
        startX = e.changedTouches[0].pageX
        startY = e.changedTouches[0].pageY
      })
      document.addEventListener('touchend', function(e){
        endX = e.changedTouches[0].pageX
        endY = e.changedTouches[0].pageY
        distanceX = endX - startX
        distanceY = endY - startY
        if(Math.abs(distanceX) > Math.abs(distanceY) && distanceX > 0) {
          _move('right')
        }else if(Math.abs(distanceX) > Math.abs(distanceY) && distanceX < 0) {
          _move('left')
        }else if(Math.abs(distanceX) < Math.abs(distanceY) && distanceY < 0) {
          _move('top')
        }else if(Math.abs(distanceX) < Math.abs(distanceY) && distanceY > 0) {
          _move('bottom')
        }
      })
    } else {
      // pc
      document.addEventListener('keydown', function(e) {
        // 解决浏览器返回bug
        e.preventDefault()
        let dir
        switch(e.keyCode) {
          case 37:
            dir = "left"
          break;
          case 39:
            dir = "right"
          break;
          case 38:
            dir = "top"
          break;
          case 40:
            dir = "bottom"
          break
        }
        _move(dir)
      })
    }
    reset.onclick = () => {init(passData, tax)}
    reset.click()
    taxOption.onchange = () => {
      init(passData, taxOption.selectedIndex)
    }
  }

  function _move(dir) {
    let personX = sokobanData.people.x
    let personY = sokobanData.people.y
    let isDot = sokobanData.map[personY][personX] === 2
    let locNode = personY * sokobanData.map[0].length + personX
    let index // 条件判断索引
    if (dir === 'right' && isCond(personX, personY, dir)) {
      const y = locNode + 1
      nodeData[locNode].className = isDot? 'target' : 'bg'
      if (index = isExist(sokobanData.dot, personX + 1, personY) + 1) {
        index -= 1
        nodeData[locNode + 2].className = 'box'
        sokobanData.dot[index].x += 1
      }
      nodeData[y].className = 'person'
      sokobanData.people.x += 1
    } else if (dir === 'bottom' && isCond(personX, personY, dir)) {
      const y = (personY + 1) * sokobanData.map[0].length + personX
      nodeData[locNode].className = isDot? 'target' : 'bg'
      if (index = isExist(sokobanData.dot, personX, personY + 1) + 1) {
        index -= 1 // 解决 0 不能通过
        nodeData[(personY + 2) * sokobanData.map[0].length + personX].className = 'box'
        sokobanData.dot[index].y += 1
      }
      nodeData[y].className = 'person'
      sokobanData.people.y += 1
    } else if (dir === 'top' && isCond(personX, personY, dir)) {
      const y = (personY - 1) * sokobanData.map[0].length + personX
      nodeData[locNode].className = isDot? 'target' : 'bg'
      if (index = isExist(sokobanData.dot, personX, personY - 1) + 1) {
        index -= 1
        nodeData[(personY - 2) * sokobanData.map[0].length + personX].className = 'box'
        sokobanData.dot[index].y -= 1
      }
      nodeData[y].className = 'person'
      sokobanData.people.y -= 1
    } else if (dir === 'left' && isCond(personX, personY, dir)) {
      const y = locNode - 1
      nodeData[locNode].className = isDot? 'target' : 'bg'
      if (index = isExist(sokobanData.dot, personX - 1, personY) + 1) {
        index -= 1
        nodeData[locNode - 2].className = 'box'
        sokobanData.dot[index].x -= 1
      }
      nodeData[y].className = 'person'
      sokobanData.people.x -= 1
    }
    if (isPass()) {
      setTimeout(() => nextTax(), 0)
    }
  }

  function nextTax() {
    if (passData.length - 1 === tax) {
      alert('恭喜你通过了所有关卡，回到原始')
      clear()
      return init(passData, 0)
    } else {
      alert('恭喜你进入下一关')
    }
    init(passData, tax + 1)
  }

  // 判断是否符合条件
  function isCond(x, y, dir) {
    const map = sokobanData.map
    const dot = sokobanData.dot
    if (dir === 'right' && map[y][x + 1] !== 1) {
      if (isExist(dot, x + 1, y, true) && isExist(dot, x + 2, y, true) || 
          isExist(dot, x + 1, y, true) && map[y][x + 2] === 1) {
        return false
      }
      return true
    } else if (dir === 'left' && map[y][x - 1] !== 1) {
      if (isExist(dot, x - 1, y, true) && isExist(dot, x - 2, y, true) || 
          isExist(dot, x - 1, y, true) && map[y][x - 2] === 1) {
        return false
      }
      return true
    } else if (dir === 'bottom' && map[y + 1][x] !== 1) {
      if (isExist(dot, x, y + 1, true) && isExist(dot, x, y + 2, true) ||
          isExist(dot, x, y + 1, true) && map[y + 2][x] === 1) {
        return false
      }
      return true
    } else if (dir === 'top' && map[y - 1][x] !== 1)  {
      if (isExist(dot, x, y - 1, true) && isExist(dot, x, y - 2, true) ||
          isExist(dot, x, y - 1, true) && map[y - 2][x] === 1) {
        return false
      }
      return true
    }
    return false
  }

  // 检查点是否是墙
  function isExist(dot, x, y, ble) {
    let index
    if (dot.some((item, i) => {
      index = i
      return item.x === x && item.y === y
    })) {
      return ble? true: index
    } else {
      return undefined  // false + 1 = 1
    }
  }

  // 检测是否通过
  function isPass() {
    let dot = sokobanData.dot
    const data = sokobanData.map
    return dot.every((item) => data[item.y][item.x] === 2)
  }

  function clear() {
    sokoban.innerHTML = ''
    nodeData = []
  }

  function setSize() {
    if (type) {
      SIZE = Math.floor(90 / passData[0].map[0].length)
    }
    let size = passData[tax].map[0].length * SIZE
    sokoban.style.width = size + (type? 'vw': 'px')
  }

  init(passData, 0)
  evt()
}