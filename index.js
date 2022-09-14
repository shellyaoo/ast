const template = `
    <div class="wscn-http404-container">
        <div class="wscn-http404">
            <div class="pic-404">
                图片集啊
                <img class="pic-404__parent" src="@/assets/404_images/404.png" alt="404">
                图一
                <img class="pic-404__child left" src="@/assets/404_images/404_cloud.png" alt="404">
                图二
                <img class="pic-404__child mid" src="@/assets/404_images/404_cloud.png" alt="404">
                图三
                <img class="pic-404__child right" src="@/assets/404_images/404_cloud.png" alt="404">
                图四
            </div>
            分割线前
            <hr>
            分割线后
            <div class="bullshit">
                <div class="bullshit__oops">出错啦！</div>
                您好，程序员
                <div class="bullshit__info"></div>
                hello word 我的世界很美好
                <div class="bullshit__headline">{{ message }}</div>
                <div class="bullshit__info">页面不存在，或您没有权限访问该页面。</div>
                <a href="" class="bullshit__return-home">回到主页</a>
            </div>
        </div>
    </div>
`
//自行结束标签
var empty = makeMap('area,base,basefont,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr');

function makeMap(values) {
    values = values.split(/,/);
    var map = {};
    values.forEach(function(value) {
        map[value] = 1;
    });
    return function(value) {
        return map[value.toLowerCase()] === 1;
    };
}

function handleAttrs(attrsString) {
    if (!attrsString || typeof attrsString !== 'string') return null
    return attrsString.trim().split(/\'|\"\s/g).map(item => {
        if (item) {
            const temArr = item.split(/=\'|\"/g)
            return {
                [temArr[0].replace('=', '')]: temArr[1]
            }
        }
    })

}

const result = ast(template)
console.log(result)


function ast(template) {
    const tagStack = []
    const astStack = [{ children: [] }]
    let restTemplate = template
    let index = 0
    const len = template.length
    const limitlen = len - 1
    const startRegEx = /^\<([a-z]+[0-9]?)(.*?)\>/
    const endRegEx = /^\<\/([a-z]+[0-9]?)\>/
    const wordRegEx = /^\>(.+)\<\/?[a-z]+[0-9]?\>/
    const betweennessRegEx = /^\>([^\>]*?)\</
    while (index < limitlen) {
        restTemplate = template.substring(index)
        if (startRegEx.test(restTemplate)) {
            const [, tag, attrs] = restTemplate.match(startRegEx)
            if (empty(tag)) { // 单标签
                astStack[astStack.length - 1].children.push({ tag, nodeType: 1, children: null, attrs: handleAttrs(attrs) })
            } else {
                tagStack.push(tag)
                astStack.push({ tag, nodeType: 1, children: [], text: '', attrs: handleAttrs(attrs) })
            }
            const stepLen = 1 + tag.length + ((attrs && attrs.length) || 0)
            index += stepLen
        } else if (wordRegEx.test(restTemplate)) {
            const [, word] = restTemplate.match(wordRegEx)
            astStack[astStack.length - 1].text = word || ''
            index += ((word && word.length) || 0)
        } else if (betweennessRegEx.test(restTemplate)) {
            const [, text] = restTemplate.match(betweennessRegEx)
            if (text.trim()) {
                astStack[astStack.length - 1].children.push({ tag: '#text', nodeType: 3, children: null, text, textContent: text, attrs: null })
            }
            index += (text.length || 1)
        } else if (endRegEx.test(restTemplate)) {
            const tag = tagStack.pop()
            const c = astStack.pop()
            let astStackLast = astStack[astStack.length - 1]
            astStackLast.children.push(c)
            const stepLen = 1 + tag.length;
            index += stepLen
        } else {
            index++
        }

    }
    return astStack[0].children[0]
}