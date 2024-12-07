// 全局变量
let isAutoAnswering = false;

// 等待iframe加载完成
function waitForIframe() {
    return new Promise((resolve) => {
        const checkIframe = () => {
            const iframe = document.getElementById('contentFrame');
            if (iframe && iframe.contentWindow && iframe.contentDocument) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc.readyState === 'complete') {
                    resolve(iframeDoc);
                    return;
                }
            }
            setTimeout(checkIframe, 100);
        };
        checkIframe();
    });
}



// 查找并填充答案
async function findAndFillAnswers() {
    try {
        const iframeDoc = await waitForIframe();
        
        // 查找所有输入框
        const inputs = iframeDoc.querySelectorAll('input[type="text"]');
        console.log('找到输入框:', inputs.length);
        
        // 遍历每个输入框
        inputs.forEach(input => {
            // 查找最近的包含data-solution的元素
            const container = input.closest('div');
            if (container) {
                const solutionElement = container.querySelector('[data-solution]');
                if (solutionElement) {
                    const answer = solutionElement.getAttribute('data-solution');
                    console.log('找到答案:', answer);
                    
                    // 填充答案
                    input.value = answer;
                    
                    // 触发事件
                    ['input', 'change', 'blur'].forEach(eventType => {
                        const event = new Event(eventType, {bubbles: true});
                        input.dispatchEvent(event);
                    });
                }
            }
        });
        
        return true;
    } catch (error) {
        console.error('答题出错:', error);
        return false;
    }
}

// 自动答题
function startAutoAnswer() {
    if (isAutoAnswering) return;
    
    console.log('开始自动答题');
    isAutoAnswering = true;
    
    // 定期检查和填充答案
    const interval = setInterval(async () => {
        if (!isAutoAnswering) {
            clearInterval(interval);
            return;
        }
        
        const success = await findAndFillAnswers();
        if (success) {
            console.log('本轮答题完成');
        }
    }, 2000);  // 每2秒检查一次
}

// 停止自动答题
function stopAutoAnswer() {
    isAutoAnswering = false;
    console.log('停止自动答题');
}

// 手动答题
async function manualAnswer() {
    const success = await findAndFillAnswers();
    return success;
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'startAutoAnswer':
            startAutoAnswer();
            sendResponse({ success: true, message: '自动答题已启动' });
            break;
            
        case 'stopAutoAnswer':
            stopAutoAnswer();
            sendResponse({ success: true, message: '自动答题已停止' });
            break;
            
        case 'manualAnswer':
            manualAnswer().then(success => {
                sendResponse({ success: success, message: success ? '答题完成' : '答题失败' });
            });
            return true;  // 保持消息通道开启
    }
});

// 初始化
console.log('WeLearn助手已加载');