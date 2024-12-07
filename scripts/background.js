// 存储扩展的状态
let state = {
    autoMode: false
};

// 初始化扩展状态
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ autoMode: false });
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'toggleMode') {
        state.autoMode = request.value;
        
        // 向content script发送模式更改消息
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'modeChanged',
                    value: state.autoMode
                });
            }
        });
        
        // 保存状态
        chrome.storage.local.set({ autoMode: state.autoMode });
        sendResponse({success: true});
    }
    
    // 获取当前状态
    if (request.type === 'getState') {
        sendResponse(state);
    }
});

// 从存储中恢复状态
chrome.storage.local.get(['autoMode'], (result) => {
    state.autoMode = result.autoMode || false;
});